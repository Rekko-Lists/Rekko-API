import { AppError } from './AppError';

/**
 * ConflictError - Thrown when resource already exists (duplicate)
 * HTTP 409 - Conflict
 *
 * ERROR CODES:
 * - CONFLICT_DUPLICATE : Resource already exists
 * - CONFLICT_EMAIL_TAKEN : Email already in use
 * - CONFLICT_DUPLICATE_FIELDS : Specific fields are duplicated
 */
export class ConflictError extends AppError {
    constructor(message: string, context?: any) {
        super(message, 409, 'CONFLICT_DUPLICATE', true, {
            type: 'CONFLICT',
            ...context
        });
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class EmailTakenError extends ConflictError {
    constructor(context?: any) {
        super('Email already in use', {
            code: 'CONFLICT_EMAIL_TAKEN',
            ...context
        });
        Object.setPrototypeOf(this, EmailTakenError.prototype);
    }
}
