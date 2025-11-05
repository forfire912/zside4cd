# GitHub发布指南

本文档说明如何通过GitHub下载和使用ZSide4CD的发布版本。

## 📦 发布渠道

ZSide4CD通过GitHub Releases发布，所有版本都可以在以下地址找到：

**GitHub Releases页面**: https://github.com/forfire912/zside4cd/releases

## 🔍 查找发布版本

1. 访问 https://github.com/forfire912/zside4cd/releases
2. 你会看到所有已发布的版本列表
3. 每个版本包含：
   - 版本号（例如：v1.0.0）
   - 发布日期
   - 发布说明（包含主要特性和更新内容）
   - 下载文件列表

## 📥 下载说明

### 独立应用版（推荐新用户）

#### ZSide4CD-{version}-Setup.exe
- **大小**: 约80MB
- **类型**: Windows安装程序
- **特点**: 完整的安装向导，自动配置系统
- **适合**: 希望安装到系统的用户

**下载步骤**:
1. 在Releases页面找到最新版本
2. 在"Assets"部分找到 `ZSide4CD-x.x.x-Setup.exe`
3. 点击文件名开始下载
4. 下载完成后双击安装

#### ZSide4CD-{version}-Portable.exe
- **大小**: 约75MB
- **类型**: Windows便携版
- **特点**: 解压即用，不写入注册表
- **适合**: 需要移动使用或不想安装的用户

**下载步骤**:
1. 在Releases页面找到最新版本
2. 在"Assets"部分找到 `ZSide4CD-x.x.x-Portable.exe`
3. 点击文件名开始下载
4. 解压到任意目录即可使用

### VSCodium扩展版（推荐VSCodium用户）

#### zside4cd-{version}.vsix
- **大小**: 约5MB
- **类型**: VSCodium扩展包
- **特点**: 轻量级，充分利用VSCodium生态
- **适合**: 已经在使用VSCodium的用户

**下载步骤**:
1. 在Releases页面找到最新版本
2. 在"Assets"部分找到 `zside4cd-x.x.x.vsix`
3. 点击文件名开始下载
4. 参考INSTALL.md进行安装

#### INSTALL.md
- **类型**: 安装指南文档
- **内容**: VSCodium扩展的详细安装步骤

## 🚀 安装和使用

### 方式一：独立应用（安装版）

```bash
# 1. 下载 ZSide4CD-x.x.x-Setup.exe
# 2. 双击运行安装程序
# 3. 按照安装向导完成安装
# 4. 从开始菜单或桌面快捷方式启动ZSide4CD
```

**系统要求**:
- Windows 10 或 Windows 11
- 至少 2GB RAM
- 至少 500MB 可用磁盘空间

### 方式二：独立应用（便携版）

```bash
# 1. 下载 ZSide4CD-x.x.x-Portable.exe
# 2. 解压到任意目录（例如：D:\ZSide4CD）
# 3. 双击 ZSide4CD.exe 启动
```

**优点**:
- 无需安装
- 可以放在U盘中移动使用
- 不会修改系统设置

### 方式三：VSCodium扩展

```bash
# 1. 确保已安装VSCodium (https://vscodium.com/)
# 2. 下载 zside4cd-x.x.x.vsix

# 方法A：命令行安装
codium --install-extension zside4cd-x.x.x.vsix

# 方法B：VSCodium内安装
# - 打开VSCodium
# - 按F1打开命令面板
# - 输入"Extensions: Install from VSIX"
# - 选择下载的.vsix文件

# 3. 重启VSCodium
# 4. 在侧边栏找到ZSide4CD图标
```

## 📋 版本选择建议

### 选择独立应用如果你：
- ✅ 第一次使用ZSide4CD
- ✅ 不使用VSCodium
- ✅ 希望有完整的IDE体验
- ✅ 不需要其他VS Code扩展

### 选择VSCodium扩展如果你：
- ✅ 已经在使用VSCodium
- ✅ 希望轻量级安装
- ✅ 需要使用其他VS Code扩展
- ✅ 熟悉VS Code/VSCodium环境

## 🔄 自动发布流程

ZSide4CD使用GitHub Actions实现自动化发布：

### 触发方式

#### 1. 标签发布（推荐）
```bash
# 在本地创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions会自动：
# 1. 构建独立应用（Windows）
# 2. 构建VSCodium扩展
# 3. 运行所有测试
# 4. 打包所有产物
# 5. 创建GitHub Release
# 6. 上传所有文件
```

#### 2. 手动触发
```bash
# 在GitHub仓库页面：
# 1. 点击 "Actions" 标签
# 2. 选择 "发布构建" workflow
# 3. 点击 "Run workflow"
# 4. 输入版本号（例如：v1.0.0）
# 5. 点击 "Run workflow" 按钮
```

### 发布流程

```
标签推送/手动触发
       ↓
┌──────────────────────────────────┐
│     GitHub Actions 启动          │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  并行构建                         │
│  ├─ 构建独立应用 (Windows)       │
│  │  ├─ 安装依赖                  │
│  │  ├─ 构建应用                  │
│  │  ├─ 运行测试                  │
│  │  └─ 打包 .exe                 │
│  └─ 构建VSCodium扩展             │
│     ├─ 安装依赖                  │
│     ├─ 构建扩展                  │
│     ├─ 运行测试                  │
│     └─ 打包 .vsix                │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  创建GitHub Release               │
│  ├─ 生成发布说明                  │
│  ├─ 上传独立应用文件              │
│  ├─ 上传VSCodium扩展文件          │
│  └─ 发布到Releases页面            │
└──────────────────────────────────┘
       ↓
    发布完成！
```

## 📊 发布内容清单

每个版本的Release包含以下文件：

### 必需文件
- ✅ `ZSide4CD-{version}-Setup.exe` - Windows安装版
- ✅ `ZSide4CD-{version}-Portable.exe` - Windows便携版
- ✅ `zside4cd-{version}.vsix` - VSCodium扩展
- ✅ `INSTALL.md` - 安装指南

### 附加信息
- ✅ 发布说明（Release Notes）
- ✅ 主要特性说明
- ✅ 下载说明
- ✅ 快速开始指南
- ✅ 文档链接
- ✅ 问题反馈链接

## 🔗 重要链接

- **Releases页面**: https://github.com/forfire912/zside4cd/releases
- **最新版本**: https://github.com/forfire912/zside4cd/releases/latest
- **源代码**: https://github.com/forfire912/zside4cd
- **问题反馈**: https://github.com/forfire912/zside4cd/issues
- **文档**: https://github.com/forfire912/zside4cd/tree/main/docs

## ❓ 常见问题

### Q: 如何下载最新版本？
A: 访问 https://github.com/forfire912/zside4cd/releases/latest 直接查看最新版本。

### Q: 下载速度慢怎么办？
A: GitHub在中国大陆可能较慢，可以：
1. 使用GitHub加速服务（如ghproxy.com）
2. 使用VPN
3. 等待仓库在国内镜像站同步

### Q: 如何验证文件完整性？
A: 每个Release都包含SHA256校验和，可以验证下载文件的完整性。

### Q: 旧版本还能下载吗？
A: 是的，所有历史版本都保留在Releases页面。

### Q: 如何知道新版本发布？
A: 可以：
1. Watch仓库并选择"Releases only"
2. 订阅GitHub的Release RSS
3. 关注项目更新

### Q: 下载需要GitHub账号吗？
A: 不需要。所有Release文件都是公开的，任何人都可以直接下载。

## 🆕 版本更新

### 检查更新
```bash
# 访问Releases页面查看最新版本
# 或在IDE中的"帮助"菜单选择"检查更新"
```

### 升级方式

**独立应用**:
1. 下载新版本的安装程序
2. 直接安装（会自动覆盖旧版本）
3. 用户数据和配置会自动保留

**VSCodium扩展**:
1. 下载新版本的.vsix文件
2. 卸载旧版本（可选）
3. 安装新版本

## 📝 发布说明格式

每个Release都包含以下信息：

```markdown
# ZSide4CD vX.X.X 发布

## 🎯 主要特性
[列出核心功能]

## 📦 下载说明
[详细的下载和安装说明]

## 🚀 快速开始
[快速上手步骤]

## 📚 文档
[相关文档链接]

## 🐛 问题反馈
[问题反馈渠道]

## 📝 更新日志
[本版本的更新内容]
```

## 💡 提示

1. **首次使用建议**：下载独立应用的安装版，体验完整功能
2. **VSCodium用户**：下载扩展版，可以与现有工作流集成
3. **移动办公**：使用便携版，放在U盘中随身携带
4. **自动更新**：未来版本会支持自动更新检测

## 📞 获取帮助

如果在下载或安装过程中遇到问题：

1. 查看 [安装指南](./quick-start.md)
2. 查看 [常见问题](./user-guide.md#常见问题)
3. 在GitHub Issues提问：https://github.com/forfire912/zside4cd/issues
4. 查看Release页面的评论区

---

**ZSide4CD** - 专业的嵌入式开发IDE，轻松从GitHub下载！🚀
