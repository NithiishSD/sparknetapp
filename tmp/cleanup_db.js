import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const cleanup = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Remove null fields that cause E11000
    const result = await users.updateMany(
      { 
        $or: [
          { googleId: null },
          { facebookId: null },
          { twitterId: null },
          { appleId: null }
        ]
      },
      { 
        $unset: { 
          googleId: "", 
          facebookId: "", 
          twitterId: "", 
          appleId: "" 
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} documents. Removed null OAuth IDs.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
