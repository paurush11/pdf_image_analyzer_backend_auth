import { Router } from 'express';
import { signUp, verifyEmail, login } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/verify', verifyEmail);
router.post('/login', login);

export default router;
