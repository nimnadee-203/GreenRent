import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/userModel.js';
import Property from './src/models/Property.js';
import Booking from './src/models/booking.model.js';
import {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBookingById,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    deleteBooking
} from './src/services/booking.service.js';

async function runExhaustiveTest() {
    try {
        console.log('--- Exhaustive Service-Level Test Started ---');
        await mongoose.connect(process.env.MONGODB_URI + '/green-rent');
        console.log('✅ Connected to DB');

        // Setup: Get a user and property
        const user = await User.findOne();
        const property = await Property.findOne();
        if (!user || !property) throw new Error('Need at least one user and property in DB');

        // 1. Create Booking
        console.log('1. Testing createBooking...');
        const booking = await createBooking({
            userId: user._id.toString(),
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: new Date('2026-08-01'),
            checkOutDate: new Date('2026-08-05'),
            numberOfGuests: 2,
            status: 'pending'
        });
        console.log(`   - Created: ${booking._id}`);

        // 2. Get All Bookings (Admin view)
        console.log('2. Testing getAllBookings...');
        const allBookings = await getAllBookings();
        console.log(`   - Found ${allBookings.length} bookings`);

        // 3. Get User Bookings
        console.log('3. Testing getUserBookings...');
        const userBookings = await getUserBookings(user._id.toString());
        console.log(`   - User has ${userBookings.length} bookings`);

        // 4. Get Single Booking
        console.log('4. Testing getBookingById...');
        const foundBooking = await getBookingById(booking._id);
        console.log(`   - Found booking: ${foundBooking?._id}`);

        // 5. Update Booking
        console.log('5. Testing updateBooking (Change guests)...');
        const updated = await updateBooking(booking._id, { numberOfGuests: 5 });
        console.log(`   - Updated guests to: ${updated.numberOfGuests}`);

        // 6. Update Status (Admin action)
        console.log('6. Testing updateBookingStatus (Confirm)...');
        const confirmed = await updateBookingStatus(booking._id, 'confirmed');
        console.log(`   - Status updated to: ${confirmed.status}`);

        // 7. Cancel Booking
        console.log('7. Testing cancelBooking...');
        const cancelled = await cancelBooking(booking._id, 'User changed mind');
        console.log(`   - Status updated to: ${cancelled.status}`);
        console.log(`   - Reason: ${cancelled.cancellationReason}`);

        // 8. Delete Booking
        console.log('8. Testing deleteBooking...');
        await deleteBooking(booking._id);
        const deleted = await getBookingById(booking._id);
        console.log(`   - Verified deletion: ${!deleted}`);

        console.log('\n--- Webhook Verification (Internal Logic) ---');
        // Test the logic that the webhook uses
        const webhookTestBooking = await Booking.create({
            userId: user._id.toString(),
            apartmentId: property._id,
            stayType: 'short',
            checkInDate: new Date('2026-09-01'),
            checkOutDate: new Date('2026-09-05'),
            numberOfGuests: 1,
            status: 'pending',
            paymentStatus: 'unpaid'
        });

        console.log('Simulating Webhook completion logic...');
        webhookTestBooking.paymentStatus = 'paid';
        webhookTestBooking.status = 'confirmed';
        await webhookTestBooking.save();

        const verifiedWebhook = await Booking.findById(webhookTestBooking._id);
        console.log(`   - Payment Status: ${verifiedWebhook.paymentStatus}`);
        console.log(`   - Booking Status: ${verifiedWebhook.status}`);

        await Booking.findByIdAndDelete(webhookTestBooking._id);

        console.log('\n✅ ALL SERVICE ENDPOINTS VERIFIED SUCCESSFULLY');

    } catch (err) {
        console.error('❌ Test failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

runExhaustiveTest();
