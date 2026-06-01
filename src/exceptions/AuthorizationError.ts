import { AppError } from './AppError';
import { normalizeErrorContext } from './context';

/**
 * AuthorizationError - Thrown when user lacks required permissions
 * HTTP 403 - Forbidden
 *
 * ERROR CODES:
 * - AUTH_FORBIDDEN : User lacks permission
 * - AUTH_INSUFFICIENT_PERMISSIONS : Insufficient permissions
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Forbidden', context?: any) {
        super(message, 403, 'AUTH_FORBIDDEN', true, {
            type: 'AUTHORIZATION',
            ...normalizeErrorContext(context)
        });
        Object.setPrototypeOf(
            this,
            AuthorizationError.prototype
        );
    }
}

export class ForbiddenError extends AuthorizationError {
    constructor(details?: any) {
        super(
            'You do not have permission to access this resource',
            details
        );
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
