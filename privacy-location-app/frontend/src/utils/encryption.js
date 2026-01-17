/**
 * Client-side End-to-End Encryption utilities
 *
 * Uses Web Crypto API for secure encryption of location data
 * before sending to the server.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Generate a new encryption key
 */
export const generateKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
};

/**
 * Export key to storable format
 */
export const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
};

/**
 * Import key from stored format
 */
export const importKey = async (keyData) => {
  const keyObject = JSON.parse(keyData);
  return await window.crypto.subtle.importKey(
    'jwk',
    keyObject,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypt location data
 */
export const encryptLocation = async (locationData, key) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(locationData));

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    data
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64 for transmission
  return arrayBufferToBase64(combined);
};

/**
 * Decrypt location data
 */
export const decryptLocation = async (encryptedData, key) => {
  try {
    const combined = base64ToArrayBuffer(encryptedData);

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    const json = decoder.decode(decrypted);
    return JSON.parse(json);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt location data');
  }
};

/**
 * Generate a simple shared key from a password
 * (For demo purposes - in production, use proper key exchange like ECDH)
 */
export const deriveKeyFromPassword = async (password, salt = 'privacy-location-salt') => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Get or create encryption key for a circle
 */
export const getCircleKey = async (circleId) => {
  const storageKey = `circle_key_${circleId}`;
  let keyData = localStorage.getItem(storageKey);

  if (!keyData) {
    // Generate new key for this circle
    const key = await generateKey();
    keyData = await exportKey(key);
    localStorage.setItem(storageKey, keyData);
  }

  return await importKey(keyData);
};

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Create location data object
 */
export const createLocationData = (latitude, longitude, accuracy = null) => {
  return {
    latitude,
    longitude,
    accuracy,
    timestamp: new Date().toISOString(),
  };
};
