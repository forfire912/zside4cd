# 发布说明与许可证合规

本文件为 ZSide4CD 发布时的合规清单与说明，包含需要随发行版一起分发的第三方许可证和注意事项。

## 包含的第三方组件

- VSCodium (基于 VS Code OSS，MIT)
  - 许可证: MIT
  - 建议包含: `LICENSE`, `ThirdPartyNotices.txt`（已在 resources/app 中）

- ARM GNU Toolchain (gcc-arm-none-eabi)
  - 许可证: 多个（主要为 GPL 和 BSD 组件）
  - 建议包含: `LICENSE` 或 官方下载页面指向，依据发行条款

- OpenOCD (xPack)
  - 许可证: GPL v2
  - 要求: 若分发 OpenOCD 的二进制，必须同时提供源代码或源代码获取方式，并附带 GPL v2 文本
  - 建议包含: `COPYING` (GPL-2.0) 与 `NOTICE`

- ST-Link Tools (stlink)
  - 许可证: LGPL/混合（请核对具体版本 LICENSE）
  - 建议包含: 相应 LICENSE 文件

- libusb
  - 许可证: LGPL 或 MIT（取决于发行包）
  - 建议包含: libusb 的 LICENSE 文档

## 打包建议

1. 在打包过程中，把第三方 LICENSE 文件放在 `resources/app/licenses/`，并在安装器中显示“第三方许可”页面。  
2. 对于 GPL 授权的组件（如 OpenOCD），在发布页面和安装包中提供“如何获取源代码”的链接或提供源代码归档。  
3. 更新 `package.json` 的 `build.extraResources`，确保工具链二进制和 LICENSE 一起包含。  

## CI 构建注意事项

- 建议在 CI 环境完成最终打包（例如 GitHub Actions），避免开发者本地的网络/平台差异。  
- 在 CI 构建后运行 `scripts/ci-build-validate.js` 来验证嵌入的工具链可执行性。  

## 发布清单示例

- ZSide4CD-1.0.0-setup.exe
- resources/app/toolchains/*  (arm-gcc, openocd, stlink)
- resources/app/licenses/* (包含所有第三方 LICENSE)
- release-notes.md

## 免责声明

本文档为初稿，请法律顾问确认最终的许可证合规性，尤其在分发 GPL/LGPL 组件时。