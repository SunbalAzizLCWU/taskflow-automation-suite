import mongoose from 'mongoose';

// Connects to MongoDB Atlas. Called once at startup. Exits the process on
// failure so the platform (Render/Fly) can restart and surface the error.
export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('[db] connected to MongoDB');
  } catch (err) {
    console.error('[db] connection error:', err.message);
    process.exit(1);
  }
}
