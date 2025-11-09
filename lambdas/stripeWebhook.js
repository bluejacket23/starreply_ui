const Stripe = require('stripe');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { updatePlan } = require('../models/users');

let stripeClient = null;
let cachedSecretKey = null;
let cachedWebhookSecret = null;

async function getStripeClient() {
  if (stripeClient && cachedSecretKey) {
    return { stripe: stripeClient, webhookSecret: cachedWebhookSecret };
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
    const webhookSecret = secrets.STRIPE_WEBHOOK_SECRET || secrets.stripeWebhookSecret;

    if (!secretKey) {
      throw new Error('Stripe secret key not found in secrets');
    }

    cachedSecretKey = secretKey;
    cachedWebhookSecret = webhookSecret;
    stripeClient = new Stripe(secretKey);

    return { stripe: stripeClient, webhookSecret };
  } catch (error) {
    console.error('Error fetching Stripe credentials:', error);
    throw error;
  }
}

async function handler(event, context) {
  console.log('stripeWebhook lambda triggered');

  try {
    const { stripe, webhookSecret } = await getStripeClient();
    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];

    if (!sig) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No stripe-signature header' }),
      };
    }

    // Get raw body (may be base64 encoded)
    let body = event.body;
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
      };
    }

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        const userId = session.metadata?.userId;
        
        if (userId) {
          await updatePlan(userId, 'paid', session.subscription);
          console.log(`Updated user ${userId} to paid plan`);
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = stripeEvent.data.object;
        const customerEmail = subscription.metadata?.userId || subscription.customer;
        
        if (subscription.status === 'active') {
          // Find user by email or subscription ID
          // For now, we'll update based on subscription ID
          // In production, you'd have a better lookup mechanism
          console.log(`Subscription ${subscription.id} is active`);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object;
        // Update user to free plan
        // You'd need to look up the user by subscription ID
        console.log(`Subscription ${deletedSubscription.id} was cancelled`);
        break;

      case 'invoice.payment_succeeded':
        const invoice = stripeEvent.data.object;
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log(`Payment failed for invoice ${failedInvoice.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
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

