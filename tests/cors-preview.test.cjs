const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function corsOrigin(env) {
    const source = fs.readFileSync('src/app.ts', 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
    }).outputText;
    let options;
    const app = { use() {}, get() {} };
    const express = Object.assign(() => app, { json: () => () => {} });
    const modules = {
        express,
        cors: value => { options = value; return () => {}; },
        morgan: () => () => {},
        helmet: () => () => {},
        'express-rate-limit': () => () => {},
        './infraestructure/router/routes': {},
        './middlewares/error.handler': {}
    };
    vm.runInNewContext(compiled, {
        require: name => modules[name],
        exports: {},
        process: { env },
        console
    });
    return origin => new Promise(resolve => options.origin(origin, (error, allowed) => resolve({ error, allowed })));
}

test('preview and production origins are allowed without accepting unrelated origins', async () => {
    const check = corsOrigin({
        NODE_ENV: 'production',
        CLIENT_URL_PROD: 'https://www.rekko-lists.net',
        CLIENT_URL_DEV: 'http://localhost:5173',
        CLIENT_URL_PREVIEW: 'https://preview.rekko-lists.net/'
    });
    assert.equal((await check('https://preview.rekko-lists.net')).allowed, true);
    assert.equal((await check('https://www.rekko-lists.net')).allowed, true);
    assert.equal((await check('http://localhost:5173')).allowed, true);
    assert.ok((await check('https://attacker.example')).error);
});
