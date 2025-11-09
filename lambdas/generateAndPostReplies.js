const { docClient } = require('../models/db');
const { getUser } = require('../models/users');
const { generateReply } = require('../utils/openaiClient');
const { postReply, setCredentials, refreshAccessToken } = require('../utils/googleClient');

const USERS_TABLE = process.env.USERS_TABLE;
const REVIEWS_TABLE = process.env.REVIEWS_TABLE;

async function handler(event, context) {
  console.log('generateAndPostReplies lambda triggered');

  try {
    // Get all reviews that haven't been posted yet
    // Note: Using scan with filter. For better performance, use GSI query on postedStatus
    const reviewsResult = await docClient.scan({
      TableName: REVIEWS_TABLE,
      FilterExpression: 'posted = :posted',
      ExpressionAttributeValues: {
        ':posted': false,
      },
    });

    const reviews = reviewsResult.Items || [];

    if (reviews.length === 0) {
      console.log('No reviews to process');
      return { statusCode: 200, body: JSON.stringify({ message: 'No reviews to process' }) };
    }

    let successCount = 0;
    let errorCount = 0;

    // Group reviews by userId
    const reviewsByUser = {};
    for (const review of reviews) {
      if (!reviewsByUser[review.userId]) {
        reviewsByUser[review.userId] = [];
      }
      reviewsByUser[review.userId].push(review);
    }

    // Process each user's reviews
    for (const [userId, userReviews] of Object.entries(reviewsByUser)) {
      try {
        const user = await getUser(userId);
        
        if (!user || user.plan !== 'paid') {
          console.log(`Skipping user ${userId} - not on paid plan`);
          continue;
        }

        if (!user.googleTokens) {
          console.log(`Skipping user ${userId} - no Google tokens`);
          continue;
        }

        // Set credentials
        let tokens = user.googleTokens;
        setCredentials(tokens);

        // Check if token needs refresh
        if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
          console.log(`Refreshing token for user ${userId}`);
          tokens = await refreshAccessToken(tokens.refresh_token);
          // Update tokens (should use proper encryption)
        }

        const locationId = user.locationId || 'default-location-id';
        
        if (!locationId || locationId === 'default-location-id') {
          console.log(`No locationId for user ${userId}`);
          continue;
        }

        // Process each review
        for (const review of userReviews) {
          try {
            // Generate reply using OpenAI
            const tone = user.tone || 'Friendly';
            const generatedReply = await generateReply(
              review.reviewText,
              review.rating,
              tone
            );

            // Post reply via Google API
            await postReply(locationId, review.reviewId, generatedReply);

            // Update review record
            await docClient.update({
              TableName: REVIEWS_TABLE,
              Key: {
                userId: userId,
                reviewId: review.reviewId,
              },
              UpdateExpression: 'SET posted = :posted, postedStatus = :postedStatus, generatedReply = :reply, postedAt = :postedAt',
              ExpressionAttributeValues: {
                ':posted': true,
                ':postedStatus': 'posted',
                ':reply': generatedReply,
                ':postedAt': new Date().toISOString(),
              },
            });

            successCount++;
            console.log(`Successfully posted reply for review ${review.reviewId}`);
          } catch (error) {
            errorCount++;
            console.error(`Error processing review ${review.reviewId}:`, error);
            
            // Mark as error (optional - could add error field)
            await docClient.update({
              TableName: REVIEWS_TABLE,
              Key: {
                userId: userId,
                reviewId: review.reviewId,
              },
              UpdateExpression: 'SET error = :error, errorMessage = :errorMsg',
              ExpressionAttributeValues: {
                ':error': true,
                ':errorMsg': error.message,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        errorCount += userReviews.length;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully processed reviews',
        successCount,
        errorCount,
        totalProcessed: reviews.length,
      }),
    };
  } catch (error) {
    console.error('Error in generateAndPostReplies:', error);
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

