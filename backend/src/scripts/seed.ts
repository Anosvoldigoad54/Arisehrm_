import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

const seedDatabase = async () => {
  console.log('Starting to seed the database...');

  try {
    // 1. Hash the password for our test user
    const password = 'password123'; // A simple password for our test user
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully.');

    // 2. Insert the new user into the 'users' table
    const userResult = await query(
      'INSERT INTO public.users (email, password_hash) VALUES ($1, $2) RETURNING id',
      ['test@example.com', hashedPassword]
    );
    const newUser = userResult.rows[0];
    console.log(`Created user with email: test@example.com, ID: ${newUser.id}`);

    // 3. Create a corresponding profile in the 'user_profiles' table
    await query(
      `INSERT INTO public.user_profiles (employee_id, auth_user_id, email, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['EMP001', newUser.id, 'test@example.com', 'Test', 'User', 6] // Role 6 is 'Employee'
    );
    console.log('Created user profile for test@example.com.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    // In a real script, you might want to close the pool connection if it's a standalone script
    // For this simple case, we'll let the script exit.
  }
};

seedDatabase();
