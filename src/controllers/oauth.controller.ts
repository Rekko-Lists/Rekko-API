import { Request, Response } from 'express';

export function oauth(req: Request, res: Response) {
  res.status(200).send(`OAUTH ${req.params.provider}`);
}

export function callback(req: Request, res: Response) {
  res.status(200).send(`OAUTH callback ${req.params.provider}`);
}
