#!/usr/bin/env node

/**
 * ZSide4CD 打包脚本
 * 
 * 用于创建 Windows 安装包
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 控制台输出工具函数
const log = {
  info: (msg) => console.log(`\x1b[36m[信息]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[成功]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[错误]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[警告]\x1b[0m ${msg}`)
};

/**
 * 执行命令
 */
function exec(command, options = {}) {
  try {
    log.info(`执行命令: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log.error(`命令执行失败: ${error.message}`);
    return false;
  }
}

/**
 * 检查构建目录
 */
function checkBuildDir() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    log.error('构建目录不存在，请先运行构建脚本');
    return false;
  }
  
  log.success('构建目录检查通过');
  return true;
}

/**
 * 创建打包配置
 */
function createPackageConfig() {
  log.info('创建打包配置...');
  
  const packageJson = require('../package.json');
  
  const config = {
    appId: 'com.zside4cd.ide',
    productName: 'ZSide4CD',
    directories: {
      output: 'release'
    },
    files: [
      'dist/**/*',
      'package.json'
    ],
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64']
        }
      ],
      icon: 'resources/icons/app.ico',
      artifactName: '${productName}-Setup-${version}.${ext}'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: 'ZSide4CD',
      installerLanguages: ['zh_CN', 'en_US'],
      language: '2052',
      deleteAppDataOnUninstall: false
    },
    extraResources: [
      {
        from: 'LICENSE',
        to: 'LICENSE.txt'
      },
      {
        from: 'NOTICE',
        to: 'NOTICE.txt'
      }
    ]
  };
  
  const configFile = path.join(__dirname, '..', 'electron-builder.json');
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  
  log.success('打包配置已创建');
  return true;
}

/**
 * 执行打包
 */
function packageApp() {
  log.info('开始打包应用...');
  log.warn('注意：打包需要 electron-builder，请确保已安装');
  
  // 使用 electron-builder 打包
  if (!exec('npx electron-builder build --win --x64')) {
    log.error('打包失败');
    return false;
  }
  
  log.success('应用打包完成');
  return true;
}

/**
 * 显示打包结果
 */
function showResults() {
  const releaseDir = path.join(__dirname, '..', 'release');
  
  if (!fs.existsSync(releaseDir)) {
    log.warn('未找到打包输出目录');
    return;
  }
  
  log.info('打包结果:');
  const files = fs.readdirSync(releaseDir);
  files.forEach(file => {
    const filePath = path.join(releaseDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - ${file} (${sizeMB} MB)`);
  });
}

/**
 * 主打包流程
 */
function main() {
  log.info('开始打包 ZSide4CD...');
  
  const startTime = Date.now();
  
  // 检查构建目录
  if (!checkBuildDir()) {
    process.exit(1);
  }
  
  // 创建打包配置
  if (!createPackageConfig()) {
    process.exit(1);
  }
  
  // 执行打包
  if (!packageApp()) {
    process.exit(1);
  }
  
  // 显示结果
  showResults();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.success(`打包完成！耗时: ${duration}秒`);
  log.info('安装包位于 release 目录');
}

// 运行打包
main();
