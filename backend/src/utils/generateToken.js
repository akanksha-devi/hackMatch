import jwt from 'jsonwebtoken';
import { getJwtSecret } from './sanitize.js';

export const generateToken = (payload) => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: '30d',
  });
};
