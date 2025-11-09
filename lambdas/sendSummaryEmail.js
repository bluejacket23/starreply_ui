const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { docClient } = require('../models/db');

const USERS_TABLE = process.env.USERS_TABLE;
const REVIEWS_TABLE = process.env.REVIEWS_TABLE;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function handler(event, context) {
  console.log('sendSummaryEmail lambda triggered');

  try {
    // Get yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterdayStart = yesterday.toISOString();
    const todayStart = today.toISOString();

    // Get all paid users
    const usersResult = await docClient.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'plan = :plan',
      ExpressionAttributeValues: {
        ':plan': 'paid',
      },
    });

    const users = usersResult.Items || [];

    if (users.length === 0) {
      console.log('No paid users found');
      return { statusCode: 200, body: JSON.stringify({ message: 'No users to email' }) };
    }

    let emailsSent = 0;

    for (const user of users) {
      try {
        // Get reviews from yesterday
        const reviewsResult = await docClient.scan({
          TableName: REVIEWS_TABLE,
          FilterExpression: 'userId = :userId AND createdAt BETWEEN :start AND :end',
          ExpressionAttributeValues: {
            ':userId': user.userId,
            ':start': yesterdayStart,
            ':end': todayStart,
          },
        });

        const reviews = reviewsResult.Items || [];

        if (reviews.length === 0) {
          continue; // Skip if no reviews yesterday
        }

        // Calculate stats
        const totalReviews = reviews.length;
        const postedReplies = reviews.filter(r => r.posted === true).length;
        const responseRate = totalReviews > 0 ? (postedReplies / totalReviews * 100).toFixed(1) : 0;
        const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews;
        const avgSentiment = reviews.reduce((sum, r) => sum + (r.sentimentScore || 0), 0) / totalReviews;

        // Generate HTML email
        const htmlBody = generateEmailHTML({
          userName: user.email.split('@')[0],
          totalReviews,
          postedReplies,
          responseRate,
          avgRating: avgRating.toFixed(1),
          avgSentiment: avgSentiment.toFixed(2),
          reviews: reviews.slice(0, 10), // Show top 10 reviews
        });

        // Send email
        await sesClient.send(
          new SendEmailCommand({
            Source: FROM_EMAIL,
            Destination: {
              ToAddresses: [user.email],
            },
            Message: {
              Subject: {
                Data: `Daily Review Summary - ${totalReviews} New Reviews`,
                Charset: 'UTF-8',
              },
              Body: {
                Html: {
                  Data: htmlBody,
                  Charset: 'UTF-8',
                },
                Text: {
                  Data: generateEmailText({
                    totalReviews,
                    postedReplies,
                    responseRate,
                    avgRating: avgRating.toFixed(1),
                  }),
                  Charset: 'UTF-8',
                },
              },
            },
          })
        );

        emailsSent++;
        console.log(`Sent summary email to ${user.email}`);
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
        // Continue with next user
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully sent summary emails',
        emailsSent,
        totalUsers: users.length,
      }),
    };
  } catch (error) {
    console.error('Error in sendSummaryEmail:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
}

function generateEmailHTML({ userName, totalReviews, postedReplies, responseRate, avgRating, avgSentiment, reviews }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .stat { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #4F46E5; }
        .review { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .rating { color: #F59E0B; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Daily Review Summary</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Here's your review activity from yesterday:</p>
          
          <div class="stat">
            <strong>Total Reviews:</strong> ${totalReviews}
          </div>
          <div class="stat">
            <strong>Replies Posted:</strong> ${postedReplies} (${responseRate}% response rate)
          </div>
          <div class="stat">
            <strong>Average Rating:</strong> <span class="rating">${avgRating} ⭐</span>
          </div>
          <div class="stat">
            <strong>Average Sentiment:</strong> ${avgSentiment > 0 ? '😊 Positive' : '😐 Neutral'}
          </div>

          <h3>Recent Reviews:</h3>
          ${reviews.map(review => `
            <div class="review">
              <div class="rating">${review.rating || 0} ⭐</div>
              <p>${review.reviewText || 'No text'}</p>
              ${review.posted ? '<p style="color: green;">✓ Reply posted</p>' : '<p style="color: orange;">⏳ Pending reply</p>'}
            </div>
          `).join('')}

          <p style="margin-top: 30px;">
            <a href="https://yourdomain.com/dashboard" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Dashboard</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText({ totalReviews, postedReplies, responseRate, avgRating }) {
  return `
Daily Review Summary

Total Reviews: ${totalReviews}
Replies Posted: ${postedReplies} (${responseRate}% response rate)
Average Rating: ${avgRating} stars

View your dashboard: https://yourdomain.com/dashboard
  `.trim();
}

module.exports = { handler };

