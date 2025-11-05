# ZSide4CD IDE - 编译指南

## 概述

本文档说明如何使用ZSide4CD IDE编译STM32F429和TI C67XX项目。

## 前置要求

### STM32F429项目

1. **ARM GCC工具链**
   - 下载地址: https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads
   - 推荐版本: 10.3.1或更高
   - 安装路径示例: `C:\Program Files (x86)\GNU Arm Embedded Toolchain\10 2021.10`

2. **OpenOCD（可选，用于调试）**
   - 下载地址: https://github.com/openocd-org/openocd/releases
   - 用于在线调试和烧录

3. **ST-Link工具（可选，用于烧录）**
   - 下载地址: https://www.st.com/en/development-tools/stsw-link004.html
   - 用于将程序烧录到STM32芯片

### TI C67XX项目

1. **TI CGT C6000工具链**
   - 下载地址: https://www.ti.com/tool/C6000-CGT
   - 推荐版本: 8.3.x或更高
   - 需要TI账号下载

2. **TI XDS仿真器（可选，用于调试）**
   - 用于在线调试DSP程序

3. **UniFlash（可选，用于烧录）**
   - 下载地址: https://www.ti.com/tool/UNIFLASH
   - 用于将程序烧录到C67XX芯片

## 快速开始

### 1. 启动IDE

```bash
# 安装依赖
npm install

# 启动IDE
npm start
```

### 2. 配置工具链

#### 方法一：自动检测（推荐）

1. 启动IDE
2. IDE会自动检测系统中已安装的工具链
3. 在状态栏查看检测到的工具链

#### 方法二：手动配置（TI CGT）

1. 点击菜单：`工具 → 工具链管理器 → 配置TI CGT`
2. 在配置对话框中：
   - 点击"自动检测"按钮搜索已安装的工具链
   - 或手动输入工具链路径
   - 点击"验证"检查工具链是否有效
3. 点击"保存"保存配置

### 3. 创建/打开项目

#### 使用模板创建新项目

1. 点击菜单：`文件 → 新建项目`
2. 选择处理器类型：
   - **STM32F429**: 包含LED闪烁示例
   - **TI C67XX**: 包含FIR滤波器示例
3. 输入项目名称和保存位置
4. 点击"创建"

#### 打开现有项目

1. 点击菜单：`文件 → 打开项目`
2. 选择项目目录（包含`project.json`文件）
3. IDE会自动加载项目并选择对应工具链

### 4. 编译项目

#### 使用工具栏

1. 点击工具栏的"构建"按钮（锤子图标）
2. 在输出面板查看编译进度和结果

#### 使用菜单

1. 点击菜单：`构建 → 编译项目` (或按`Ctrl+B`)
2. 等待编译完成

#### 使用快捷键

- **编译**: `Ctrl+B`
- **清理**: `Ctrl+Shift+C`
- **重新编译**: `Ctrl+Shift+B`

### 5. 查看编译输出

编译完成后，输出面板会显示：

```
开始构建项目: STM32F429_Basic
处理器类型: stm32
工具链: ARM GCC 10.3.1
构建目录: D:\Projects\STM32F429_Basic\build
============================================================
[1/3] 编译 main.c
  arm-none-eabi-gcc -c -mcpu=cortex-m4 -mthumb -O2 -g ...
  ✓ 编译成功

[2/3] 链接对象文件
  arm-none-eabi-ld -T stm32f429.ld ...
  ✓ 链接成功

[3/3] 生成烧录文件
  arm-none-eabi-objcopy -O ihex ...
  ✓ 生成成功

程序大小:
   text    data     bss     dec     hex filename
   8192     256    4096   12544    3100 firmware.elf

============================================================
构建成功！用时: 3.5秒
```

### 6. 输出文件

编译成功后，在项目的`build`目录下会生成以下文件：

**STM32项目**:
- `firmware.elf` - ELF可执行文件（用于调试）
- `firmware.hex` - Intel HEX格式（用于烧录）
- `firmware.bin` - 二进制格式（用于烧录）
- `firmware.map` - 链接映射文件
- `*.o` - 对象文件

**C67XX项目**:
- `firmware.out` - COFF可执行文件
- `firmware.map` - 链接映射文件
- `*.obj` - 对象文件

## 编译选项

### 项目配置文件

每个项目包含一个`project.json`配置文件：

```json
{
  "name": "STM32F429_Basic",
  "version": "1.0.0",
  "processorType": "stm32f429",
  "build": {
    "sourceDir": "src",
    "buildDir": "build",
    "outputName": "firmware"
  },
  "compiler": {
    "optimization": "O2",
    "debugInfo": true,
    "defines": ["STM32F429xx", "USE_HAL_DRIVER"],
    "includePaths": ["include", "HAL/Inc"]
  }
}
```

### 自定义编译选项

可以在`project.json`中添加自定义编译选项：

```json
"compiler": {
  "optimization": "O2",      // 优化级别: O0, O1, O2, O3, Os
  "debugInfo": true,         // 包含调试信息
  "defines": [               // 预定义宏
    "STM32F429xx",
    "USE_HAL_DRIVER",
    "DEBUG"
  ],
  "includePaths": [          // 头文件搜索路径
    "include",
    "HAL/Inc",
    "CMSIS/Include"
  ],
  "extraFlags": [            // 额外的编译器标志
    "-Wall",
    "-Wextra",
    "-ffunction-sections",
    "-fdata-sections"
  ]
}
```

## 编译流程说明

### STM32项目编译流程

```mermaid
graph LR
    A[源文件 .c] --> B[编译 gcc]
    B --> C[对象文件 .o]
    C --> D[链接 ld]
    D --> E[可执行文件 .elf]
    E --> F[objcopy]
    F --> G[hex/bin]
```

1. **预处理**: 处理宏定义和头文件包含
2. **编译**: 将C源文件编译为对象文件(.o)
3. **链接**: 将对象文件链接为可执行文件(.elf)
4. **转换**: 生成烧录格式(.hex/.bin)

### C67XX项目编译流程

```mermaid
graph LR
    A[源文件 .c] --> B[编译 cl6x]
    B --> C[对象文件 .obj]
    C --> D[链接 lnk6x]
    D --> E[可执行文件 .out]
```

1. **预处理**: 处理宏定义和头文件包含
2. **编译**: 将C/C++源文件编译为对象文件(.obj)
3. **链接**: 将对象文件链接为可执行文件(.out)

## 常见问题

### 1. 工具链未检测到

**问题**: IDE无法检测到已安装的工具链

**解决方案**:
- 确认工具链已正确安装
- 检查安装路径是否在常见位置
- 使用"手动配置"功能指定工具链路径
- 将工具链路径添加到系统PATH环境变量

### 2. 编译失败

**问题**: 编译过程中出错

**可能原因**:
- 源代码语法错误
- 缺少头文件或库文件
- 编译选项不正确
- 链接脚本配置错误

**解决方案**:
- 查看输出面板的详细错误信息
- 检查源代码是否有语法错误
- 确认所有必需的头文件和库都存在
- 检查`project.json`配置是否正确

### 3. 找不到头文件

**问题**: 编译时提示`fatal error: xxx.h: No such file or directory`

**解决方案**:
- 在`project.json`的`includePaths`中添加头文件路径
- 确认头文件确实存在于指定路径
- 使用相对路径（相对于项目根目录）

### 4. 链接错误

**问题**: 链接时出现`undefined reference`错误

**解决方案**:
- 确认所有源文件都已编译
- 检查是否缺少必要的库文件
- 确认链接脚本(.ld)配置正确
- 检查函数声明和定义是否匹配

### 5. 构建速度慢

**解决方案**:
- 使用增量编译（只编译修改过的文件）
- 降低优化级别（开发时使用-O0或-O1）
- 关闭不必要的警告选项
- 使用更快的存储设备（SSD）

## 测试构建功能

### 运行构建演示

IDE提供了一个测试脚本来演示构建流程：

```bash
# 运行构建演示
node test-build.js
```

这个脚本会：
1. 加载示例项目配置
2. 展示完整的构建流程
3. 显示编译命令和输出
4. 演示构建结果

### 使用示例项目

IDE包含两个示例项目：

1. **STM32F429 LED闪烁**
   - 位置: `extensions/stm32/templates/basic`
   - 功能: LED灯每500ms闪烁一次
   - 适合初学者学习

2. **C67XX FIR滤波器**
   - 位置: `extensions/c67xx/templates/basic`
   - 功能: 16阶FIR数字滤波器实现
   - 展示DSP信号处理

## 下一步

编译成功后，您可以：

1. **调试程序**: 参见[调试指南](debug-guide.md)
2. **烧录到芯片**: 参见[烧录指南](flash-guide.md)
3. **查看用户手册**: 参见[用户手册](user-guide.md)

## 命令行编译（高级）

如果您更喜欢使用命令行，可以直接调用构建管理器：

```javascript
const BuildManager = require('./app/build-manager');
const buildManager = new BuildManager();

const project = {
    name: 'MyProject',
    processorType: 'stm32',
    path: '/path/to/project',
    build: {
        sourceDir: 'src',
        buildDir: 'build',
        outputName: 'firmware'
    }
};

const toolchain = {
    name: 'ARM GCC',
    type: 'arm-gcc',
    path: 'C:\\Program Files (x86)\\GNU Arm Embedded Toolchain\\10 2021.10',
    compiler: 'arm-none-eabi-gcc',
    linker: 'arm-none-eabi-ld',
    objcopy: 'arm-none-eabi-objcopy',
    size: 'arm-none-eabi-size'
};

buildManager.buildProject(project, toolchain, (output) => {
    console.log(output);
}).then(result => {
    console.log('构建完成:', result);
}).catch(error => {
    console.error('构建失败:', error);
});
```

## 技术支持

如果您在编译过程中遇到问题：

1. 查看[常见问题](#常见问题)部分
2. 查看[Windows兼容性测试](windows-compatibility.md)
3. 查看输出面板的详细错误信息
4. 参考[用户手册](user-guide.md)

---

**ZSide4CD IDE** - 让嵌入式开发更简单！
