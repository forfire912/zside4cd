# STM32F429 基础项目模板

这是一个 STM32F429 系列处理器的基础项目模板。

## 项目特点

- 包含 STM32 HAL 库
- 预配置的系统时钟
- GPIO 初始化代码
- 链接脚本和启动代码
- Makefile 构建支持

## 硬件要求

- STM32F429 开发板
- ST-Link 调试器
- USB 线

## 快速开始

1. 在 ZSide4CD 中打开此项目
2. 点击 **构建** 编译项目
3. 连接开发板
4. 点击 **调试** 启动调试
5. 或点击 **烧录** 直接烧录程序

## 项目结构

```
stm32-basic/
├── Core/
│   ├── Inc/           # 头文件
│   │   ├── main.h
│   │   └── stm32f4xx_hal_conf.h
│   └── Src/           # 源文件
│       ├── main.c
│       ├── system_stm32f4xx.c
│       └── stm32f4xx_it.c
├── Drivers/
│   └── STM32F4xx_HAL_Driver/
├── Startup/
│   └── startup_stm32f429xx.s
├── STM32F429ZITx_FLASH.ld
├── Makefile
└── README.md
```

## 代码说明

### main.c
主程序文件，包含：
- 系统初始化
- GPIO 配置
- 主循环

### 示例功能
默认实现了 LED 闪烁功能，每 500ms 切换一次状态。

## 编译和烧录

### 编译
```bash
make
```

### 清理
```bash
make clean
```

### 烧录
使用 ZSide4CD 的烧录功能，或命令行：
```bash
openocd -f interface/stlink.cfg -f target/stm32f4x.cfg -c "program build/firmware.elf verify reset exit"
```

## 调试

使用 ZSide4CD 的调试功能，会自动配置：
- OpenOCD 服务器
- GDB 调试器
- SVD 文件支持（寄存器查看）

## 修改和定制

### 更改时钟配置
编辑 `Core/Src/system_stm32f4xx.c` 中的 `SystemClock_Config()` 函数。

### 添加外设
1. 在 `Core/Inc/main.h` 中添加头文件
2. 在 `Core/Src/main.c` 中初始化外设
3. 实现相应的中断处理函数

### 添加源文件
1. 将文件放入 `Core/Src` 目录
2. 修改 Makefile，添加到 `C_SOURCES` 变量

## 许可证

本模板代码采用 MIT 许可证。
