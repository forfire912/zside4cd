#!/usr/bin/env node

/**
 * ZSide4CD 独立应用打包脚本
 * 
 * 使用 electron-builder 打包为 Windows 安装程序
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
  const distDir = path.join(__dirname, '..', 'dist-standalone');
  
  if (!fs.existsSync(distDir)) {
    log.error('构建目录不存在，请先运行: npm run build:standalone');
    return false;
  }
  
  log.success('构建目录检查通过');
  return true;
}

/**
 * 安装依赖
 */
function installDependencies() {
  log.info('安装打包依赖...');
  
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  
  if (!exec('npm install electron-builder --save-dev')) {
    log.error('依赖安装失败');
    return false;
  }
  
  log.success('依赖安装完成');
  return true;
}

/**
 * 创建打包配置
 */
function createPackageConfig() {
  log.info('创建打包配置...');
  
  const packageJson = require('../package.json');
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  
  const config = {
    appId: 'com.zside4cd.ide',
    productName: 'ZSide4CD',
    copyright: 'Copyright © 2024 ZSide4CD Team',
    directories: {
      app: buildDir,
      output: path.join(__dirname, '..', 'release-standalone')
    },
    files: [
      '**/*'
    ],
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64']
        },
        {
          target: 'portable',
          arch: ['x64']
        }
      ],
      icon: path.join(__dirname, '..', 'resources', 'icons', 'app.ico'),
      artifactName: 'ZSide4CD-${version}-Setup.${ext}'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      allowElevation: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: 'ZSide4CD IDE',
      installerIcon: path.join(__dirname, '..', 'resources', 'icons', 'app.ico'),
      uninstallerIcon: path.join(__dirname, '..', 'resources', 'icons', 'app.ico'),
      installerHeader: path.join(__dirname, '..', 'resources', 'icons', 'installer-header.bmp'),
      installerLanguages: ['zh_CN', 'en_US'],
      language: '2052',
      deleteAppDataOnUninstall: false,
      perMachine: false,
      runAfterFinish: true,
      menuCategory: true,
      artifactName: 'ZSide4CD-${version}-Setup.${ext}'
    },
    portable: {
      artifactName: 'ZSide4CD-${version}-Portable.${ext}'
    },
    extraMetadata: {
      name: 'zside4cd',
      productName: 'ZSide4CD',
      description: packageJson.description
    }
  };
  
  const configFile = path.join(__dirname, '..', 'electron-builder-standalone.json');
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  
  log.success('打包配置已创建');
  return true;
}

/**
 * 执行打包
 */
function packageApp() {
  log.info('开始打包独立应用...');
  log.warn('这可能需要几分钟时间，请耐心等待...');
  
  const configFile = path.join(__dirname, '..', 'electron-builder-standalone.json');
  
  // 使用 electron-builder 打包
  if (!exec(`npx electron-builder --config ${configFile} --win --x64`)) {
    log.error('打包失败');
    return false;
  }
  
  log.success('独立应用打包完成');
  return true;
}

/**
 * 显示打包结果
 */
function showResults() {
  const releaseDir = path.join(__dirname, '..', 'release-standalone');
  
  if (!fs.existsSync(releaseDir)) {
    log.warn('未找到打包输出目录');
    return;
  }
  
  log.info('\n打包结果:');
  log.info('========================================');
  
  const files = fs.readdirSync(releaseDir);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(releaseDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      totalSize += stats.size;
      console.log(`  📦 ${file}`);
      console.log(`     大小: ${sizeMB} MB`);
    }
  });
  
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  log.info('========================================');
  log.info(`总大小: ${totalSizeMB} MB`);
  log.info(`输出目录: ${releaseDir}`);
}

/**
 * 主打包流程
 */
function main() {
  log.info('开始打包 ZSide4CD 独立应用...');
  log.info('========================================\n');
  
  const startTime = Date.now();
  
  // 检查构建目录
  if (!checkBuildDir()) {
    process.exit(1);
  }
  
  // 安装依赖
  if (!installDependencies()) {
    log.warn('依赖安装失败，尝试继续打包...');
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
  log.info('========================================');
  log.success(`\n✨ 打包完成！耗时: ${duration}秒`);
  log.info('\n📦 安装包文件:');
  log.info('  - ZSide4CD-*-Setup.exe (安装版)');
  log.info('  - ZSide4CD-*-Portable.exe (便携版)');
}

// 运行打包
main();
