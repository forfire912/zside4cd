# ZSide4CD 发布指南

本文档说明如何构建、测试和发布ZSide4CD的独立应用和VSCodium扩展。

## 📋 发布前准备

### 1. 环境要求

- **Node.js**: >=16.0.0
- **npm**: >=8.0.0
- **操作系统**: Windows 10/11（用于构建Windows安装包）

### 2. 安装依赖

```bash
# 安装项目依赖
npm install

# 全局安装打包工具（可选）
npm install -g electron-builder
npm install -g @vscode/vsce
```

### 3. 版本号管理

在发布前，更新`package.json`中的版本号：

```json
{
  "version": "1.0.0"  // 更新为新版本
}
```

版本号遵循语义化版本规范（Semantic Versioning）：
- **主版本号**：不兼容的API修改
- **次版本号**：向下兼容的功能新增
- **修订号**：向下兼容的问题修正

## 🚀 发布独立应用

独立应用是基于Electron的桌面应用程序，无需安装VSCodium即可使用。

### 步骤 1: 构建

```bash
npm run build:standalone
```

这将创建`dist-standalone/`目录，包含所有应用文件。

### 步骤 2: 测试

```bash
npm run test:standalone
```

测试脚本会验证：
- ✅ 构建目录结构
- ✅ 核心文件完整性
- ✅ 模块文件存在
- ✅ 资源文件完整
- ✅ package.json配置
- ✅ 版本信息
- ✅ 项目模板
- ✅ JavaScript语法

**所有测试必须通过才能继续打包！**

### 步骤 3: 打包

```bash
npm run package:standalone
```

打包过程会：
1. 检查构建目录
2. 安装electron-builder依赖
3. 创建打包配置
4. 生成Windows安装程序

输出文件位于`release-standalone/`目录：
- **ZSide4CD-{version}-Setup.exe** - 安装版（推荐）
- **ZSide4CD-{version}-Portable.exe** - 便携版

### 步骤 4: 一键发布

```bash
# 执行完整的构建、测试、打包流程
npm run release:standalone
```

### 验证安装包

1. **安装测试**
   ```bash
   # 在测试环境安装
   ZSide4CD-1.0.0-Setup.exe
   ```

2. **功能测试**
   - 启动应用
   - 检测工具链
   - 创建测试项目
   - 尝试构建项目
   - 验证中文界面

3. **卸载测试**
   - 通过控制面板卸载
   - 检查残留文件

## 🔌 发布VSCodium扩展

VSCodium扩展可以安装到VSCodium中，充分利用VSCodium生态。

### 步骤 1: 构建

```bash
npm run build:extension
```

这将创建`dist-extension/`目录，包含：
- extension.js（扩展入口）
- modules/（核心模块）
- resources/（资源文件）
- package.json（扩展配置）
- README.md、CHANGELOG.md

### 步骤 2: 测试

```bash
npm run test:extension
```

测试脚本会验证：
- ✅ 构建目录结构
- ✅ 扩展入口文件
- ✅ package.json配置
- ✅ 命令定义
- ✅ 激活事件
- ✅ 模块文件
- ✅ 资源文件
- ✅ 文档完整性
- ✅ JavaScript语法

**所有测试必须通过才能继续打包！**

### 步骤 3: 打包

```bash
npm run package:extension
```

打包过程会：
1. 检查构建目录
2. 安装@vscode/vsce工具
3. 创建扩展图标
4. 验证package.json
5. 打包为.vsix文件

输出文件位于`release-extension/`目录：
- **zside4cd-{version}.vsix** - VSCodium扩展包
- **INSTALL.md** - 安装指南

### 步骤 4: 一键发布

```bash
# 执行完整的构建、测试、打包流程
npm run release:extension
```

### 验证扩展

1. **安装测试**
   ```bash
   # 在VSCodium中安装
   codium --install-extension release-extension/zside4cd-1.0.0.vsix
   ```

2. **功能测试**
   - 打开VSCodium
   - 查看扩展是否激活
   - 测试命令面板中的命令
   - 创建测试项目
   - 尝试构建项目

3. **卸载测试**
   - 在VSCodium中卸载扩展
   - 重启VSCodium验证

## 🎯 发布两种模式

一次性构建和打包两种模式：

```bash
npm run release:all
```

这将依次执行：
1. 构建独立应用
2. 测试独立应用
3. 打包独立应用
4. 构建VSCodium扩展
5. 测试VSCodium扩展
6. 打包VSCodium扩展

## 📦 发布物清单

### 独立应用发布物

```
release-standalone/
├── ZSide4CD-1.0.0-Setup.exe      # Windows安装版 (~80MB)
└── ZSide4CD-1.0.0-Portable.exe   # Windows便携版 (~80MB)
```

### VSCodium扩展发布物

```
release-extension/
├── zside4cd-1.0.0.vsix           # VSCodium扩展包 (~5MB)
└── INSTALL.md                    # 安装指南
```

## 🔍 质量检查清单

### 发布前检查

- [ ] 所有测试通过
- [ ] 版本号已更新
- [ ] CHANGELOG已更新
- [ ] README已更新
- [ ] 许可证文件完整
- [ ] 文档无错别字
- [ ] 示例代码可运行

### 独立应用检查

- [ ] 应用可正常启动
- [ ] 工具链检测功能正常
- [ ] 项目创建功能正常
- [ ] 构建功能正常
- [ ] 中文界面显示正确
- [ ] 所有菜单功能可用
- [ ] 无JavaScript错误

### VSCodium扩展检查

- [ ] 扩展可正常安装
- [ ] 扩展可正常激活
- [ ] 所有命令可执行
- [ ] 快捷键正常工作
- [ ] 配置项可正常设置
- [ ] 与VSCodium其他扩展兼容
- [ ] 无激活错误

## 📤 发布渠道

### 1. GitHub Releases

1. 创建新的Release标签
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. 在GitHub上创建Release
   - 标题：ZSide4CD v1.0.0
   - 描述：参考CHANGELOG
   - 附件：上传所有发布文件

3. 上传发布物
   - ZSide4CD-1.0.0-Setup.exe
   - ZSide4CD-1.0.0-Portable.exe
   - zside4cd-1.0.0.vsix

### 2. VSCodium Extension Marketplace

VSCodium使用Open VSX Registry作为扩展市场：

```bash
# 安装ovsx CLI
npm install -g ovsx

# 发布到Open VSX
ovsx publish -p <your-access-token>
```

详见：https://open-vsx.org/

### 3. 自托管下载

可以将发布物上传到：
- 自己的服务器
- 云存储（如阿里云OSS、腾讯云COS）
- CDN加速

## 🐛 故障排除

### 构建失败

**问题**：`npm run build:standalone` 失败

**解决方案**：
1. 检查Node.js版本：`node --version`
2. 清理node_modules：`rm -rf node_modules && npm install`
3. 检查文件权限

### 打包失败

**问题**：electron-builder打包失败

**解决方案**：
1. 安装electron-builder：`npm install -g electron-builder`
2. 检查网络连接（可能需要下载依赖）
3. 设置镜像：`npm config set electron_mirror https://npm.taobao.org/mirrors/electron/`

### 扩展打包失败

**问题**：vsce打包失败

**解决方案**：
1. 安装vsce：`npm install -g @vscode/vsce`
2. 检查package.json配置
3. 验证extension.js语法

### 测试失败

**问题**：测试脚本报错

**解决方案**：
1. 先运行构建：`npm run build:standalone` 或 `npm run build:extension`
2. 检查构建目录是否存在
3. 查看测试输出的具体错误

## 📝 版本发布记录

| 版本 | 日期 | 说明 | 发布物 |
|------|------|------|--------|
| 1.0.0 | 2024-11-05 | 首次发布 | 独立应用 + VSCodium扩展 |

## 📚 相关文档

- [项目README](../README.md)
- [用户手册](user-guide.md)
- [快速开始](quick-start.md)
- [VSCodium集成说明](vscodium-integration.md)
- [编译指南](build-guide.md)

## 🤝 贡献

如果你在发布过程中遇到问题或有改进建议，请：
1. 提交Issue到GitHub
2. 或发送Pull Request

## 📄 许可证

MIT License - 详见LICENSE文件
