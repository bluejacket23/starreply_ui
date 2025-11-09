const { getAuthUrl, refreshAccessToken } = require('../utils/googleClient');
const { getUser, updateGoogleTokens, createUser } = require('../models/users');

async function handler(event, context) {
  console.log('connectGoogle lambda triggered');

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, email, code } = body;

    if (!userId || !email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'userId and email are required' }),
      };
    }

    // If code is provided, exchange it for tokens
    if (code) {
      const { getOAuth2Client } = require('../utils/googleClient');
      const client = await getOAuth2Client();
      
      const { tokens } = await client.getToken(code);
      
      // Get or create user
      let user = await getUser(userId);
      if (!user) {
        user = await createUser(userId, email);
      }

      // Update tokens
      await updateGoogleTokens(userId, tokens);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          success: true,
          message: 'Google account connected successfully',
        }),
      };
    } else {
      // Return auth URL
      const authUrl = await getAuthUrl();

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          authUrl,
        }),
      };
    }
  } catch (error) {
    console.error('Error in connectGoogle:', error);
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

