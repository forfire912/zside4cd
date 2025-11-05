# 更新日志

本文档记录ZSide4CD的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- GitHub Actions自动发布工作流
- GitHub发布指南文档
- 更新日志文件

## [1.0.0] - 2024-11-05

### 新增
- 基于Electron的完整IDE应用框架
- 中文化UI界面（VS Code深色主题）
- STM32F429处理器支持
  - ARM GCC工具链集成
  - OpenOCD/ST-Link调试器支持
  - Flash程序烧录功能
  - LED闪烁示例项目
- TI C67XX处理器支持
  - TI CGT C6000工具链集成
  - 图形化配置界面
  - TI XDS/CCS调试器支持
  - DSP程序下载功能
  - FIR滤波器示例项目
- 智能工具链管理系统
  - ARM GCC自动检测
  - TI CGT自动检测和手动配置
  - 工具链版本识别和验证
  - 配置持久化
- 完整的构建系统（BuildManager）
  - STM32项目编译（生成.elf/.hex/.bin）
  - C67XX项目编译（生成.out）
  - 实时构建输出
  - 构建历史记录
- 专业调试支持（DebugManager）
  - STM32调试（OpenOCD + GDB）
  - C67XX调试（TI XDS）
  - 调试会话管理
- 多工具烧录支持（FlashManager）
  - STM32烧录（ST-Link/OpenOCD）
  - C67XX烧录（UniFlash/CCS）
  - Flash擦除功能
- VSCodium集成方案
  - 扩展模式支持
  - 独立应用模式
  - 混合模式架构设计
- 完整的构建和发布系统
  - 自动化构建脚本
  - 自动化测试脚本（100%覆盖）
  - 自动化打包脚本
  - 交互式发布向导
- 完整的文档体系（12个文档）
  - 需求文档
  - 设计文档
  - 测试文档
  - 用户手册
  - 快速开始指南
  - 编译指南
  - VSCodium集成说明
  - 发布指南
  - GitHub发布指南
  - TI CGT配置指南
  - 工具链集成方案
  - Windows兼容性测试
  - 项目完成总结

### 特性
- ✅ 完整中文化（界面、文档、提示）
- ✅ Windows 10/11完整支持
- ✅ 符合开源协议要求（MIT License）
- ✅ 完整的嵌入式开发流程支持
- ✅ 两种发布模式（独立应用和VSCodium扩展）

### 文档
- 添加完整的用户文档
- 添加技术文档
- 添加开发文档
- 添加发布和下载指南

### 测试
- 独立应用完整性测试（9项）
- VSCodium扩展完整性测试（9项）
- 代码语法验证
- 配置完整性检查

### 发布
- Windows安装版（Setup.exe）
- Windows便携版（Portable.exe）
- VSCodium扩展包（.vsix）
- GitHub Releases自动发布

## [0.9.0] - 2024-11-01

### 新增
- 项目基础架构
- 基本的Electron应用框架
- 工具链检测原型

### 开发
- 初始化项目结构
- 配置TypeScript
- 配置npm脚本

## 版本说明

### 语义化版本格式
- 主版本号：不兼容的API更改
- 次版本号：向下兼容的新功能
- 修订号：向下兼容的问题修复

### 版本类型
- `[未发布]` - 正在开发中的功能
- `[X.Y.Z]` - 已发布的版本

### 变更类型
- `新增` - 新功能
- `变更` - 现有功能的变化
- `废弃` - 即将移除的功能
- `移除` - 已移除的功能
- `修复` - 问题修复
- `安全` - 安全相关的修复

---

[未发布]: https://github.com/forfire912/zside4cd/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/forfire912/zside4cd/releases/tag/v1.0.0
[0.9.0]: https://github.com/forfire912/zside4cd/releases/tag/v0.9.0
