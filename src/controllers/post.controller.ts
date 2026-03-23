import { Request, Response } from 'express';

export function getPost(req: Request, res: Response) {
  res.status(200).send(`POST GET ${req.params.postid}`);
}

export function getPosts(req: Request, res: Response) {
  res.status(200).send(`POST GET POST LIST`);
}

export function postPost(req: Request, res: Response) {
  res.status(200).send(`POST POST`);
}

export function patchPost(req: Request, res: Response) {
  res.status(200).send(`POST PATCH ${req.params.postid}`);
}

export function deletePost(req: Request, res: Response) {
  res.status(200).send(`POST DELETE ${req.params.postid}`);
}
