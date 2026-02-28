import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';

/**
 * Seeds a default admin user if none exists in the database.
 */
export const seedAdmin = async () => {
    try {
        const adminEmail = 'test1@test.com';
        const defaultPassword = 'AdminPassword123';

        const user = await userModel.findOne({ email: adminEmail });

        if (!user) {
            console.log('Seeding default admin user...');
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            await userModel.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log(`✅ Default admin created: ${adminEmail}`);
            console.log(`🔑 Password: ${defaultPassword}`);
            console.log('IMPORTANT: Please change this password after your first login.');
        } else if (user.role !== 'admin') {
            console.log(`Promoting existing user ${adminEmail} to admin...`);
            user.role = 'admin';
            await user.save();
            console.log(`✅ User ${adminEmail} promoted to admin.`);
        } else {
            console.log('Admin user already exists. Skipping seed.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error.message);
    }
};

export default seedAdmin;
