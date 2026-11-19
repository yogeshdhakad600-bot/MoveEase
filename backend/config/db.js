const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

let memoryServer = null;

function isLocalMongo(uri) {
  return /mongodb:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\//i.test(uri || '');
}

async function connectDB() {
  mongoose.set('strictQuery', true);

  const configuredUri = process.env.MONGO_URI;
  const autoMongo = String(process.env.AUTO_MONGO ?? 'true').toLowerCase() !== 'false';
  let mongoUri = configuredUri || 'mongodb://127.0.0.1:27017/moveease';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
      family: 4,
    });
    console.log(`MongoDB connected: ${mongoUri.replace(/:\/\/.*@/, '://***@')}`);
    return true;
  } catch (err) {
    if (!autoMongo || (configuredUri && !isLocalMongo(configuredUri))) {
      console.error(`MongoDB connection failed: ${err.message}`);
      return false;
    }
  }

  try {
    const dataPath = path.resolve(process.env.EMBEDDED_MONGO_DB_PATH || path.join(__dirname, '..', 'data', 'mongo'));
    fs.mkdirSync(dataPath, { recursive: true });
    console.log('Local MongoDB is unavailable. Starting MoveEase embedded MongoDB...');
    memoryServer = await MongoMemoryServer.create({
      instance: { dbName: 'moveease', dbPath: dataPath },
      binary: { version: process.env.EMBEDDED_MONGO_VERSION || '7.0.14' },
    });
    mongoUri = memoryServer.getUri('moveease');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    });

    console.log('MongoDB connected: MoveEase embedded database');
    return true;
  } catch (err) {
    console.error('\n❌ Could not start MongoDB automatically.');
    console.error(`   ${err.message}`);
    console.error('   If this is the first run, make sure internet access is available so the embedded MongoDB binary can be downloaded.');
    console.error('   Or set AUTO_MONGO=false and use MongoDB Community/Docker/Atlas.\n');
    return false;
  }
}

async function closeDB() {
  if (memoryServer) {
    const instance = memoryServer.instanceInfo?.instance;
    const mongodProcess = instance?.mongodProcess;

    if (mongodProcess && mongoose.connection.readyState === 1) {
      try { await mongoose.connection.db.admin().command({ shutdown: 1 }); } catch (_) {}

      const exited = await new Promise((resolve) => {
        if (mongodProcess.exitCode !== null || mongodProcess.signalCode !== null) return resolve(true);
        const onClose = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        const timeout = setTimeout(() => {
          mongodProcess.removeListener('close', onClose);
          resolve(false);
        }, 10000);
        timeout.unref();
        mongodProcess.once('close', onClose);
      });

      if (exited) instance.mongodProcess = undefined;
    }

    try { await mongoose.connection.close(); } catch (_) {}
    try { await memoryServer.stop(); } catch (_) {}
    memoryServer = null;
    return;
  }

  try { await mongoose.connection.close(); } catch (_) {}
}

module.exports = { connectDB, closeDB };
