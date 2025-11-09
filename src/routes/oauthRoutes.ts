import { Router } from 'express';
import { initiateGoogleAuth, handleGoogleCallback } from '../controllers/oauthController';

const router = Router();

router.get('/google/login', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

export default router;
