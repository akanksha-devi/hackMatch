import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Function Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Serverless database connection error',
    });
  }
}
