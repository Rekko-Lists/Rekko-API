import {
    ValidationError,
    ConflictError,
    NotFoundError,
    InternalServerError
} from '../../exceptions/exceptions';

interface PrismaError {
    name?: string;
    code?: string;
    errorCode?: string;
    meta?: {
        target?: string[];
        table?: string;
        column?: string;
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
    const prismaCode = prismaError.code ?? prismaError.errorCode;

    if (prismaError.name === 'PrismaClientInitializationError') {
        throw new InternalServerError(
            'Could not connect to the database.',
            'INTERNAL_DATABASE_CONNECTION_ERROR',
            {
                originalError: prismaError.message,
                stack
            }
        );
    }

    switch (prismaCode) {
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

        case 'P2021':
            throw new InternalServerError(
                'The database table expected by Prisma does not exist.',
                'INTERNAL_DATABASE_SCHEMA_ERROR',
                {
                    prismaCode: 'P2021',
                    table: prismaError.meta?.table,
                    originalError: prismaError.message
                }
            );

        case 'P2022':
            throw new InternalServerError(
                'The database column expected by Prisma does not exist.',
                'INTERNAL_DATABASE_SCHEMA_ERROR',
                {
                    prismaCode: 'P2022',
                    column: prismaError.meta?.column,
                    originalError: prismaError.message
                }
            );

        default:
            throw new InternalServerError(
                'An unexpected database error occurred.',
                'INTERNAL_DATABASE_ERROR',
                {
                    prismaCode,
                    originalError: prismaError.message,
                    errorName: prismaError.name,
                    stack
                }
            );
    }
}
