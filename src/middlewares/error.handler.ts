import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../domain/errors/http.errors';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof HttpError) {
        res.status(err.status).json({
            error: {
                message: err.message,
                details: err.details
            }
        });
    } else {
        console.error(err);
        res.status(500).json({
            error: {
                message: 'Internal Server Error'
            }
        });
    }
};
