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
import { EmailAuthRepository } from '../../../../domain/repositories/user/EmailAuth.repository';

export class EmailAuthPrismaRepository implements EmailAuthRepository<User> {
    constructor(private readonly db = prisma) {}

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.db.user.findUnique({
                where: { email: email },
                include: {
                    userSocialAccount: {
                        include: {
                            socialAccount: true
                        }
                    }
                }
            });

            if (!user) return null;

            return User.fromPersistence(user);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async verifyEmailRequest(
        userId: number,
        token: string
    ): Promise<void> {
        try {
            const decoded = jwt.decode(token) as any;
            const expiresAt = new Date(decoded.exp * 1000);

            const existingRequest =
                await this.db.emailVerificationRequest.findUnique(
                    {
                        where: { userId }
                    }
                );

            if (existingRequest) {
                await this.db.emailVerificationRequest.update({
                    where: { userId },
                    data: { token, expiresAt, confirmed: false }
                });
            } else {
                await this.db.emailVerificationRequest.create({
                    data: {
                        userId,
                        token,
                        expiresAt
                    }
                });
            }
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async verifyEmail(
        userId: number,
        token: string
    ): Promise<void> {
        try {
            const verifyReq =
                await this.db.emailVerificationRequest.findUnique(
                    {
                        where: { userId }
                    }
                );

            if (!verifyReq)
                throw new InvalidTokenError(
                    'No email verification request found'
                );

            if (verifyReq.token !== token) {
                throw new InvalidTokenError('Invalid token');
            }

            if (new Date() > verifyReq.expiresAt) {
                throw new TokenExpiredError(
                    'Token expired. Request a new one'
                );
            }

            await this.db.emailVerificationRequest.update({
                where: { userId },
                data: { confirmed: true }
            });

            await this.db.user.update({
                where: { userId },
                data: { emailVerified: true }
            });
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async updateEmailRequest(
        userId: number,
        newEmail: string,
        token: string
    ): Promise<void> {
        try {
            const existingUser =
                await this.findByEmail(newEmail);

            if (existingUser) {
                throw new EmailTakenError(
                    'Email already in use'
                );
            }

            const existingRequest =
                await this.db.emailChangeRequest.findUnique({
                    where: { userId }
                });

            const decoded = jwt.decode(token) as any;
            const expiresAt = new Date(decoded.exp * 1000);

            if (existingRequest) {
                await this.db.emailChangeRequest.update({
                    where: { userId },
                    data: {
                        newEmail,
                        token,
                        expiresAt,
                        confirmed: false
                    }
                });
            } else {
                await this.db.emailChangeRequest.create({
                    data: {
                        userId,
                        newEmail,
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

    async updateEmail(
        userId: number,
        token: string
    ): Promise<User | null> {
        try {
            const emailReq =
                await this.db.emailChangeRequest.findUnique({
                    where: { userId }
                });

            if (!emailReq)
                throw new InvalidTokenError(
                    'No email change request found'
                );

            if (emailReq.token !== token) {
                throw new InvalidTokenError('Invalid token');
            }

            if (new Date() > emailReq.expiresAt) {
                throw new TokenExpiredError(
                    'Token expired. Request a new one'
                );
            }

            const user = await this.db.user.update({
                where: { userId },
                data: { email: emailReq.newEmail }
            });

            await this.db.emailChangeRequest.update({
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
