import mongoose from 'mongoose';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';
import Booking from './src/models/booking.model.js';
import { createCheckoutSession } from './src/services/stripe.service.js';

async function runFullTest() {
    try {
        console.log('--- Full Integrated Test Started ---');
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');
        console.log('Connected to DB');

        // 1. Get or Create Test User
        let user = await User.findOne({ email: 'test_integrator@example.com' });
        if (!user) {
            user = await User.create({
                name: 'Test Integrator',
                email: 'test_integrator@example.com',
                password: 'password123', // Doesn't matter for token bypass
                role: 'user'
            });
            console.log('Created test user');
        }

        // 2. Get a Property
        const property = await Property.findOne();
        if (!property) throw new Error('No property found');
        console.log(`Using property: ${property.title}`);

        // 3. Create a Booking
        const booking = await Booking.create({
            userId: user._id.toString(),
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: new Date('2026-07-01'),
            checkOutDate: new Date('2026-07-05'),
            totalPrice: property.price * 4,
            numberOfGuests: 1,
            status: 'pending'
        });
        console.log(`Created booking: ${booking._id}`);

        // 4. Test Stripe Session Generation
        console.log('Generating Stripe Checkout Session...');
        const session = await createCheckoutSession(booking, property);
        console.log('SUCCESS! Stripe Session URL:', session.url);
        console.log('Session ID:', session.id);

        // Clean up test booking if you want, but maybe keep it to show in DB
        // await Booking.findByIdAndDelete(booking._id);

    } catch (err) {
        console.error('Integration test failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runFullTest();
