import { spawn } from 'child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const shimDir = mkdtempSync(path.join(os.tmpdir(), 'clawalytics-builder-'));

function cleanup() {
  rmSync(shimDir, { force: true, recursive: true });
}

function createPnpmShim() {
  writeFileSync(
    path.join(shimDir, 'pnpm.cmd'),
    '@echo off\r\ncorepack pnpm %*\r\n',
    'utf8'
  );

  const unixShim = path.join(shimDir, 'pnpm');
  writeFileSync(unixShim, '#!/bin/sh\ncorepack pnpm "$@"\n', 'utf8');
  chmodSync(unixShim, 0o755);
}

function getElectronBuilderBinary() {
  return process.platform === 'win32'
    ? path.join(projectRoot, 'node_modules', '.bin', 'electron-builder.cmd')
    : path.join(projectRoot, 'node_modules', '.bin', 'electron-builder');
}

createPnpmShim();

const env = {
  ...process.env,
  PATH: `${shimDir}${path.delimiter}${process.env.PATH || ''}`,
};

const builderBinary = getElectronBuilderBinary();
const builderArgs = process.argv.slice(2);
const child =
  process.platform === 'win32'
    ? spawn(builderBinary, builderArgs, {
        cwd: projectRoot,
        env,
        shell: true,
        stdio: 'inherit',
      })
    : spawn(builderBinary, builderArgs, {
        cwd: projectRoot,
        env,
        shell: false,
        stdio: 'inherit',
      });

child.on('error', (error) => {
  cleanup();
  console.error('Failed to start electron-builder:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  cleanup();
  process.exit(code ?? 1);
});
