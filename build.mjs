import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';

const config = JSON.parse(readFileSync('config.json', 'utf-8'));
const prefixScss = `$prefix: "${config.prefix}" !default;\n`;
const prefixPath = 'scss/settings/_prefix.scss';

const current = (() => {
  try { return readFileSync(prefixPath, 'utf-8'); } catch { return ''; }
})();

if (current !== prefixScss) {
  writeFileSync(prefixPath, prefixScss);
}

const watch = process.argv.includes('--watch');

function stripBom(file) {
  const css = readFileSync(file, 'utf-8');
  writeFileSync(file, css.replace(/^﻿/, ''));
}

if (watch) {
  execSync('npx sass --watch scss/_index.scss:dist/styles.css --style=expanded &', { stdio: 'inherit', shell: true });
  execSync('node esbuild.mjs --watch', { stdio: 'inherit' });
} else {
  execSync('npx sass scss/_index.scss dist/styles.css --style=expanded --no-source-map', { stdio: 'inherit' });
  execSync('npx sass scss/_core.scss dist/core.css --style=expanded --no-source-map', { stdio: 'inherit' });
  execSync('npx sass scss/_blocks-only.scss dist/blocks.css --style=expanded --no-source-map', { stdio: 'inherit' });
  execSync('npx sass scss/_utilities-only.scss dist/utilities.css --style=expanded --no-source-map', { stdio: 'inherit' });
  const files = ['dist/styles.css', 'dist/core.css', 'dist/blocks.css', 'dist/utilities.css'];
  files.forEach(stripBom);

  execSync('node esbuild.mjs', { stdio: 'inherit' });

  copyFileSync('js/theme-init.js', 'dist/theme-init.js');
}
