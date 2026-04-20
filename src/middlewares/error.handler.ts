import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
    HttpError,
    NotFoundError
} from '../domain/errors/http.errors';
import { AuthError } from '../domain/errors/auth.errors';

const isDevelopment = process.env.NODE_ENV === 'development';

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    next(
        new NotFoundError({
            message: 'Route not found',
            path: req.originalUrl,
            method: req.method
        })
    );
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const stack = isDevelopment ? err.stack : undefined;

    if (err instanceof ZodError) {
        const message = err.issues
            .map((issue) => {
                return `${issue.message}`;
            })
            .join('; ');

        res.status(400).json({
            error: {
                message: 'Validation error',
                details: message,
                stack
            }
        });
        return;
    }

    if (err instanceof HttpError) {
        res.status(err.status).json({
            error: {
                message: err.message,
                details: err.details,
                stack
            }
        });
        return;
    }

    if (err instanceof AuthError) {
        res.status(err.status).json({
            error: {
                message: err.message,
                details: err.details,
                stack
            }
        });
        return;
    }

    res.status(500).json({
        error: {
            message: 'Internal Server Error',
            stack
        }
    });
};
