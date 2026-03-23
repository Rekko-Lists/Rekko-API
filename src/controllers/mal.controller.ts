import { Request, Response } from 'express';

export function getMalAnimes(req: Request, res: Response) {
  res.status(200).send('Animes');
}

export function getMalAnime(req: Request, res: Response) {
  res.status(200).send(`Anime GET ${req.params.malid}`);
}
