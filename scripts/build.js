#!/usr/bin/env node

/**
 * ZSide4CD 构建脚本
 * 
 * 用于编译和打包 ZSide4CD IDE
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
  const buildDir = path.join(__dirname, '..', 'dist');
  
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
    log.success('构建目录已清理');
  }
}

/**
 * 编译 TypeScript
 */
function compileTypeScript() {
  log.info('编译 TypeScript 代码...');
  
  if (!exec('tsc')) {
    log.error('TypeScript 编译失败');
    return false;
  }
  
  log.success('TypeScript 编译完成');
  return true;
}

/**
 * 复制资源文件
 */
function copyResources() {
  log.info('复制资源文件...');
  
  const resourceDirs = ['resources', 'extensions'];
  const distDir = path.join(__dirname, '..', 'dist');
  
  resourceDirs.forEach(dir => {
    const srcPath = path.join(__dirname, '..', dir);
    const destPath = path.join(distDir, dir);
    
    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      log.success(`已复制: ${dir}`);
    }
  });
  
  // 复制许可证文件
  const licenseFiles = ['LICENSE', 'NOTICE', 'README.md'];
  licenseFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log.success(`已复制: ${file}`);
    }
  });
  
  return true;
}

/**
 * 生成版本信息
 */
function generateVersionInfo() {
  log.info('生成版本信息...');
  
  const packageJson = require('../package.json');
  const versionInfo = {
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description,
    buildDate: new Date().toISOString(),
    author: packageJson.author
  };
  
  const distDir = path.join(__dirname, '..', 'dist');
  const versionFile = path.join(distDir, 'version.json');
  
  fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
  log.success('版本信息已生成');
  
  return true;
}

/**
 * 主构建流程
 */
function main() {
  log.info('开始构建 ZSide4CD...');
  
  const startTime = Date.now();
  
  // 清理
  cleanBuildDir();
  
  // 编译
  if (!compileTypeScript()) {
    process.exit(1);
  }
  
  // 复制资源
  if (!copyResources()) {
    process.exit(1);
  }
  
  // 生成版本信息
  if (!generateVersionInfo()) {
    process.exit(1);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.success(`构建完成！耗时: ${duration}秒`);
}

// 运行构建
main();
