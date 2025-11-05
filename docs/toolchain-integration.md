# ARM GCC 工具链集成方案

## 许可证合规性说明

### ARM GCC 工具链许可证

ARM GCC (GNU Arm Embedded Toolchain) 使用以下许可证：

- **GCC 编译器**: GPLv3 License
- **Binutils**: GPLv3 License  
- **Newlib C 库**: 多种许可证（BSD, GPL）
- **GDB 调试器**: GPLv3 License

### 集成合规性

✅ **可以合法集成的原因**：

1. **GPL 允许分发**
   - GPL 许可证明确允许自由分发软件
   - 可以将 GCC 工具链打包到安装程序中
   - 无需支付任何费用

2. **独立组件原则**
   - IDE（MIT 许可证）和工具链（GPL 许可证）是独立组件
   - IDE 仅调用工具链可执行文件，不链接 GPL 代码
   - 这种使用方式不会导致 IDE 被 GPL "感染"

3. **行业标准做法**
   - Eclipse CDT、Code::Blocks、PlatformIO 等都集成 GCC
   - ARM 官方的 Keil MDK 也可以集成 ARM GCC
   - 这是被广泛接受的做法

### 必须遵守的要求

📋 **GPL 合规要求**：

1. **保留版权声明**
   - 必须包含 GCC 的版权和许可证文件
   - 在安装程序和文档中说明集成了 ARM GCC

2. **提供源码访问**
   - 提供 ARM GCC 源码的下载链接
   - 或者在安装包中包含源码（体积较大，不推荐）

3. **许可证文档**
   - 在 NOTICE 文件中列出 ARM GCC 及其许可证
   - 提供完整的 GPL 许可证文本

4. **不能限制用户权利**
   - 不能阻止用户修改或替换工具链
   - 必须允许用户使用自己编译的 GCC 版本

## 集成方案

### 方案一：完整集成（推荐）

**优点**：
- 用户开箱即用，无需单独安装工具链
- 版本统一，减少兼容性问题
- 提供更好的用户体验

**实现步骤**：

1. **下载 ARM GCC**
   - 从 ARM 官网下载预编译版本
   - 网址: https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm

2. **集成到安装包**
   ```
   ZSide4CD/
   ├── toolchains/
   │   └── arm-gcc-10.3.1/
   │       ├── bin/
   │       │   ├── arm-none-eabi-gcc.exe
   │       │   ├── arm-none-eabi-g++.exe
   │       │   ├── arm-none-eabi-ld.exe
   │       │   ├── arm-none-eabi-gdb.exe
   │       │   └── ...
   │       ├── lib/
   │       ├── include/
   │       └── share/
   │           └── doc/
   └── licenses/
       └── arm-gcc/
           ├── COPYING (GPLv3)
           ├── COPYING.LIB
           └── README.txt
   ```

3. **自动配置**
   - IDE 启动时自动检测集成的工具链
   - 优先使用集成版本
   - 允许用户切换到系统安装的其他版本

### 方案二：在线下载

**优点**：
- 安装包体积小
- 始终获取最新版本
- 用户可以选择是否安装

**实现步骤**：

1. **首次启动向导**
   - 检测是否已安装工具链
   - 如果没有，提示用户下载

2. **自动下载安装**
   - 从官方镜像下载 ARM GCC
   - 解压到指定目录
   - 自动配置路径

### 方案三：混合方案（最佳平衡）

**实现**：
- 基础安装包不包含工具链（体积小）
- 提供"完整版"安装包（包含工具链）
- 安装时可选择下载工具链

## 目录结构设计

```
C:\Program Files\ZSide4CD\
├── ZSide4CD.exe
├── resources/
├── extensions/
├── toolchains/              # 集成的工具链
│   ├── arm-gcc-10.3.1/     # ARM GCC 10.3.1
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── include/
│   │   └── share/
│   └── README.md           # 工具链说明
├── licenses/                # 许可证文件
│   ├── ZSide4CD-LICENSE    # MIT License
│   ├── VSCodium-LICENSE    # MIT License
│   ├── ARM-GCC-COPYING     # GPLv3
│   └── NOTICE              # 汇总说明
└── docs/
```

## 许可证文档更新

### 更新 NOTICE 文件

需要在 NOTICE 文件中添加：

```markdown
## ARM GCC Toolchain

- **许可证 (License)**: GNU General Public License v3.0 (GPLv3)
- **版权 (Copyright)**: Free Software Foundation, ARM Limited
- **官网 (Website)**: https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain
- **版本 (Version)**: 10.3.1
- **描述 (Description)**: 
  ARM GCC 是用于 ARM Cortex-M 和 Cortex-R 处理器的 GNU 工具链，
  包括 GCC 编译器、Binutils、GDB 调试器和 Newlib C 库。

本产品集成了 ARM GCC 工具链的预编译二进制版本。
ARM GCC 是自由软件，您可以根据 GNU General Public License v3 的条款
重新分发和/或修改它。

完整的 ARM GCC 源代码可从以下地址获取：
https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/downloads

GPLv3 许可证全文请参阅 licenses/ARM-GCC-COPYING 文件。
```

### 添加 GPL 许可证文件

在 `licenses/` 目录下添加：
- `ARM-GCC-COPYING` - GPLv3 完整文本
- `ARM-GCC-README.txt` - ARM GCC 说明文档

## 用户文档更新

### 安装指南更新

```markdown
## 工具链说明

ZSide4CD 完整版已集成 ARM GCC 10.3.1 工具链，无需单独安装。

### 集成的工具链

- **ARM GCC 10.3.1** (用于 STM32 开发)
  - 位置: C:\Program Files\ZSide4CD\toolchains\arm-gcc-10.3.1
  - 许可证: GPLv3
  - 包含组件: GCC、G++、GDB、Binutils、Newlib

### 使用自己的工具链

您可以自由选择使用其他版本的 ARM GCC：
1. 安装您选择的 ARM GCC 版本
2. 在 ZSide4CD 中打开"工具链管理"
3. 添加或选择新的工具链

### 源代码获取

根据 GPLv3 许可证，ARM GCC 的源代码可从以下地址获取：
https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain
```

## 安装脚本修改

### 检测和配置集成工具链

```javascript
// scripts/install.js 或 main.js 初始化部分

/**
 * 检测集成的工具链
 */
function detectBundledToolchains() {
  const appPath = app.getPath('exe');
  const appDir = path.dirname(appPath);
  const toolchainsDir = path.join(appDir, 'toolchains');
  
  console.log('检测集成的工具链:', toolchainsDir);
  
  if (!fs.existsSync(toolchainsDir)) {
    console.log('未找到集成的工具链目录');
    return [];
  }
  
  const bundled = [];
  
  // 检测 ARM GCC
  const armGccDir = path.join(toolchainsDir, 'arm-gcc-10.3.1');
  if (fs.existsSync(armGccDir)) {
    bundled.push({
      id: 'bundled-arm-gcc-10.3.1',
      name: 'ARM GCC 10.3.1 (集成版)',
      type: 'arm-gcc',
      path: path.join(armGccDir, 'bin'),
      version: '10.3.1',
      compiler: 'arm-none-eabi-gcc.exe',
      linker: 'arm-none-eabi-ld.exe',
      debugger: 'arm-none-eabi-gdb.exe',
      bundled: true  // 标记为集成版本
    });
    console.log('发现集成的 ARM GCC 10.3.1');
  }
  
  return bundled;
}

/**
 * 初始化工具链（优先使用集成版本）
 */
function initializeToolchains() {
  // 1. 先加载集成的工具链
  const bundled = detectBundledToolchains();
  bundled.forEach(tc => {
    toolchainManager.addToolchain(tc);
  });
  
  // 2. 如果配置了自动检测，再检测系统安装的工具链
  if (config.autoDetectToolchains) {
    toolchainManager.detectToolchains();
  }
  
  console.log(`工具链初始化完成，共 ${toolchainManager.getToolchains().length} 个`);
}
```

## 安装包构建

### electron-builder 配置

```json
{
  "extraResources": [
    {
      "from": "toolchains/arm-gcc-10.3.1",
      "to": "toolchains/arm-gcc-10.3.1"
    },
    {
      "from": "licenses/ARM-GCC-COPYING",
      "to": "licenses/ARM-GCC-COPYING"
    }
  ],
  "nsis": {
    "license": "licenses/COMBINED-LICENSE.txt",
    "include": "installer/custom-messages.nsh"
  }
}
```

### 安装程序提示

在安装向导中添加：

```
本软件集成了以下开源工具链：

• ARM GCC 10.3.1 (GNU General Public License v3)
  用于 ARM Cortex-M 处理器开发

根据 GPL 许可证，您有权利：
✓ 自由使用、复制、分发该工具链
✓ 修改和重新分发修改版本
✓ 获取完整源代码

源代码和许可证详情请访问安装目录下的 licenses 文件夹。
```

## 法律审查建议

虽然集成 ARM GCC 是合法的，但建议：

1. ✅ **保留所有版权声明**
2. ✅ **提供完整的许可证文本**
3. ✅ **在文档中明确说明**
4. ✅ **提供源码获取方式**
5. ✅ **不对工具链添加额外限制**

## 常见问题

### Q: 集成 GPL 工具链会影响 IDE 的许可证吗？

A: 不会。IDE 和工具链是独立的组件。IDE 仅通过命令行调用工具链，不链接 GPL 代码，因此 MIT 许可证不受影响。

### Q: 可以对集成的工具链收费吗？

A: 可以。GPL 不禁止对分发收费，但必须：
- 提供源码访问
- 不限制用户的 GPL 权利
- 通常做法是对"服务和支持"收费，而不是对软件本身

### Q: 用户可以替换集成的工具链吗？

A: 必须允许。这是 GPL 的基本要求。ZSide4CD 设计上支持用户：
- 使用系统安装的其他版本
- 手动添加自定义工具链
- 完全不使用集成版本

### Q: 需要提供编译后的工具链源码吗？

A: 如果使用官方预编译版本，提供官方源码下载链接即可。如果自己编译或修改了工具链，则需要提供修改后的源码。

### Q: TI CGT 工具链可以集成吗？

A: TI CGT 不是开源软件，有专有许可证。需要：
1. 查看 TI 的许可证条款
2. 可能需要与 TI 签订分发协议
3. 通常建议用户自行从 TI 官网下载

## 总结

✅ **ARM GCC 工具链可以合法集成到 ZSide4CD 中**

只需要：
1. 保留 ARM GCC 的版权和许可证声明
2. 在文档中说明集成了 ARM GCC
3. 提供源码获取方式（链接即可）
4. 不限制用户使用其他工具链的权利

这是完全合规且被广泛采用的做法。
