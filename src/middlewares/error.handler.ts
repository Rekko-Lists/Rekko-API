import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../domain/errors/http.errors';

const isDevelopment =
    process.env.NODE_ENV === 'development';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const stack = isDevelopment ? err.stack : undefined;

    if (err instanceof HttpError) {
        res.status(err.status).json({
            error: {
                message: err.message,
                details: err.details,
                stack
            }
        });
    } else {
        res.status(500).json({
            error: {
                message: 'Internal Server Error',
                stack
            }
        });
    }
};
