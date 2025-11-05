#!/usr/bin/env node

/**
 * ZSide4CD 独立应用测试脚本
 * 
 * 测试独立应用的基本功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 控制台输出工具函数
const log = {
  info: (msg) => console.log(`\x1b[36m[信息]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[✗]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[警告]\x1b[0m ${msg}`),
  test: (msg) => console.log(`\x1b[35m[测试]\x1b[0m ${msg}`)
};

let testsPassed = 0;
let testsFailed = 0;

/**
 * 运行测试
 */
function runTest(testName, testFunc) {
  log.test(testName);
  try {
    const result = testFunc();
    if (result) {
      log.success(`${testName} - 通过`);
      testsPassed++;
      return true;
    } else {
      log.error(`${testName} - 失败`);
      testsFailed++;
      return false;
    }
  } catch (error) {
    log.error(`${testName} - 异常: ${error.message}`);
    testsFailed++;
    return false;
  }
}

/**
 * 测试：检查构建目录
 */
function testBuildDirectory() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  return fs.existsSync(buildDir);
}

/**
 * 测试：检查核心文件
 */
function testCoreFiles() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const requiredFiles = [
    'app/main.js',
    'app/renderer.js',
    'app/index.html',
    'package.json',
    'LICENSE'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(buildDir, file);
    if (!fs.existsSync(filePath)) {
      log.error(`缺少文件: ${file}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 测试：检查模块文件
 */
function testModuleFiles() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const modules = [
    'app/toolchain-manager.js',
    'app/build-manager.js',
    'app/debug-manager.js',
    'app/flash-manager.js'
  ];
  
  for (const module of modules) {
    const modulePath = path.join(buildDir, module);
    if (!fs.existsSync(modulePath)) {
      log.error(`缺少模块: ${module}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 测试：检查资源文件
 */
function testResourceFiles() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const resources = [
    'resources/i18n/zh-CN.json',
    'extensions/stm32/package.json',
    'extensions/c67xx/package.json'
  ];
  
  for (const resource of resources) {
    const resourcePath = path.join(buildDir, resource);
    if (!fs.existsSync(resourcePath)) {
      log.error(`缺少资源: ${resource}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 测试：检查package.json
 */
function testPackageJson() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const packageFile = path.join(buildDir, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    
    // 检查必需字段
    if (!packageJson.name || !packageJson.version || !packageJson.main) {
      log.error('package.json缺少必需字段');
      return false;
    }
    
    // 检查main入口
    if (packageJson.main !== 'app/main.js') {
      log.error('package.json main入口不正确');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`package.json解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试：检查版本信息
 */
function testVersionInfo() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const versionFile = path.join(buildDir, 'version.json');
  
  if (!fs.existsSync(versionFile)) {
    log.error('version.json不存在');
    return false;
  }
  
  try {
    const versionInfo = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    
    if (!versionInfo.version || !versionInfo.buildType) {
      log.error('version.json字段不完整');
      return false;
    }
    
    if (versionInfo.buildType !== 'standalone') {
      log.error('buildType不正确');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`version.json解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试：检查项目模板
 */
function testProjectTemplates() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const templates = [
    'extensions/stm32/templates/basic/src/main.c',
    'extensions/stm32/templates/basic/project.json',
    'extensions/c67xx/templates/basic/src/main.c',
    'extensions/c67xx/templates/basic/project.json'
  ];
  
  for (const template of templates) {
    const templatePath = path.join(buildDir, template);
    if (!fs.existsSync(templatePath)) {
      log.error(`缺少模板: ${template}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 测试：检查JavaScript语法
 */
function testJavaScriptSyntax() {
  const buildDir = path.join(__dirname, '..', 'dist-standalone');
  const jsFiles = [
    'app/main.js',
    'app/renderer.js',
    'app/toolchain-manager.js'
  ];
  
  for (const jsFile of jsFiles) {
    const filePath = path.join(buildDir, jsFile);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // 简单的语法检查
      new Function(content);
    } catch (error) {
      log.error(`${jsFile} 语法错误: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 显示测试报告
 */
function showTestReport() {
  const total = testsPassed + testsFailed;
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(2) : 0;
  
  console.log('\n========================================');
  console.log('测试报告');
  console.log('========================================');
  console.log(`总测试数: ${total}`);
  console.log(`通过: ${testsPassed}`);
  console.log(`失败: ${testsFailed}`);
  console.log(`通过率: ${passRate}%`);
  console.log('========================================\n');
  
  if (testsFailed === 0) {
    log.success('✨ 所有测试通过！独立应用可以发布。');
    return true;
  } else {
    log.error(`⚠️  有 ${testsFailed} 个测试失败，请修复后再发布。`);
    return false;
  }
}

/**
 * 主测试流程
 */
function main() {
  log.info('开始测试 ZSide4CD 独立应用...\n');
  
  const startTime = Date.now();
  
  // 运行所有测试
  runTest('检查构建目录', testBuildDirectory);
  runTest('检查核心文件', testCoreFiles);
  runTest('检查模块文件', testModuleFiles);
  runTest('检查资源文件', testResourceFiles);
  runTest('检查package.json', testPackageJson);
  runTest('检查版本信息', testVersionInfo);
  runTest('检查项目模板', testProjectTemplates);
  runTest('检查JavaScript语法', testJavaScriptSyntax);
  
  // 显示测试报告
  const success = showTestReport();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.info(`测试耗时: ${duration}秒`);
  
  process.exit(success ? 0 : 1);
}

// 运行测试
main();
