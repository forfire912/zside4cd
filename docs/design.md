# ZSide4CD 设计文档 (Design Document)

## 1. 系统架构 (System Architecture)

### 1.1 总体架构 (Overall Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     ZSide4CD IDE                            │
│              (基于 VSCodium - MIT License)                  │
├─────────────────────────────────────────────────────────────┤
│                   用户界面层 (UI Layer)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  编辑器界面   │  │  调试界面     │  │  配置界面     │     │
│  │  Editor UI   │  │  Debug UI    │  │  Config UI   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                   核心层 (Core Layer)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  项目管理     │  │  工具链管理   │  │  构建系统     │     │
│  │  Project Mgr │  │ Toolchain Mgr│  │ Build System │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  调试管理     │  │  烧录管理     │  │  配置管理     │     │
│  │  Debug Mgr   │  │  Flash Mgr   │  │  Config Mgr  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                 扩展层 (Extension Layer)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  STM32扩展    │  │  C67XX扩展    │  │  通用扩展     │     │
│  │ STM32 Ext    │  │ C67XX Ext    │  │ Common Ext   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                VSCodium 基础平台 (Base Platform)            │
│                      MIT License                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  编辑器核心   │  │  插件系统     │  │  语言服务     │     │
│  │ Editor Core  │  │ Plugin Sys   │  │ Lang Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               外部工具 (External Tools)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  ARM GCC     │  │  TI CGT      │  │  OpenOCD     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  ST-Link     │  │  TI Debugger │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈 (Technology Stack)

- **基础平台**: VSCodium (基于 VS Code OSS, MIT License)
- **运行环境**: Electron
- **开发语言**: TypeScript, JavaScript
- **扩展API**: VS Code Extension API
- **构建工具**: Node.js, npm/yarn
- **打包工具**: electron-builder
- **目标平台**: Windows 10/11 (64-bit)

## 2. 模块设计 (Module Design)

### 2.1 项目管理模块 (Project Management Module)

#### 2.1.1 功能描述
- 创建、打开、保存项目
- 项目模板管理
- 项目配置管理
- 文件结构管理

#### 2.1.2 主要类设计

```typescript
class ProjectManager {
  // 创建新项目
  createProject(type: ProjectType, name: string, path: string): Project;
  
  // 打开项目
  openProject(path: string): Project;
  
  // 保存项目配置
  saveProject(project: Project): void;
  
  // 获取项目模板
  getTemplates(type: ProcessorType): Template[];
}

class Project {
  name: string;
  type: ProjectType;
  processorType: ProcessorType;
  toolchainConfig: ToolchainConfig;
  buildConfig: BuildConfig;
}

enum ProcessorType {
  STM32F429 = "stm32f429",
  TI_C67XX = "ti_c67xx"
}

enum ProjectType {
  EXECUTABLE = "executable",
  LIBRARY = "library"
}
```

### 2.2 工具链管理模块 (Toolchain Management Module)

#### 2.2.1 功能描述
- 检测已安装的工具链
- 配置工具链路径
- 选择和切换工具链
- 验证工具链有效性

#### 2.2.2 主要类设计

```typescript
class ToolchainManager {
  // 检测工具链
  detectToolchains(): Toolchain[];
  
  // 添加工具链
  addToolchain(config: ToolchainConfig): Toolchain;
  
  // 选择工具链
  selectToolchain(project: Project, toolchain: Toolchain): void;
  
  // 验证工具链
  validateToolchain(toolchain: Toolchain): boolean;
}

class Toolchain {
  id: string;
  name: string;
  type: ToolchainType;
  path: string;
  version: string;
  compiler: string;
  linker: string;
  debugger: string;
}

enum ToolchainType {
  ARM_GCC = "arm-gcc",
  TI_CGT = "ti-cgt"
}

class ToolchainConfig {
  type: ToolchainType;
  compilerFlags: string[];
  linkerFlags: string[];
  defines: Map<string, string>;
  includePaths: string[];
  libraryPaths: string[];
}
```

### 2.3 构建系统模块 (Build System Module)

#### 2.3.1 功能描述
- 解析构建配置
- 执行编译任务
- 管理依赖关系
- 显示构建结果

#### 2.3.2 主要类设计

```typescript
class BuildSystem {
  // 构建项目
  build(project: Project, config: BuildConfig): BuildResult;
  
  // 清理构建
  clean(project: Project): void;
  
  // 重新构建
  rebuild(project: Project, config: BuildConfig): BuildResult;
}

class BuildConfig {
  target: string;
  optimization: OptimizationLevel;
  defines: Map<string, string>;
  outputPath: string;
}

enum OptimizationLevel {
  O0 = "O0",
  O1 = "O1",
  O2 = "O2",
  O3 = "O3",
  Os = "Os"
}

class BuildResult {
  success: boolean;
  errors: CompileError[];
  warnings: CompileWarning[];
  outputFile: string;
  duration: number;
}
```

### 2.4 调试管理模块 (Debug Management Module)

#### 2.4.1 功能描述
- 启动调试会话
- 设置和管理断点
- 执行调试命令
- 查看变量和内存

#### 2.4.2 主要类设计

```typescript
class DebugManager {
  // 启动调试
  startDebug(project: Project, config: DebugConfig): DebugSession;
  
  // 停止调试
  stopDebug(session: DebugSession): void;
  
  // 设置断点
  setBreakpoint(file: string, line: number): Breakpoint;
  
  // 单步执行
  stepOver(): void;
  stepInto(): void;
  stepOut(): void;
  
  // 继续执行
  continue(): void;
}

class DebugConfig {
  executable: string;
  debugger: DebuggerType;
  serverType: ServerType;
  interface: InterfaceType;
  device: string;
  svdFile?: string;
}

enum DebuggerType {
  GDB = "gdb",
  OPENOCD = "openocd",
  TI_XDS = "ti-xds"
}

enum ServerType {
  OPENOCD = "openocd",
  STLINK = "stlink",
  JLINK = "jlink",
  TI_CCS = "ti-ccs"
}

enum InterfaceType {
  SWD = "swd",
  JTAG = "jtag"
}

class DebugSession {
  id: string;
  project: Project;
  config: DebugConfig;
  state: DebugState;
  breakpoints: Breakpoint[];
}

enum DebugState {
  STOPPED = "stopped",
  RUNNING = "running",
  PAUSED = "paused"
}
```

### 2.5 烧录管理模块 (Flash Management Module)

#### 2.5.1 功能描述
- 连接目标设备
- 烧录程序到Flash
- 验证烧录结果
- 擦除Flash

#### 2.5.2 主要类设计

```typescript
class FlashManager {
  // 烧录程序
  flash(project: Project, config: FlashConfig): FlashResult;
  
  // 擦除Flash
  erase(config: FlashConfig): void;
  
  // 验证Flash
  verify(file: string, config: FlashConfig): boolean;
}

class FlashConfig {
  programmer: ProgrammerType;
  interface: InterfaceType;
  device: string;
  flashAddress: number;
  verifyAfterFlash: boolean;
}

enum ProgrammerType {
  OPENOCD = "openocd",
  STLINK = "stlink",
  JLINK = "jlink",
  TI_UNIFLASH = "ti-uniflash"
}

class FlashResult {
  success: boolean;
  bytesWritten: number;
  duration: number;
  errors: string[];
}
```

### 2.6 配置管理模块 (Configuration Management Module)

#### 2.6.1 功能描述
- 全局配置管理
- 项目配置管理
- 工作区配置管理
- 配置持久化

#### 2.6.2 主要类设计

```typescript
class ConfigManager {
  // 获取配置
  getConfig<T>(key: string, scope: ConfigScope): T;
  
  // 设置配置
  setConfig<T>(key: string, value: T, scope: ConfigScope): void;
  
  // 重置配置
  resetConfig(key: string, scope: ConfigScope): void;
}

enum ConfigScope {
  GLOBAL = "global",
  WORKSPACE = "workspace",
  PROJECT = "project"
}

interface IDEConfig {
  language: string;
  theme: string;
  branding: BrandingConfig;
  toolchains: ToolchainConfig[];
  defaultProcessor: ProcessorType;
}

interface BrandingConfig {
  productName: string;
  companyName: string;
  copyright: string;
  basedOn: string;  // "Based on VSCodium (MIT License)"
  logo: string;
  icon: string;
  aboutText: string;
}
```

## 3. 数据设计 (Data Design)

### 3.1 项目配置文件 (Project Configuration)

**文件**: `.zside/project.json`

```json
{
  "name": "MyProject",
  "version": "1.0.0",
  "processorType": "stm32f429",
  "projectType": "executable",
  "toolchain": {
    "type": "arm-gcc",
    "path": "C:\\Program Files\\ARM\\bin",
    "version": "10.3.1"
  },
  "build": {
    "target": "firmware.elf",
    "optimization": "O2",
    "defines": {
      "STM32F429xx": "",
      "USE_HAL_DRIVER": ""
    },
    "includePaths": [
      "Core/Inc",
      "Drivers/STM32F4xx_HAL_Driver/Inc"
    ],
    "sourcePaths": [
      "Core/Src",
      "Drivers/STM32F4xx_HAL_Driver/Src"
    ],
    "linkerScript": "STM32F429ZITx_FLASH.ld"
  },
  "debug": {
    "debugger": "openocd",
    "serverType": "stlink",
    "interface": "swd",
    "device": "STM32F429ZI",
    "svdFile": "STM32F429.svd"
  },
  "flash": {
    "programmer": "stlink",
    "interface": "swd",
    "device": "STM32F429ZI",
    "flashAddress": "0x08000000",
    "verifyAfterFlash": true
  }
}
```

### 3.2 工具链配置文件 (Toolchain Configuration)

**文件**: `%APPDATA%\ZSide4CD\toolchains.json`

```json
{
  "toolchains": [
    {
      "id": "arm-gcc-10.3",
      "name": "ARM GCC 10.3.1",
      "type": "arm-gcc",
      "path": "C:\\Program Files\\ARM\\bin",
      "version": "10.3.1",
      "compiler": "arm-none-eabi-gcc.exe",
      "linker": "arm-none-eabi-ld.exe",
      "debugger": "arm-none-eabi-gdb.exe"
    },
    {
      "id": "ti-cgt-8.3",
      "name": "TI CGT 8.3.0",
      "type": "ti-cgt",
      "path": "C:\\ti\\ccs\\tools\\compiler\\ti-cgt-c6000_8.3.0",
      "version": "8.3.0",
      "compiler": "cl6x.exe",
      "linker": "lnk6x.exe",
      "debugger": "cg_xml.exe"
    }
  ]
}
```

### 3.3 IDE配置文件 (IDE Configuration)

**文件**: `%APPDATA%\ZSide4CD\settings.json`

```json
{
  "language": "zh-CN",
  "theme": "dark",
  "branding": {
    "productName": "ZSide4CD",
    "companyName": "Your Company",
    "copyright": "Copyright © 2025 Your Company. All rights reserved.",
    "basedOn": "Based on VSCodium (MIT License) - https://vscodium.com",
    "logo": "assets/logo.png",
    "icon": "assets/icon.ico",
    "aboutText": "ZSide4CD - 嵌入式开发集成环境\n\nBased on VSCodium\nLicense: MIT\nhttps://vscodium.com"
  },
  "defaultProcessor": "stm32f429",
  "autoDetectToolchains": true,
  "showWelcomePage": true
}
```

## 4. 部署设计 (Deployment Design)

### 4.1 目录结构 (Directory Structure)

```
ZSide4CD/
├── app/                    # 应用程序主目录
│   ├── main.js            # Electron主进程
│   ├── renderer.js        # 渲染进程
│   └── preload.js         # 预加载脚本
├── extensions/            # 扩展目录
│   ├── stm32/            # STM32扩展
│   │   ├── package.json
│   │   ├── extension.js
│   │   └── templates/
│   └── c67xx/            # C67XX扩展
│       ├── package.json
│       ├── extension.js
│       └── templates/
├── resources/             # 资源文件
│   ├── i18n/             # 国际化文件
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── icons/            # 图标
│   ├── themes/           # 主题
│   └── branding/         # 品牌资源
├── toolchains/           # 工具链配置
│   ├── arm-gcc/
│   └── ti-cgt/
├── docs/                 # 文档
│   ├── requirements.md
│   ├── design.md
│   ├── testing.md
│   ├── user-guide.md
│   └── LICENSE.md
├── scripts/              # 构建脚本
│   ├── build.js
│   ├── package.js
│   └── install.js
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── LICENSE               # MIT License (VSCodium)
├── NOTICE                # 第三方组件许可证声明
└── README.md            # 项目说明
```

### 4.2 Windows 安装包结构 (Windows Installer)

```
ZSide4CD-Setup-1.0.0.exe
├── ZSide4CD.exe
├── resources/
│   ├── app.asar           # 打包的应用程序
│   ├── electron.asar      # Electron资源
│   ├── i18n/
│   ├── icons/
│   └── branding/
├── extensions/
├── LICENSE.txt            # MIT License
├── NOTICE.txt             # 第三方许可证
└── uninstall.exe
```

**安装路径**: `C:\Program Files\ZSide4CD`
**用户数据**: `%APPDATA%\ZSide4CD`

## 5. 开源合规设计 (Open Source Compliance Design)

### 5.1 许可证管理 (License Management)

#### 5.1.1 主要许可证文件

**LICENSE** (根目录)
```
MIT License

Copyright (c) 2025 ZSide4CD Team
Based on VSCodium (https://vscodium.com)

This software is based on VSCodium, which is licensed under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**NOTICE** (根目录)
```
ZSide4CD - 嵌入式开发集成环境
Copyright (c) 2025 ZSide4CD Team

This product is based on the following open source software:

1. VSCodium
   - License: MIT License
   - Copyright: VSCodium Project
   - Website: https://vscodium.com
   - Source: https://github.com/VSCodium/vscodium

2. Visual Studio Code - Open Source ("Code - OSS")
   - License: MIT License
   - Copyright: Microsoft Corporation
   - Website: https://github.com/microsoft/vscode

3. Electron
   - License: MIT License
   - Copyright: Electron contributors
   - Website: https://www.electronjs.org

4. Node.js
   - License: MIT License
   - Copyright: Node.js contributors
   - Website: https://nodejs.org

[Additional third-party components listed here]

Full license texts for all components can be found in the 'licenses' directory.
```

### 5.2 版权声明 (Copyright Notice)

#### 5.2.1 关于对话框 (About Dialog)

```
ZSide4CD v1.0.0
嵌入式开发集成环境

Copyright © 2025 Your Company
All rights reserved.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on VSCodium
License: MIT License
https://vscodium.com

VSCodium is a community-driven, freely-licensed binary distribution 
of Microsoft's editor VS Code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Electron: v25.0.0
Node.js: v16.0.0
Chromium: v114.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[License Information] [Third-Party Notices]
```

#### 5.2.2 启动画面 (Splash Screen)

```
┌─────────────────────────────────────┐
│                                     │
│          [Your Logo Here]           │
│                                     │
│           ZSide4CD v1.0.0           │
│       嵌入式开发集成环境             │
│                                     │
│    Based on VSCodium (MIT License)  │
│                                     │
│         © 2025 Your Company         │
│                                     │
└─────────────────────────────────────┘
```

## 6. 安全设计 (Security Design)

### 6.1 代码签名 (Code Signing)
- Windows: Authenticode签名
- 使用有效的代码签名证书

### 6.2 权限控制 (Permission Control)
- 最小权限原则
- 工具链执行权限验证
- 配置文件访问控制

### 6.3 更新机制 (Update Mechanism)
- HTTPS传输
- 更新包签名验证
- 回滚机制

## 7. 性能优化 (Performance Optimization)

### 7.1 启动优化
- 延迟加载扩展
- 缓存配置文件
- 异步初始化

### 7.2 构建优化
- 增量编译
- 并行编译
- 缓存中间文件

### 7.3 内存优化
- 及时释放资源
- 限制日志大小
- 优化数据结构

## 8. 国际化设计 (Internationalization)

### 8.1 语言支持
- 中文（简体）- 主要语言
- 英文 - 备用语言

### 8.2 本地化内容
- 界面文本
- 错误消息
- 帮助文档
- 示例代码注释
