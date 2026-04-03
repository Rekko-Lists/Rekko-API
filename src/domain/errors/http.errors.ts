export class HttpError extends Error {
    public status: number;
    public details: any;

    constructor(
        message: string,
        status: number,
        details: any = null
    ) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'Bad Request', details: any = null) {
        super(message, 400, details);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized', details: any = null) {
        super(message, 401, details);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden', details: any = null) {
        super(message, 403, details);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = 'Not Found', details: any = null) {
        super(message, 404, details);
    }
}

export class DuplicateDataError extends HttpError {
    constructor(
        message = 'Duplicated Data',
        details: any = null
    ) {
        super(message, 409, details);
    }
}

export class InternalServerError extends HttpError {
    constructor(
        message = 'Internal Server',
        details: any = null
    ) {
        super(message, 500, details);
    }
}
