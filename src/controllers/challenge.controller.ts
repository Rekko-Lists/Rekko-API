import { Request, Response } from 'express';

export function dailyChallenges(req: Request, res: Response) {
  res.status(200).send('Daily challenges');
}

export function historyChallenges(req: Request, res: Response) {
  res.status(200).send('History challenges');
}

export function dateChallenges(req: Request, res: Response) {
  res.status(200).send('Date challenges');
}
