import { build } from 'esbuild'
import fs from 'fs'    

await build({
    entryPoints: ['./src/cli-homebrew.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: './out/cli.cjs',
    banner: {
        js: '#!/usr/bin/env node'
    }
});

const wasmFile = fs.readFileSync('./node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm')

fs.writeFileSync('./out/tiktoken_bg.wasm', wasmFile)
