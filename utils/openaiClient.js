const OpenAI = require('openai');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let openaiClient = null;
let cachedApiKey = null;

async function getOpenAIClient() {
  if (openaiClient && cachedApiKey) {
    return openaiClient;
  }

  const secretsClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });

  try {
    const secretArn = process.env.SECRETS_MANAGER_ARN || process.env.OPENAI_API_KEY_SECRET;
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    const secrets = JSON.parse(response.SecretString);
    const apiKey = secrets.OPENAI_API_KEY || secrets.openaiApiKey;

    if (!apiKey) {
      throw new Error('OpenAI API key not found in secrets');
    }

    cachedApiKey = apiKey;
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });

    return openaiClient;
  } catch (error) {
    console.error('Error fetching OpenAI API key:', error);
    throw error;
  }
}

async function generateReply(reviewText, rating, tone = 'Friendly') {
  const client = await getOpenAIClient();

  const systemPrompt = `You are a polite business representative. Write a friendly 2-sentence reply to customer reviews. 
Never mention refunds or personal info. Keep responses concise and professional. Tone: ${tone}.`;

  const userPrompt = `Review (${rating} stars): "${reviewText}"
Generate a polite, brand-safe reply:`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    
    if (!reply) {
      throw new Error('No reply generated from OpenAI');
    }

    // Moderation check
    const moderationResult = await client.moderations.create({
      input: reply,
    });

    if (moderationResult.results[0]?.flagged) {
      throw new Error('Generated reply failed moderation check');
    }

    return reply;
  } catch (error) {
    console.error('Error generating reply:', error);
    throw error;
  }
}

async function analyzeSentiment(reviewText) {
  const client = await getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of this review and return a number between -1 (very negative) and 1 (very positive). Return only the number.',
        },
        {
          role: 'user',
          content: reviewText,
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const score = parseFloat(completion.choices[0]?.message?.content?.trim() || '0');
    return Math.max(-1, Math.min(1, score)); // Clamp between -1 and 1
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return 0; // Default neutral sentiment
  }
}

module.exports = {
  generateReply,
  analyzeSentiment,
  getOpenAIClient,
};

