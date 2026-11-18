const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { signAccessToken } = require('../src/utils/auth/jwt');
const router = require('../src/infraestructure/router/anime/mal.routes').default;

test('only an administrator can initiate MAL authorization and callback never returns tokens', async t => {
    const original = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-only-secret';
    t.after(() => { if (original === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = original; });
    const app = express();
    app.use((req, res, next) => {
        req.container = { externalServices: { malAuth: {
            getAuthorizationUrl: () => 'https://example.test/authorize',
            getAccessToken: async () => ({ accessToken: 'sensitive-access', refreshToken: 'sensitive-refresh', expiresIn: 3600 })
        } } };
        next();
    });
    app.use('/mal', router);
    app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ error: true }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}/mal`;
    assert.notEqual((await fetch(`${base}/auth/url`)).status, 200);
    const userToken = signAccessToken(1, 'USER', true);
    assert.notEqual((await fetch(`${base}/auth/url`, { headers: { authorization: `Bearer ${userToken}` } })).status, 200);
    const adminToken = signAccessToken(1, 'ADMIN', true);
    assert.equal((await fetch(`${base}/auth/url`, { headers: { authorization: `Bearer ${adminToken}` } })).status, 200);
    const callback = await fetch(`${base}/auth/callback?code=test-code&state=test-state`);
    assert.equal(callback.status, 200);
    const body = await callback.text();
    assert.doesNotMatch(body, /sensitive-access|sensitive-refresh/);
});

test('a transient token store failure is retried before using environment credentials', async t => {
    const { prisma } = require('../src/infraestructure/database/prisma.client');
    const { MalService } = require('../src/infraestructure/services/mal/mal.service');
    const originalFind = prisma.malToken.findUnique;
    const originalFetch = global.fetch;
    const oldRefresh = process.env.MAL_REFRESH_TOKEN;
    t.after(() => {
        prisma.malToken.findUnique = originalFind;
        global.fetch = originalFetch;
        if (oldRefresh === undefined) delete process.env.MAL_REFRESH_TOKEN;
        else process.env.MAL_REFRESH_TOKEN = oldRefresh;
    });
    process.env.MAL_REFRESH_TOKEN = 'stale-environment-token';
    let reads = 0;
    prisma.malToken.findUnique = async () => {
        if (++reads === 1) throw new Error('temporary database outage');
        return { accessToken: 'stored-access', refreshToken: 'stored-refresh', expiresAt: BigInt(Date.now() + 3600000) };
    };
    let authorization;
    global.fetch = async (url, options) => {
        authorization = options.headers.Authorization;
        return new Response('{}', { status: 200 });
    };
    const service = new MalService();
    await assert.rejects(service.fetchFromMal('/anime/20'), /temporary database outage/);
    await service.fetchFromMal('/anime/20');
    assert.equal(reads, 2);
    assert.equal(authorization, 'Bearer stored-access');
});

test('MAL token endpoint errors do not expose the upstream response body', async t => {
    const { prisma } = require('../src/infraestructure/database/prisma.client');
    const { MalService } = require('../src/infraestructure/services/mal/mal.service');
    const originalFind = prisma.malToken.findUnique;
    const originalFetch = global.fetch;
    t.after(() => { prisma.malToken.findUnique = originalFind; global.fetch = originalFetch; });
    prisma.malToken.findUnique = async () => null;
    global.fetch = async () => new Response('sensitive-upstream-response', { status: 401 });
    await assert.rejects(new MalService().fetchFromMal('/anime/20'), error => {
        assert.doesNotMatch(error.message, /sensitive-upstream-response/);
        assert.match(error.message, /401/);
        return true;
    });
});

test('expired credentials refresh once and persist the replacement before use', async t => {
    const { prisma } = require('../src/infraestructure/database/prisma.client');
    const { MalService } = require('../src/infraestructure/services/mal/mal.service');
    const originalFind = prisma.malToken.findUnique;
    const originalUpsert = prisma.malToken.upsert;
    const originalFetch = global.fetch;
    t.after(() => { prisma.malToken.findUnique = originalFind; prisma.malToken.upsert = originalUpsert; global.fetch = originalFetch; });
    prisma.malToken.findUnique = async () => ({ accessToken: 'old-access', refreshToken: 'old-refresh', expiresAt: 1n });
    let persisted, refreshes = 0;
    prisma.malToken.upsert = async request => { persisted = request.update; };
    global.fetch = async (url, options) => {
        if (String(url).includes('/oauth2/token')) {
            refreshes++;
            assert.equal(new URLSearchParams(options.body).get('refresh_token'), 'old-refresh');
            return new Response(JSON.stringify({ access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 3600 }), { status: 200 });
        }
        assert.equal(options.headers.Authorization, 'Bearer new-access');
        assert.equal(persisted.refreshToken, 'new-refresh');
        return new Response('{}', { status: 200 });
    };
    const service = new MalService();
    await Promise.all([service.fetchFromMal('/anime/20'), service.fetchFromMal('/anime/21')]);
    assert.equal(refreshes, 1);
});

test('access logger excludes the MAL OAuth callback query string', () => {
    const fs = require('node:fs');
    const vm = require('node:vm');
    const ts = require('typescript');
    const code = ts.transpileModule(fs.readFileSync('src/app.ts', 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
    }).outputText;
    let options;
    const app = { use() {}, get() {} };
    const expressStub = Object.assign(() => app, { json: () => () => {} });
    const modules = {
        express: expressStub, cors: () => () => {},
        morgan: (format, config) => { options = config; return () => {}; },
        helmet: () => () => {}, 'express-rate-limit': () => () => {},
        './infraestructure/router/routes': {}, './middlewares/error.handler': {}
    };
    vm.runInNewContext(code, { require: name => modules[name], exports: {}, process: { env: {} }, console });
    assert.equal(options.skip({ path: '/mal/auth/callback' }), true);
    assert.equal(options.skip({ path: '/health' }), false);
});
