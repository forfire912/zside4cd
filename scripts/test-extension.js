#!/usr/bin/env node

/**
 * ZSide4CD VSCodium扩展测试脚本
 * 
 * 测试VSCodium扩展的基本功能
 */

const fs = require('fs');
const path = require('path');

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
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  return fs.existsSync(buildDir);
}

/**
 * 测试：检查扩展入口
 */
function testExtensionEntry() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const entryFile = path.join(buildDir, 'extension.js');
  
  if (!fs.existsSync(entryFile)) {
    log.error('extension.js不存在');
    return false;
  }
  
  // 检查入口文件内容
  const content = fs.readFileSync(entryFile, 'utf8');
  if (!content.includes('activate') || !content.includes('deactivate')) {
    log.error('extension.js缺少必需函数');
    return false;
  }
  
  return true;
}

/**
 * 测试：检查package.json
 */
function testPackageJson() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const packageFile = path.join(buildDir, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    
    // 检查必需字段
    const requiredFields = [
      'name',
      'version',
      'engines',
      'main',
      'activationEvents',
      'contributes'
    ];
    
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        log.error(`package.json缺少字段: ${field}`);
        return false;
      }
    }
    
    // 检查engines.vscode
    if (!packageJson.engines.vscode) {
      log.error('package.json缺少engines.vscode');
      return false;
    }
    
    // 检查main入口
    if (packageJson.main !== './extension.js') {
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
 * 测试：检查命令定义
 */
function testCommands() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const packageFile = path.join(buildDir, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const commands = packageJson.contributes?.commands || [];
    
    // 检查是否定义了关键命令
    const requiredCommands = [
      'zside4cd.buildProject',
      'zside4cd.debugProject',
      'zside4cd.flashProgram',
      'zside4cd.detectToolchains'
    ];
    
    for (const cmd of requiredCommands) {
      const found = commands.some(c => c.command === cmd);
      if (!found) {
        log.error(`缺少命令定义: ${cmd}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log.error(`命令检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试：检查激活事件
 */
function testActivationEvents() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const packageFile = path.join(buildDir, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const events = packageJson.activationEvents || [];
    
    if (events.length === 0) {
      log.error('未定义激活事件');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`激活事件检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 测试：检查模块文件
 */
function testModuleFiles() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const modules = [
    'modules/toolchain-manager.js',
    'modules/build-manager.js',
    'modules/debug-manager.js',
    'modules/flash-manager.js'
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
  const buildDir = path.join(__dirname, '..', 'dist-extension');
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
 * 测试：检查README和文档
 */
function testDocumentation() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const docs = ['README.md', 'CHANGELOG.md', 'LICENSE'];
  
  for (const doc of docs) {
    const docPath = path.join(buildDir, doc);
    if (!fs.existsSync(docPath)) {
      log.error(`缺少文档: ${doc}`);
      return false;
    }
  }
  
  return true;
}

/**
 * 测试：检查JavaScript语法
 */
function testJavaScriptSyntax() {
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const jsFiles = [
    'extension.js',
    'modules/toolchain-manager.js'
  ];
  
  for (const jsFile of jsFiles) {
    const filePath = path.join(buildDir, jsFile);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // 简单的语法检查 - 检查是否能解析
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
    log.success('✨ 所有测试通过！VSCodium扩展可以发布。');
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
  log.info('开始测试 ZSide4CD VSCodium扩展...\n');
  
  const startTime = Date.now();
  
  // 运行所有测试
  runTest('检查构建目录', testBuildDirectory);
  runTest('检查扩展入口', testExtensionEntry);
  runTest('检查package.json', testPackageJson);
  runTest('检查命令定义', testCommands);
  runTest('检查激活事件', testActivationEvents);
  runTest('检查模块文件', testModuleFiles);
  runTest('检查资源文件', testResourceFiles);
  runTest('检查README和文档', testDocumentation);
  runTest('检查JavaScript语法', testJavaScriptSyntax);
  
  // 显示测试报告
  const success = showTestReport();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.info(`测试耗时: ${duration}秒`);
  
  process.exit(success ? 0 : 1);
}

// 运行测试
main();
