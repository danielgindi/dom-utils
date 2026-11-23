/* eslint-disable no-console */

import * as FsExtra from 'fs-extra';
import * as Path from 'node:path';
import { rollup, type OutputChunk, type Plugin } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

type BuildTask = {
    dest: string;
    sourceMap: boolean;
    outputFormat: 'esm' | 'umd' | 'cjs';
    outputExports?: 'named';
    outputName?: string;
    babelTargets?: string;
    minified: boolean;
    ecmaVersion: 2022;
};

(async () => {

    await FsExtra.emptyDir('./dist');

    const rollupTasks: BuildTask[] = [{
        dest: 'dist/lib.es6.js',
        sourceMap: true,
        outputFormat: 'esm',
        minified: false,
        ecmaVersion: 2022,
    }, {
        dest: 'dist/lib.es6.min.js',
        sourceMap: true,
        outputFormat: 'esm',
        minified: true,
        ecmaVersion: 2022,
    }, {
        dest: 'dist/lib.umd.js',
        sourceMap: true,
        outputFormat: 'umd',
        outputExports: 'named',
        outputName: 'domutils',
        babelTargets: '> 0.25%, not dead',
        minified: false,
        ecmaVersion: 2022,
    }, {
        dest: 'dist/lib.umd.min.js',
        sourceMap: true,
        outputFormat: 'umd',
        outputExports: 'named',
        outputName: 'domutils',
        babelTargets: '> 0.25%, not dead',
        minified: true,
        ecmaVersion: 2022,
    }, {
        dest: 'dist/lib.cjs.js',
        sourceMap: true,
        outputFormat: 'cjs',
        outputExports: 'named',
        outputName: 'domutils',
        babelTargets: '> 0.25%, not dead',
        minified: false,
        ecmaVersion: 2022,
    }, {
        dest: 'dist/lib.cjs.min.js',
        sourceMap: true,
        outputFormat: 'cjs',
        outputExports: 'named',
        outputName: 'domutils',
        babelTargets: '> 0.25%, not dead',
        minified: true,
        ecmaVersion: 2022,
    }];

    await FsExtra.ensureDir('dist/types');
    for (const file of await FsExtra.readdir('.tsbuild')) {
        if (file.endsWith('.d.ts')) {
            await FsExtra.copyFile(`.tsbuild/${file}`, `dist/types/${file}`);
        }
    }

    const inputFile = '.tsbuild/index.js';

    for (const task of rollupTasks) {
        console.info('Generating ' + task.dest + '...');

        const plugins: Plugin[] = [
            nodeResolve({
                mainFields: ['module', 'main'],
            }),
            commonjs({}),
        ];

        const pkg = FsExtra.readJsonSync('package.json') as { name: string; version: string; repository: { url: string } };
        const banner = [
            `/*!`,
            ` * ${pkg.name} ${pkg.version}`,
            ` * ${pkg.repository.url}`,
            ' */\n',
        ].join('\n');

        if (task.babelTargets) {
            plugins.push(babel({
                sourceMap: !!task.sourceMap,
                presets: [
                    ['@babel/env', {
                        targets: task.babelTargets,
                        useBuiltIns: 'usage',
                        corejs: 3,
                    }],
                ],
                compact: false,
                minified: false,
                comments: true,
                retainLines: true,
                babelHelpers: 'bundled',
                exclude: 'node_modules/**/core-js/**/*',
            }));
        }

        if (task.minified) {
            plugins.push(terser({
                toplevel: true,
                compress: {
                    ecma: task.ecmaVersion,
                    passes: 2,
                },
                sourceMap: !!task.sourceMap,
            }));
        }

        plugins.push({
            name: 'banner',

            renderChunk(code) {

                const magicString = new MagicString(code);
                magicString.prepend(banner);

                return {
                    code: magicString.toString(),
                    map: magicString.generateMap({
                        hires: true,
                    }),
                };
            },
        });

        const bundle = await rollup({
            preserveSymlinks: true,
            treeshake: false,
            onwarn(warning, warn) {
                if (warning.code === 'THIS_IS_UNDEFINED') return;
                warn(warning);
            },
            input: inputFile,
            plugins: plugins,
            external: [],
        });

        const generated = await bundle.generate({
            name: task.outputName,
            sourcemap: task.sourceMap,
            format: task.outputFormat,
            exports: task.outputExports,
            globals: {
            },
        });

        const output = generated.output[0] as OutputChunk;
        let code = output.code;

        if (task.sourceMap === true && output.map) {
            const sourceMapOutPath = task.dest + '.map';
            FsExtra.writeFileSync(sourceMapOutPath, output.map.toString());
            code += '\n//# sourceMappingURL=' + Path.basename(sourceMapOutPath);
        }

        FsExtra.writeFileSync(task.dest, code);
    }

    console.info('Done.');

})();
