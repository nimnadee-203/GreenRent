import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserPreference from './src/models/UserPreference.js';
import { getUserPreferences, saveUserPreferences } from './src/services/recommendationService.js';

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const testId = new mongoose.Types.ObjectId();
    
    console.log('\n--- Testing Fallback (No Record) ---');
    const fallback = await getUserPreferences(testId);
    console.log('Fallback Output:', fallback);
    console.log('isDefault:', fallback.isDefault);

    console.log('\n--- Testing Saved Record ---');
    await saveUserPreferences(testId, { budgetMax: 123456 });
    const saved = await getUserPreferences(testId);
    console.log('Saved Output (Mongoose Doc):', saved);
    console.log('isDefault property on doc:', saved.isDefault);
    
    await UserPreference.deleteOne({ userId: testId });
    await mongoose.disconnect();
}

test();
