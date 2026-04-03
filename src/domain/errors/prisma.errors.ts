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
}

export function handlePrismaError(error: unknown): never {
    const prismaError = error as PrismaError;

    switch (prismaError.code) {
        case 'P2002':
            const fieldNames =
                prismaError.meta?.target?.join(', ') ??
                'given fields';
            throw new DuplicateDataError(
                `${fieldNames} already exists.`
            );

        case 'P2025':
            throw new NotFoundError(
                undefined,
                'Record not found.'
            );

        case 'P2003':
            throw new BadRequestError(
                undefined,
                'Invalid reference to another record.'
            );

        case 'P2014':
            throw new BadRequestError(
                undefined,
                'Cannot delete record due to related records.'
            );

        default:
            throw new InternalServerError(
                undefined,
                'An unexpected database error occurred.'
            );
    }
}
