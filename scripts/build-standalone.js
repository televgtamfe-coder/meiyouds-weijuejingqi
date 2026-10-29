#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DOCS = path.join(ROOT, 'docs');
const builtAt = new Date().toISOString();

if (!fs.existsSync(DIST)) {
  throw new Error('dist directory not found. Run "npm run build" before "node scripts/build-standalone.js".');
}

fs.mkdirSync(DOCS, { recursive: true });

const generatedFiles = ['index.html', 'scene1.html', 'scene2.html', 'scene3.html', 'record.html'];
for (const file of generatedFiles) {
  fs.rmSync(path.join(DOCS, file), { force: true });
}
fs.rmSync(path.join(DOCS, 'assets'), { recursive: true, force: true });

fs.cpSync(path.join(DIST, 'assets'), path.join(DOCS, 'assets'), { recursive: true });
fs.copyFileSync(path.join(DIST, 'index.html'), path.join(DOCS, 'index.html'));

function buildRedirectPage(hashTarget, label) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${label}</title>
  <meta http-equiv="refresh" content="0;url=./${hashTarget}">
  <script>location.replace('./${hashTarget}')</script>
  <style>
    body{font-family:"PingFang SC",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f2f2f5;color:#323232;padding:24px}
    a{color:#ff4d88}
  </style>
</head>
<body>
  <p>正在跳转到${label}…</p>
  <p><a href="./${hashTarget}">若未自动跳转，请点这里</a></p>
</body>
</html>`;
}

fs.writeFileSync(path.join(DOCS, 'scene1.html'), buildRedirectPage('#/scene1', '场景一 · 日历记月经'));
fs.writeFileSync(path.join(DOCS, 'scene2.html'), buildRedirectPage('#/scene1', '场景二占位，当前回到 scene1'));
fs.writeFileSync(path.join(DOCS, 'scene3.html'), buildRedirectPage('#/record', '场景三占位，当前跳转记录骨架'));
fs.writeFileSync(path.join(DOCS, 'record.html'), buildRedirectPage('#/record', '记录详情骨架'));

console.log(`Built app copied from ${DIST} to ${DOCS} at ${builtAt}`);

// Keep the independent Python-in-browser algorithm demo in Pages output.
fs.cpSync(path.join(DIST, 'demo5'), path.join(DOCS, 'demo5'), { recursive: true });
