// 简单的构建后验证脚本：验证嵌入的工具链可执行文件能够运行 --version 并输出版本信息

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function checkExe(exePath, args = ['--version']) {
  if (!fs.existsSync(exePath)) {
    console.error(`MISSING: ${exePath}`);
    return false;
  }

  try {
    const out = execFileSync(exePath, args, { encoding: 'utf8', timeout: 10000 });
    console.log(`OK: ${exePath} -> ${out.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.error(`FAIL: ${exePath} -> ${error.message}`);
    return false;
  }
}

const root = path.join(__dirname, '..');
const toolchainsDir = path.join(root, 'build', 'toolchains');

const checks = [
  { path: path.join(toolchainsDir, 'arm-gcc', 'gcc-arm-none-eabi-10.3-2021.10', 'bin', 'arm-none-eabi-gcc.exe') },
  { path: path.join(toolchainsDir, 'openocd', 'xpack-openocd-0.11.0-1', 'bin', 'openocd.exe') },
  { path: path.join(toolchainsDir, 'stlink', 'stlink-1.8.0-win32', 'bin', 'st-flash.exe') }
];

let allOk = true;
for (const chk of checks) {
  const ok = checkExe(chk.path);
  allOk = allOk && ok;
}

process.exit(allOk ? 0 : 2);
