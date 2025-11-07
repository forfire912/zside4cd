const fs = require('fs');
const path = require('path');

// 从 build/toolchains 中收集 LICENSE/COPYING/NOTICE 文件，复制到 dist-standalone/resources/app/licenses

function isLicenseFile(name) {
  const n = name.toLowerCase();
  return n === 'license' || n === 'license.txt' || n === 'copying' || n === 'copying.txt' || n === 'notice' || n === 'license.md' || n === 'copyright';
}

function collect(srcRoot, destRoot) {
  if (!fs.existsSync(srcRoot)) {
    console.warn(`源目录不存在: ${srcRoot}`);
    return 0;
  }

  fs.mkdirSync(destRoot, { recursive: true });

  const toolchains = fs.readdirSync(srcRoot, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  let count = 0;

  toolchains.forEach(tc => {
    const tcDir = path.join(srcRoot, tc);
    // 递归查找许可证文件
    const files = findFilesRecursive(tcDir, isLicenseFile);
    if (files.length === 0) {
      // 也尝试在二级目录中查找
      const subdirs = fs.readdirSync(tcDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
      subdirs.forEach(sd => {
        const subpath = path.join(tcDir, sd);
        const f2 = findFilesRecursive(subpath, isLicenseFile);
        files.push(...f2);
      });
    }

    if (files.length > 0) {
      files.forEach((f, idx) => {
        const ext = path.extname(f) || '.txt';
        const base = `${tc}${idx+1}${ext}`;
        const dest = path.join(destRoot, base);
        try {
          fs.copyFileSync(f, dest);
          console.log(`复制: ${f} -> ${dest}`);
          count++;
        } catch (err) {
          console.error(`复制失败: ${f} -> ${dest}: ${err.message}`);
        }
      });
    } else {
      console.warn(`未找到 ${tc} 的许可证文件`);
    }
  });

  return count;
}

function findFilesRecursive(dir, predicate) {
  const results = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
      const p = path.join(dir, item.name);
      if (item.isDirectory()) {
        results.push(...findFilesRecursive(p, predicate));
      } else if (item.isFile()) {
        if (predicate(item.name)) results.push(p);
      }
    });
  } catch (err) {
    // ignore
  }
  return results;
}

function main() {
  const repoRoot = path.join(__dirname, '..');
  const src = path.join(repoRoot, 'build', 'toolchains');
  const dest = path.join(repoRoot, 'dist-standalone', 'resources', 'app', 'licenses');

  const copied = collect(src, dest);
  console.log(`已复制 ${copied} 个许可证文件 到 ${dest}`);
  if (copied === 0) process.exit(2);
}

if (require.main === module) main();
