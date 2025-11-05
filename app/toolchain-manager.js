/**
 * ZSide4CD 工具链管理器
 * 
 * 负责检测、配置和管理工具链
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ToolchainManager {
  constructor() {
    this.toolchains = [];
    this.configPath = null;
  }

  /**
   * 初始化工具链管理器
   */
  initialize(appDataPath) {
    this.configPath = path.join(appDataPath, 'toolchains.json');
    this.loadToolchains();
    console.log('工具链管理器已初始化');
  }

  /**
   * 加载已配置的工具链
   */
  loadToolchains() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        this.toolchains = data.toolchains || [];
        console.log(`已加载 ${this.toolchains.length} 个工具链配置`);
      } else {
        this.toolchains = [];
        console.log('未找到工具链配置文件，使用默认配置');
      }
    } catch (error) {
      console.error('加载工具链配置失败:', error);
      this.toolchains = [];
    }
  }

  /**
   * 保存工具链配置
   */
  saveToolchains() {
    try {
      const data = {
        toolchains: this.toolchains
      };
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
      console.log('工具链配置已保存');
      return true;
    } catch (error) {
      console.error('保存工具链配置失败:', error);
      return false;
    }
  }

  /**
   * 自动检测系统中已安装的工具链
   */
  detectToolchains() {
    console.log('开始自动检测工具链...');
    const detected = [];

    // 检测 ARM GCC
    const armGccPaths = this.detectARMGCC();
    detected.push(...armGccPaths);

    // 检测 TI CGT
    const tiCgtPaths = this.detectTICGT();
    detected.push(...tiCgtPaths);

    console.log(`检测到 ${detected.length} 个工具链`);
    
    // 合并新检测到的工具链
    detected.forEach(newToolchain => {
      const exists = this.toolchains.find(tc => 
        tc.path === newToolchain.path && tc.type === newToolchain.type
      );
      
      if (!exists) {
        this.toolchains.push(newToolchain);
        console.log(`添加新工具链: ${newToolchain.name}`);
      }
    });

    this.saveToolchains();
    return detected;
  }

  /**
   * 检测 ARM GCC 工具链
   */
  detectARMGCC() {
    const detected = [];
    
    // Windows 常见安装路径
    const searchPaths = [
      'C:\\Program Files (x86)\\GNU Arm Embedded Toolchain',
      'C:\\Program Files\\GNU Arm Embedded Toolchain',
      'C:\\ARM',
      'C:\\Tools\\ARM'
    ];

    // 搜索环境变量 PATH
    const pathEnv = process.env.PATH || '';
    const pathDirs = pathEnv.split(path.delimiter);
    
    pathDirs.forEach(dir => {
      if (dir.toLowerCase().includes('arm') || dir.toLowerCase().includes('gcc')) {
        searchPaths.push(dir);
      }
    });

    // 检查每个路径
    searchPaths.forEach(basePath => {
      try {
        if (!fs.existsSync(basePath)) return;

        // 检查是否为 ARM GCC 目录
        const gccPath = this.findArmGccExecutable(basePath);
        if (gccPath) {
          const version = this.getToolchainVersion(gccPath);
          
          detected.push({
            id: `arm-gcc-${version.replace(/\./g, '-')}`,
            name: `ARM GCC ${version}`,
            type: 'arm-gcc',
            path: path.dirname(gccPath),
            version: version,
            compiler: 'arm-none-eabi-gcc.exe',
            linker: 'arm-none-eabi-ld.exe',
            debugger: 'arm-none-eabi-gdb.exe',
            detected: true
          });
        }
      } catch (error) {
        // 忽略检测错误，继续检查其他路径
      }
    });

    return detected;
  }

  /**
   * 在目录中查找 ARM GCC 可执行文件
   */
  findArmGccExecutable(basePath) {
    const possibleNames = [
      'arm-none-eabi-gcc.exe',
      'bin\\arm-none-eabi-gcc.exe'
    ];

    for (const name of possibleNames) {
      const fullPath = path.join(basePath, name);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    // 递归搜索子目录（最多2层）
    try {
      const subdirs = fs.readdirSync(basePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const subdir of subdirs) {
        for (const name of possibleNames) {
          const fullPath = path.join(basePath, subdir, name);
          if (fs.existsSync(fullPath)) {
            return fullPath;
          }
        }
      }
    } catch (error) {
      // 忽略目录读取错误
    }

    return null;
  }

  /**
   * 检测 TI CGT 工具链
   */
  detectTICGT() {
    const detected = [];
    
    // Windows 常见安装路径
    const searchPaths = [
      'C:\\ti\\ccs\\tools\\compiler',
      'C:\\TI\\ccs\\tools\\compiler',
      'C:\\Program Files\\Texas Instruments',
      'C:\\Program Files (x86)\\Texas Instruments'
    ];

    searchPaths.forEach(basePath => {
      try {
        if (!fs.existsSync(basePath)) return;

        // 查找 C6000 编译器
        const c6000Dirs = fs.readdirSync(basePath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .filter(dirent => dirent.name.includes('ti-cgt-c6000'))
          .map(dirent => dirent.name);

        c6000Dirs.forEach(dirName => {
          const compilerPath = path.join(basePath, dirName, 'bin', 'cl6x.exe');
          if (fs.existsSync(compilerPath)) {
            const version = dirName.match(/(\d+\.\d+\.\d+)/);
            const versionStr = version ? version[1] : '未知';
            
            detected.push({
              id: `ti-cgt-${versionStr.replace(/\./g, '-')}`,
              name: `TI CGT C6000 ${versionStr}`,
              type: 'ti-cgt',
              path: path.join(basePath, dirName, 'bin'),
              version: versionStr,
              compiler: 'cl6x.exe',
              linker: 'lnk6x.exe',
              debugger: 'cg_xml.exe',
              detected: true
            });
          }
        });
      } catch (error) {
        // 忽略检测错误
      }
    });

    return detected;
  }

  /**
   * 获取工具链版本
   */
  getToolchainVersion(executablePath) {
    try {
      const output = execSync(`"${executablePath}" --version`, {
        encoding: 'utf8',
        timeout: 5000
      });
      
      // 提取版本号
      const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        return versionMatch[1];
      }
    } catch (error) {
      console.error('获取工具链版本失败:', error.message);
    }
    
    return '未知';
  }

  /**
   * 验证工具链是否有效
   */
  validateToolchain(toolchain) {
    try {
      const compilerPath = path.join(toolchain.path, toolchain.compiler);
      
      if (!fs.existsSync(compilerPath)) {
        return {
          valid: false,
          error: '未找到编译器可执行文件'
        };
      }

      // 尝试运行编译器获取版本
      try {
        execSync(`"${compilerPath}" --version`, {
          timeout: 5000,
          stdio: 'pipe'
        });
        
        return {
          valid: true,
          error: null
        };
      } catch (error) {
        return {
          valid: false,
          error: '编译器无法运行'
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * 添加工具链
   */
  addToolchain(toolchain) {
    // 验证工具链
    const validation = this.validateToolchain(toolchain);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // 检查是否已存在
    const exists = this.toolchains.find(tc => 
      tc.path === toolchain.path && tc.type === toolchain.type
    );

    if (exists) {
      return {
        success: false,
        error: '工具链已存在'
      };
    }

    // 添加工具链
    this.toolchains.push(toolchain);
    this.saveToolchains();

    return {
      success: true,
      toolchain: toolchain
    };
  }

  /**
   * 移除工具链
   */
  removeToolchain(toolchainId) {
    const index = this.toolchains.findIndex(tc => tc.id === toolchainId);
    
    if (index === -1) {
      return {
        success: false,
        error: '未找到工具链'
      };
    }

    this.toolchains.splice(index, 1);
    this.saveToolchains();

    return {
      success: true
    };
  }

  /**
   * 获取所有工具链
   */
  getToolchains() {
    return this.toolchains;
  }

  /**
   * 根据类型获取工具链
   */
  getToolchainsByType(type) {
    return this.toolchains.filter(tc => tc.type === type);
  }

  /**
   * 根据ID获取工具链
   */
  getToolchainById(id) {
    return this.toolchains.find(tc => tc.id === id);
  }

  /**
   * 为项目选择最佳工具链
   */
  selectBestToolchain(processorType) {
    let toolchainType = '';
    
    // 根据处理器类型映射工具链类型
    if (processorType === 'stm32f429') {
      toolchainType = 'arm-gcc';
    } else if (processorType === 'ti_c67xx') {
      toolchainType = 'ti-cgt';
    }

    const availableToolchains = this.getToolchainsByType(toolchainType);
    
    if (availableToolchains.length === 0) {
      return null;
    }

    // 返回第一个有效的工具链
    for (const toolchain of availableToolchains) {
      const validation = this.validateToolchain(toolchain);
      if (validation.valid) {
        return toolchain;
      }
    }

    return null;
  }
}

module.exports = ToolchainManager;
