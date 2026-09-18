import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmatch';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    };

    cached.promise = mongoose.connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log(`[MongoDB] Connected to database: ${mongooseInstance.connection.name} (${mongooseInstance.connection.host})`);
        return mongooseInstance;
      })
      .catch(async (err) => {
        // In local development, if connection to local MongoDB fails, fall back to mongodb-memory-server
        if (process.env.NODE_ENV !== 'production' && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
          console.warn(`[MongoDB] Local MongoDB connection failed (${err.message}). Starting embedded in-memory MongoDB for local development/testing...`);
          try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create({
              instance: { dbName: 'hackmatch' }
            });
            const memUri = mongod.getUri();
            console.log(`[MongoDB] Embedded MongoDB started at: ${memUri}`);
            return mongoose.connect(memUri, { bufferCommands: false });
          } catch (memErr) {
            console.error('[MongoDB] Failed to start embedded MongoDB:', memErr.message);
            throw err;
          }
        }
        console.error(`[MongoDB] Database connection error: ${err.message}`);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
