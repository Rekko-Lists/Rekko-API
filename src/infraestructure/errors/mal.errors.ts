export class MalError extends Error {
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

export class MalApiError extends MalError {
    constructor(status: number, details: any = null) {
        super('Mal Api Error', status, details);
    }
}

export class AuthorizationRequestError extends MalError {
    constructor(details: any = null) {
        super('Authorization Error', 401, details);
    }
}
