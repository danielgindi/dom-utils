import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as Fs from 'node:fs';
import * as Os from 'node:os';
import * as Path from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';

test('the packed package supports the original lib file imports', async context => {
    const directory = Fs.mkdtempSync(Path.join(Os.tmpdir(), 'dom-utils-package-'));
    const npmCli = process.env.npm_execpath;
    assert.ok(npmCli, 'Run this test with npm run test:package');

    const run = (script: string, args: string[], cwd = directory): string => {
        return execFileSync(process.execPath, [script, ...args], {
            cwd,
            encoding: 'utf8',
            timeout: 30000,
        });
    };

    try {
        const packed = JSON.parse(run(npmCli, [
            'pack', '--json', '--ignore-scripts', '--pack-destination', directory,
        ], process.cwd())) as { filename: string; files: { path: string }[] }[];
        const paths = packed[0].files.map(file => file.path);
        const modules = ['Css', 'Dom', 'DomCompat', 'DomEventsSink', 'ScrollHelper', 'Touches', 'index'];

        await context.test('every original JavaScript file ships with declarations', () => {
            for (const name of modules) {
                assert.ok(paths.includes(`lib/${name}.js`), `Missing lib/${name}.js`);
                assert.ok(paths.includes(`lib/${name}.d.ts`), `Missing lib/${name}.d.ts`);
                assert.ok(!paths.includes(`lib/${name}.ts`), 'Consumers should resolve declarations instead of unchecked source');
            }
        });

        Fs.writeFileSync(Path.join(directory, 'package.json'), '{ "private": true }');
        run(npmCli, [
            'install', Path.join(directory, packed[0].filename),
            '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock',
        ]);

        await context.test('native ESM file imports and the CommonJS root load', () => {
            const source = [
                "import assert from 'node:assert/strict';",
                "import { createRequire } from 'node:module';",
                "import * as index from '@danielgindi/dom-utils/lib/index.js';",
                "import DomEventsSink from '@danielgindi/dom-utils/lib/DomEventsSink.js';",
                "import * as alias from '@danielgindi/dom-utils/lib/index';",
                "import * as folder from '@danielgindi/dom-utils/lib';",
                "import SinkAlias from '@danielgindi/dom-utils/lib/DomEventsSink';",
                "import * as rootEsm from '@danielgindi/dom-utils';",
                'assert.equal(alias, index);',
                'assert.equal(folder, index);',
                'assert.equal(SinkAlias, DomEventsSink);',
                'assert.equal(rootEsm.DomEventsSink, DomEventsSink);',
                "const root = createRequire(import.meta.url)('@danielgindi/dom-utils');",
                "const require = createRequire(import.meta.url);",
                "assert.ok(require('@danielgindi/dom-utils/package.json').name);",
                "assert.ok(require('@danielgindi/dom-utils/dist/lib.cjs.min.js').Dom);",
                "assert.ok(require('@danielgindi/dom-utils/lib/package.json').type);",
                'assert.deepEqual(Object.keys(root).sort(), Object.keys(index).sort());',
                'assert.equal(index.DomEventsSink, DomEventsSink);',
                'assert.ok(new root.DomEventsSink());',
                "for (const name of ['Css', 'Dom', 'DomCompat', 'ScrollHelper', 'Touches']) {",
                "    const direct = await import('@danielgindi/dom-utils/lib/' + name + '.js');",
                "    const extensionless = await import('@danielgindi/dom-utils/lib/' + name);",
                '    assert.equal(extensionless, direct);',
                '    assert.deepEqual(Object.keys(direct).sort(), Object.keys(root[name]).sort());',
                '    for (const [key, helper] of Object.entries(direct))',
                '        assert.equal(index[name][key], helper);',
                '}',
                'assert.equal(index.Css.timeToMs("1.5s"), 1500);',
            ].join('\n');
            const fixture = Path.join(directory, 'runtime.mjs');
            Fs.writeFileSync(fixture, source);
            run(fixture, []);
        });

        const imports = [
            "import * as Css from '@danielgindi/dom-utils/lib/Css.js';",
            "import * as Dom from '@danielgindi/dom-utils/lib/Dom.js';",
            "import * as DomCompat from '@danielgindi/dom-utils/lib/DomCompat.js';",
            "import DomEventsSink from '@danielgindi/dom-utils/lib/DomEventsSink.js';",
            "import * as ScrollHelper from '@danielgindi/dom-utils/lib/ScrollHelper.js';",
            "import * as Touches from '@danielgindi/dom-utils/lib/Touches.js';",
            "import * as index from '@danielgindi/dom-utils/lib/index.js';",
            "import * as root from '@danielgindi/dom-utils';",
            "import * as folder from '@danielgindi/dom-utils/lib';",
            'void folder;',
            'export { Css, Dom, DomCompat, DomEventsSink, ScrollHelper, Touches, index, root };',
        ].join('\n');

        await context.test('TypeScript resolves explicit and extensionless file imports', () => {
            const fixture = Path.join(directory, 'consumer.mts');
            const require = createRequire(Path.join(process.cwd(), 'package.json'));
            const tsc = require.resolve('typescript/lib/tsc.js');
            const options = ['--noEmit', '--strict', '--skipLibCheck', 'false', '--target', 'ES2022'];
            const typeAssertions = '\nconst sink: DomEventsSink = new index.DomEventsSink();\nconst rootSink: DomEventsSink = new root.DomEventsSink();\nvoid sink;\nvoid rootSink;';
            Fs.writeFileSync(fixture, imports + typeAssertions);
            run(tsc, [...options, '--module', 'NodeNext', '--moduleResolution', 'NodeNext', fixture]);

            Fs.writeFileSync(fixture, imports.replaceAll('.js\'', '\'') + typeAssertions);
            run(tsc, [...options, '--module', 'NodeNext', '--moduleResolution', 'NodeNext', fixture]);
            run(tsc, [...options, '--module', 'ESNext', '--moduleResolution', 'Bundler', fixture]);

            const commonjsFixture = Path.join(directory, 'consumer.cts');
            Fs.writeFileSync(commonjsFixture, [
                "import root = require('@danielgindi/dom-utils');",
                'const sink: root.DomEventsSink = new root.DomEventsSink();',
                'void sink;',
            ].join('\n'));
            run(tsc, [...options, '--module', 'NodeNext', '--moduleResolution', 'NodeNext', commonjsFixture]);
        });

        await context.test('bundlers resolve the original extensionless lib paths', async () => {
            const fixture = Path.join(directory, 'bundle.mjs');
            Fs.writeFileSync(fixture, imports.replaceAll('.js\'', '\''));
            const bundle = await rollup({ input: fixture, plugins: [nodeResolve()] });
            try {
                const generated = await bundle.generate({ format: 'esm' });
                assert.equal(generated.output[0].type, 'chunk');
                assert.equal(generated.output[0].exports.length, 8);
            } finally {
                await bundle.close();
            }
        });
    } finally {
        assert.equal(Path.dirname(directory), Path.resolve(Os.tmpdir()));
        assert.ok(Path.basename(directory).startsWith('dom-utils-package-'));
        Fs.rmSync(directory, { recursive: true, force: true });
    }
});
