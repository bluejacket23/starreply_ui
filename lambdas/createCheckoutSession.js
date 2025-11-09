const Stripe = require('stripe');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { createUser, getUser } = require('../models/users');

let stripeClient = null;
let cachedSecretKey = null;

async function getStripeClient() {
  if (stripeClient && cachedSecretKey) {
    return stripeClient;
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
    const secretKey = secrets.STRIPE_SECRET_KEY || secrets.stripeSecretKey;

    if (!secretKey) {
      throw new Error('Stripe secret key not found in secrets');
    }

    cachedSecretKey = secretKey;
    stripeClient = new Stripe(secretKey);

    return stripeClient;
  } catch (error) {
    console.error('Error fetching Stripe secret key:', error);
    throw error;
  }
}

async function handler(event, context) {
  console.log('createCheckoutSession lambda triggered');

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, email, priceId } = body;

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

    const stripe = await getStripeClient();

    // Get or create user
    let user = await getUser(userId);
    if (!user) {
      user = await createUser(userId, email);
    }

    // Get price ID from secrets if not provided
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    const secretArn = process.env.SECRETS_MANAGER_ARN;
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );
    const secrets = JSON.parse(response.SecretString);
    const defaultPriceId = secrets.STRIPE_PRICE_ID || priceId;

    if (!defaultPriceId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ error: 'Stripe price ID not configured' }),
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: defaultPriceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        userId: userId,
      },
      success_url: `${body.successUrl || 'https://yourdomain.com/dashboard?success=true'}`,
      cancel_url: `${body.cancelUrl || 'https://yourdomain.com/dashboard?canceled=true'}`,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
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

