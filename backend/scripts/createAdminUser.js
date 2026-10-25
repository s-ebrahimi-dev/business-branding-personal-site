
import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../configs/db.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

async function createAdmin() {
  const {
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
  } = process.env;

  if (
    !ADMIN_FIRST_NAME?.trim() ||
    !ADMIN_LAST_NAME?.trim() ||
    !ADMIN_EMAIL?.trim() ||
    !ADMIN_PASSWORD
  ) {
    throw new Error(
      'Admin initialization environment variables are missing.'
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error(
      'Admin password must contain at least 12 characters.'
    );
  }

  await connectDB();

  const existingAdmin = await User.exists({ role: 'admin' });

  if (existingAdmin) {
    throw new Error(
      'An admin account already exists. Initialization cancelled.'
    );
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();

  const existingUser = await User.exists({ email });

  if (existingUser) {
    throw new Error(
      'This email already belongs to a user. Choose another email.'
    );
  }

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const admin = await User.create({
    firstName: ADMIN_FIRST_NAME.trim(),
    lastName: ADMIN_LAST_NAME.trim(),
    email,
    passwordHash,
    role: 'admin',
    isActive: true,
  });

  console.log('Admin account created successfully.');
  console.log(`Admin email: ${admin.email}`);
}

createAdmin()
  .catch((error) => {
    console.error('Admin initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
