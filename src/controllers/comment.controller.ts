import { Request, Response } from 'express';

export function getComment(req: Request, res: Response) {
  res.status(200).send(`COMMENT GET ${req.params.commentid}`);
}

export function getComments(req: Request, res: Response) {
  res.status(200).send(`COMMENT GET COMMENT LIST`);
}

export function postComment(req: Request, res: Response) {
  res.status(200).send(`COMMENT COMMENT`);
}

export function patchComment(req: Request, res: Response) {
  res.status(200).send(`COMMENT PATCH ${req.params.commentid}`);
}

export function deleteComment(req: Request, res: Response) {
  res.status(200).send(`COMMENT DELETE ${req.params.commentid}`);
}
