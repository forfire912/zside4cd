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

### 安装

1. 下载 ZSide4CD 安装包
2. 运行安装程序
3. 按照向导完成安装

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
3. 连接开发板
4. 点击 **调试** 菜单或按 F5 启动调试
5. 使用工具栏控制调试流程

### 烧录程序

1. 确保项目已成功构建
2. 连接目标设备
3. 选择 **工具** → **烧录程序**
4. 等待烧录完成

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

## 开发文档

详细的开发文档请参阅 `docs/` 目录：

- [需求文档](docs/requirements.md) - 功能需求和验收标准
- [设计文档](docs/design.md) - 系统架构和模块设计
- [测试文档](docs/testing.md) - 测试策略和测试用例

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

## 更新日志

### v1.0.0 (2025-01-01)

- ✨ 首次发布
- ✨ 支持 STM32F429 系列处理器
- ✨ 支持 TI C67XX 系列处理器
- ✨ 完整中文化界面
- ✨ 工具链自动检测和管理
- ✨ 代码编辑、编译、调试、烧录完整流程
- ✨ 可定制品牌和版权信息
- ✨ Windows 10/11 支持

---

**ZSide4CD** - 让嵌入式开发更简单 🚀