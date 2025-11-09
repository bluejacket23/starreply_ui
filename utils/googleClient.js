const { google } = require('googleapis');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let oauth2Client = null;
let cachedClientId = null;
let cachedClientSecret = null;

async function getOAuth2Client() {
  if (oauth2Client && cachedClientId && cachedClientSecret) {
    return oauth2Client;
  }

  const secretsClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  try {
    const secretArn = process.env.SECRETS_MANAGER_ARN;
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    const secrets = JSON.parse(response.SecretString);
    const clientId = secrets.GOOGLE_OAUTH_CLIENT_ID || secrets.googleOAuthClientId;
    const clientSecret = secrets.GOOGLE_OAUTH_CLIENT_SECRET || secrets.googleOAuthClientSecret;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not found in secrets');
    }

    cachedClientId = clientId;
    cachedClientSecret = clientSecret;

    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      secrets.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    );

    return oauth2Client;
  } catch (error) {
    console.error('Error fetching Google OAuth credentials:', error);
    throw error;
  }
}

function setCredentials(tokens) {
  if (!oauth2Client) {
    throw new Error('OAuth2 client not initialized. Call getOAuth2Client first.');
  }

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });
}

async function refreshAccessToken(refreshToken) {
  const client = await getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

async function fetchReviews(accountId, locationId) {
  const client = await getOAuth2Client();
  const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth: client });
  const mybusinessInfo = google.mybusinessbusinessinformation({ version: 'v1', auth: client });

  try {
    // Fetch reviews for the location
    const response = await mybusinessInfo.locations.reviews.list({
      name: `locations/${locationId}`,
    });

    return response.data.reviews || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    // If token expired, try to refresh
    if (error.response?.status === 401) {
      throw new Error('TOKEN_EXPIRED');
    }
    
    throw error;
  }
}

async function postReply(locationId, reviewId, replyText) {
  const client = await getOAuth2Client();
  const mybusinessInfo = google.mybusinessbusinessinformation({ version: 'v1', auth: client });

  try {
    const response = await mybusinessInfo.locations.reviews.updateReply({
      name: `locations/${locationId}/reviews/${reviewId}`,
      requestBody: {
        reply: {
          comment: replyText,
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error posting reply:', error);
    
    if (error.response?.status === 401) {
      throw new Error('TOKEN_EXPIRED');
    }
    
    throw error;
  }
}

async function getAuthUrl() {
  const client = await getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/cloud-platform',
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

module.exports = {
  getOAuth2Client,
  setCredentials,
  refreshAccessToken,
  fetchReviews,
  postReply,
  getAuthUrl,
};

