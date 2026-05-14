import { AppError } from './AppError';

/**
 * NotFoundError - Thrown when resource not found
 * HTTP 404 - Not Found
 *
 * ERROR CODES:
 * - NOT_FOUND : Resource not found
 * - NOT_FOUND_USER : User not found
 * - NOT_FOUND_ROUTE : Route not found
 */
export class NotFoundError extends AppError {
    constructor(resource: string, id?: string | number) {
        super(`${resource} not found`, 404, 'NOT_FOUND', true, {
            type: 'NOT_FOUND',
            resource,
            id
        });
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UserNotFoundError extends NotFoundError {
    constructor(context?: any) {
        super('user');
        (this as any).context = {
            ...(this.context || {}),
            code: 'NOT_FOUND_USER',
            ...context
        };
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}
