#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const distLicDir = path.join(repoRoot, 'dist-standalone', 'resources', 'app', 'licenses');
const buildToolchains = path.join(repoRoot, 'build', 'toolchains');
const outManifest = path.join(distLicDir, 'THIRD_PARTY_LICENSES.txt');
const outCopyDir = path.join(repoRoot, 'build', 'release-artifacts', 'licenses');

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

ensureDir(distLicDir);
ensureDir(outCopyDir);

const licenseNames = ['LICENSE', 'LICENSE.txt', 'COPYING', 'COPYING.txt', 'NOTICE', 'README', 'README.md'];

function collectFromDir(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const sub = collectFromDir(p);
      for (const s of sub) found.push(s);
    } else {
      const name = path.basename(p);
      if (licenseNames.includes(name)) found.push(p);
    }
  }
  return found;
}

// Start manifest
let manifest = [];
manifest.push('Third-Party Licenses Manifest\n');
manifest.push('Generated: ' + new Date().toISOString() + '\n');
manifest.push('Source directories scanned: dist-standalone/resources/app/licenses, build/toolchains\n\n');

// 1) collect existing dist licenses
let distFiles = [];
if (fs.existsSync(distLicDir)) {
  distFiles = fs.readdirSync(distLicDir).filter(f => fs.statSync(path.join(distLicDir,f)).isFile());
}

if (distFiles.length > 0) {
  manifest.push('===== Licenses already in dist-standalone/resources/app/licenses =====\n\n');
  for (const f of distFiles) {
    const p = path.join(distLicDir, f);
    manifest.push('--- ' + f + '\n');
    try {
      const content = fs.readFileSync(p, 'utf8');
      manifest.push(content + '\n\n');
      // copy to release-artifacts/licenses
      fs.copyFileSync(p, path.join(outCopyDir, f));
    } catch (e) {
      manifest.push('[Unable to read ' + f + ']\n\n');
    }
  }
} else {
  manifest.push('[No pre-existing license files found in dist licenses dir]\n\n');
}

// 2) scan build/toolchains for license files per toolchain
manifest.push('===== Scanning build/toolchains for license files =====\n\n');
if (fs.existsSync(buildToolchains)) {
  const toolchainDirs = fs.readdirSync(buildToolchains).filter(n => fs.statSync(path.join(buildToolchains,n)).isDirectory());
  for (const tc of toolchainDirs) {
    const tcPath = path.join(buildToolchains, tc);
    manifest.push('Toolchain: ' + tc + '\n');
    const found = collectFromDir(tcPath);
    if (found.length === 0) {
      manifest.push('  No license files found under: ' + tcPath + '\n\n');
      // note missing
      manifest.push('[NOTICE] License file missing for ' + tc + '. Please obtain LICENSE/COPYING from the upstream distribution and add it to dist-standalone/resources/app/licenses or build/toolchains/' + tc + '\n\n');
    } else {
      for (const f of found) {
        const rel = path.relative(repoRoot, f);
        const name = path.basename(f);
        manifest.push('  Found: ' + rel + '\n');
        try {
          const content = fs.readFileSync(f, 'utf8');
          manifest.push('\n---- begin ' + tc + ' / ' + name + ' ----\n');
          manifest.push(content + '\n');
          manifest.push('---- end ' + tc + ' / ' + name + ' ----\n\n');
          // copy into dist and release-artifacts
          const destName = tc + '-' + name;
          fs.copyFileSync(f, path.join(distLicDir, destName));
          fs.copyFileSync(f, path.join(outCopyDir, destName));
        } catch (e) {
          manifest.push('  [Unable to read ' + rel + ']\n');
        }
      }
    }
  }
} else {
  manifest.push('build/toolchains not found. Skipping scan.\n');
}

// write manifest
fs.writeFileSync(outManifest, manifest.join('\n'), 'utf8');
// also copy manifest to release artifacts
fs.copyFileSync(outManifest, path.join(outCopyDir, path.basename(outManifest)));

console.log('[生成完成] 许可证清单写入: ' + outManifest);
console.log('[复制完成] 已把可用许可证文件复制到: ' + outCopyDir);

// list artifacts
const artifacts = fs.readdirSync(outCopyDir).map(f => ({ name: f, size: fs.statSync(path.join(outCopyDir,f)).size }));
console.log('[Artifacts] ' + JSON.stringify(artifacts));
