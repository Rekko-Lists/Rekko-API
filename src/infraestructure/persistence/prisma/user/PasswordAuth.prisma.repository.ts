import jwt from 'jsonwebtoken';
import { User } from '../../../../domain/entities/User';
import { handlePrismaError } from '../../../errors/prisma.errors';

import { prisma } from '../../../database/prisma.client';
import {
    TokenExpiredError,
    InvalidTokenError,
    TokenAlreadyUsed,
    EmailTakenError
} from '../../../../domain/errors/auth.errors';
import { PasswordAuthRepository } from '../../../../domain/repositories/user/PasswordAuth.repository';

export class PasswordAuthPrismaRepository implements PasswordAuthRepository<User> {
    constructor(private readonly db = prisma) {}

    async updatePasswordRequest(
        userId: number,
        token: string
    ): Promise<void> {
        try {
            const existingRequest =
                await this.db.passwordChangeRequest.findUnique({
                    where: { userId }
                });

            const decoded = jwt.decode(token) as any;
            const expiresAt = new Date(decoded.exp * 1000);

            if (existingRequest) {
                if (existingRequest.confirmed) {
                    throw new TokenAlreadyUsed(
                        'Password change already confirmed'
                    );
                }

                await this.db.passwordChangeRequest.update({
                    where: { userId },
                    data: {
                        token,
                        expiresAt,
                        confirmed: false
                    }
                });
            } else {
                await this.db.passwordChangeRequest.create({
                    data: {
                        userId,
                        token,
                        expiresAt
                    }
                });
            }
        } catch (error) {
            if (
                error instanceof EmailTakenError ||
                error instanceof TokenAlreadyUsed
            )
                throw error;
            handlePrismaError(error);
        }
    }

    async updatePassword(
        userId: number,
        token: string,
        passwordHash: string
    ): Promise<User | null> {
        try {
            const passwordReq =
                await this.db.passwordChangeRequest.findUnique({
                    where: { userId }
                });

            if (!passwordReq)
                throw new InvalidTokenError(
                    'No password change request found'
                );

            if (passwordReq.token !== token) {
                throw new InvalidTokenError('Invalid token');
            }

            if (new Date() > passwordReq.expiresAt) {
                throw new TokenExpiredError(
                    'Token expired. Request a new one'
                );
            }

            const user = await this.db.user.update({
                where: { userId },
                data: { password: passwordHash }
            });

            await this.db.passwordChangeRequest.update({
                where: { userId },
                data: { confirmed: true }
            });

            return User.fromPersistence(user);
        } catch (error) {
            if (
                error instanceof InvalidTokenError ||
                error instanceof TokenExpiredError
            ) {
                throw error;
            }
            handlePrismaError(error);
        }
    }
}
