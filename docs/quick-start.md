# ZSide4CD 快速开始指南

欢迎使用ZSide4CD！本指南将帮助您快速上手这款专为嵌入式开发设计的中文化IDE。

## 系统要求

- **操作系统**: Windows 10 (1809+) 或 Windows 11
- **内存**: 至少4GB RAM（推荐8GB）
- **硬盘**: 2GB可用空间（不含工具链）
- **显示器**: 1366x768或更高分辨率

## 安装步骤

### 1. 安装ZSide4CD

1. 下载ZSide4CD安装包
2. 双击运行安装程序
3. 按照安装向导完成安装
4. 启动ZSide4CD

### 2. 安装工具链

#### STM32开发工具链

**ARM GCC编译器**（推荐直接集成）
```
ZSide4CD支持直接集成ARM GCC工具链，无需单独安装。
如已安装，IDE会自动检测。
```

常见安装路径：
- `C:\Program Files (x86)\GNU Arm Embedded Toolchain`
- `C:\Program Files\GNU Arm Embedded Toolchain`

**调试烧录工具**
1. **ST-Link Utility**: 用于STM32烧录
   - 下载地址: https://www.st.com/en/development-tools/stsw-link004.html
   - 安装后IDE会自动检测

2. **OpenOCD**: 开源调试工具
   - 使用winget安装: `winget install OpenOCD`
   - 或下载: https://openocd.org/

#### TI C67XX开发工具链

**TI CGT C6000编译器**
1. 下载Code Composer Studio (CCS)
   - 下载地址: https://www.ti.com/tool/CCSTUDIO
2. 安装时选择C6000编译器组件
3. 使用IDE的图形化配置工具配置工具链路径

常见安装路径：
- `C:\ti\ccs\tools\compiler\ti-cgt-c6000_X.X.X`
- `C:\ti\ccs1200\ccs\tools\compiler\ti-cgt-c6000_X.X.X`

**调试工具**
- TI XDS仿真器
- Code Composer Studio调试组件

## 第一个项目

### 创建STM32项目

1. **启动IDE并创建新项目**
   - 点击"文件 > 新建项目"
   - 或点击欢迎屏幕的"新建STM32F429项目"

2. **配置项目**
   ```
   项目名称: MyFirstSTM32
   处理器: STM32F429
   位置: C:\Projects\MyFirstSTM32
   ```

3. **编写代码**
   
   打开`src/main.c`，编写LED闪烁程序：
   ```c
   #include "stm32f4xx.h"
   
   int main(void)
   {
       // 初始化HAL库
       HAL_Init();
       
       // 配置LED引脚
       __HAL_RCC_GPIOG_CLK_ENABLE();
       GPIO_InitTypeDef GPIO_InitStruct = {0};
       GPIO_InitStruct.Pin = GPIO_PIN_13;
       GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
       GPIO_InitStruct.Pull = GPIO_NOPULL;
       GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
       HAL_GPIO_Init(GPIOG, &GPIO_InitStruct);
       
       // 主循环
       while(1)
       {
           HAL_GPIO_TogglePin(GPIOG, GPIO_PIN_13);
           HAL_Delay(500);
       }
   }
   ```

4. **构建项目**
   - 点击工具栏的"构建"按钮（锤子图标）
   - 或使用快捷键 `F7`
   - 查看输出面板的构建日志

5. **烧录程序**
   - 连接ST-Link到STM32开发板
   - 点击"烧录"按钮（闪电图标）
   - 等待烧录完成

6. **调试程序**
   - 点击"调试"按钮（虫子图标）
   - 或使用快捷键 `F5`
   - 使用调试工具栏控制程序执行

### 创建C67XX项目

1. **创建新项目**
   - 点击"文件 > 新建项目"
   - 选择"TI C67XX DSP"处理器类型

2. **配置TI CGT工具链**
   - 点击"工具 > 工具链配置"
   - 选择"自动检测TI CGT"或手动配置
   - 验证工具链路径

3. **编写DSP代码**
   
   打开`src/main.c`：
   ```c
   #include <stdio.h>
   
   void FIR_Filter(float *input, float *output, 
                   float *coeffs, int length, int numTaps)
   {
       int i, j;
       for(i = 0; i < length; i++)
       {
           output[i] = 0.0f;
           for(j = 0; j < numTaps; j++)
           {
               if(i - j >= 0)
                   output[i] += input[i - j] * coeffs[j];
           }
       }
   }
   
   int main(void)
   {
       printf("TI C67XX DSP 启动\n");
       
       // DSP信号处理代码
       float input[128], output[128];
       float coeffs[8] = {0.1f, 0.2f, 0.3f, 0.2f, 
                          0.1f, 0.05f, 0.03f, 0.02f};
       
       // 应用FIR滤波器
       FIR_Filter(input, output, coeffs, 128, 8);
       
       return 0;
   }
   ```

4. **构建和运行**
   - 构建项目（F7）
   - 使用CCS加载程序到DSP
   - 或使用UniFlash烧录

## IDE界面导览

### 主要区域

```
┌─────────────────────────────────────────────────┐
│ 菜单栏: 文件 编辑 构建 调试 工具 帮助            │
├─────────────────────────────────────────────────┤
│ 工具栏: [新建] [打开] [保存] [构建] [调试] [烧录] │
├──────┬──────────────────────────────────────────┤
│      │                                          │
│ 项目 │         代码编辑器                       │
│ 浏览 │                                          │
│ 器   │                                          │
│      │                                          │
├──────┴──────────────────────────────────────────┤
│ 输出面板: 构建输出、调试信息                     │
├─────────────────────────────────────────────────┤
│ 状态栏: 处理器 | 工具链 | 行:列                 │
└─────────────────────────────────────────────────┘
```

### 菜单功能

**文件菜单**
- 新建项目: 创建STM32或C67XX项目
- 打开项目: 打开现有项目
- 保存: 保存当前文件
- 退出: 关闭IDE

**编辑菜单**
- 撤销/重做
- 剪切/复制/粘贴
- 查找/替换

**构建菜单**
- 构建项目: 编译当前项目
- 重新构建: 清理后重新编译
- 清理: 删除构建文件

**调试菜单**
- 启动调试: 开始调试会话
- 停止调试: 结束调试
- 烧录程序: 将程序烧录到硬件

**工具菜单**
- 工具链管理: 配置编译工具链
- 设置: IDE全局设置

## 常用快捷键

| 功能 | 快捷键 |
|------|--------|
| 新建项目 | Ctrl+Shift+N |
| 打开项目 | Ctrl+O |
| 保存 | Ctrl+S |
| 全部保存 | Ctrl+K S |
| 构建 | F7 |
| 调试 | F5 |
| 查找 | Ctrl+F |
| 替换 | Ctrl+H |
| 撤销 | Ctrl+Z |
| 重做 | Ctrl+Y |

## 工具链配置

### 自动检测工具链

1. 点击"工具 > 工具链管理"
2. 点击"自动检测所有工具链"
3. IDE会搜索常见安装路径
4. 查看检测结果

### 手动配置工具链

**配置ARM GCC**
1. 工具 > 工具链管理
2. 添加ARM GCC工具链
3. 设置工具链路径
4. 验证配置

**配置TI CGT（图形界面）**
1. 工具 > 工具链配置
2. 点击"自动检测"或"浏览"选择路径
3. 输入工具链名称和版本
4. 点击"验证"检查配置
5. 保存配置

## 故障排除

### 问题1: 找不到工具链

**解决方案**:
1. 确认工具链已正确安装
2. 使用"工具 > 工具链配置"手动配置
3. 将工具链路径添加到系统环境变量PATH

### 问题2: 构建失败

**检查清单**:
- [ ] 工具链配置正确
- [ ] 项目路径不包含中文或特殊字符
- [ ] 源文件没有语法错误
- [ ] 查看输出面板的详细错误信息

### 问题3: 无法连接调试器

**解决方案**:
1. 检查ST-Link/XDS物理连接
2. 安装USB驱动程序
3. 确认调试器在设备管理器中正常识别
4. 重启IDE和重新连接调试器

### 问题4: 烧录失败

**解决方案**:
1. 先构建项目，确保生成烧录文件
2. 检查目标设备供电
3. 确认烧录工具已安装
4. 尝试使用不同的烧录工具

## 进阶功能

### 项目模板

IDE提供基础项目模板：
- **STM32模板**: 包含HAL库初始化和LED闪烁示例
- **C67XX模板**: 包含FIR滤波器示例

### 构建配置

可以自定义编译选项：
- 优化级别（-O0, -O2, -O3）
- 调试信息生成
- 链接脚本配置
- 预处理器定义

### 调试功能

- 断点设置
- 单步执行
- 变量查看
- 内存查看
- GDB命令行（高级）

## 获取帮助

### 文档资源

- **用户手册**: docs/user-guide.md
- **TI CGT配置指南**: docs/ti-cgt-config-guide.md
- **工具链集成方案**: docs/toolchain-integration.md
- **设计文档**: docs/design.md

### 在线资源

- GitHub Issues: 报告bug和功能请求
- 示例项目: examples/目录

### 社区支持

遇到问题？
1. 查看文档和FAQ
2. 搜索已有的Issues
3. 创建新的Issue描述问题
4. 包含详细信息：系统版本、错误日志、重现步骤

## 下一步

恭喜！您已经掌握了ZSide4CD的基本使用。

**继续学习**:
1. 阅读完整的用户手册
2. 探索示例项目
3. 学习高级调试技巧
4. 自定义IDE设置

**开始开发**:
1. 创建您的第一个实际项目
2. 连接真实硬件测试
3. 构建更复杂的应用

祝您开发愉快！🚀
