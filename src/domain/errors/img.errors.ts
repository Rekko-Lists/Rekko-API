export class ImageError extends Error {
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

export class CannotDeleteImageError extends ImageError {
    constructor(details: any = null, stack: any = null) {
        super('Image Not Found', 404, details, stack);
    }
}

export class InvalidImageFormatError extends ImageError {
    constructor(details: any = null, stack: any = null) {
        super('Image Invalid format', 422, details, stack);
    }
}

export class SpaceLimitExceededError extends ImageError {
    constructor(details: any = null, stack: any = null) {
        super('Image Space Limit Exceeded', 413, details, stack);
    }
}

