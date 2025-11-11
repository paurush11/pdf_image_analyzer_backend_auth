import { Router } from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  initiateGitHubAuth,
  handleGitHubCallback,
} from '../controllers/oauthController';

const router = Router();

router.get('/google/login', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.get('/github/login', initiateGitHubAuth);
router.get('/github/callback', handleGitHubCallback);

export default router;
