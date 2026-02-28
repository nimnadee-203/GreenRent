import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';

async function getTestData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');
        const user = await User.findOne();
        const property = await Property.findOne();
        console.log(JSON.stringify({
            user: user ? { _id: user._id, email: user.email } : null,
            property: property ? { _id: property._id, title: property.title } : null
        }));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

getTestData();
