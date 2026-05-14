import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
    AppError,
    NotFoundError
} from '../exceptions/exceptions';

const isDevelopment = process.env.NODE_ENV === 'development';

const logError = (
    error: Error,
    req: Request,
    statusCode: number
): void => {
    console.error({
        timestamp: new Date().toISOString(),
        error: {
            name: error.constructor.name,
            message: error.message,
            stack: error.stack
        },
        request: {
            method: req.method,
            path: req.path,
            ip: req.ip
        },
        statusCode
    });
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = new NotFoundError('route');
    (error as any).context = {
        ...(error.context || {}),
        code: 'NOT_FOUND_ROUTE',
        path: req.originalUrl,
        method: req.method
    };
    next(error);
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const isDev = isDevelopment;

    if (err instanceof ZodError) {
        const message = err.issues
            .map(
                (issue) =>
                    `${issue.path.join('.')}: ${issue.message}`
            )
            .join('; ');

        logError(err, req, 400);

        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ZOD_ERROR',
                type: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: message,
                ...(isDev && { stack: err.stack })
            }
        });
        return;
    }

    if (err instanceof AppError && err.isOperational) {
        logError(err, req, err.statusCode);

        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                type: err.context?.type || 'APPLICATION_ERROR',
                message: err.message,
                statusCode: err.statusCode,
                ...(isDev && {
                    context: err.context,
                    timestamp: err.timestamp,
                    stack: err.stack
                })
            }
        });
        return;
    }

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_UNHANDLED_ERROR',
            type: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
            ...(isDev && {
                originalError: err.message,
                stack: err.stack
            })
        }
    });
};
