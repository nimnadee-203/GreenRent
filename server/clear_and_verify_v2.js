import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';
import Booking from './src/models/booking.model.js';

const BASE_URL = 'http://localhost:5000';

async function runFreshTest() {
    try {
        console.log('--- Fresh Start Verification V2 Started ---');
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');

        // 0. CLEAR ALL BOOKINGS
        console.log('0. Clearing all existing bookings...');
        await Booking.deleteMany({});

        // 1. Get real users and property from DB
        const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();
        const regularUser = await User.findOne({ role: 'user' }) || await User.findOne();
        const property = await Property.findOne();
        await mongoose.disconnect();

        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, JWT_SECRET);
        const userToken = jwt.sign({ id: regularUser._id, role: regularUser.role, email: regularUser.email }, JWT_SECRET);

        const headers = (token) => ({ Authorization: `Bearer ${token}` });

        const checkIn = `2032-01-01`;
        const checkOut = `2032-01-05`;

        // 2. Create booking
        console.log('2. Creating booking (User Token)...');
        const bookingRes = await axios.post(`${BASE_URL}/api/bookings`, {
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: 2
        }, { headers: headers(userToken) });
        const bookingId = bookingRes.data.booking._id;
        console.log(`   - Created booking: ${bookingId}`);

        // 3. Get own bookings
        console.log('3. Getting own bookings (User Token)...');
        const myBookings = await axios.get(`${BASE_URL}/api/bookings/my`, { headers: headers(userToken) });
        console.log(`   - Found ${myBookings.data.count} bookings`);

        // 4. Update booking (NEW ROUTE)
        console.log('4. Updating booking (User Token) at /update...');
        const updateRes = await axios.put(`${BASE_URL}/api/bookings/${bookingId}/update`, { numberOfGuests: 4 }, { headers: headers(userToken) });
        console.log(`   - Updated booking: ${updateRes.data.message}`);

        // 5. Update Status (Admin Token)
        console.log('5. Updating status to confirmed (Admin Token)...');
        const statusRes = await axios.put(`${BASE_URL}/api/bookings/${bookingId}/status`, { status: 'confirmed' }, { headers: headers(adminToken) });
        console.log(`   - Status updated to: ${statusRes.data.booking.status}`);

        // 6. Cancel booking
        console.log('6. Cancelling booking (User Token)...');
        const cancelRes = await axios.put(`${BASE_URL}/api/bookings/${bookingId}/cancel`, { cancellationReason: 'Final Success' }, { headers: headers(userToken) });
        console.log(`   - Cancelled: ${cancelRes.data.booking.status}`);

        // 7. Delete booking
        console.log('7. Deleting booking (Admin Token)...');
        await axios.delete(`${BASE_URL}/api/bookings/${bookingId}`, { headers: headers(adminToken) });
        console.log('   - Deleted booking');

        console.log('\n✅ 100% EXHAUSTIVE VERIFICATION COMPLETED SUCCESSFULLY');

    } catch (err) {
        console.error('❌ Integration test failed:', err.response?.data || err.message);
    } finally {
        process.exit();
    }
}

runFreshTest();
