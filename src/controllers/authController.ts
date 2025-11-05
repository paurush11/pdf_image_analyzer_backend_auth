import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const signUp = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      message: 'You missed some field',
    });
  }
  try {
    const result = await authService.signUp(email, password, name);
    return res.status(200).json({
      message: ' Succesfully created',
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || 'Signup failed',
    });
  }
};
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: 'Email and verification code required',
    });
  }

  try {
    await authService.verifyEmail(email, code);
    return res.status(200).json({
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || 'Verification failed',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'email or password maybe wrong !!',
    });
  }
  try {
    const result = await authService.login(email, password);
    return res.status(200).json({
      message: 'Login successful',
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
      refreshToken: result.AuthenticationResult?.RefreshToken,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || 'Verification failed',
    });
  }
};
