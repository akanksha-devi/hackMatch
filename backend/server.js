import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import College from './src/models/College.js';
import Hackathon from './src/models/Hackathon.js';
import { seedDatabase } from './src/utils/seed.js';
import { runHackathonSync } from './src/services/hackathonSync/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is completely empty (ideal for local testing and first run)
    const collegeCount = await College.countDocuments();
    if (collegeCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo data...');
      await seedDatabase();
    }

    // Auto-sync external hackathons if none exist yet
    const externalCount = await Hackathon.countDocuments({ isExternal: true });
    if (externalCount === 0) {
      console.log('[Server] No external hackathons found. Initiating background hackathon sync...');
      runHackathonSync().then(res => {
        console.log(`[Server] Background sync completed: ${res.createdCount} events imported.`);
      }).catch(err => {
        console.warn('[Server] Background sync warning:', err.message);
      });
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 [HackMatch Backend] Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('[Server] Fatal error during startup:', error);
    process.exit(1);
  }
};

startServer();
