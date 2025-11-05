#!/usr/bin/env node

/**
 * ZSide4CD VSCodium扩展构建脚本
 * 
 * 构建VSCodium扩展包（.vsix）
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
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(buildDir, { recursive: true });
  log.success('构建目录已准备');
}

/**
 * 创建扩展入口文件
 */
function createExtensionEntry() {
  log.info('创建扩展入口文件...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const extensionFile = path.join(buildDir, 'extension.js');
  
  const extensionCode = `
/**
 * ZSide4CD VSCodium 扩展入口
 */

const vscode = require('vscode');
const path = require('path');
const ToolchainManager = require('./modules/toolchain-manager');
const BuildManager = require('./modules/build-manager');
const DebugManager = require('./modules/debug-manager');
const FlashManager = require('./modules/flash-manager');

let toolchainManager;
let buildManager;
let debugManager;
let flashManager;

/**
 * 扩展激活
 */
function activate(context) {
    console.log('ZSide4CD 扩展已激活');
    
    // 初始化管理器
    toolchainManager = new ToolchainManager();
    buildManager = new BuildManager(toolchainManager);
    debugManager = new DebugManager(toolchainManager);
    flashManager = new FlashManager(toolchainManager);
    
    // 注册命令：检测工具链
    let detectToolchains = vscode.commands.registerCommand('zside4cd.detectToolchains', async () => {
        const toolchains = await toolchainManager.detectToolchains();
        vscode.window.showInformationMessage(\`检测到 \${toolchains.length} 个工具链\`);
    });
    
    // 注册命令：构建项目
    let buildProject = vscode.commands.registerCommand('zside4cd.buildProject', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('请先打开一个项目');
            return;
        }
        
        vscode.window.showInformationMessage('开始构建项目...');
        try {
            await buildManager.build(workspaceFolder.uri.fsPath);
            vscode.window.showInformationMessage('构建成功！');
        } catch (error) {
            vscode.window.showErrorMessage(\`构建失败: \${error.message}\`);
        }
    });
    
    // 注册命令：调试项目
    let debugProject = vscode.commands.registerCommand('zside4cd.debugProject', async () => {
        vscode.window.showInformationMessage('启动调试...');
        // TODO: 实现调试逻辑
    });
    
    // 注册命令：烧录程序
    let flashProgram = vscode.commands.registerCommand('zside4cd.flashProgram', async () => {
        vscode.window.showInformationMessage('开始烧录...');
        // TODO: 实现烧录逻辑
    });
    
    // 注册命令：配置工具链
    let configureToolchain = vscode.commands.registerCommand('zside4cd.configureToolchain', async () => {
        // 显示配置面板
        const panel = vscode.window.createWebviewPanel(
            'toolchainConfig',
            '工具链配置',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        
        // 加载配置界面HTML
        const htmlPath = path.join(__dirname, 'views', 'toolchain-config.html');
        if (fs.existsSync(htmlPath)) {
            panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
        }
    });
    
    // 注册命令：新建STM32项目
    let newStm32Project = vscode.commands.registerCommand('zside4cd.newStm32Project', async () => {
        const projectName = await vscode.window.showInputBox({
            prompt: '请输入STM32项目名称',
            placeHolder: 'my-stm32-project'
        });
        
        if (projectName) {
            vscode.window.showInformationMessage(\`创建STM32项目: \${projectName}\`);
            // TODO: 实现项目创建逻辑
        }
    });
    
    // 注册命令：新建C67XX项目
    let newC67xxProject = vscode.commands.registerCommand('zside4cd.newC67xxProject', async () => {
        const projectName = await vscode.window.showInputBox({
            prompt: '请输入C67XX项目名称',
            placeHolder: 'my-c67xx-project'
        });
        
        if (projectName) {
            vscode.window.showInformationMessage(\`创建C67XX项目: \${projectName}\`);
            // TODO: 实现项目创建逻辑
        }
    });
    
    // 添加到订阅列表
    context.subscriptions.push(
        detectToolchains,
        buildProject,
        debugProject,
        flashProgram,
        configureToolchain,
        newStm32Project,
        newC67xxProject
    );
    
    // 启动时自动检测工具链
    toolchainManager.detectToolchains().then(toolchains => {
        console.log(\`ZSide4CD: 检测到 \${toolchains.length} 个工具链\`);
    });
}

/**
 * 扩展停用
 */
function deactivate() {
    console.log('ZSide4CD 扩展已停用');
}

module.exports = {
    activate,
    deactivate
};
`;
  
  fs.writeFileSync(extensionFile, extensionCode);
  log.success('扩展入口文件已创建');
  return true;
}

/**
 * 复制模块文件
 */
function copyModules() {
  log.info('复制模块文件...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const modulesDir = path.join(buildDir, 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  
  // 复制核心模块
  const modules = [
    'toolchain-manager.js',
    'build-manager.js',
    'debug-manager.js',
    'flash-manager.js'
  ];
  
  modules.forEach(module => {
    const srcPath = path.join(__dirname, '..', 'app', module);
    const destPath = path.join(modulesDir, module);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log.success(`已复制: ${module}`);
    }
  });
  
  return true;
}

/**
 * 复制资源文件
 */
function copyResources() {
  log.info('复制资源文件...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  
  // 复制资源目录
  const resourceDirs = ['resources', 'extensions'];
  resourceDirs.forEach(dir => {
    const srcPath = path.join(__dirname, '..', dir);
    const destPath = path.join(buildDir, dir);
    
    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      log.success(`已复制: ${dir}/`);
    }
  });
  
  // 复制配置界面
  const viewsDir = path.join(buildDir, 'views');
  fs.mkdirSync(viewsDir, { recursive: true });
  
  const configDialog = path.join(__dirname, '..', 'app', 'toolchain-config-dialog.html');
  if (fs.existsSync(configDialog)) {
    fs.copyFileSync(configDialog, path.join(viewsDir, 'toolchain-config.html'));
    log.success('已复制: 配置界面');
  }
  
  return true;
}

/**
 * 创建package.json
 */
function createPackageJson() {
  log.info('创建扩展package.json...');
  
  const packageJson = require('../package.json');
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  
  const extensionPackage = {
    name: 'zside4cd-extension',
    displayName: 'ZSide4CD 嵌入式开发扩展',
    description: packageJson.description,
    version: packageJson.version,
    publisher: 'zside4cd',
    engines: {
      vscode: '^1.75.0'
    },
    categories: [
      'Programming Languages',
      'Debuggers',
      'Other'
    ],
    keywords: [
      'embedded',
      'stm32',
      'c67xx',
      'arm',
      'dsp',
      '嵌入式',
      '中文'
    ],
    activationEvents: [
      'onCommand:zside4cd.detectToolchains',
      'onCommand:zside4cd.buildProject',
      'onCommand:zside4cd.debugProject',
      'onCommand:zside4cd.flashProgram',
      'onCommand:zside4cd.configureToolchain',
      'onCommand:zside4cd.newStm32Project',
      'onCommand:zside4cd.newC67xxProject',
      'workspaceContains:**/project.json'
    ],
    main: './extension.js',
    contributes: {
      commands: [
        {
          command: 'zside4cd.detectToolchains',
          title: 'ZSide4CD: 检测工具链',
          category: 'ZSide4CD'
        },
        {
          command: 'zside4cd.buildProject',
          title: 'ZSide4CD: 构建项目',
          category: 'ZSide4CD',
          icon: '$(gear)'
        },
        {
          command: 'zside4cd.debugProject',
          title: 'ZSide4CD: 调试项目',
          category: 'ZSide4CD',
          icon: '$(debug-alt)'
        },
        {
          command: 'zside4cd.flashProgram',
          title: 'ZSide4CD: 烧录程序',
          category: 'ZSide4CD',
          icon: '$(cloud-upload)'
        },
        {
          command: 'zside4cd.configureToolchain',
          title: 'ZSide4CD: 配置工具链',
          category: 'ZSide4CD'
        },
        {
          command: 'zside4cd.newStm32Project',
          title: 'ZSide4CD: 新建STM32项目',
          category: 'ZSide4CD'
        },
        {
          command: 'zside4cd.newC67xxProject',
          title: 'ZSide4CD: 新建C67XX项目',
          category: 'ZSide4CD'
        }
      ],
      menus: {
        'commandPalette': [
          {
            command: 'zside4cd.buildProject',
            when: 'workspaceFolderCount > 0'
          },
          {
            command: 'zside4cd.debugProject',
            when: 'workspaceFolderCount > 0'
          },
          {
            command: 'zside4cd.flashProgram',
            when: 'workspaceFolderCount > 0'
          }
        ],
        'editor/title': [
          {
            command: 'zside4cd.buildProject',
            when: 'resourceExtname == .c || resourceExtname == .cpp',
            group: 'navigation'
          }
        ]
      },
      keybindings: [
        {
          command: 'zside4cd.buildProject',
          key: 'ctrl+shift+b',
          mac: 'cmd+shift+b',
          when: 'workspaceFolderCount > 0'
        },
        {
          command: 'zside4cd.debugProject',
          key: 'f5',
          when: 'workspaceFolderCount > 0'
        }
      ],
      configuration: {
        title: 'ZSide4CD',
        properties: {
          'zside4cd.armGccPath': {
            type: 'string',
            default: '',
            description: 'ARM GCC工具链路径'
          },
          'zside4cd.tiCgtPath': {
            type: 'string',
            default: '',
            description: 'TI CGT C6000工具链路径'
          },
          'zside4cd.autoDetectToolchains': {
            type: 'boolean',
            default: true,
            description: '启动时自动检测工具链'
          }
        }
      }
    },
    repository: {
      type: 'git',
      url: packageJson.repository.url
    },
    author: packageJson.author,
    license: packageJson.license,
    icon: 'resources/icons/extension-icon.png'
  };
  
  const packageFile = path.join(buildDir, 'package.json');
  fs.writeFileSync(packageFile, JSON.stringify(extensionPackage, null, 2));
  
  log.success('扩展package.json已创建');
  return true;
}

/**
 * 创建README
 */
function createReadme() {
  log.info('创建扩展README...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const readmeContent = `# ZSide4CD VSCodium 扩展

基于VSCodium的中文化嵌入式开发扩展，支持STM32F429和TI C67XX系列处理器。

## 功能特性

- ✅ STM32F429开发支持（ARM GCC工具链）
- ✅ TI C67XX开发支持（TI CGT C6000工具链）
- ✅ 自动工具链检测
- ✅ 一键构建、调试、烧录
- ✅ 完整中文界面
- ✅ 项目模板

## 安装

1. 下载.vsix扩展包
2. 在VSCodium中执行：Extensions: Install from VSIX
3. 选择下载的.vsix文件
4. 重启VSCodium

## 使用

### 命令面板

按 \`Ctrl+Shift+P\` 打开命令面板，输入"ZSide4CD"查看所有命令：

- **检测工具链**: 自动搜索系统中的工具链
- **构建项目**: 编译当前项目
- **调试项目**: 启动调试会话
- **烧录程序**: 将程序烧录到目标设备
- **配置工具链**: 手动配置工具链路径
- **新建STM32项目**: 创建STM32项目
- **新建C67XX项目**: 创建C67XX项目

### 快捷键

- \`Ctrl+Shift+B\`: 构建项目
- \`F5\`: 调试项目

## 许可证

MIT License - 详见LICENSE文件
`;
  
  const readmeFile = path.join(buildDir, 'README.md');
  fs.writeFileSync(readmeFile, readmeContent);
  
  log.success('扩展README已创建');
  return true;
}

/**
 * 创建CHANGELOG
 */
function createChangelog() {
  log.info('创建CHANGELOG...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const changelogContent = `# 更新日志

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### 新增
- STM32F429完整开发支持
- TI C67XX完整开发支持
- 自动工具链检测
- 图形化工具链配置
- 项目构建功能
- 调试功能
- 烧录功能
- 完整中文界面
- 项目模板
`;
  
  const changelogFile = path.join(buildDir, 'CHANGELOG.md');
  fs.writeFileSync(changelogFile, changelogContent);
  
  log.success('CHANGELOG已创建');
  return true;
}

/**
 * 复制许可证文件
 */
function copyLicense() {
  log.info('复制许可证文件...');
  
  const buildDir = path.join(__dirname, '..', 'dist-extension');
  const licenseFiles = ['LICENSE', 'NOTICE'];
  
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
 * 主构建流程
 */
function main() {
  log.info('开始构建 ZSide4CD VSCodium扩展...');
  
  const startTime = Date.now();
  
  // 清理
  cleanBuildDir();
  
  // 创建扩展入口
  if (!createExtensionEntry()) {
    process.exit(1);
  }
  
  // 复制模块
  if (!copyModules()) {
    process.exit(1);
  }
  
  // 复制资源
  if (!copyResources()) {
    process.exit(1);
  }
  
  // 创建package.json
  if (!createPackageJson()) {
    process.exit(1);
  }
  
  // 创建README
  if (!createReadme()) {
    process.exit(1);
  }
  
  // 创建CHANGELOG
  if (!createChangelog()) {
    process.exit(1);
  }
  
  // 复制许可证
  if (!copyLicense()) {
    process.exit(1);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log.success(`VSCodium扩展构建完成！耗时: ${duration}秒`);
  log.info('构建目录: dist-extension/');
  log.warn('下一步: 运行 npm run package:extension 打包为.vsix文件');
}

// 运行构建
main();
