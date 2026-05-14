import { AppError } from './AppError';

/**
 * AuthenticationError - Thrown when authentication fails
 * HTTP 401 - Unauthorized
 *
 * ERROR CODES:
 * - AUTH_UNAUTHORIZED : Generic auth failure
 * - AUTH_INVALID_TOKEN : Token is invalid
 * - AUTH_TOKEN_EXPIRED : Token has expired
 * - AUTH_MISSING_TOKEN : No token provided
 */
export class AuthenticationError extends AppError {
    constructor(
        message: string = 'Unauthorized',
        code: string = 'AUTH_UNAUTHORIZED',
        context?: any
    ) {
        super(message, 401, code, true, {
            type: 'AUTHENTICATION',
            ...context
        });
        Object.setPrototypeOf(
            this,
            AuthenticationError.prototype
        );
    }
}

export class InvalidTokenError extends AuthenticationError {
    constructor(context?: any) {
        super('Invalid token', 'AUTH_INVALID_TOKEN', context);
        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
}

export class TokenExpiredError extends AuthenticationError {
    constructor(context?: any) {
        super(
            'Token has expired',
            'AUTH_TOKEN_EXPIRED',
            context
        );
        Object.setPrototypeOf(this, TokenExpiredError.prototype);
    }
}
