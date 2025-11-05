#!/usr/bin/env node

/**
 * ZSide4CD VSCodium扩展打包脚本
 * 
 * 使用 @vscode/vsce 打包为 .vsix 文件
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
  const distDir = path.join(__dirname, '..', 'dist-extension');
  
  if (!fs.existsSync(distDir)) {
    log.error('构建目录不存在，请先运行: npm run build:extension');
    return false;
  }
  
  log.success('构建目录检查通过');
  return true;
}

/**
 * 安装打包工具
 */
function installVsce() {
  log.info('检查打包工具...');
  
  try {
    execSync('vsce --version', { stdio: 'ignore' });
    log.success('vsce已安装');
    return true;
  } catch (error) {
    log.warn('vsce未安装，正在安装...');
    
    if (!exec('npm install -g @vscode/vsce')) {
      log.error('vsce安装失败');
      return false;
    }
    
    log.success('vsce安装完成');
    return true;
  }
}

/**
 * 创建扩展图标
 */
function createExtensionIcon() {
  log.info('创建扩展图标...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const iconsDir = path.join(buildDir, 'resources', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // 如果没有图标，创建一个简单的SVG图标
  const iconPath = path.join(iconsDir, 'extension-icon.png');
  if (!fs.existsSync(iconPath)) {
    log.warn('扩展图标不存在，将使用默认图标');
    // TODO: 可以在这里创建一个默认图标
  }
  
  return true;
}

/**
 * 验证package.json
 */
function validatePackageJson() {
  log.info('验证package.json...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const packageFile = path.join(buildDir, 'package.json');
  
  if (!fs.existsSync(packageFile)) {
    log.error('package.json不存在');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    
    // 检查必需字段
    const requiredFields = ['name', 'version', 'engines', 'main', 'contributes'];
    const missingFields = requiredFields.filter(field => !packageJson[field]);
    
    if (missingFields.length > 0) {
      log.error(`package.json缺少必需字段: ${missingFields.join(', ')}`);
      return false;
    }
    
    log.success('package.json验证通过');
    return true;
  } catch (error) {
    log.error(`package.json解析失败: ${error.message}`);
    return false;
  }
}

/**
 * 打包扩展
 */
function packageExtension() {
  log.info('开始打包VSCodium扩展...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const outputDir = path.join(__dirname, '..', 'release-extension');
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 进入构建目录执行打包
  const originalDir = process.cwd();
  process.chdir(buildDir);
  
  try {
    // 使用vsce打包
    const packageJson = require(path.join(buildDir, 'package.json'));
    const outputFile = path.join(outputDir, `zside4cd-${packageJson.version}.vsix`);
    
    if (!exec(`vsce package --out "${outputFile}"`)) {
      log.error('扩展打包失败');
      process.chdir(originalDir);
      return false;
    }
    
    log.success('扩展打包完成');
    process.chdir(originalDir);
    return true;
  } catch (error) {
    log.error(`打包过程出错: ${error.message}`);
    process.chdir(originalDir);
    return false;
  }
}

/**
 * 显示打包结果
 */
function showResults() {
  const releaseDir = path.join(__dirname, '..', 'release-extension');
  
  if (!fs.existsSync(releaseDir)) {
    log.warn('未找到打包输出目录');
    return;
  }
  
  log.info('\n打包结果:');
  log.info('========================================');
  
  const files = fs.readdirSync(releaseDir);
  
  files.forEach(file => {
    if (file.endsWith('.vsix')) {
      const filePath = path.join(releaseDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`  📦 ${file}`);
      console.log(`     大小: ${sizeMB} MB`);
      console.log(`     路径: ${filePath}`);
    }
  });
  
  log.info('========================================');
  log.info('\n安装方法:');
  log.info('  1. 打开VSCodium');
  log.info('  2. 按 Ctrl+Shift+P 打开命令面板');
  log.info('  3. 输入 "Extensions: Install from VSIX"');
  log.info('  4. 选择上面的.vsix文件');
  log.info('  5. 重启VSCodium');
}

/**
 * 创建安装说明
 */
function createInstallGuide() {
  log.info('创建安装说明...');
  
  const releaseDir = path.join(__dirname, '..', 'release-extension');
  const guideFile = path.join(releaseDir, 'INSTALL.md');
  
  const guideContent = `# ZSide4CD VSCodium扩展 - 安装指南

## 安装步骤

### 方法一：通过VSCodium界面安装

1. 打开VSCodium
2. 按 \`Ctrl+Shift+P\` (Mac: \`Cmd+Shift+P\`) 打开命令面板
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的 \`.vsix\` 文件
5. 等待安装完成
6. 重启VSCodium

### 方法二：通过命令行安装

\`\`\`bash
# 进入.vsix文件所在目录
cd release-extension

# 安装扩展
codium --install-extension zside4cd-1.0.0.vsix
\`\`\`

## 验证安装

1. 打开VSCodium
2. 按 \`Ctrl+Shift+P\` 打开命令面板
3. 输入 "ZSide4CD"
4. 应该能看到所有ZSide4CD命令

## 开始使用

### 检测工具链

1. 打开命令面板 (\`Ctrl+Shift+P\`)
2. 输入 "ZSide4CD: 检测工具链"
3. 扩展会自动搜索系统中的ARM GCC和TI CGT工具链

### 创建项目

1. 打开命令面板
2. 选择 "ZSide4CD: 新建STM32项目" 或 "ZSide4CD: 新建C67XX项目"
3. 输入项目名称
4. 开始开发！

### 构建项目

1. 打开项目文件夹
2. 按 \`Ctrl+Shift+B\` 或在命令面板选择 "ZSide4CD: 构建项目"
3. 查看终端输出的构建结果

### 调试项目

1. 按 \`F5\` 或在命令面板选择 "ZSide4CD: 调试项目"
2. 扩展会自动启动调试会话

### 烧录程序

1. 连接开发板
2. 在命令面板选择 "ZSide4CD: 烧录程序"
3. 等待烧录完成

## 配置工具链

如果自动检测失败，可以手动配置：

1. 打开VSCodium设置 (\`Ctrl+,\`)
2. 搜索 "zside4cd"
3. 设置工具链路径：
   - ARM GCC Path: ARM GCC工具链安装路径
   - TI CGT Path: TI CGT C6000工具链安装路径

或者使用配置命令：

1. 打开命令面板
2. 选择 "ZSide4CD: 配置工具链"
3. 在界面中设置工具链路径

## 卸载

如果需要卸载扩展：

1. 打开VSCodium
2. 点击左侧扩展图标
3. 找到"ZSide4CD"扩展
4. 点击"卸载"按钮

## 问题反馈

如遇到问题，请访问：
https://github.com/forfire912/zside4cd/issues

## 许可证

MIT License - 详见LICENSE文件
`;
  
  fs.writeFileSync(guideFile, guideContent);
  log.success('安装说明已创建');
  return true;
}

/**
 * 主打包流程
 */
function main() {
  log.info('开始打包 ZSide4CD VSCodium扩展...');
  log.info('========================================\n');
  
  const startTime = Date.now();
  
  // 检查构建目录
  if (!checkBuildDir()) {
    process.exit(1);
  }
  
  // 安装打包工具
  if (!installVsce()) {
    process.exit(1);
  }
  
  // 创建扩展图标
  if (!createExtensionIcon()) {
    log.warn('图标创建失败，但不影响打包');
  }
  
  // 验证package.json
  if (!validatePackageJson()) {
    process.exit(1);
  }
  
  // 打包扩展
  if (!packageExtension()) {
    process.exit(1);
  }
  
  // 创建安装说明
  if (!createInstallGuide()) {
    log.warn('安装说明创建失败');
  }
  
  // 显示结果
  showResults();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.info('========================================');
  log.success(`\n✨ 打包完成！耗时: ${duration}秒`);
}

// 运行打包
main();
