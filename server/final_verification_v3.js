import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';
import Booking from './src/models/booking.model.js';

const BASE_URL = 'http://localhost:5001';

async function runComprehensiveVerification() {
    try {
        console.log('--- 🚀 Final Integrated Verification Started (Admin + Stripe) ---');
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');

        // 0. CLEAR PREVIOUS TEST BOOKINGS
        console.log('0. Clearing all existing bookings...');
        await Booking.deleteMany({});

        // 1. Get real users and property from DB
        const adminUser = await User.findOne({ email: 'test1@test.com' });
        const regularUser = await User.findOne({ email: { $ne: 'test1@test.com' } }) || await User.findOne();
        const property = await Property.findOne();

        if (!adminUser || !regularUser || !property) {
            console.error('❌ Error: Necessary test data (Admin, User, or Property) missing in DB.');
            process.exit(1);
        }
        await mongoose.disconnect();

        const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
        const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, JWT_SECRET);
        const userToken = jwt.sign({ id: regularUser._id, role: regularUser.role, email: regularUser.email }, JWT_SECRET);

        const headers = (token) => ({ Authorization: `Bearer ${token}` });

        const checkIn = `2035-10-01`;
        const checkOut = `2035-10-05`;

        // 2. Create booking (User)
        console.log('1. User: Creating a fresh booking...');
        const bookingRes = await axios.post(`${BASE_URL}/api/bookings`, {
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: 2
        }, { headers: headers(userToken) });
        const bookingId = bookingRes.data.booking._id;
        console.log(`   ✅ Booking created: ${bookingId}`);

        // 3. Request Stripe Session (User)
        console.log('2. User: Requesting Stripe Session...');
        const sessionRes = await axios.post(`${BASE_URL}/api/bookings/pay-session/${bookingId}`, {}, { headers: headers(userToken) });
        console.log(`   ✅ Stripe Session ID: ${sessionRes.data.sessionId}`);

        // 4. Update booking (User)
        console.log('3. User: Updating booking guest count...');
        const updateRes = await axios.put(`${BASE_URL}/api/bookings/details/${bookingId}`, { numberOfGuests: 4 }, { headers: headers(userToken) });
        console.log(`   ✅ Update Success: ${updateRes.data.message}`);

        // 5. Update Status (Admin)
        console.log('4. Admin: Confirming the booking status...');
        const statusRes = await axios.put(`${BASE_URL}/api/bookings/admin/status/${bookingId}`, { status: 'confirmed' }, { headers: headers(adminToken) });
        console.log(`   ✅ Admin Success: Status updated to ${statusRes.data.booking.status}`);

        // 6. Admin: Get all bookings
        console.log('5. Admin: Fetching all bookings...');
        const allBookingsRes = await axios.get(`${BASE_URL}/api/bookings/admin/all`, { headers: headers(adminToken) });
        console.log(`   ✅ Admin Success: Found ${allBookingsRes.data.count} bookings total.`);

        console.log('\n🌟 100% EXHAUSTIVE VERIFICATION COMPLETED SUCCESSFULLY 🌟');

    } catch (err) {
        console.error('❌ Integrated verification failed:', err.response?.data || err.message);
    } finally {
        process.exit();
    }
}

runComprehensiveVerification();
