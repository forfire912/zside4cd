# ZSide4CD 测试文档 (Testing Document)

## 1. 测试策略 (Testing Strategy)

### 1.1 测试目标 (Testing Objectives)
- 验证所有功能需求的正确实现
- 确保系统稳定性和可靠性
- 验证性能指标满足要求
- 确保用户体验符合预期
- 验证 Windows 10/11 兼容性

### 1.2 测试范围 (Testing Scope)
- 单元测试：模块级别的功能测试
- 集成测试：模块间交互测试
- 系统测试：端到端功能测试
- 性能测试：响应时间和资源使用
- 兼容性测试：Windows 10/11 兼容性

### 1.3 测试方法 (Testing Methods)
- 自动化测试：使用测试框架进行自动化
- 手动测试：界面和用户体验测试
- 回归测试：确保修改不影响已有功能
- 压力测试：验证系统在高负载下的表现

## 2. 单元测试 (Unit Testing)

### 2.1 项目管理模块测试

#### 测试用例 UT-PM-001: 创建STM32项目
```typescript
describe('ProjectManager', () => {
  test('should create STM32F429 project', () => {
    const manager = new ProjectManager();
    const project = manager.createProject(
      ProjectType.EXECUTABLE,
      'TestProject',
      'C:\\Projects\\TestProject'
    );
    
    expect(project).toBeDefined();
    expect(project.name).toBe('TestProject');
    expect(project.processorType).toBe(ProcessorType.STM32F429);
  });
});
```

**预期结果**: 成功创建项目，配置文件正确生成

#### 测试用例 UT-PM-002: 打开现有项目
```typescript
test('should open existing project', () => {
  const manager = new ProjectManager();
  const project = manager.openProject('C:\\Projects\\ExistingProject');
  
  expect(project).toBeDefined();
  expect(project.name).toBe('ExistingProject');
});
```

**预期结果**: 成功加载项目配置

### 2.2 工具链管理模块测试

#### 测试用例 UT-TC-001: 检测ARM GCC工具链
```typescript
describe('ToolchainManager', () => {
  test('should detect ARM GCC toolchain on Windows', () => {
    const manager = new ToolchainManager();
    const toolchains = manager.detectToolchains();
    
    const armGcc = toolchains.find(t => t.type === ToolchainType.ARM_GCC);
    expect(armGcc).toBeDefined();
    expect(armGcc.version).toMatch(/\d+\.\d+\.\d+/);
    expect(armGcc.compiler).toContain('.exe');
  });
});
```

**预期结果**: 成功检测到已安装的ARM GCC

#### 测试用例 UT-TC-002: 验证工具链有效性
```typescript
test('should validate toolchain', () => {
  const manager = new ToolchainManager();
  const toolchain = createTestToolchain();
  
  const isValid = manager.validateToolchain(toolchain);
  
  expect(isValid).toBe(true);
});
```

**预期结果**: 工具链验证通过

### 2.3 构建系统模块测试

#### 测试用例 UT-BS-001: 编译单个文件
```typescript
describe('BuildSystem', () => {
  test('should compile single source file', () => {
    const buildSystem = new BuildSystem();
    const project = createTestProject();
    const config = createBuildConfig();
    
    const result = buildSystem.build(project, config);
    
    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
```

**预期结果**: 编译成功，无错误

#### 测试用例 UT-BS-002: 处理编译错误
```typescript
test('should handle compile errors', () => {
  const buildSystem = new BuildSystem();
  const project = createProjectWithErrors();
  const config = createBuildConfig();
  
  const result = buildSystem.build(project, config);
  
  expect(result.success).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});
```

**预期结果**: 正确识别和报告编译错误

## 3. 集成测试 (Integration Testing)

### 3.1 项目创建到构建流程

#### 测试用例 IT-001: STM32项目完整流程
```typescript
describe('STM32 Integration', () => {
  test('complete workflow from creation to build', async () => {
    // 1. 创建项目
    const projectManager = new ProjectManager();
    const project = projectManager.createProject(
      ProjectType.EXECUTABLE,
      'STM32Test',
      'C:\\Projects\\STM32Test'
    );
    
    // 2. 选择工具链
    const toolchainManager = new ToolchainManager();
    const toolchains = toolchainManager.detectToolchains();
    const armGcc = toolchains.find(t => t.type === ToolchainType.ARM_GCC);
    toolchainManager.selectToolchain(project, armGcc);
    
    // 3. 构建项目
    const buildSystem = new BuildSystem();
    const buildConfig = createBuildConfig();
    const result = buildSystem.build(project, buildConfig);
    
    expect(result.success).toBe(true);
    expect(fs.existsSync(result.outputFile)).toBe(true);
  });
});
```

**预期结果**: 完整流程成功执行

#### 测试用例 IT-002: C67XX项目完整流程
```typescript
test('complete workflow for C67XX project', async () => {
  // 1. 创建C67XX项目
  const projectManager = new ProjectManager();
  const project = projectManager.createProject(
    ProjectType.EXECUTABLE,
    'C67XXTest',
    'C:\\Projects\\C67XXTest'
  );
  project.processorType = ProcessorType.TI_C67XX;
  
  // 2. 选择TI工具链
  const toolchainManager = new ToolchainManager();
  const toolchains = toolchainManager.detectToolchains();
  const tiCgt = toolchains.find(t => t.type === ToolchainType.TI_CGT);
  toolchainManager.selectToolchain(project, tiCgt);
  
  // 3. 构建项目
  const buildSystem = new BuildSystem();
  const result = buildSystem.build(project, createBuildConfig());
  
  expect(result.success).toBe(true);
});
```

**预期结果**: C67XX项目流程成功

## 4. 系统测试 (System Testing)

### 4.1 功能测试 (Functional Testing)

#### 测试用例 ST-F-001: 中文界面显示
**测试步骤**:
1. 启动IDE
2. 检查所有菜单项
3. 打开各个对话框
4. 查看提示信息

**预期结果**: 所有界面元素正确显示中文

#### 测试用例 ST-F-002: STM32项目创建
**测试步骤**:
1. 选择"文件" -> "新建项目"
2. 选择"STM32F429"处理器
3. 选择项目模板
4. 输入项目名称和路径
5. 点击"创建"

**预期结果**: 项目创建成功，包含所有必要文件

#### 测试用例 ST-F-003: 代码编辑功能
**测试步骤**:
1. 打开源文件
2. 输入代码
3. 测试语法高亮
4. 测试代码补全
5. 测试智能提示

**预期结果**: 所有编辑功能正常工作

#### 测试用例 ST-F-004: 编译功能
**测试步骤**:
1. 打开STM32项目
2. 点击"构建"按钮
3. 查看构建输出
4. 检查生成的文件

**预期结果**: 编译成功，生成可执行文件

#### 测试用例 ST-F-005: 调试功能
**测试步骤**:
1. 连接开发板
2. 启动调试
3. 设置断点
4. 单步执行
5. 查看变量
6. 查看内存

**预期结果**: 调试功能正常，可以查看程序状态

#### 测试用例 ST-F-006: 烧录功能
**测试步骤**:
1. 连接开发板
2. 选择"烧录"功能
3. 等待烧录完成
4. 验证烧录结果

**预期结果**: 程序成功烧录到设备

#### 测试用例 ST-F-007: 工具链切换
**测试步骤**:
1. 打开项目设置
2. 切换到不同的工具链
3. 重新构建项目

**预期结果**: 工具链切换成功，构建使用新工具链

#### 测试用例 ST-F-008: 版权定制
**测试步骤**:
1. 打开设置
2. 修改产品名称
3. 修改版权信息
4. 修改Logo
5. 重启IDE
6. 检查"关于"对话框

**预期结果**: 自定义信息正确显示，包含VSCodium许可证声明

## 5. 性能测试 (Performance Testing)

### 5.1 启动性能测试

#### 测试用例 PT-001: IDE启动时间
**测试条件**:
- Windows 10/11
- 首次启动 vs 后续启动

**测试步骤**:
1. 记录启动时间
2. 多次测试取平均值

**性能指标**: 
- 首次启动: < 8秒
- 后续启动: < 5秒

#### 测试用例 PT-002: 内存占用
**测试步骤**:
1. 启动IDE
2. 打开项目
3. 监控内存使用
4. 执行各种操作

**性能指标**: 内存占用 < 500MB

### 5.2 编译性能测试

#### 测试用例 PT-003: 大型项目编译时间
**测试条件**:
- 项目文件数: 100+
- 代码行数: 10000+

**测试步骤**:
1. 完全构建项目
2. 记录编译时间
3. 修改单个文件
4. 记录增量编译时间

**性能指标**:
- 完全构建: < 60秒
- 增量编译: < 5秒

## 6. 兼容性测试 (Compatibility Testing)

### 6.1 操作系统兼容性

#### 测试用例 CT-OS-001: Windows 10兼容性
**测试平台**:
- Windows 10 Home (64-bit) - 最新版本
- Windows 10 Pro (64-bit) - 最新版本

**测试内容**: 所有功能测试用例

**预期结果**: 所有功能正常工作

#### 测试用例 CT-OS-002: Windows 11兼容性
**测试平台**:
- Windows 11 Home (64-bit)
- Windows 11 Pro (64-bit)

**测试内容**: 所有功能测试用例

**预期结果**: 所有功能正常工作

### 6.2 工具链兼容性

#### 测试用例 CT-TC-001: ARM GCC版本兼容性
**测试版本**:
- ARM GCC 9.x
- ARM GCC 10.x
- ARM GCC 11.x

**测试内容**: 编译、链接、调试功能

**预期结果**: 所有版本正常工作

#### 测试用例 CT-TC-002: TI CGT版本兼容性
**测试版本**:
- TI CGT 8.x
- TI CGT 9.x

**测试内容**: 编译、链接、调试功能

**预期结果**: 所有版本正常工作

## 7. 测试环境 (Test Environment)

### 7.1 硬件环境
- **测试主机**: 
  - CPU: Intel Core i7 或 AMD Ryzen 7
  - 内存: 16GB RAM
  - 硬盘: 256GB SSD
  - OS: Windows 10/11 Pro (64-bit)
  
- **目标硬件**:
  - STM32F429 开发板
  - TI C67XX DSP 开发板
  - 调试器: ST-Link V2, J-Link

### 7.2 软件环境
- **操作系统**: Windows 10/11 (64-bit)
- **工具链**:
  - ARM GCC 10.3.1
  - TI CGT 8.3.0
- **调试工具**:
  - OpenOCD
  - TI CCS

### 7.3 测试工具
- **单元测试**: Jest
- **集成测试**: Mocha
- **界面测试**: Spectron
- **性能测试**: Windows Performance Monitor
- **代码覆盖率**: Istanbul

## 8. 测试数据 (Test Data)

### 8.1 测试项目
- **STM32基础项目**: LED闪烁示例
- **STM32复杂项目**: 包含HAL库和中间件
- **C67XX基础项目**: DSP算法示例
- **C67XX复杂项目**: 完整的信号处理应用

### 8.2 测试代码
```c
// STM32测试代码 - main.c
#include "stm32f4xx_hal.h"

void SystemClock_Config(void);
static void MX_GPIO_Init(void);

int main(void) {
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();
  
  while (1) {
    HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_0);
    HAL_Delay(500);
  }
}
```

```c
// C67XX测试代码 - main.c
#include <stdio.h>

#define BUFFER_SIZE 256

void dsp_fft(float *input, float *output, int size);

int main() {
  float input[BUFFER_SIZE];
  float output[BUFFER_SIZE];
  
  // 初始化输入数据
  for (int i = 0; i < BUFFER_SIZE; i++) {
    input[i] = i * 1.0f;
  }
  
  // 执行FFT
  dsp_fft(input, output, BUFFER_SIZE);
  
  printf("FFT completed\n");
  return 0;
}
```

## 9. 缺陷管理 (Defect Management)

### 9.1 缺陷等级
- **严重 (Critical)**: 系统崩溃、数据丢失
- **高 (High)**: 核心功能无法使用
- **中 (Medium)**: 部分功能受限
- **低 (Low)**: 界面问题、小错误

### 9.2 缺陷报告模板
```
缺陷ID: BUG-001
标题: [模块] 简短描述
等级: Critical/High/Medium/Low
状态: Open/In Progress/Resolved/Closed

描述:
详细的问题描述

重现步骤:
1. 步骤1
2. 步骤2
3. ...

预期结果:
应该发生什么

实际结果:
实际发生了什么

环境:
- OS: Windows 10/11
- IDE版本: v1.0.0
- 工具链: ARM GCC 10.3.1

附件:
截图、日志文件等
```

## 10. 测试报告 (Test Report)

### 10.1 测试摘要
- 测试开始日期: YYYY-MM-DD
- 测试结束日期: YYYY-MM-DD
- 测试人员: 测试团队
- 测试版本: v1.0.0

### 10.2 测试统计
- 计划测试用例数: 100
- 执行测试用例数: 100
- 通过测试用例数: 95
- 失败测试用例数: 5
- 测试通过率: 95%

### 10.3 缺陷统计
- 发现缺陷总数: 20
- 严重缺陷: 0
- 高优先级缺陷: 2
- 中优先级缺陷: 8
- 低优先级缺陷: 10
- 已修复缺陷: 18
- 待修复缺陷: 2

### 10.4 测试结论
根据测试结果，ZSide4CD IDE基本满足需求规格说明，主要功能正常工作，性能指标达到预期。在Windows 10/11上运行稳定。建议修复剩余缺陷后发布。

## 11. 验收测试 (Acceptance Testing)

### 11.1 验收标准
- [ ] 所有高优先级测试用例通过
- [ ] 测试通过率 >= 95%
- [ ] 无严重缺陷
- [ ] 性能指标满足要求
- [ ] Windows 10/11兼容性验证通过
- [ ] 文档完整
- [ ] 开源协议遵守正确

### 11.2 验收签字
- 开发负责人: ____________ 日期: ______
- 测试负责人: ____________ 日期: ______
- 项目经理: ____________ 日期: ______
- 用户代表: ____________ 日期: ______
