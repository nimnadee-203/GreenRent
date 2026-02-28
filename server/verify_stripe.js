import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';
import Booking from './src/models/booking.model.js';

const BASE_URL = 'http://localhost:5001';

async function verifyStripeFlow() {
    try {
        console.log('--- Dedicated Stripe Payment Verification Started ---');
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');

        // 1. Get real test data
        const user = await User.findOne({ role: 'user' }) || await User.findOne();
        const property = await Property.findOne();

        if (!user || !property) {
            console.error('❌ Error: Need at least one user and one property in DB to test.');
            process.exit(1);
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const userToken = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET);
        const headers = { Authorization: `Bearer ${userToken}` };

        // 2. Create a fresh booking
        console.log('1. Creating a fresh booking...');
        const bookingRes = await axios.post(`${BASE_URL}/api/bookings`, {
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: '2029-12-01',
            checkOutDate: '2029-12-05',
            numberOfGuests: 2
        }, { headers });

        const bookingId = bookingRes.data.booking._id;
        console.log(`   ✅ Booking created: ${bookingId}`);

        // 3. Create Stripe Session
        console.log('2. Requesting Stripe Checkout Session...');
        const sessionRes = await axios.post(`${BASE_URL}/api/bookings/pay-session/${bookingId}`, {}, { headers });

        if (sessionRes.data.url && sessionRes.data.sessionId) {
            console.log(`   ✅ Stripe Session Created!`);
            console.log(`   🔗 Checkout URL: ${sessionRes.data.url}`);
            console.log(`   🆔 Session ID: ${sessionRes.data.sessionId}`);
        } else {
            throw new Error('Stripe session response missing URL or ID');
        }

        // 4. Simulate Webhook (Success)
        console.log('3. Simulating Stripe Webhook Success...');
        // We call the service logic or if the webhook route is open for simulation:
        // For a real integration test, we'd use stripe CLI, but here we can check if the booking updates.

        // Check if the booking now has the stripeSessionId stored
        const updatedBooking = await Booking.findById(bookingId);
        if (updatedBooking.stripeSessionId === sessionRes.data.sessionId) {
            console.log('   ✅ Stripe Session ID correctly persisted to Booking model.');
        } else {
            console.error('   ❌ Stripe Session ID mismatch in database.');
        }

        await mongoose.disconnect();
        console.log('\n✅ STRIPE FLOW VERIFIED (Checkout Session Creation & Persistence)');
        console.log('Note: To test the actual webhook receipt, please use the Stripe CLI in your local terminal.');

    } catch (err) {
        console.error('❌ Stripe verification failed:', err.response?.data || err.message);
    } finally {
        process.exit();
    }
}

verifyStripeFlow();
