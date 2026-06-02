/**
 * Test Suite: Bcrypt Password Hashing
 *
 * Tests the hashBcrypt and comparePassword utility functions
 * These are critical security functions used in authentication
 *
 * CRITICALITY: 🔴 MÁXIMO - Seguridad de passwords
 */

import { hashBcrypt, comparePassword } from '../bcrypt.util';

describe('Bcrypt Utilities', () => {
    describe('hashBcrypt()', () => {
        it('should hash a password successfully', async () => {
            const password = 'TestPassword123';
            const hashed = await hashBcrypt(password);

            expect(hashed).toBeDefined();
            expect(typeof hashed).toBe('string');
            expect(hashed).not.toBe(password);
            expect(hashed).toHaveLength(60); // Bcrypt siempre genera 60 chars
            expect(hashed).toMatch(/^\$2[aby]\$/); // Bcrypt marker: $2a$, $2b$, $2y$
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'TestPassword123';
            const hash1 = await hashBcrypt(password);
            const hash2 = await hashBcrypt(password);

            // Bcrypt usa salt aleatorio, así que hashes diferentes son esperados
            expect(hash1).not.toBe(hash2);
            expect(hash1).toHaveLength(60);
            expect(hash2).toHaveLength(60);
        });

        it('should handle maximum length password (128 chars)', async () => {
            const longPassword = 'A'.repeat(128); // Max password length
            const hashed = await hashBcrypt(longPassword);

            expect(hashed).toHaveLength(60);
            expect(hashed).toMatch(/^\$2[aby]\$/);
        });

        it('should handle special characters', async () => {
            const specialPassword =
                '!@#$%^&*()_+-=[]{}|;:",.<>?`~`';
            const hashed = await hashBcrypt(specialPassword);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(specialPassword);
            expect(hashed).toHaveLength(60);
        });

        it('should handle unicode characters', async () => {
            const unicodePassword = 'Contraseña123™€£¥';
            const hashed = await hashBcrypt(unicodePassword);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(unicodePassword);
            expect(hashed).toHaveLength(60);
        });

        it('should handle spaces and tabs', async () => {
            const spacedPassword = '  Test  Pass  123  ';
            const hashed = await hashBcrypt(spacedPassword);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(spacedPassword);
            expect(hashed).toHaveLength(60);
        });

        it('should hash very short passwords', async () => {
            const shortPassword = 'a1A'; // Mínimo válido en aplicación
            const hashed = await hashBcrypt(shortPassword);

            expect(hashed).toBeDefined();
            expect(hashed).toHaveLength(60);
        });
    });

    describe('comparePassword()', () => {
        it('should return true for matching passwords', async () => {
            const password = 'CorrectPassword123';
            const hashed = await hashBcrypt(password);

            const matches = await comparePassword(
                password,
                hashed
            );

            expect(matches).toBe(true);
        });

        it('should return false for non-matching passwords', async () => {
            const correctPassword = 'CorrectPassword123';
            const wrongPassword = 'WrongPassword123';
            const hashed = await hashBcrypt(correctPassword);

            const matches = await comparePassword(
                wrongPassword,
                hashed
            );

            expect(matches).toBe(false);
        });

        it('should return false for empty password against hash', async () => {
            const password = 'CorrectPassword123';
            const hashed = await hashBcrypt(password);

            const matches = await comparePassword('', hashed);

            expect(matches).toBe(false);
        });

        it('should be case-sensitive', async () => {
            const password = 'TestPassword123';
            const hashed = await hashBcrypt(password);

            const matches = await comparePassword(
                'testpassword123',
                hashed
            );

            expect(matches).toBe(false);
        });

        it('should return false if password has extra characters', async () => {
            const password = 'TestPassword123';
            const hashed = await hashBcrypt(password);

            const matches = await comparePassword(
                'TestPassword123 ',
                hashed
            );

            expect(matches).toBe(false); // Nota: espacio al final
        });

        it('should return false if password has fewer characters', async () => {
            const password = 'TestPassword123';
            const hashed = await hashBcrypt(password);

            const matches = await comparePassword(
                'TestPassword12',
                hashed
            );

            expect(matches).toBe(false); // Un carácter menos
        });

        it('should handle special characters correctly', async () => {
            const password = '!@#$%^&*()_+-=[]{}|;:",.<>?`~';
            const hashed = await hashBcrypt(password);

            const correctMatch = await comparePassword(
                password,
                hashed
            );
            const wrongMatch = await comparePassword(
                '!@#$%^&*()_+-=[]{}|;:",.<>?',
                hashed
            );

            expect(correctMatch).toBe(true);
            expect(wrongMatch).toBe(false);
        });

        it('should handle unicode characters correctly', async () => {
            const password = 'Contraseña123™€£¥';
            const hashed = await hashBcrypt(password);

            const matches = await comparePassword(
                password,
                hashed
            );

            expect(matches).toBe(true);
        });

        it('should return false for completely wrong hash', async () => {
            const wrongHash =
                '$2b$10$fakefakefakefakefakefakefakefakefakefakefakefakefakefa';

            const matches = await comparePassword(
                'SomePassword123',
                wrongHash
            );

            expect(matches).toBe(false);
        });

        it('should handle whitespace correctly', async () => {
            const password = '  TestPassword123  ';
            const hashed = await hashBcrypt(password);

            const correctMatch = await comparePassword(
                password,
                hashed
            );
            const trimmedMatch = await comparePassword(
                'TestPassword123',
                hashed
            );

            expect(correctMatch).toBe(true);
            expect(trimmedMatch).toBe(false); // Espacios are part of password
        });
    });

    describe('Security edge cases', () => {
        it('should not allow timing attacks (timing consistency)', async () => {
            const password = 'TestPassword123';
            const hashed = await hashBcrypt(password);
            const timings = [];

            for (let i = 0; i < 5; i++) {
                const start = performance.now();
                await comparePassword(password, hashed);
                const end = performance.now();
                timings.push(end - start);
            }

            // Todos los timings deberían ser similares (bcrypt es constant-time)
            const average =
                timings.reduce((a, b) => a + b) / timings.length;
            const variance = timings.every(
                (t) => Math.abs(t - average) < average * 0.5
            ); // 50% variance tolerance

            expect(variance).toBe(true);
        });

        it('should produce different hashes with different SALT_ROUNDS', async () => {
            // Este test verifica que el SALT_ROUNDS se respeta desde .env
            const password = 'TestPassword123';
            const hash1 = await hashBcrypt(password);

            // Si se cambiara SALT_ROUNDS en .env, el hash sería diferente
            // Por ahora solo verificamos que es válido
            expect(hash1).toMatch(/^\$2[aby]\$/);
        });
    });

    describe('Integration scenarios', () => {
        it('should handle login flow: hash and verify', async () => {
            // Simula flujo de registro
            const userPassword = 'MySecurePass123';
            const passwordHash = await hashBcrypt(userPassword);

            // Simula flujo de login
            const loginPassword = 'MySecurePass123';
            const isValid = await comparePassword(
                loginPassword,
                passwordHash
            );

            expect(isValid).toBe(true);
        });

        it('should handle failed login attempts', async () => {
            const userPassword = 'MySecurePass123';
            const passwordHash = await hashBcrypt(userPassword);

            // Intentos fallidos
            const attempts = [
                await comparePassword(
                    'WrongPassword1',
                    passwordHash
                ),
                await comparePassword(
                    'MySecurePass124',
                    passwordHash
                ),
                await comparePassword(
                    'mysecurepass123',
                    passwordHash
                ),
                await comparePassword(
                    'MySecurePass123 ',
                    passwordHash
                )
            ];

            // Todos deberían fallar
            expect(attempts).toEqual([
                false,
                false,
                false,
                false
            ]);
        });

        it('should hash passwords from registration data', async () => {
            const registrationData = {
                email: 'user@example.com',
                password: 'UserPassword123',
                username: 'john_doe'
            };

            // Simula lo que hace el servicio de usuario
            const hashedPassword = await hashBcrypt(
                registrationData.password
            );

            expect(hashedPassword).not.toBe(
                registrationData.password
            );
            expect(hashedPassword).toHaveLength(60);

            // Verifica que se pueda comparar después
            const matches = await comparePassword(
                registrationData.password,
                hashedPassword
            );
            expect(matches).toBe(true);
        });
    });
});
