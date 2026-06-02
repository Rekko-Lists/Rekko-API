module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.spec.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
    ],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.entity.ts',
        '!src/server.ts',
        '!src/app.ts',
        '!src/infraestructure/database/**',
        '!src/infraestructure/container/**',
        '!src/infraestructure/router/**',
        '!src/controllers/**'
    ],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 65,
            lines: 65,
            statements: 65
        },
        './src/utils/auth/': {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95
        },
        './src/domain/schemas/': {
            branches: 85,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    testTimeout: 10000,
    verbose: true,
    passWithNoTests: true
};
