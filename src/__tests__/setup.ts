// src/__tests__/setup.ts
// Setup file para Jest - ejecutado antes de todos los tests

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.REFRESH_TOKEN_SECRET =
    'test-refresh-secret-key-for-testing-only';
process.env.SALT_ROUNDS = '10';

// Aumentar timeout para tests que usan criptografía
jest.setTimeout(10000);

// Suprimir console.log en tests si quieres más limpieza
// global.console.log = jest.fn();
