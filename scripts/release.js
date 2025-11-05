#!/usr/bin/env node

/**
 * ZSide4CD 完整发布脚本
 * 
 * 自动化执行构建、测试和打包流程
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 控制台输出工具函数
const log = {
  info: (msg) => console.log(`\x1b[36m[信息]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[✗]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[⚠]\x1b[0m ${msg}`),
  step: (msg) => console.log(`\n\x1b[1m\x1b[35m━━━ ${msg} ━━━\x1b[0m\n`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 询问用户确认
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

/**
 * 执行命令
 */
function exec(command, options = {}) {
  try {
    log.info(`执行: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    log.error(`命令失败: ${error.message}`);
    return false;
  }
}

/**
 * 显示欢迎信息
 */
function showWelcome() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ZSide4CD 发布工具 v1.0.0             ║');
  console.log('║   自动化构建、测试和打包流程           ║');
  console.log('╚════════════════════════════════════════╝\n');
}

/**
 * 检查版本号
 */
async function checkVersion() {
  log.step('步骤 1/7: 检查版本信息');
  
  const packageJson = require('../package.json');
  console.log(`  当前版本: ${packageJson.version}`);
  console.log(`  项目名称: ${packageJson.name}`);
  console.log(`  描述: ${packageJson.description}\n`);
  
  const answer = await askQuestion('  版本号是否正确？(y/n): ');
  if (answer !== 'y' && answer !== 'yes') {
    log.warn('请先在package.json中更新版本号');
    return false;
  }
  
  log.success('版本检查通过');
  return true;
}

/**
 * 选择发布模式
 */
async function selectMode() {
  log.step('步骤 2/7: 选择发布模式');
  
  console.log('  1. 独立应用（Electron）');
  console.log('  2. VSCodium扩展');
  console.log('  3. 两种模式都发布\n');
  
  const answer = await askQuestion('  请选择 (1/2/3): ');
  
  if (answer === '1') return 'standalone';
  if (answer === '2') return 'extension';
  if (answer === '3') return 'both';
  
  log.error('无效选择');
  return null;
}

/**
 * 构建独立应用
 */
function buildStandalone() {
  log.step('步骤 3a/7: 构建独立应用');
  
  if (!exec('node scripts/build-standalone.js')) {
    log.error('独立应用构建失败');
    return false;
  }
  
  log.success('独立应用构建完成');
  return true;
}

/**
 * 测试独立应用
 */
function testStandalone() {
  log.step('步骤 4a/7: 测试独立应用');
  
  if (!exec('node scripts/test-standalone.js')) {
    log.error('独立应用测试失败');
    return false;
  }
  
  log.success('独立应用测试通过');
  return true;
}

/**
 * 打包独立应用
 */
async function packageStandalone() {
  log.step('步骤 5a/7: 打包独立应用');
  
  log.warn('打包过程可能需要5-10分钟，请耐心等待...');
  const answer = await askQuestion('  继续打包？(y/n): ');
  
  if (answer !== 'y' && answer !== 'yes') {
    log.warn('已跳过独立应用打包');
    return false;
  }
  
  if (!exec('node scripts/package-standalone.js')) {
    log.error('独立应用打包失败');
    return false;
  }
  
  log.success('独立应用打包完成');
  return true;
}

/**
 * 构建VSCodium扩展
 */
function buildExtension() {
  log.step('步骤 3b/7: 构建VSCodium扩展');
  
  if (!exec('node scripts/build-extension.js')) {
    log.error('VSCodium扩展构建失败');
    return false;
  }
  
  log.success('VSCodium扩展构建完成');
  return true;
}

/**
 * 测试VSCodium扩展
 */
function testExtension() {
  log.step('步骤 4b/7: 测试VSCodium扩展');
  
  if (!exec('node scripts/test-extension.js')) {
    log.error('VSCodium扩展测试失败');
    return false;
  }
  
  log.success('VSCodium扩展测试通过');
  return true;
}

/**
 * 打包VSCodium扩展
 */
async function packageExtension() {
  log.step('步骤 5b/7: 打包VSCodium扩展');
  
  const answer = await askQuestion('  继续打包？(y/n): ');
  
  if (answer !== 'y' && answer !== 'yes') {
    log.warn('已跳过VSCodium扩展打包');
    return false;
  }
  
  if (!exec('node scripts/package-extension.js')) {
    log.error('VSCodium扩展打包失败');
    return false;
  }
  
  log.success('VSCodium扩展打包完成');
  return true;
}

/**
 * 显示发布结果
 */
function showResults(mode) {
  log.step('步骤 6/7: 发布结果');
  
  console.log('  ✨ 发布完成！\n');
  
  if (mode === 'standalone' || mode === 'both') {
    const releaseDir = path.join(__dirname, '..', 'release-standalone');
    if (fs.existsSync(releaseDir)) {
      console.log('  📦 独立应用:');
      const files = fs.readdirSync(releaseDir);
      files.forEach(file => {
        if (file.endsWith('.exe')) {
          const filePath = path.join(releaseDir, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`     - ${file} (${sizeMB} MB)`);
        }
      });
      console.log(`     路径: ${releaseDir}\n`);
    }
  }
  
  if (mode === 'extension' || mode === 'both') {
    const releaseDir = path.join(__dirname, '..', 'release-extension');
    if (fs.existsSync(releaseDir)) {
      console.log('  📦 VSCodium扩展:');
      const files = fs.readdirSync(releaseDir);
      files.forEach(file => {
        if (file.endsWith('.vsix')) {
          const filePath = path.join(releaseDir, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`     - ${file} (${sizeMB} MB)`);
        }
      });
      console.log(`     路径: ${releaseDir}\n`);
    }
  }
}

/**
 * 显示下一步操作
 */
async function showNextSteps(mode) {
  log.step('步骤 7/7: 下一步操作');
  
  console.log('  建议的后续操作:\n');
  
  if (mode === 'standalone' || mode === 'both') {
    console.log('  独立应用:');
    console.log('    1. 在Windows 10/11上测试安装包');
    console.log('    2. 验证所有功能正常工作');
    console.log('    3. 上传到GitHub Releases');
    console.log('    4. 更新下载链接\n');
  }
  
  if (mode === 'extension' || mode === 'both') {
    console.log('  VSCodium扩展:');
    console.log('    1. 在VSCodium中测试安装');
    console.log('    2. 验证所有命令正常工作');
    console.log('    3. 发布到Open VSX Registry');
    console.log('    4. 上传到GitHub Releases\n');
  }
  
  console.log('  通用操作:');
  console.log('    1. 创建Git标签: git tag -a v1.0.0 -m "Release v1.0.0"');
  console.log('    2. 推送标签: git push origin v1.0.0');
  console.log('    3. 在GitHub上创建Release');
  console.log('    4. 更新CHANGELOG.md');
  console.log('    5. 通知用户更新\n');
  
  const answer = await askQuestion('  是否查看发布指南？(y/n): ');
  if (answer === 'y' || answer === 'yes') {
    console.log('\n  详细发布指南: docs/release-guide.md');
  }
}

/**
 * 主流程
 */
async function main() {
  showWelcome();
  
  const startTime = Date.now();
  
  try {
    // 检查版本
    if (!await checkVersion()) {
      rl.close();
      process.exit(1);
    }
    
    // 选择模式
    const mode = await selectMode();
    if (!mode) {
      rl.close();
      process.exit(1);
    }
    
    // 执行独立应用发布
    if (mode === 'standalone' || mode === 'both') {
      if (!buildStandalone()) {
        rl.close();
        process.exit(1);
      }
      
      if (!testStandalone()) {
        rl.close();
        process.exit(1);
      }
      
      await packageStandalone();
    }
    
    // 执行VSCodium扩展发布
    if (mode === 'extension' || mode === 'both') {
      if (!buildExtension()) {
        rl.close();
        process.exit(1);
      }
      
      if (!testExtension()) {
        rl.close();
        process.exit(1);
      }
      
      await packageExtension();
    }
    
    // 显示结果
    showResults(mode);
    
    // 显示下一步
    await showNextSteps(mode);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n  ⏱️  总耗时: ${duration}秒`);
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🎉 发布流程已完成！                  ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    rl.close();
  } catch (error) {
    log.error(`发布过程出错: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// 运行主流程
main();
