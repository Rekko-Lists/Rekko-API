import { AppError } from './AppError';

/**
 * ImageError - Base class for image-related errors
 * Used for upload, processing, deletion failures
 * HTTP 400 - Bad Request
 *
 * ERROR CODES:
 * - IMAGE_ERROR : Generic image error
 * - IMAGE_CANNOT_DELETE : Image deletion failed
 * - IMAGE_INVALID_FORMAT : Invalid image format
 * - IMAGE_SPACE_LIMIT : File size exceeds limit
 */
export class ImageError extends AppError {
    constructor(
        message: string,
        code: string = 'IMAGE_ERROR',
        context?: any
    ) {
        super(message, 400, code, true, {
            type: 'IMAGE_ERROR',
            ...context
        });
        Object.setPrototypeOf(this, ImageError.prototype);
    }
}

export class CannotDeleteImageError extends ImageError {
    constructor(message: string, context?: any) {
        super(message, 'IMAGE_CANNOT_DELETE', {
            subtype: 'CANNOT_DELETE',
            ...context
        });
        Object.setPrototypeOf(
            this,
            CannotDeleteImageError.prototype
        );
    }
}

export class InvalidImageFormatError extends ImageError {
    constructor(message: string, context?: any) {
        super(message, 'IMAGE_INVALID_FORMAT', {
            subtype: 'INVALID_FORMAT',
            ...context
        });
        Object.setPrototypeOf(
            this,
            InvalidImageFormatError.prototype
        );
    }
}

export class SpaceLimitExceededError extends ImageError {
    constructor(message: string, context?: any) {
        super(message, 'IMAGE_SPACE_LIMIT', {
            subtype: 'SPACE_LIMIT_EXCEEDED',
            ...context
        });
        Object.setPrototypeOf(
            this,
            SpaceLimitExceededError.prototype
        );
    }
}
