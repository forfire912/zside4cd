# TI C67XX DSP 基础项目模板

这是一个 TI C67XX 系列 DSP 处理器的基础项目模板。

## 项目特点

- C67XX DSP 优化代码
- 预配置的内存映射
- 中断向量表
- 链接命令文件
- Makefile 构建支持

## 硬件要求

- TI C67XX DSP 开发板
- TI XDS 调试器
- USB 线

## 快速开始

1. 在 ZSide4CD 中打开此项目
2. 点击 **构建** 编译项目
3. 连接开发板
4. 点击 **调试** 启动调试
5. 或点击 **烧录** 直接下载程序

## 项目结构

```
c67xx-basic/
├── include/           # 头文件
│   ├── main.h
│   └── vectors.h
├── src/               # 源文件
│   ├── main.c
│   ├── vectors.c
│   └── init.c
├── linker/
│   └── c67xx.cmd     # 链接命令文件
├── Makefile
└── README.md
```

## 代码说明

### main.c
主程序文件，包含：
- DSP 初始化
- 中断配置
- 主循环

### 示例功能
默认实现了简单的数据处理示例。

## 编译和下载

### 编译
```bash
make
```

### 清理
```bash
make clean
```

### 下载
使用 ZSide4CD 的烧录功能，或 TI 命令行工具：
```bash
uniflash -c connection.cfg -f build/output.out
```

## 调试

使用 ZSide4CD 的调试功能，会自动配置：
- TI CCS 调试服务器
- DSP 调试器
- 内存查看

## DSP 优化

### 编译优化
在 Makefile 中设置优化级别：
```makefile
CFLAGS += -O3
```

### 使用内联汇编
```c
asm(" NOP");
```

### DSP 库函数
包含 TI DSPLIB 可以使用优化的 DSP 算法。

## 修改和定制

### 更改内存映射
编辑 `linker/c67xx.cmd` 文件。

### 添加中断处理
1. 在 `include/vectors.h` 中声明中断函数
2. 在 `src/vectors.c` 中实现
3. 在中断向量表中注册

### 添加源文件
1. 将文件放入 `src` 目录
2. 修改 Makefile，添加到源文件列表

## 许可证

本模板代码采用 MIT 许可证。
