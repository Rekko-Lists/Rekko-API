const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function startWith(env) {
    const source = fs.readFileSync('src/server.ts', 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
    }).outputText;
    const calls = [];
    const app = { listen: (...args) => calls.push(args) };
    const processStub = { env, on() {}, exit() {} };
    vm.runInNewContext(compiled, {
        require: (name) => name === './app' ? { default: app } : {},
        exports: {},
        process: processStub,
        console
    });
    return calls;
}

test('Render listens on PORT in production', () => {
    const calls = startWith({ NODE_ENV: 'production', PORT: '10000', RENDER: 'true' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 10000);
    assert.equal(calls[0][1], '0.0.0.0');
});

test('Vercel does not open a listening socket', () => {
    assert.equal(startWith({ NODE_ENV: 'production', VERCEL: '1' }).length, 0);
});

test('local development listens on SERVER_PORT', () => {
    const calls = startWith({ NODE_ENV: 'development', SERVER_PORT: '5000' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 5000);
});
