const { docClient } = require('../models/db');
const { getUser } = require('../models/users');

const USERS_TABLE = process.env.USERS_TABLE;
const REVIEWS_TABLE = process.env.REVIEWS_TABLE;

async function handler(event, context) {
  console.log('userStats lambda triggered');

  try {
    // Extract userId from query params or headers
    const userId = event.queryStringParameters?.userId || event.headers?.userid;

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'userId is required' }),
      };
    }

    const user = await getUser(userId);

    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Get all reviews for user
    const reviewsResult = await docClient.query({
      TableName: REVIEWS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const reviews = reviewsResult.Items || [];

    // Calculate stats
    const totalReviews = reviews.length;
    const postedReplies = reviews.filter(r => r.posted === true).length;
    const responseRate = totalReviews > 0 ? (postedReplies / totalReviews * 100).toFixed(1) : 0;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;
    const avgSentiment = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.sentimentScore || 0), 0) / reviews.length).toFixed(2)
      : 0;

    // Get recent reviews (last 10)
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(r => ({
        reviewId: r.reviewId,
        reviewText: r.reviewText,
        rating: r.rating,
        posted: r.posted,
        generatedReply: r.generatedReply,
        createdAt: r.createdAt,
      }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        stats: {
          totalReviews,
          postedReplies,
          responseRate: parseFloat(responseRate),
          avgRating: parseFloat(avgRating),
          avgSentiment: parseFloat(avgSentiment),
        },
        user: {
          email: user.email,
          plan: user.plan,
          tone: user.tone,
          hasGoogleConnected: !!user.googleTokens,
        },
        recentReviews,
      }),
    };
  } catch (error) {
    console.error('Error in userStats:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
}

module.exports = { handler };

