
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../configs/db.js';
import { hashPassword } from '../utils/password.js';

async function createTestUser() {
  try {
    await connectDB();

    const email = 'testuser@example.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Test user already exists.');
      return;
    }

    const passwordHash = await hashPassword(
      'TestUserPassword123!'
    );

    await User.create({
      firstName: 'Test',
      lastName: 'User',
      email,
      passwordHash,
      role: 'user',
      isActive: true,
    });

    console.log('Test user created successfully.');
    console.log(`Email: ${email}`);
  } catch (error) {
    console.error('Failed to create test user:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();
