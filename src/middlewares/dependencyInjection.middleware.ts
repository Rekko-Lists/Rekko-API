import { Request, Response, NextFunction } from 'express';
import {
    container,
    Container
} from '../infraestructure/container/container';

export const injectDependencies = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    req.container = container as Container;
    next();
};
