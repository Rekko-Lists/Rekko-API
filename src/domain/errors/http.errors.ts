export class HttpError extends Error {
    public status: number;
    public details: any;
    public stack?: string;

    constructor(
        message: string,
        status: number,
        details: any = null,
        stack: any = null
    ) {
        super(message);
        this.status = status;
        this.details = details;

        if (stack) {
            this.stack = stack;
        }
    }
}

export class BadRequestError extends HttpError {
    constructor(details: any = null, stack: any = null) {
        super('Bad Request', 400, details, stack);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(details: any = null, stack: any = null) {
        super('Unauthorized', 401, details, stack);
    }
}

export class ForbiddenError extends HttpError {
    constructor(details: any = null, stack: any = null) {
        super('Forbidden', 403, details, stack);
    }
}

export class NotFoundError extends HttpError {
    constructor(details: any = null, stack: any = null) {
        super('Not Found', 404, details, stack);
    }
}

export class DuplicateDataError extends HttpError {
    constructor(details: any = null, stack: any = null) {
        super('Duplicated Data', 409, details, stack);
    }
}

export class InternalServerError extends HttpError {
    constructor(details: any = null, stack: any = null) {
        super('Internal Server', 500, details, stack);
    }
}
