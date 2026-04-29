export class AuthError extends Error {
    public status: number;
    public details: any;
    public redirectStatus?: string;

    constructor(
        message: string,
        status: number,
        details: any = null,
        redirectStatus?: string
    ) {
        super(message);
        this.status = status;
        this.details = details;
        this.redirectStatus = redirectStatus;
    }
}

export class TokenExpiredError extends AuthError {
    constructor(details: any = null) {
        super('Token has expired', 401, details, 'expired');
    }
}

export class InvalidTokenError extends AuthError {
    constructor(details: any = null) {
        super('Invalid token', 401, details, 'invalid');
    }
}

export class UserNotFoundError extends AuthError {
    constructor(details: any = null) {
        super('User not found', 404, details, 'user_not_found');
    }
}

export class TokenAlreadyUsed extends AuthError {
    constructor(details: any = null) {
        super('Token already used', 400, details, 'token_used');
    }
}

export class EmailTakenError extends AuthError {
    constructor(details: any = null) {
        super(
            'Email already in use',
            409,
            details,
            'email_taken'
        );
    }
}

export class ValidationError extends AuthError {
    constructor(
        message: string = 'Validation error',
        details: any = null
    ) {
        super(message, 400, details, 'validation_error');
    }
}

export class ForbiddenError extends AuthError {
    constructor(details: any = null) {
        super(
            'You do not have permission to access this resource',
            403,
            details,
            'forbidden'
        );
    }
}
