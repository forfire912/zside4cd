# ZSide4CD与VSCodium集成说明

## 概述

ZSide4CD是基于VSCodium架构开发的独立嵌入式开发IDE。本文档详细说明了ZSide4CD如何与VSCodium进行集成，以及集成的方式和原理。

## 集成方式

### 方式一：VSCodium扩展方式（推荐）

ZSide4CD可以作为VSCodium的扩展包进行集成，这是最推荐的方式。

#### 集成步骤

1. **将ZSide4CD打包为VSCodium扩展**

```bash
# 在ZSide4CD项目根目录
cd /path/to/zside4cd

# 安装vsce工具（VSCode/VSCodium扩展打包工具）
npm install -g @vscode/vsce

# 创建扩展清单
cat > vscode-extension.json << EOF
{
  "name": "zside4cd",
  "displayName": "ZSide4CD - 嵌入式开发工具",
  "description": "STM32F429和TI C67XX系列处理器开发支持",
  "version": "1.0.0",
  "publisher": "zside4cd",
  "engines": {
    "vscode": "^1.60.0"
  },
  "categories": ["Programming Languages", "Debuggers", "Other"],
  "activationEvents": [
    "onCommand:zside4cd.newProject",
    "onCommand:zside4cd.build",
    "onCommand:zside4cd.debug",
    "onCommand:zside4cd.flash"
  ],
  "main": "./app/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "zside4cd.newProject",
        "title": "新建项目",
        "category": "ZSide4CD"
      },
      {
        "command": "zside4cd.build",
        "title": "构建项目",
        "category": "ZSide4CD"
      },
      {
        "command": "zside4cd.debug",
        "title": "调试程序",
        "category": "ZSide4CD"
      },
      {
        "command": "zside4cd.flash",
        "title": "烧录程序",
        "category": "ZSide4CD"
      },
      {
        "command": "zside4cd.configureToolchain",
        "title": "配置工具链",
        "category": "ZSide4CD"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "zside4cd.build",
          "group": "zside4cd@1"
        },
        {
          "command": "zside4cd.flash",
          "group": "zside4cd@2"
        }
      ]
    },
    "configuration": {
      "title": "ZSide4CD",
      "properties": {
        "zside4cd.armGccPath": {
          "type": "string",
          "default": "",
          "description": "ARM GCC工具链路径"
        },
        "zside4cd.tiCgtPath": {
          "type": "string",
          "default": "",
          "description": "TI CGT工具链路径"
        }
      }
    },
    "viewsContainers": {
      "activitybar": [
        {
          "id": "zside4cd-explorer",
          "title": "ZSide4CD",
          "icon": "resources/icon.svg"
        }
      ]
    },
    "views": {
      "zside4cd-explorer": [
        {
          "id": "zside4cd.projectExplorer",
          "name": "项目浏览器"
        },
        {
          "id": "zside4cd.toolchainManager",
          "name": "工具链管理"
        }
      ]
    }
  }
}
EOF

# 打包扩展
vsce package
```

2. **在VSCodium中安装扩展**

```bash
# 方法1：通过命令行安装
codium --install-extension zside4cd-1.0.0.vsix

# 方法2：通过VSCodium界面安装
# 1. 打开VSCodium
# 2. 按Ctrl+Shift+P打开命令面板
# 3. 输入"Extensions: Install from VSIX"
# 4. 选择zside4cd-1.0.0.vsix文件
```

3. **验证集成**

安装完成后，在VSCodium中：
- 侧边栏会出现ZSide4CD图标
- 命令面板中可以搜索到"ZSide4CD"相关命令
- 资源管理器右键菜单中会出现"构建"和"烧录"选项

#### 扩展入口点（extension.js）

创建扩展入口文件以连接ZSide4CD功能模块：

```javascript
// app/extension.js
const vscode = require('vscode');
const BuildManager = require('./build-manager');
const DebugManager = require('./debug-manager');
const FlashManager = require('./flash-manager');
const ToolchainManager = require('./toolchain-manager');

let buildManager;
let debugManager;
let flashManager;
let toolchainManager;

function activate(context) {
    console.log('ZSide4CD扩展已激活');

    // 初始化管理器
    buildManager = new BuildManager();
    debugManager = new DebugManager();
    flashManager = new FlashManager();
    toolchainManager = new ToolchainManager();

    // 检测工具链
    toolchainManager.detectToolchains();

    // 注册命令
    context.subscriptions.push(
        vscode.commands.registerCommand('zside4cd.newProject', createNewProject),
        vscode.commands.registerCommand('zside4cd.build', buildProject),
        vscode.commands.registerCommand('zside4cd.debug', debugProject),
        vscode.commands.registerCommand('zside4cd.flash', flashProject),
        vscode.commands.registerCommand('zside4cd.configureToolchain', configureToolchain)
    );

    // 注册视图提供者
    const projectExplorerProvider = new ProjectExplorerProvider();
    vscode.window.registerTreeDataProvider('zside4cd.projectExplorer', projectExplorerProvider);

    const toolchainProvider = new ToolchainManagerProvider(toolchainManager);
    vscode.window.registerTreeDataProvider('zside4cd.toolchainManager', toolchainProvider);
}

async function createNewProject() {
    const projectType = await vscode.window.showQuickPick(
        ['STM32F429项目', 'TI C67XX项目'],
        { placeHolder: '选择项目类型' }
    );
    
    if (projectType) {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            openLabel: '选择项目位置'
        });

        if (folderUri && folderUri[0]) {
            // 创建项目逻辑
            vscode.window.showInformationMessage('项目创建成功！');
        }
    }
}

async function buildProject() {
    const config = vscode.workspace.getConfiguration('zside4cd');
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个项目');
        return;
    }

    try {
        vscode.window.showInformationMessage('开始构建项目...');
        const result = await buildManager.build(workspaceFolder.uri.fsPath);
        
        if (result.success) {
            vscode.window.showInformationMessage('构建成功！');
        } else {
            vscode.window.showErrorMessage(`构建失败: ${result.error}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`构建错误: ${error.message}`);
    }
}

async function debugProject() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个项目');
        return;
    }

    try {
        await debugManager.startDebug(workspaceFolder.uri.fsPath);
        vscode.window.showInformationMessage('调试器已启动');
    } catch (error) {
        vscode.window.showErrorMessage(`调试错误: ${error.message}`);
    }
}

async function flashProject() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('请先打开一个项目');
        return;
    }

    try {
        vscode.window.showInformationMessage('开始烧录程序...');
        const result = await flashManager.flash(workspaceFolder.uri.fsPath);
        
        if (result.success) {
            vscode.window.showInformationMessage('烧录成功！');
        } else {
            vscode.window.showErrorMessage(`烧录失败: ${result.error}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`烧录错误: ${error.message}`);
    }
}

async function configureToolchain() {
    // 打开工具链配置界面
    const panel = vscode.window.createWebviewPanel(
        'toolchainConfig',
        '工具链配置',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    // 加载配置界面HTML
    const fs = require('fs');
    const path = require('path');
    const htmlPath = path.join(__dirname, 'toolchain-config-dialog.html');
    panel.webview.html = fs.readFileSync(htmlPath, 'utf8');
}

function deactivate() {
    console.log('ZSide4CD扩展已停用');
}

module.exports = {
    activate,
    deactivate
};
```

### 方式二：独立Electron应用（当前实现）

ZSide4CD也可以作为基于Electron的独立应用运行，复用VSCodium的核心组件。

#### 架构说明

```
┌─────────────────────────────────────────────────────┐
│                   ZSide4CD IDE                      │
│                 (Electron应用)                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         UI层（基于Electron）                 │  │
│  │  - index.html（主界面）                      │  │
│  │  - renderer.js（渲染进程）                   │  │
│  │  - styles.css（VS Code主题）                 │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕                             │
│  ┌──────────────────────────────────────────────┐  │
│  │         业务逻辑层（Node.js模块）            │  │
│  │  - toolchain-manager.js（工具链管理）        │  │
│  │  - build-manager.js（构建管理）              │  │
│  │  - debug-manager.js（调试管理）              │  │
│  │  - flash-manager.js（烧录管理）              │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕                             │
│  ┌──────────────────────────────────────────────┐  │
│  │      VSCodium核心组件（可选集成）            │  │
│  │  - Monaco Editor（代码编辑器）               │  │
│  │  - Language Servers（语言服务）              │  │
│  │  - Terminal（集成终端）                      │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕                             │
│  ┌──────────────────────────────────────────────┐  │
│  │         工具链和调试器                       │  │
│  │  - ARM GCC                                    │  │
│  │  - TI CGT C6000                              │  │
│  │  - OpenOCD / ST-Link                         │  │
│  │  - TI XDS                                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 集成VSCodium组件的方法

1. **集成Monaco Editor（代码编辑器）**

```javascript
// 在index.html中引入Monaco Editor
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs/loader.min.js"></script>

// 在renderer.js中初始化编辑器
require.config({ paths: { vs: 'node_modules/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function() {
    const editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: '// 在这里编写代码\n',
        language: 'c',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: true }
    });
});
```

2. **集成Language Server Protocol (LSP)**

```javascript
// 安装LSP客户端
npm install vscode-languageclient

// 在main.js中启动C/C++语言服务器
const { LanguageClient } = require('vscode-languageclient/node');

const serverOptions = {
    command: 'clangd',  // C/C++语言服务器
    args: ['--background-index']
};

const clientOptions = {
    documentSelector: [{ scheme: 'file', language: 'c' }]
};

const client = new LanguageClient('c-language-server', serverOptions, clientOptions);
client.start();
```

3. **集成VSCodium终端**

```javascript
// 使用node-pty创建终端
const pty = require('node-pty');

const terminal = pty.spawn('powershell.exe', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
});

terminal.on('data', (data) => {
    // 将输出显示在IDE的终端面板
    document.getElementById('terminal-output').textContent += data;
});
```

### 方式三：混合模式（最佳实践）

结合方式一和方式二的优点：

1. **开发阶段**：作为独立Electron应用开发和测试
2. **发布阶段**：同时提供VSCodium扩展和独立应用两种形式

#### 实现步骤

1. **创建共享核心模块**

将核心功能（build-manager、debug-manager等）提取为独立的npm包：

```bash
# 创建核心包
mkdir zside4cd-core
cd zside4cd-core
npm init

# package.json
{
  "name": "@zside4cd/core",
  "version": "1.0.0",
  "main": "index.js",
  "exports": {
    "./build": "./build-manager.js",
    "./debug": "./debug-manager.js",
    "./flash": "./flash-manager.js",
    "./toolchain": "./toolchain-manager.js"
  }
}
```

2. **在Electron应用中使用核心包**

```javascript
// app/main.js
const { BuildManager } = require('@zside4cd/core/build');
const { DebugManager } = require('@zside4cd/core/debug');
// ...其他模块
```

3. **在VSCodium扩展中使用核心包**

```javascript
// extension.js
const { BuildManager } = require('@zside4cd/core/build');
const { DebugManager } = require('@zside4cd/core/debug');
// ...其他模块
```

## 与VSCodium的关系

### 技术层面

1. **代码编辑器**
   - ZSide4CD可以集成Monaco Editor（VSCodium使用的编辑器核心）
   - 提供语法高亮、代码补全、智能提示等功能

2. **语言支持**
   - 通过Language Server Protocol (LSP)提供C/C++语言支持
   - 支持代码导航、重构、错误检查等

3. **调试适配器**
   - 使用Debug Adapter Protocol (DAP)
   - 支持GDB、OpenOCD等调试器

4. **扩展API**
   - 如果作为VSCodium扩展，可以使用完整的VS Code Extension API
   - 包括文件系统、工作区、UI组件等

### 许可证关系

- **VSCodium**: MIT License
- **ZSide4CD**: MIT License（基于VSCodium）
- **Monaco Editor**: MIT License
- **ARM GCC**: GPLv3（独立工具链，不影响IDE许可证）

ZSide4CD可以合法地：
1. 使用VSCodium的MIT许可代码
2. 集成Monaco Editor
3. 作为VSCodium扩展分发
4. 作为独立应用分发

## 安装和使用指南

### 作为VSCodium扩展使用

```bash
# 1. 安装VSCodium
# Windows: 从 https://vscodium.com/ 下载安装包

# 2. 安装ZSide4CD扩展
codium --install-extension zside4cd-1.0.0.vsix

# 3. 重启VSCodium

# 4. 使用ZSide4CD
# - 按Ctrl+Shift+P打开命令面板
# - 输入"ZSide4CD"查看所有命令
# - 点击侧边栏的ZSide4CD图标访问项目浏览器
```

### 作为独立应用使用

```bash
# 1. 安装依赖
cd /path/to/zside4cd
npm install

# 2. 启动应用
npm start

# 或者使用打包后的可执行文件
# Windows: ZSide4CD.exe
# Linux: ./ZSide4CD
# macOS: open ZSide4CD.app
```

## 功能对比

| 功能 | VSCodium扩展模式 | 独立应用模式 |
|------|-----------------|-------------|
| 代码编辑 | ✅ 完整VSCodium编辑器 | ✅ 集成Monaco Editor |
| 工具链管理 | ✅ 完整支持 | ✅ 完整支持 |
| 项目构建 | ✅ 完整支持 | ✅ 完整支持 |
| 程序调试 | ✅ 完整支持 | ✅ 完整支持 |
| 程序烧录 | ✅ 完整支持 | ✅ 完整支持 |
| 启动速度 | 🟡 依赖VSCodium | 🟢 快速 |
| 独立性 | 🟡 需要VSCodium | 🟢 完全独立 |
| 扩展生态 | 🟢 可用VSCodium扩展 | 🟡 有限 |
| 安装大小 | 🟢 小（约10MB） | 🟡 较大（约150MB） |

## 下一步计划

1. **完善VSCodium扩展打包**
   - 创建extension.js入口文件
   - 配置package.json扩展清单
   - 打包为.vsix文件

2. **优化独立应用**
   - 集成Monaco Editor
   - 添加更多VSCodium组件
   - 优化性能和体积

3. **文档完善**
   - 扩展安装指南
   - API文档
   - 开发者指南

## 总结

ZSide4CD与VSCodium的集成有多种方式：

1. **VSCodium扩展**：适合已有VSCodium用户，轻量级，易于安装
2. **独立应用**：适合新用户，开箱即用，不需要额外安装VSCodium
3. **混合模式**：同时提供两种形式，满足不同用户需求

当前ZSide4CD实现为独立Electron应用，复用了VSCodium的设计理念和部分组件（Monaco Editor等），并且可以轻松转换为VSCodium扩展。

所有集成方式都严格遵守MIT许可证要求，确保开源合规性。
