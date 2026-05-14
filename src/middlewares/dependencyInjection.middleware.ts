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
    (req as any).container = container as Container;
    next();
};

declare global {
    namespace Express {
        interface Request {
            container?: Container;
        }
    }
}
