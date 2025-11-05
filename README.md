# ZSide4CD - 嵌入式开发集成环境

> 基于 VSCodium 的中文化最小定制 IDE，专为 STM32F429 和 TI C67XX 系列处理器开发

## 项目简介

ZSide4CD 是一个专为嵌入式系统开发设计的集成开发环境（IDE），基于开源项目 VSCodium 构建。它提供了完整的中文化界面，并针对 STM32F429 和 TI C67XX 系列处理器进行了优化，支持代码编辑、编译、调试和程序固化等完整的开发流程。

## 主要特性

### 🌏 完整中文化
- 所有界面菜单和对话框均为中文
- 中文帮助文档和提示信息
- 符合中文用户使用习惯

### 🎯 专业处理器支持
- **STM32F429 系列**
  - ARM Cortex-M4 处理器
  - HAL 库支持
  - OpenOCD/ST-Link 调试
  - Flash 程序烧录
  
- **TI C67XX 系列**
  - DSP 处理器
  - TI CGT 工具链
  - CCS 调试协议
  - 程序下载支持

### ⚙️ 智能工具链管理
- 自动检测已安装的工具链
- 根据项目类型自动选择工具链
- 支持多版本工具链切换
- 持久化工具链配置

### 🛠️ 完整开发流程
- **代码编辑**: 语法高亮、智能提示、代码补全
- **项目构建**: 支持 Makefile 和 CMake
- **程序调试**: 断点、单步、变量查看、内存监控
- **程序固化**: 一键烧录到目标设备

### 🎨 可定制化
- 自定义产品名称和版权信息
- 可配置启动界面和 Logo
- 支持品牌定制（符合开源协议要求）

## 系统要求

### 操作系统
- Windows 10 (64-bit) 或更高版本
- Windows 11

### 硬件要求
- CPU: 双核 2.0GHz 或更高
- 内存: 4GB RAM（推荐 8GB）
- 硬盘: 2GB 可用空间

### 开发工具链
- **STM32 开发**: ARM GCC 工具链
- **C67XX 开发**: TI Code Generation Tools (CGT)

## 快速开始

详细的入门指南请参阅 **[快速开始指南](docs/quick-start.md)**

### 安装

1. 下载 ZSide4CD 安装包
2. 运行安装程序
3. 按照向导完成安装
4. 安装工具链（ARM GCC 或 TI CGT）

### 配置工具链

**STM32 开发**:
- ARM GCC 可直接集成（符合GPLv3协议）
- 或使用已安装的工具链，IDE会自动检测

**TI C67XX 开发**:
1. 安装 Code Composer Studio (CCS)
2. 点击 **工具** → **工具链配置**
3. 自动检测或手动配置TI CGT路径

详见 **[TI CGT配置指南](docs/ti-cgt-config-guide.md)**

### 创建第一个项目

1. 启动 ZSide4CD
2. 选择 **文件** → **新建项目**
3. 选择处理器类型（STM32F429 或 TI C67XX）
4. 选择项目模板
5. 输入项目名称和保存路径
6. 点击 **创建**

### 构建和调试

1. 在项目浏览器中打开项目
2. 点击 **构建** 菜单或按 F7 编译项目
3. 查看输出面板的构建日志
4. 连接开发板（ST-Link 或 XDS）
5. 点击 **调试** 菜单或按 F5 启动调试
6. 使用工具栏控制调试流程

### 烧录程序

1. 确保项目已成功构建
2. 连接目标设备（ST-Link/XDS）
3. 点击工具栏的 **烧录** 按钮（闪电图标）
4. 查看输出面板的烧录进度
5. 等待烧录完成

## 项目结构

```
ZSide4CD/
├── app/                    # 应用程序主目录
├── extensions/             # 处理器扩展
│   ├── stm32/             # STM32 支持
│   └── c67xx/             # C67XX 支持
├── resources/              # 资源文件
│   ├── i18n/              # 国际化（中文/英文）
│   ├── icons/             # 图标
│   ├── themes/            # 主题
│   └── branding/          # 品牌资源
├── toolchains/            # 工具链配置
├── docs/                  # 文档
│   ├── requirements.md    # 需求文档
│   ├── design.md          # 设计文档
│   ├── testing.md         # 测试文档
│   └── user-guide.md      # 用户手册
├── scripts/               # 构建脚本
├── LICENSE                # MIT 许可证
├── NOTICE                 # 第三方许可证声明
└── README.md              # 本文件
```

## 文档

### 用户文档
- **[快速开始指南](docs/quick-start.md)** - 快速上手ZSide4CD
- **[用户手册](docs/user-guide.md)** - 完整的使用说明
- **[TI CGT配置指南](docs/ti-cgt-config-guide.md)** - TI工具链配置详解
- **[工具链集成方案](docs/toolchain-integration.md)** - ARM GCC集成和许可证说明
- **[Windows兼容性](docs/windows-compatibility.md)** - Windows 10/11兼容性测试

### 开发文档
- **[需求文档](docs/requirements.md)** - 功能需求和验收标准
- **[设计文档](docs/design.md)** - 系统架构和模块设计
- **[测试文档](docs/testing.md)** - 测试策略和测试用例

## 开源协议

ZSide4CD 基于 **VSCodium** 项目开发，遵守 MIT 开源协议。

### 基于的开源项目

- **VSCodium** - MIT License
  - 官网: https://vscodium.com
  - 源码: https://github.com/VSCodium/vscodium

- **Visual Studio Code - OSS** - MIT License
  - 源码: https://github.com/microsoft/vscode

- **Electron** - MIT License
  - 官网: https://www.electronjs.org

### 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

第三方组件的许可证声明请参阅 [NOTICE](NOTICE) 文件。

### 版权声明

```
ZSide4CD - 嵌入式开发集成环境
Copyright (c) 2025 ZSide4CD Team

基于 VSCodium (MIT License)
https://vscodium.com
```

## 贡献指南

我们欢迎社区贡献！在提交贡献之前，请确保：

1. 遵守项目的代码规范
2. 添加必要的测试用例
3. 更新相关文档
4. 遵守 MIT 开源协议

## 技术支持

- **问题反馈**: 请在 GitHub Issues 中提交
- **功能建议**: 欢迎在 Issues 中讨论
- **文档**: 查阅 `docs/` 目录下的文档

## 致谢

感谢以下开源项目：

- VSCodium 项目及其社区
- Microsoft VS Code 团队
- Electron 项目
- 所有开源工具链开发者

## 主要功能

### ✅ 项目管理
- 创建STM32F429和TI C67XX项目
- 项目模板（LED闪烁、FIR滤波器示例）
- 项目浏览器和文件管理
- 项目配置持久化

### ✅ 代码编辑
- 语法高亮和代码补全
- 智能提示和错误检查
- 代码格式化
- 快捷键支持

### ✅ 编译构建
- **STM32**: ARM GCC编译
  - 生成.elf/.hex/.bin文件
  - 程序大小分析
  - 编译优化选项
- **C67XX**: TI CGT编译
  - 生成.out文件
  - Map文件生成
  - DSP优化编译

### ✅ 调试功能
- **STM32调试**:
  - OpenOCD + GDB调试
  - ST-Link支持
  - 断点和单步执行
  - GDB命令行
- **C67XX调试**:
  - TI XDS仿真器支持
  - CCS调试集成
  - DSP寄存器查看

### ✅ 程序烧录
- **STM32烧录**:
  - ST-Link Utility烧录
  - OpenOCD烧录
  - Flash擦除功能
- **C67XX烧录**:
  - UniFlash支持
  - CCS加载支持

### ✅ 工具链管理
- 自动检测ARM GCC和TI CGT
- 图形化配置界面
- 工具链版本识别
- 工具链验证
- 多版本管理
- 配置持久化

### ✅ 中文化
- 完整中文界面
- 中文菜单和提示
- 中文文档
- 中文错误信息

## 更新日志

### v1.0.0 (开发中)

**已完成功能**:
- ✅ 完整的IDE应用框架（Electron）
- ✅ 中文化界面和资源
- ✅ STM32F429 系列处理器支持
- ✅ TI C67XX 系列处理器支持
- ✅ 工具链自动检测和管理
- ✅ TI CGT图形化配置界面
- ✅ 项目构建功能（BuildManager）
- ✅ 调试功能（DebugManager）
- ✅ 烧录功能（FlashManager）
- ✅ 实时输出日志
- ✅ 项目模板（STM32和C67XX）
- ✅ 完整开发文档（需求/设计/测试）
- ✅ 用户手册和快速开始指南
- ✅ ARM GCC集成方案（GPLv3合规）
- ✅ Windows 10/11兼容性测试
- ✅ 符合开源协议的品牌定制

**待完成**:
- ⏳ Windows安装包制作
- ⏳ ARM GCC工具链集成包
- ⏳ 代码编辑器高级功能
- ⏳ 更多项目模板
- ⏳ 在线更新检查

---

**ZSide4CD** - 让嵌入式开发更简单 🚀