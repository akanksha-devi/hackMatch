import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const LOCAL_URI_FILE = path.resolve(process.cwd(), '.local-mongo-uri');

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  let mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmatch';

  // In local dev, if .local-mongo-uri exists, attempt to connect to the existing running instance
  if (process.env.NODE_ENV !== 'production' && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
    if (fs.existsSync(LOCAL_URI_FILE)) {
      try {
        const savedUri = fs.readFileSync(LOCAL_URI_FILE, 'utf8').trim();
        if (savedUri) {
          mongoUri = savedUri;
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,
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
            const rawUri = mongod.getUri();
            const fullUri = rawUri.endsWith('/') ? `${rawUri}hackmatch` : `${rawUri}/hackmatch`;
            console.log(`[MongoDB] Embedded MongoDB started at: ${fullUri}`);

            try {
              fs.writeFileSync(LOCAL_URI_FILE, fullUri, 'utf8');
            } catch (writeErr) {
              // Ignore file write error
            }

            return mongoose.connect(fullUri, { bufferCommands: false });
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

