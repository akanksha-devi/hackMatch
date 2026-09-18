import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { runHackathonSync } from '../services/hackathonSync/index.js';

dotenv.config();

async function main() {
  console.log('====================================================');
  console.log('⚡ HackMatch - Automated Hackathon Synchronization CLI');
  console.log('====================================================');

  try {
    await connectDB();

    const result = await runHackathonSync();

    console.log('\n----------------------------------------------------');
    console.log('📊 SYNCHRONIZATION RESULTS SUMMARY');
    console.log('----------------------------------------------------');
    console.log(`Overall Status:   ${result.status}`);
    console.log(`Total Fetched:    ${result.fetchedCount}`);
    console.log(`Total Created:    ${result.createdCount}`);
    console.log(`Total Updated:    ${result.updatedCount}`);
    console.log(`Total Expired:    ${result.expiredCount}`);
    console.log(`Total Skipped:    ${result.skippedCount}`);
    console.log(`Total Errors:     ${result.errorCount}`);
    console.log(`Execution Time:   ${result.durationMs}ms`);

    console.log('\n----------------------------------------------------');
    console.log('🔍 PER-SOURCE BREAKDOWN');
    console.log('----------------------------------------------------');
    for (const [sourceId, data] of Object.entries(result.sourceBreakdowns || {})) {
      console.log(`Source:     ${data.name} (${sourceId})`);
      console.log(`Status:     ${data.status}`);
      console.log(`Fetched:    ${data.fetched}`);
      console.log(`Created:    ${data.created}`);
      console.log(`Updated:    ${data.updated}`);
      console.log(`Skipped:    ${data.skipped}`);
      console.log(`Errors:     ${data.errors}`);
      if (data.errorMessage) {
        console.log(`Error Msg:  ${data.errorMessage}`);
      }
      console.log('----------------------------------------------------');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal error during synchronization execution:', err);
    process.exit(1);
  }
}

main();
