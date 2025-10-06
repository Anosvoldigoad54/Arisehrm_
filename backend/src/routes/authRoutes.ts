import { Router } from 'express';
import { login } from '../controllers/authController.js';

const router = Router();

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', login);

export default router;
