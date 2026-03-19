import { Request, Response } from 'express';

export function getUser(req: Request, res: Response) {
  res.status(200).send(`USER GET ${req.params.username}`);
}

export function getUsers(req: Request, res: Response) {
  res.status(200).send(`USER GET USER LIST`);
}

export function postUser(req: Request, res: Response) {
  res.status(200).send(`USER POST`);
}

export function patchUser(req: Request, res: Response) {
  res.status(200).send(`USER PATCH ${req.params.username}`);
}

export function deleteUser(req: Request, res: Response) {
  res.status(200).send(`USER DELETE ${req.params.username}`);
}

export function changeEmail(req: Request, res: Response) {
  res
    .status(200)
    .send(`USER EMAIL REQUEST ${req.params.username}`);
}

export function changeEmailConfirm(req: Request, res: Response) {
  res
    .status(200)
    .send(`USER EMAIL CONFIRM ${req.params.username}`);
}

export function changePassword(req: Request, res: Response) {
  res.status(200).send(`USER PASSWORD ${req.params.username}`);
}
