import {
    ValidationError,
    ConflictError,
    NotFoundError,
    InternalServerError
} from '../../exceptions/exceptions';

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
            throw new ConflictError(
                `${fieldNames} already exists.`,
                {
                    code: 'P2002',
                    fields: prismaError.meta?.target
                }
            );

        case 'P2025':
            throw new NotFoundError('record');

        case 'P2003':
            throw new ValidationError(
                'Invalid reference to another record.',
                { code: 'P2003' }
            );

        case 'P2014':
            throw new ValidationError(
                'Cannot delete record due to related records.',
                { code: 'P2014' }
            );

        default:
            throw new InternalServerError(
                'An unexpected database error occurred.',
                'INTERNAL_DATABASE_ERROR',
                {
                    prismaCode: prismaError.code,
                    originalError: prismaError.message
                }
            );
    }
}
