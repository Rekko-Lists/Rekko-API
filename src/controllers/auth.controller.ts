import { Request, Response } from 'express';

export function login(req: Request, res: Response) {
  res.status(200).send('Login');
}

export function register(req: Request, res: Response) {
  res.status(200).send('Register');
}

export function logout(req: Request, res: Response) {
  res.status(200).send('Logout');
}

export function forgotPassword(req: Request, res: Response) {
  res.status(200).send('Forgot Password');
}

export function resetPassword(req: Request, res: Response) {
  res.status(200).send('Reset Password');
}

export function refreshToken(req: Request, res: Response) {
  res.status(200).send('Refresh Token');
}
