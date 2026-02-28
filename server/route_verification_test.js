import axios from 'axios';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate mock tokens
const adminToken = jwt.sign({ id: 'admin-001', role: 'admin', name: 'Admin User' }, JWT_SECRET);
const userToken = jwt.sign({ id: 'user-001', role: 'user', name: 'Test User' }, JWT_SECRET);

const headers = (token) => ({ Authorization: `Bearer ${token}` });

async function runRouteTests() {
    try {
        console.log('--- Route-Level Integration Test Started ---');

        console.log('1. Fetching properties (Public)...');
        const props = await axios.get(`${BASE_URL}/api/properties`);
        const propId = props.data[0]._id;

        console.log('2. Creating booking (User Token)...');
        const bookingRes = await axios.post(`${BASE_URL}/api/bookings`, {
            apartmentId: propId,
            stayType: 'short',
            checkInDate: '2026-10-01',
            checkOutDate: '2026-10-05',
            numberOfGuests: 2
        }, { headers: headers(userToken) });
        const bookingId = bookingRes.data.booking._id;
        console.log(`   - Created booking: ${bookingId}`);

        console.log('3. Getting own bookings (User Token)...');
        const myBookings = await axios.get(`${BASE_URL}/api/bookings/my`, { headers: headers(userToken) });
        console.log(`   - Found ${myBookings.data.count} bookings for user`);

        console.log('4. Getting all bookings (Admin Token)...');
        const allBookings = await axios.get(`${BASE_URL}/api/bookings`, { headers: headers(adminToken) });
        console.log(`   - Admin found ${allBookings.data.count} total bookings`);

        console.log('5. Creating Stripe Payment Session (User Token)...');
        const sessionRes = await axios.post(`${BASE_URL}/api/bookings/${bookingId}/payment-session`, {}, { headers: headers(userToken) });
        console.log(`   - Generated session URL: ${sessionRes.data.url.substring(0, 50)}...`);

        console.log('6. Updating status to confirmed (Admin Token)...');
        const statusRes = await axios.put(`${BASE_URL}/api/bookings/${bookingId}/status`, { status: 'confirmed' }, { headers: headers(adminToken) });
        console.log(`   - Status updated to: ${statusRes.data.booking.status}`);

        console.log('7. Cancelling reservation (User Token)...');
        const cancelRes = await axios.put(`${BASE_URL}/api/bookings/${bookingId}/cancel`, { cancellationReason: 'Testing' }, { headers: headers(userToken) });
        console.log(`   - Status updated to: ${cancelRes.data.booking.status}`);

        console.log('8. Deleting booking (Admin Token)...');
        await axios.delete(`${BASE_URL}/api/bookings/${bookingId}`, { headers: headers(adminToken) });
        console.log('   - Booking deleted successfully');

        console.log('\n✅ ALL API ROUTES VERIFIED SUCCESSFULLY');

    } catch (err) {
        console.error('❌ Route test failed:', err.response?.data || err.message);
    } finally {
        process.exit();
    }
}

runRouteTests();
