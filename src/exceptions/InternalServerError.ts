import { AppError } from './AppError';

/**
 * InternalServerError - Thrown for unexpected server-side errors
 * HTTP 500 - Internal Server Error
 *
 * ERROR CODES:
 * - INTERNAL_SERVER_ERROR : Generic unknown error
 * - INTERNAL_DATABASE_ERROR : Database operation failed
 * - INTERNAL_UNKNOWN_ERROR : Completely unexpected error
 */
export class InternalServerError extends AppError {
    constructor(
        message: string = 'Internal server error',
        code: string = 'INTERNAL_SERVER_ERROR',
        context?: any
    ) {
        super(message, 500, code, false, {
            type: 'INTERNAL_SERVER_ERROR',
            ...context
        });
        Object.setPrototypeOf(
            this,
            InternalServerError.prototype
        );
    }
}
