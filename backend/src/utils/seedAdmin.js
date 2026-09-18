import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

export const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'superadmin@hackmatch.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.role = 'superAdmin';
      admin.status = 'Active';
      admin.password = adminPassword; // Triggers pre-save bcrypt hook
      await admin.save();
      console.log(`[SeedAdmin] Super Admin updated: ${adminEmail}`);
    } else {
      admin = await User.create({
        name: 'Super Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'superAdmin',
        status: 'Active',
        bio: 'Root platform administrator.',
      });
      console.log(`[SeedAdmin] Super Admin created: ${adminEmail}`);
    }

    console.log(`[SeedAdmin] Login using: ${adminEmail} / ${adminPassword}`);
  } catch (err) {
    console.error('[SeedAdmin Error]:', err.message);
    throw err;
  }
};

if (process.argv[1]?.endsWith('seedAdmin.js')) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
