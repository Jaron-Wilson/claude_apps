const crypto = require('crypto');

/**
 * Encryption utilities for location data
 *
 * Note: This is server-side utility code. The actual E2E encryption
 * happens on the client side before data is sent to the server.
 * These utilities are for server-side encryption of sensitive data at rest.
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 */
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment');
  }

  // Ensure key is proper length
  return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypt data
 */
const encrypt = (text) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted data
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
};

/**
 * Decrypt data
 */
const decrypt = (encryptedData) => {
  const key = getEncryptionKey();

  // Extract iv, authTag, and encrypted text
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(
    encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2),
    'hex'
  );
  const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Generate a secure random token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash data (one-way)
 */
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  generateToken,
  hash
};
