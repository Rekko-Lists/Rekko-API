import { AppError } from './AppError';

/**
 * ExternalServiceError - Thrown when external API calls fail
 * Used for MyAnimeList, Firebase OAuth, Cloudinary, etc.
 * HTTP 502 - Bad Gateway (default, but can vary)
 *
 * ERROR CODES:
 * - EXTERNAL_SERVICE_ERROR : Generic external service error
 * - EXTERNAL_MAL_API : MyAnimeList API error
 * - EXTERNAL_MAL_NOT_FOUND : Anime not found on MAL
 * - EXTERNAL_MAL_PARSE : Failed to parse MAL response
 * - EXTERNAL_FIREBASE : Firebase error
 * - EXTERNAL_DISCORD : Discord OAuth error
 */
export class ExternalServiceError extends AppError {
    public readonly serviceName: string;
    public readonly originalError?: Error;

    constructor(
        serviceName: string,
        message: string,
        statusCode: number = 502,
        code: string = 'EXTERNAL_SERVICE_ERROR',
        originalError?: Error,
        context?: any
    ) {
        super(
            `${serviceName} service error: ${message}`,
            statusCode,
            code,
            true,
            {
                type: 'EXTERNAL_SERVICE',
                service: serviceName,
                originalMessage: originalError?.message,
                ...context
            }
        );
        this.serviceName = serviceName;
        this.originalError = originalError;
        Object.setPrototypeOf(
            this,
            ExternalServiceError.prototype
        );
    }
}

export class MalApiError extends ExternalServiceError {
    public malStatusCode?: number;
    public malErrorMessage?: string;

    constructor(
        message: string,
        malStatusCode?: number,
        malErrorMessage?: string
    ) {
        super(
            'MyAnimeList',
            message,
            502,
            'EXTERNAL_MAL_API',
            undefined,
            {
                malStatus: malStatusCode,
                malMessage: malErrorMessage
            }
        );
        this.malStatusCode = malStatusCode;
        this.malErrorMessage = malErrorMessage;
        Object.setPrototypeOf(this, MalApiError.prototype);
    }
}

export class MalNotFoundError extends ExternalServiceError {
    constructor(malId: number) {
        super(
            'MyAnimeList',
            'Anime not found',
            404,
            'EXTERNAL_MAL_NOT_FOUND',
            undefined,
            { malId }
        );
        Object.setPrototypeOf(this, MalNotFoundError.prototype);
    }
}

export class MalParseError extends ExternalServiceError {
    public zodError?: any;

    constructor(zodError: any, malResponse?: any) {
        super(
            'MyAnimeList',
            'Failed to parse response',
            500,
            'EXTERNAL_MAL_PARSE',
            undefined,
            {
                zodErrors:
                    zodError.errors?.length > 0
                        ? zodError.errors
                              .slice(0, 3)
                              .map(
                                  (e: any) =>
                                      `${e.path.join('.')}: ${e.message}`
                              )
                        : zodError.message,
                responsePreview: malResponse
                    ? JSON.stringify(malResponse).slice(0, 100)
                    : undefined
            }
        );
        this.zodError = zodError;
        Object.setPrototypeOf(this, MalParseError.prototype);
    }
}
