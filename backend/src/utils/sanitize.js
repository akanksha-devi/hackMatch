import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * Escapes characters for safe RegExp construction to prevent ReDoS & syntax errors
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Builds a safe RegExp with query length bounding to prevent expensive patterns
 */
export const safeRegex = (str, flags = 'i', maxLength = 80) => {
  if (typeof str !== 'string') return null;
  const trimmed = str.trim().slice(0, maxLength);
  if (!trimmed) return null;
  return new RegExp(escapeRegex(trimmed), flags);
};

/**
 * Timing-safe string comparison using crypto.timingSafeEqual
 * Prevents side-channel timing attacks on secrets/tokens.
 */
export const timingSafeEqualStr = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

/**
 * Validates whether an input is a valid 24-character hexadecimal MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Retrieves authoritative JWT secret, enforcing strict configuration in production
 */
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production.');
  }
  return secret || 'hackmatch_super_secret_jwt_key_multi_college_2026';
};

/**
 * Validates that an avatar public ID belongs to the authorized user's namespace
 * and does not attempt IDOR against other users or path traversal.
 */
export const isAllowedAvatarPublicId = (pubId, userId) => {
  if (!pubId || typeof pubId !== 'string') return true;
  const trimmed = pubId.trim();
  if (trimmed === '') return true;
  if (trimmed.includes('..')) return false;

  const validNamespace = trimmed.startsWith('hackmatch/avatars/') || trimmed.startsWith('user_');
  if (!validNamespace) return false;

  const uidStr = String(userId);

  // If publicId starts with user_<id>, verify it matches the user's ID
  if (trimmed.startsWith('user_')) {
    return trimmed.startsWith(`user_${uidStr}`);
  }

  // If publicId contains an explicit user ID under hackmatch/avatars/user_<id>
  const userMatch = trimmed.match(/user_([a-fA-F0-9]{24})/);
  if (userMatch) {
    const targetUserId = userMatch[1];
    if (targetUserId !== uidStr) {
      return false;
    }
  }

  return true;
};

export default {
  escapeRegex,
  safeRegex,
  timingSafeEqualStr,
  isValidObjectId,
  getJwtSecret,
  isAllowedAvatarPublicId,
};
