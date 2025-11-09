const { docClient } = require('./db');
const crypto = require('crypto');

const USERS_TABLE = process.env.USERS_TABLE;

// Encryption key (should be stored in Secrets Manager in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function createUser(userId, email, googleTokens = null) {
  const encryptedTokens = googleTokens ? encrypt(JSON.stringify(googleTokens)) : null;
  
  const user = {
    userId,
    email,
    googleTokens: encryptedTokens,
    plan: 'free',
    subscriptionId: null,
    tone: 'Friendly',
    createdAt: new Date().toISOString(),
  };

  await docClient.put({
    TableName: USERS_TABLE,
    Item: user,
  });

  return user;
}

async function getUser(userId) {
  const result = await docClient.get({
    TableName: USERS_TABLE,
    Key: { userId },
  });

  if (!result.Item) {
    return null;
  }

  const user = result.Item;
  
  // Decrypt tokens if they exist
  if (user.googleTokens) {
    try {
      user.googleTokens = JSON.parse(decrypt(user.googleTokens));
    } catch (error) {
      console.error('Error decrypting tokens:', error);
      user.googleTokens = null;
    }
  }

  return user;
}

async function updateGoogleTokens(userId, tokens) {
  const encryptedTokens = encrypt(JSON.stringify(tokens));
  
  await docClient.update({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET googleTokens = :tokens',
    ExpressionAttributeValues: {
      ':tokens': encryptedTokens,
    },
  });
}

async function updatePlan(userId, plan, subscriptionId = null) {
  const updateExpression = subscriptionId
    ? 'SET plan = :plan, subscriptionId = :subId'
    : 'SET plan = :plan';
  
  const expressionValues = subscriptionId
    ? {
        ':plan': plan,
        ':subId': subscriptionId,
      }
    : {
        ':plan': plan,
      };

  await docClient.update({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
  });
}

async function updateTone(userId, tone) {
  await docClient.update({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET tone = :tone',
    ExpressionAttributeValues: {
      ':tone': tone,
    },
  });
}

module.exports = {
  createUser,
  getUser,
  updateGoogleTokens,
  updatePlan,
  updateTone,
};

