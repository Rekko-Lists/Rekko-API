/**
 * AppError - Base class for all application errors
 * Distinguishes between operational errors (known/recoverable)
 * and programming errors (unknown/unrecoverable)
 *
 * ERROR CODES:
 * - VALIDATION_* : Input validation failures
 * - AUTH_* : Authentication/Authorization
 * - NOT_FOUND : Resource not found
 * - CONFLICT_* : Resource already exists
 * - EXTERNAL_* : External service failures
 * - INTERNAL_* : Unknown server errors
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code: string;
    public readonly context?: Record<string, any>;
    public readonly timestamp: Date;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true,
        context?: Record<string, any>
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.context = context;
        this.timestamp = new Date();

        Error.captureStackTrace(this, this.constructor);
    }
}
