#!/usr/bin/env node

/**
 * ZSide4CD 独立应用构建脚本
 * 
 * 构建基于Electron的独立应用
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
 * 执行命令并输出结果
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
 * 清理构建目录
 */
function cleanBuildDir() {
  log.info('清理构建目录...');
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(buildDir, { recursive: true });
  log.success('构建目录已准备');
}

/**
 * 复制应用文件
 */
function copyAppFiles() {
  log.info('复制应用文件...');
  
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  
  // 复制app目录
  const appSrc = path.join(__dirname, '..', 'app');
  const appDest = path.join(buildDir, 'app');
  fs.cpSync(appSrc, appDest, { recursive: true });
  log.success('已复制: app/');
  
  // 复制资源文件
  const resourceDirs = ['resources', 'extensions', 'toolchains'];
  resourceDirs.forEach(dir => {
    const srcPath = path.join(__dirname, '..', dir);
    const destPath = path.join(buildDir, dir);
    
    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      log.success(`已复制: ${dir}/`);
    }
  });
  
  // 复制 build 下的已下载工具链到 dist 的 resources/app/toolchains，便于 overlay 到 VSCodium 时使用
  const buildToolchainsSrc = path.join(__dirname, '..', 'build', 'toolchains');
  if (fs.existsSync(buildToolchainsSrc)) {
    const destToolchains = path.join(buildDir, 'resources', 'app', 'toolchains');
    fs.mkdirSync(destToolchains, { recursive: true });
    fs.cpSync(buildToolchainsSrc, destToolchains, { recursive: true });
    log.success('已复制: build/toolchains -> resources/app/toolchains');
  } else {
    log.warn('未找到 build/toolchains，跳过复制');
  }

  // 复制许可证文件
  const licenseFiles = ['LICENSE', 'NOTICE', 'README.md'];
  licenseFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(buildDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log.success(`已复制: ${file}`);
    }
  });
  
  return true;
}

/**
 * 创建package.json
 */
function createPackageJson() {
  log.info('创建package.json...');
  
  const packageJson = require('../package.json');
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  
  const standalonePackage = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    // 将入口设置为根下的 main.js（与 files 映射 dist-standalone/app -> "." 一致）
    main: 'main.js',
    author: packageJson.author,
    license: packageJson.license,
    dependencies: {
      electron: packageJson.dependencies.electron
    }
  };
  
  const packageFile = path.join(buildDir, 'package.json');
  fs.writeFileSync(packageFile, JSON.stringify(standalonePackage, null, 2));
  
  // 为了兼容 electron-builder，确保 app 目录下也包含 package.json
  try {
    const appPackagePath = path.join(buildDir, 'app', 'package.json');
    fs.copyFileSync(packageFile, appPackagePath);
    log.success('app/package.json 已创建（用于打包）');
  } catch (err) {
    log.warn('无法复制 package.json 到 app 目录: ' + err.message);
  }
  
  log.success('package.json已创建');
  return true;
}

/**
 * 生成版本信息
 */
function generateVersionInfo() {
  log.info('生成版本信息...');
  
  const packageJson = require('../package.json');
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  
  const versionInfo = {
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description,
    buildDate: new Date().toISOString(),
    buildType: 'standalone',
    author: packageJson.author
  };
  
  const versionFile = path.join(buildDir, 'version.json');
  fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
  
  log.success('版本信息已生成');
  return true;
}

/**
 * 主构建流程
 */
function main() {
  log.info('开始构建 ZSide4CD 独立应用...');
  
  const startTime = Date.now();
  
  // 清理
  cleanBuildDir();
  
  // 复制文件
  if (!copyAppFiles()) {
    process.exit(1);
  }
  
  // 创建package.json
  if (!createPackageJson()) {
    process.exit(1);
  }
  
  // 生成版本信息
  if (!generateVersionInfo()) {
    process.exit(1);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.success(`独立应用构建完成！耗时: ${duration}秒`);
  log.info('构建目录: dist-standalone/');
}

// 运行构建
main();
