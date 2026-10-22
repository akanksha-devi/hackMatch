import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hackathonRoutes from './routes/hackathonRoutes.js';
import teamRequestRoutes from './routes/teamRequestRoutes.js';
import responseRoutes from './routes/responseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Standard OWASP Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// CORS configuration (supports configured frontend & local dev)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Direct match against configured allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In non-production or local dev, strictly parse and allow localhost/127.0.0.1 ports
      if (process.env.NODE_ENV !== 'production') {
        try {
          const parsed = new URL(origin);
          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            return callback(null, true);
          }
        } catch {
          // Ignore invalid URL
        }
      }

      // Vercel deployment support: allow if explicitly matching deployed VERCEL_URL
      if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
        return callback(null, true);
      }

      // Reject unapproved origins cleanly without throwing uncaught server errors
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root landing endpoints
app.get(['/', '/api'], (req, res) => {
  res.json({
    message: '🚀 HackMatch Multi-College Platform API is running',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      colleges: '/api/colleges',
      users: '/api/users',
      hackathons: '/api/hackathons',
      teamRequests: '/api/team-requests',
      responses: '/api/responses',
      admin: '/api/admin',
      experienceVerifications: '/api/experience-verifications',
      notifications: '/api/notifications',
      cronSync: '/api/cron/sync-hackathons',
      search: '/api/search',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    platform: 'HackMatch Multi-College Platform',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/team-requests', teamRequestRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/experience-verifications', verificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/search', searchRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
