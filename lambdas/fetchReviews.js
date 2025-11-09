const { docClient } = require('../models/db');
const { getUser } = require('../models/users');
const { fetchReviews, refreshAccessToken, setCredentials } = require('../utils/googleClient');
const { analyzeSentiment } = require('../utils/openaiClient');

const USERS_TABLE = process.env.USERS_TABLE;
const REVIEWS_TABLE = process.env.REVIEWS_TABLE;

async function handler(event, context) {
  console.log('fetchReviews lambda triggered');

  try {
    // Get all users with active subscriptions and Google tokens
    const usersResult = await docClient.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'plan = :plan AND attribute_exists(googleTokens)',
      ExpressionAttributeValues: {
        ':plan': 'paid',
      },
    });

    const users = usersResult.Items || [];

    if (users.length === 0) {
      console.log('No active users with Google tokens found');
      return { statusCode: 200, body: JSON.stringify({ message: 'No users to process' }) };
    }

    let totalReviews = 0;

    for (const user of users) {
      try {
        // Decrypt tokens (simplified - in production use proper decryption)
        let tokens;
        try {
          if (typeof user.googleTokens === 'string') {
            tokens = JSON.parse(user.googleTokens);
          } else {
            tokens = user.googleTokens;
          }
        } catch (e) {
          console.error(`Error parsing tokens for user ${user.userId}:`, e);
          continue;
        }

        // Set credentials
        setCredentials(tokens);

        // Check if token needs refresh
        if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
          console.log(`Refreshing token for user ${user.userId}`);
          tokens = await refreshAccessToken(tokens.refresh_token);
          // Update tokens in database (simplified - should use proper encryption)
          // await updateGoogleTokens(user.userId, tokens);
        }

        // Fetch reviews (assuming user has stored locationId)
        // In production, you'd store this in the user record
        const locationId = user.locationId || 'default-location-id';
        
        if (!locationId || locationId === 'default-location-id') {
          console.log(`No locationId for user ${user.userId}`);
          continue;
        }

        const reviews = await fetchReviews(user.accountId, locationId);

        // Store new reviews
        for (const review of reviews) {
          const reviewId = review.name?.split('/').pop() || review.reviewId || `review-${Date.now()}`;
          
          // Check if review already exists
          const existingReview = await docClient.get({
            TableName: REVIEWS_TABLE,
            Key: {
              userId: user.userId,
              reviewId: reviewId,
            },
          });

          if (existingReview.Item) {
            continue; // Review already stored
          }

          // Analyze sentiment
          const reviewText = review.comment || '';
          const rating = review.starRating || 0;
          const sentimentScore = await analyzeSentiment(reviewText);

          // Store review
          await docClient.put({
            TableName: REVIEWS_TABLE,
            Item: {
              userId: user.userId,
              reviewId: reviewId,
              reviewText: reviewText,
              rating: rating,
              generatedReply: null,
              posted: false,
              postedStatus: 'pending', // For GSI query
              createdAt: new Date().toISOString(),
              sentimentScore: sentimentScore,
              reviewData: review,
            },
          });

          totalReviews++;
        }

        console.log(`Processed ${reviews.length} reviews for user ${user.userId}`);
      } catch (error) {
        console.error(`Error processing user ${user.userId}:`, error);
        // Continue with next user
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully fetched reviews',
        totalReviews: totalReviews,
        usersProcessed: users.length,
      }),
    };
  } catch (error) {
    console.error('Error in fetchReviews:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
}

module.exports = { handler };

