import { Request, Response } from 'express';

export function getAnime(req: Request, res: Response) {
  res.status(200).send(`ANIME GET ${req.params.animeid}`);
}

export function getAnimes(req: Request, res: Response) {
  res.status(200).send(`ANIME GET ANIME LIST`);
}

export function postAnime(req: Request, res: Response) {
  res.status(200).send(`ANIME ANIME`);
}

export function patchAnime(req: Request, res: Response) {
  res.status(200).send(`ANIME PATCH ${req.params.animeid}`);
}

export function deleteAnime(req: Request, res: Response) {
  res.status(200).send(`ANIME DELETE ${req.params.animeid}`);
}
