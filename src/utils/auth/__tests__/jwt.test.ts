/**
 * Test Suite: JWT Authentication Tokens
 *
 * Tests JWT token generation, verification, and validation
 * These functions are critical for authentication and security
 *
 * CRITICALITY: 🔴 MÁXIMO - Autenticación y autorización
 */

import {
    sign10MinToken,
    verifyToken,
    signAccessToken,
    verifyAccessToken
} from '../jwt';
import jwt from 'jsonwebtoken';

describe('JWT Token Utilities', () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

    describe('sign10MinToken()', () => {
        it('should create a valid 10-minute token with purpose', () => {
            const purpose = 'change-password';
            const token = sign10MinToken(purpose);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3);
        });

        it('should encode the purpose in the token payload', () => {
            const purpose = 'verify-email';
            const token = sign10MinToken(purpose);

            const decoded = jwt.decode(token) as any;
            expect(decoded.purpose).toBe(purpose);
        });

        it('should include expiration time (10 minutes)', () => {
            const token = sign10MinToken('any-purpose');
            const decoded = jwt.decode(token) as any;

            expect(decoded.exp).toBeDefined();
            const expiresIn = decoded.exp * 1000 - Date.now();

            expect(expiresIn).toBeGreaterThan(599000);
            expect(expiresIn).toBeLessThanOrEqual(600000);
        });

        it('should handle different purposes', () => {
            const purposes = [
                'verify-email',
                'change-password',
                'change-email',
                'confirm-action'
            ];

            purposes.forEach((purpose) => {
                const token = sign10MinToken(purpose);
                const decoded = jwt.decode(token) as any;
                expect(decoded.purpose).toBe(purpose);
            });
        });
    });

    describe('verifyToken()', () => {
        it('should verify a valid token with correct purpose', () => {
            const purpose = 'verify-email';
            const token = sign10MinToken(purpose);

            expect(() =>
                verifyToken(token, purpose)
            ).not.toThrow();
        });

        it('should throw error for wrong purpose', () => {
            const token = sign10MinToken('verify-email');

            expect(() =>
                verifyToken(token, 'change-password')
            ).toThrow();
        });

        it('should throw InvalidTokenError for malformed token', () => {
            const malformedTokens = [
                'invalid',
                'invalid.token',
                'invalid.token.format.extra',
                ''
            ];

            malformedTokens.forEach((token) => {
                expect(() =>
                    verifyToken(token, 'any-purpose')
                ).toThrow();
            });
        });

        it('should throw InvalidTokenError for corrupted token', () => {
            const token = sign10MinToken('verify-email');
            const parts = token.split('.');
            const corruptedToken = `${parts[0]}.${parts[1]}.corrupted`;

            expect(() =>
                verifyToken(corruptedToken, 'verify-email')
            ).toThrow();
        });

        it('should throw TokenExpiredError for expired token', async () => {
            const expiredToken = jwt.sign(
                { purpose: 'test' },
                JWT_SECRET,
                { expiresIn: '-1s' }
            );

            expect(() =>
                verifyToken(expiredToken, 'test')
            ).toThrow();
        });

        it('should be case-sensitive for purpose', () => {
            const token = sign10MinToken('VerifyEmail');

            expect(() =>
                verifyToken(token, 'verifyemail')
            ).toThrow();
        });

        it('should handle special characters in purpose', () => {
            const purpose = 'test-purpose-123_SPECIAL';
            const token = sign10MinToken(purpose);

            expect(() =>
                verifyToken(token, purpose)
            ).not.toThrow();
        });
    });

    describe('signAccessToken()', () => {
        it('should create a valid access token with user data', () => {
            const userId = 1;
            const role = 'USER';
            const emailVerified = true;
            const token = signAccessToken(
                userId,
                role,
                emailVerified
            );

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3);
        });

        it('should encode userId, role, and emailVerified in payload', () => {
            const userId = 42;
            const role = 'ADMIN';
            const emailVerified = false;
            const token = signAccessToken(
                userId,
                role,
                emailVerified
            );

            const decoded = jwt.decode(token) as any;
            expect(decoded.userId).toBe(userId);
            expect(decoded.role).toBe(role);
            expect(decoded.emailVerified).toBe(false);
            expect(decoded.type).toBe('access');
        });

        it('should have 15-minute expiration', () => {
            const token = signAccessToken(1, 'USER', true);
            const decoded = jwt.decode(token) as any;

            expect(decoded.exp).toBeDefined();
            const expiresIn = decoded.exp * 1000 - Date.now();

            expect(expiresIn).toBeGreaterThan(899000);
            expect(expiresIn).toBeLessThanOrEqual(900000);
        });

        it('should handle different user roles', () => {
            const roles = ['USER', 'MODERATOR', 'ADMIN'];

            roles.forEach((role) => {
                const token = signAccessToken(
                    1,
                    role as any,
                    true
                );
                const decoded = jwt.decode(token) as any;
                expect(decoded.role).toBe(role);
            });
        });

        it('should handle emailVerified boolean values', () => {
            const token1 = signAccessToken(1, 'USER', true);
            const token2 = signAccessToken(1, 'USER', false);

            const decoded1 = jwt.decode(token1) as any;
            const decoded2 = jwt.decode(token2) as any;

            expect(decoded1.emailVerified).toBe(true);
            expect(decoded2.emailVerified).toBe(false);
        });

        it('should generate different tokens for different users', () => {
            const token1 = signAccessToken(1, 'USER', true);
            const token2 = signAccessToken(2, 'USER', true);

            expect(token1).not.toBe(token2);

            const decoded1 = jwt.decode(token1) as any;
            const decoded2 = jwt.decode(token2) as any;

            expect(decoded1.userId).toBe(1);
            expect(decoded2.userId).toBe(2);
        });
    });

    describe('verifyAccessToken()', () => {
        it('should verify a valid access token and return payload', () => {
            const userId = 5;
            const role = 'USER';
            const emailVerified = true;
            const token = signAccessToken(
                userId,
                role,
                emailVerified
            );

            const decoded = verifyAccessToken(token);

            expect(decoded.userId).toBe(userId);
            expect(decoded.role).toBe(role);
            expect(decoded.emailVerified).toBe(emailVerified);
            expect(decoded.type).toBe('access');
        });

        it('should throw InvalidTokenError for invalid token', () => {
            expect(() =>
                verifyAccessToken('invalid.token')
            ).toThrow();
        });

        it('should throw InvalidTokenError for non-access tokens', () => {
            const purpose = 'verify-email';
            const token = sign10MinToken(purpose);

            expect(() => verifyAccessToken(token)).toThrow();
        });

        it('should throw TokenExpiredError for expired access token', () => {
            const expiredToken = jwt.sign(
                {
                    userId: 1,
                    role: 'USER',
                    emailVerified: true,
                    type: 'access'
                },
                JWT_SECRET,
                { expiresIn: '-1s' }
            );

            expect(() =>
                verifyAccessToken(expiredToken)
            ).toThrow();
        });

        it('should throw InvalidTokenError for corrupted token', () => {
            const token = signAccessToken(1, 'USER', true);
            const parts = token.split('.');
            const corruptedToken = `${parts[0]}.${parts[1]}.corrupted`;

            expect(() =>
                verifyAccessToken(corruptedToken)
            ).toThrow();
        });

        it('should verify ADMIN role correctly', () => {
            const token = signAccessToken(3, 'ADMIN', true);

            const decoded = verifyAccessToken(token);

            expect(decoded.role).toBe('ADMIN');
            expect(decoded.userId).toBe(3);
        });

        it('should verify emailVerified as false', () => {
            const token = signAccessToken(1, 'USER', false);

            const decoded = verifyAccessToken(token);

            expect(decoded.emailVerified).toBe(false);
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complete authentication flow', () => {
            const accessToken = signAccessToken(1, 'USER', true);
            const decoded = verifyAccessToken(accessToken);

            expect(decoded.userId).toBe(1);
            expect(decoded.role).toBe('USER');
        });

        it('should handle password reset flow', () => {
            const resetToken = sign10MinToken('change-password');
            expect(() =>
                verifyToken(resetToken, 'change-password')
            ).not.toThrow();
        });

        it('should handle email verification flow', () => {
            const verificationToken =
                sign10MinToken('verify-email');
            expect(() =>
                verifyToken(verificationToken, 'verify-email')
            ).not.toThrow();
        });

        it('should reject token with wrong purpose in verification flow', () => {
            const passwordResetToken = sign10MinToken(
                'change-password'
            );

            expect(() =>
                verifyToken(passwordResetToken, 'verify-email')
            ).toThrow();
        });
    });

    describe('Security considerations', () => {
        it('should throw error if token is signed with wrong secret', () => {
            const token = signAccessToken(1, 'USER', true);

            const wrongSecret = 'wrong-secret-key';
            const wrongVerify = () => {
                jwt.verify(token, wrongSecret);
            };

            expect(wrongVerify).toThrow();
        });
    });
});
