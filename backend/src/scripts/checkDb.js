import mongoose from 'mongoose';
import Hackathon from '../models/Hackathon.js';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  await connectDB();

  const totalHackathons = await Hackathon.countDocuments();
  const totalExternal = await Hackathon.countDocuments({ isExternal: true });
  const totalCurated = await Hackathon.countDocuments({ source: 'curated' });
  const totalManual = await Hackathon.countDocuments({ isExternal: { $ne: true } });

  console.log('=== SAFE MONGODB DIAGNOSTICS ===');
  console.log('Backend database name:', mongoose.connection.name);
  console.log('Total hackathons:', totalHackathons);
  console.log('Total external:', totalExternal);
  console.log('Total curated:', totalCurated);
  console.log('Total manual:', totalManual);

  const examples = await Hackathon.find({ isExternal: true }).limit(3);
  examples.forEach((h, i) => {
    console.log(`\n--- Example ${i + 1} ---`);
    console.log('title:', h.title);
    console.log('source:', h.source);
    console.log('externalId:', h.externalId);
    console.log('isExternal:', h.isExternal);
    console.log('visibility:', h.visibility);
    console.log('status:', h.status);
    console.log('syncStatus:', h.syncStatus);
    console.log('registrationDeadline:', h.registrationDeadline);
    console.log('lastSyncedAt:', h.lastSyncedAt);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
