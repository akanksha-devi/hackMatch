import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'hackmatch_super_secret_jwt_key_multi_college_2026';
  return jwt.sign(payload, secret, {
    expiresIn: '30d',
  });
};
