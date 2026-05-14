import { AppError } from './AppError';

/**
 * ValidationError - Thrown when input validation fails
 * HTTP 400 - Bad Request
 *
 * ERROR CODES:
 * - VALIDATION_INVALID_INPUT : Generic validation failure
 * - VALIDATION_INVALID_FIELD : Specific field validation
 * - VALIDATION_TOKEN_ALREADY_USED : Token was already used
 * - VALIDATION_INVALID_REFERENCE : Invalid reference to another record
 * - VALIDATION_DELETE_CONSTRAINT : Cannot delete due to constraints
 */
export class ValidationError extends AppError {
    constructor(message: string, context?: any) {
        super(message, 400, 'VALIDATION_INVALID_INPUT', true, {
            type: 'VALIDATION',
            ...context
        });
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class TokenAlreadyUsedError extends ValidationError {
    constructor(context?: any) {
        super('Token already used', {
            code: 'VALIDATION_TOKEN_ALREADY_USED',
            ...context
        });
        Object.setPrototypeOf(
            this,
            TokenAlreadyUsedError.prototype
        );
    }
}
