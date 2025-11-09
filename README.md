# ReviewSaaS - Automated Google Review Replies

A production-ready SaaS platform that automatically generates and posts AI-powered replies to Google Business Profile reviews using OpenAI GPT-4-mini.

## 🏗️ Architecture

- **Frontend**: React with TailwindCSS, deployed on AWS Amplify
- **Backend**: AWS Lambda functions (Node.js 20)
- **Database**: DynamoDB
- **Authentication**: Google OAuth2 (for Business Profile API access)
- **AI**: OpenAI GPT-4-mini
- **Billing**: Stripe ($7/month subscriptions)
- **Scheduling**: EventBridge (daily cron tasks)
- **Email**: AWS SES (daily summary reports)
- **Deployment**: Serverless Framework

## 📁 Project Structure

```
/
├── package.json              # Backend dependencies
├── serverless.yml           # Serverless Framework configuration
├── lambdas/                 # Lambda function handlers
│   ├── fetchReviews.js
│   ├── generateAndPostReplies.js
│   ├── sendSummaryEmail.js
│   ├── createCheckoutSession.js
│   ├── stripeWebhook.js
│   ├── userStats.js
│   ├── connectGoogle.js
│   └── updateTone.js
├── models/                  # DynamoDB models
│   ├── db.js
│   └── users.js
├── utils/                   # Utility modules
│   ├── openaiClient.js
│   └── googleClient.js
└── frontend/                # React frontend
    ├── package.json
    ├── src/
    │   ├── App.js
    │   ├── pages/
    │   │   ├── Landing.js
    │   │   └── Dashboard.js
    │   └── index.js
    └── amplify.yml
```

## 🚀 Setup Instructions

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **Node.js 20+** installed
3. **Serverless Framework** installed globally: `npm install -g serverless`
4. **AWS CLI** configured with credentials
5. **Stripe Account** with API keys
6. **OpenAI API Key**
7. **Google Cloud Project** with Business Profile API enabled

### Step 1: Clone and Install

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Configure AWS Secrets Manager

Create a secret in AWS Secrets Manager with the following structure:

```json
{
  "OPENAI_API_KEY": "sk-your-openai-key",
  "STRIPE_SECRET_KEY": "sk_test_your-stripe-key",
  "STRIPE_WEBHOOK_SECRET": "whsec_your-webhook-secret",
  "STRIPE_PRICE_ID": "price_your-monthly-price-id",
  "GOOGLE_OAUTH_CLIENT_ID": "your-client-id.apps.googleusercontent.com",
  "GOOGLE_OAUTH_CLIENT_SECRET": "your-client-secret",
  "GOOGLE_REDIRECT_URI": "https://yourdomain.com/auth/callback",
  "FROM_EMAIL": "noreply@yourdomain.com"
}
```

**Important**: Note the ARN of the secret and update `serverless.yml` with the SSM parameter path, or store it as an environment variable.

### Step 3: Configure SSM Parameters (Alternative)

Alternatively, store individual secrets as SSM parameters:

```bash
aws ssm put-parameter --name "/review-saas/openai-api-key" --value "sk-your-key" --type "SecureString"
aws ssm put-parameter --name "/review-saas/stripe-secret-key" --value "sk_test_your-key" --type "SecureString"
aws ssm put-parameter --name "/review-saas/stripe-webhook-secret" --value "whsec_your-secret" --type "SecureString"
aws ssm put-parameter --name "/review-saas/stripe-price-id" --value "price_your-id" --type "String"
aws ssm put-parameter --name "/review-saas/google-oauth-client-id" --value "your-client-id" --type "SecureString"
aws ssm put-parameter --name "/review-saas/google-oauth-client-secret" --value "your-secret" --type "SecureString"
aws ssm put-parameter --name "/review-saas/from-email" --value "noreply@yourdomain.com" --type "String"
aws ssm put-parameter --name "/review-saas/secrets-arn" --value "arn:aws:secretsmanager:region:account:secret:name" --type "String"
```

### Step 4: Configure Stripe

1. Create a product in Stripe Dashboard
2. Create a monthly subscription price ($7/month)
3. Note the Price ID and add it to Secrets Manager
4. Set up a webhook endpoint pointing to your deployed `/stripe-webhook` endpoint
5. Configure webhook events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### Step 5: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google My Business API** and **Business Profile Performance API**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local testing)
   - `https://yourdomain.com/auth/callback` (for production)
6. Download credentials and add to Secrets Manager

### Step 6: Configure AWS SES

1. Verify your sender email in AWS SES:
   ```bash
   aws ses verify-email-identity --email-address noreply@yourdomain.com
   ```
2. If in SES sandbox, request production access
3. Update `FROM_EMAIL` in Secrets Manager

### Step 7: Deploy Backend

```bash
# Deploy to AWS
serverless deploy

# Or deploy to specific stage
serverless deploy --stage prod
```

After deployment, note the API Gateway endpoints and update your frontend configuration.

### Step 8: Configure Frontend

1. Update `frontend/src/pages/Landing.js` and `frontend/src/pages/Dashboard.js` with your API endpoint:
   ```javascript
   const API_ENDPOINT = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';
   ```

2. Or set as environment variable:
   ```bash
   export REACT_APP_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev
   ```

### Step 9: Deploy Frontend to Amplify

#### Option A: Using AWS Amplify Console

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your Git repository or deploy manually
4. Build settings:
   - Build command: `npm run build`
   - Output directory: `build`
5. Add environment variable: `REACT_APP_API_ENDPOINT`
6. Deploy

#### Option B: Using Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
cd frontend
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### Step 10: Update OAuth Redirect URI

After deploying the frontend, update the Google OAuth redirect URI in Google Cloud Console to match your Amplify domain.

## 🔧 Environment Variables

### Backend (Lambda)

- `USERS_TABLE`: DynamoDB table name for users
- `REVIEWS_TABLE`: DynamoDB table name for reviews
- `SECRETS_MANAGER_ARN`: ARN of Secrets Manager secret
- `FROM_EMAIL`: Email address for SES notifications

### Frontend

- `REACT_APP_API_ENDPOINT`: API Gateway endpoint URL

## 📊 DynamoDB Tables

### Users Table
- **Partition Key**: `userId` (String)
- Attributes:
  - `email`: User email
  - `googleTokens`: Encrypted OAuth tokens
  - `plan`: Subscription plan (`free` or `paid`)
  - `subscriptionId`: Stripe subscription ID
  - `tone`: Reply tone preference
  - `createdAt`: ISO timestamp

### ReviewReplies Table
- **Partition Key**: `userId` (String)
- **Sort Key**: `reviewId` (String)
- Attributes:
  - `reviewText`: Review content
  - `rating`: Star rating (1-5)
  - `generatedReply`: AI-generated reply
  - `posted`: Boolean (whether reply was posted)
  - `createdAt`: ISO timestamp
  - `sentimentScore`: Sentiment analysis score (-1 to 1)

## 🔄 Lambda Functions

### Scheduled Functions

- **fetchReviews**: Runs daily to fetch new reviews from Google Business Profile
- **generateAndPostReplies**: Runs hourly to generate and post replies
- **sendSummaryEmail**: Runs daily at 9 AM to send summary emails

### API Endpoints

- `POST /create-checkout-session`: Create Stripe checkout session
- `POST /stripe-webhook`: Handle Stripe webhooks
- `GET /userStats`: Get user statistics
- `POST /connect-google`: Connect Google Business Profile
- `POST /update-tone`: Update reply tone preference

## 🧪 Testing Locally

```bash
# Install serverless-offline
npm install --save-dev serverless-offline

# Run locally
serverless offline

# Test frontend locally
cd frontend
npm start
```

## 🔒 Security Notes

1. **Encryption**: OAuth tokens are encrypted at rest using AES-256-GCM
2. **Secrets**: All API keys stored in AWS Secrets Manager
3. **IAM**: Lambda functions use least-privilege IAM roles
4. **CORS**: Configured for frontend domain only
5. **Moderation**: OpenAI moderation API filters generated replies

## 📝 Additional Setup

### EventBridge Schedules

The scheduled functions are automatically created by Serverless Framework. To modify schedules, edit `serverless.yml`.

### Stripe Webhook Configuration

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to Secrets Manager

## 🐛 Troubleshooting

### Lambda Timeout Errors
- Increase timeout in `serverless.yml` (default: 60s)

### DynamoDB Throttling
- Switch to On-Demand billing mode (already configured)
- Or provision capacity for high-traffic scenarios

### Google API Errors
- Verify OAuth tokens are valid
- Check API quotas in Google Cloud Console
- Ensure Business Profile API is enabled

### SES Email Issues
- Verify sender email address
- Check SES sandbox limits
- Verify recipient email addresses (in sandbox mode)

## 📚 API Documentation

### Create Checkout Session
```bash
POST /create-checkout-session
{
  "userId": "user-123",
  "email": "user@example.com",
  "successUrl": "https://yourdomain.com/dashboard?success=true",
  "cancelUrl": "https://yourdomain.com/dashboard?canceled=true"
}
```

### Get User Stats
```bash
GET /userStats?userId=user-123
```

### Connect Google
```bash
POST /connect-google
{
  "userId": "user-123",
  "email": "user@example.com"
}
```

### Update Tone
```bash
POST /update-tone
{
  "userId": "user-123",
  "tone": "Professional"
}
```

## 🚀 Production Checklist

- [ ] All secrets stored in AWS Secrets Manager
- [ ] SES email verified and out of sandbox
- [ ] Stripe webhook configured with production keys
- [ ] Google OAuth redirect URIs updated
- [ ] CORS configured for production domain
- [ ] CloudWatch alarms set up for errors
- [ ] DynamoDB backup enabled
- [ ] Frontend environment variables configured
- [ ] SSL certificate configured for Amplify
- [ ] Monitoring and logging set up

## 📄 License

ISC

## 🤝 Support

For issues or questions, please open an issue in the repository.

