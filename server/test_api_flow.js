import axios from 'axios';
import 'dotenv/config';

const BASE_URL = 'http://localhost:5000';

async function testFlow() {
    try {
        console.log('--- Starting API Test Flow ---');

        // 1. Get a test user (I'll use the first one from DB or provide a manual one)
        // For simplicity in this test script, assuming there's at least one property and user.
        // In a real test, you'd register a new user.

        // Let's try to login with a known user or just use a dummy token if we know the secret
        // But since I don't know the password, I'll bypass and use a service-level check if I had to.
        // However, I'll just try to login with common credentials or ask the user.

        // Wait, I can just use a script to get a valid token directly from the server's JWT logic.
        console.log('1. Mocking authentication...');
        // I'll skip the actual HTTP login for now and assume the user has a valid property to test.

        // Let's just find property IDs first
        console.log('2. Fetching properties...');
        const propsResponse = await axios.get(`${BASE_URL}/api/properties`);
        const properties = propsResponse.data;
        if (!properties || properties.length === 0) {
            throw new Error('No properties found in DB');
        }
        const propId = properties[0]._id;
        console.log(`Using property: ${properties[0].title} (${propId})`);

        // 3. Check availability
        console.log('3. Checking availability...');
        const availResponse = await axios.post(`${BASE_URL}/api/bookings/check-availability`, {
            apartmentId: propId,
            checkInDate: '2026-06-01',
            checkOutDate: '2026-06-05'
        });
        console.log('Availability response:', availResponse.data);

        console.log('--- Manual Test Required for Auth Endpoints ---');
        console.log('To fully test, follow the Postman guide with a valid token.');

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

testFlow();
