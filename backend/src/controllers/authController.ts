import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const userResult = await query('SELECT * FROM public.users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch the user's profile to include in the response
    const profileResult = await query('SELECT * FROM public.user_profiles WHERE auth_user_id = $1', [user.id]);

    if (profileResult.rows.length === 0) {
        // This case might happen if a user exists in `users` but not `user_profiles`
        return res.status(404).json({ message: 'User profile not found' });
    }

    const userProfile = profileResult.rows[0];

    // Generate a JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: userProfile.role_id },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        profile: userProfile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
