import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';
import Booking from './src/models/booking.model.js';

// Using the port from .env or default to 5001
const BASE_URL = 'http://localhost:5001';

async function verifyStripeEndpoints() {
    try {
        console.log('--- Stripe Endpoint Verification Started ---');
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');

        // 1. Get test data
        const user = await User.findOne({ role: 'user' }) || await User.findOne();
        const property = await Property.findOne();

        if (!user || !property) {
            console.error('❌ Error: Database must have at least one user and one property.');
            process.exit(1);
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
        const userToken = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET);
        const headers = { Authorization: `Bearer ${userToken}` };

        // 2. Create Booking
        console.log('1. Creating a fresh booking for payment test...');
        const bookingRes = await axios.post(`${BASE_URL}/api/bookings`, {
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: '2030-05-01',
            checkOutDate: '2030-05-05',
            numberOfGuests: 2
        }, { headers });

        const bookingId = bookingRes.data.booking._id;
        console.log(`   ✅ Booking created: ${bookingId}`);

        // 3. Request Stripe Session
        console.log('2. Testing POST /api/bookings/pay-session/:id ...');
        // Using the explicit path we refactored to: /pay-session/:id
        const sessionRes = await axios.post(`${BASE_URL}/api/bookings/pay-session/${bookingId}`, {}, { headers });

        if (sessionRes.data.url && sessionRes.data.sessionId) {
            console.log(`   ✅ Stripe Session Success!`);
            console.log(`   🔗 URL: ${sessionRes.data.url}`);
            console.log(`   🆔 ID: ${sessionRes.data.sessionId}`);

            // Verify database persistence
            const updatedBooking = await Booking.findById(bookingId);
            if (updatedBooking.stripeSessionId === sessionRes.data.sessionId) {
                console.log('   ✅ Session ID saved to database successfully.');
            } else {
                console.error('   ❌ Session ID not found in database.');
            }
        }

        await mongoose.disconnect();
        console.log('\n✅ STRIPE ENDPOINT VERIFICATION COMPLETED');

    } catch (err) {
        console.error('❌ Stripe test failed:', err.response?.data || err.message);
    } finally {
        process.exit();
    }
}

verifyStripeEndpoints();
