const { updateTone, getUser } = require('../models/users');

async function handler(event, context) {
  console.log('updateTone lambda triggered');

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, tone } = body;

    if (!userId || !tone) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'userId and tone are required' }),
      };
    }

    // Validate tone
    const validTones = ['Friendly', 'Professional', 'Casual', 'Formal', 'Enthusiastic'];
    if (!validTones.includes(tone)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: `Tone must be one of: ${validTones.join(', ')}` }),
      };
    }

    // Check if user exists
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

    // Update tone
    await updateTone(userId, tone);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        message: 'Tone updated successfully',
        tone,
      }),
    };
  } catch (error) {
    console.error('Error in updateTone:', error);
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

