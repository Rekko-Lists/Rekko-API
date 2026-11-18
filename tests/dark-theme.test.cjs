const { test } = require('node:test');
const assert = require('node:assert/strict');
const { User } = require('../src/domain/entities/User');
const { userThemeSchema } = require('../src/domain/schemas/user/user.schemas');
const { UserService } = require('../src/services/user/user.service');

const persistedUser = {
    userId: 1, email: 'test@example.com', password: '', username: 'test',
    profileImage: '', bannerImage: '', backgroundImage: '', createdAt: new Date()
};

test('defaults to light and restores a stored dark theme', () => {
    assert.equal(User.fromPersistence(persistedUser).getDarkMode(), false);
    assert.equal(User.fromPersistence({ ...persistedUser, darkMode: true }).getDarkMode(), true);
});

test('theme update requires a boolean and rejects extra fields', () => {
    assert.deepEqual(userThemeSchema.parse({ darkMode: true }), { darkMode: true });
    assert.equal(userThemeSchema.safeParse({ darkMode: 'true' }).success, false);
    assert.equal(userThemeSchema.safeParse({ darkMode: false, userId: 2 }).success, false);
    assert.equal(userThemeSchema.safeParse({}).success, false);
});

test('theme update uses the authenticated user id', async () => {
    let request;
    const repository = {
        update: async (where, data) => {
            request = { where, data };
            return User.fromPersistence({ ...persistedUser, darkMode: data.darkMode });
        }
    };
    const user = await new UserService(repository).updateTheme(1, true);
    assert.deepEqual(request, { where: { userId: 1 }, data: { darkMode: true } });
    assert.equal(user.getDarkMode(), true);
});

test('authenticated user response includes the saved theme', async () => {
    const { getMe } = require('../src/controllers/user/auth.controller');
    let body;
    const req = {
        user: { userId: 1 },
        container: { services: { user: {
            getUserById: async () => User.fromPersistence({ ...persistedUser, darkMode: true })
        } } }
    };
    const res = { status() { return this; }, json(value) { body = value; return this; } };
    await new Promise((resolve, reject) => {
        getMe(req, res, reject);
        setImmediate(resolve);
    });
    assert.equal(body.data.darkMode, true);
});

test('theme endpoint requires authentication and ignores attempts to target another user', async (t) => {
    const express = require('express');
    const router = require('../src/infraestructure/router/user/auth.routes').default;
    const { authAuthMiddleware } = require('../src/middlewares/auth.middleware');
    const { signAccessToken } = require('../src/utils/auth/jwt');
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-only-theme-secret';
    t.after(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    });
    const updates = [];
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
        req.container = { services: { user: {
            updateTheme: async (id, darkMode) => {
                updates.push({ id, darkMode });
                return User.fromPersistence({ ...persistedUser, darkMode });
            }
        } } };
        next();
    });
    app.use('/auth', authAuthMiddleware, router);
    app.use((err, req, res, next) => res.status(err.statusCode || 400).json({ error: true }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const url = `http://127.0.0.1:${server.address().port}/auth/me/theme`;
    const request = (body, token) => fetch(url, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
    });
    assert.equal((await request({ darkMode: true })).status, 401);
    const token = signAccessToken(1, 'USER', true);
    assert.equal((await request({ darkMode: true, userId: 2 }, token)).status, 400);
    assert.equal((await request({ darkMode: 'true' }, token)).status, 400);
    assert.deepEqual(updates, []);
    const response = await request({ darkMode: true }, token);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, { darkMode: true });
    assert.deepEqual(updates, [{ id: 1, darkMode: true }]);
});
