import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/userModel.js';

async function promoteToAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');
        const email = 'test1@test.com'; // Choosing this existing user

        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ User ${email} promoted to ADMIN successfully!`);
            console.log(`User ID: ${user._id}`);
        } else {
            console.error(`❌ User ${email} not found.`);
        }

    } catch (err) {
        console.error('❌ Error promoting user:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

promoteToAdmin();
