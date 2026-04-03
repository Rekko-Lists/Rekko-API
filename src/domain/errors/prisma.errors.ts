import {
    BadRequestError,
    DuplicateDataError,
    NotFoundError,
    InternalServerError
} from './http.errors';

interface PrismaError {
    code?: string;
    meta?: {
        target?: string[];
    };
    message: string;
    stack?: string;
}

function getErrorStack(error: unknown): string | null {
    return error instanceof Error ? (error.stack ?? null) : null;
}

export function handlePrismaError(error: unknown): never {
    const prismaError = error as PrismaError;
    const stack = getErrorStack(error);

    switch (prismaError.code) {
        case 'P2002':
            const fieldNames =
                prismaError.meta?.target?.join(', ') ??
                'given fields';
            throw new DuplicateDataError(
                `${fieldNames} already exists.`,
                stack
            );

        case 'P2025':
            throw new NotFoundError('Record not found.', stack);

        case 'P2003':
            throw new BadRequestError(
                'Invalid reference to another record.',
                stack
            );

        case 'P2014':
            throw new BadRequestError(
                'Cannot delete record due to related records.',
                stack
            );

        default:
            throw new InternalServerError(
                'An unexpected database error occurred.',
                stack
            );
    }
}
