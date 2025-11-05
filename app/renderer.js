/**
 * ZSide4CD 渲染进程
 * 
 * 处理UI交互和业务逻辑
 */

const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// 全局状态
let currentProject = null;
let config = null;

/**
 * 初始化应用
 */
function initApp() {
  console.log('初始化 ZSide4CD 渲染进程');
  
  // 加载配置
  config = ipcRenderer.sendSync('get-config');
  console.log('配置已加载:', config);
  
  // 绑定事件
  bindEvents();
  
  // 监听菜单命令
  ipcRenderer.on('menu-command', (event, command) => {
    handleMenuCommand(command);
  });
  
  console.log('应用初始化完成');
}

/**
 * 绑定事件
 */
function bindEvents() {
  // 工具栏按钮
  document.getElementById('btn-new-project').addEventListener('click', () => {
    handleMenuCommand('new-project');
  });
  
  document.getElementById('btn-open-project').addEventListener('click', () => {
    handleMenuCommand('open-project');
  });
  
  document.getElementById('btn-save').addEventListener('click', () => {
    handleMenuCommand('save');
  });
  
  document.getElementById('btn-build').addEventListener('click', () => {
    handleMenuCommand('build');
  });
  
  document.getElementById('btn-debug').addEventListener('click', () => {
    handleMenuCommand('start-debug');
  });
  
  document.getElementById('btn-flash').addEventListener('click', () => {
    handleMenuCommand('flash');
  });
  
  // 侧边栏按钮
  const btnOpenSidebar = document.getElementById('btn-open-sidebar');
  if (btnOpenSidebar) {
    btnOpenSidebar.addEventListener('click', () => {
      handleMenuCommand('open-project');
    });
  }
  
  // 清除输出按钮
  document.getElementById('btn-clear-output').addEventListener('click', () => {
    clearOutput();
  });
  
  // 欢迎屏幕链接
  const linkNewStm32 = document.getElementById('link-new-stm32');
  if (linkNewStm32) {
    linkNewStm32.addEventListener('click', (e) => {
      e.preventDefault();
      createNewProject('stm32f429');
    });
  }
  
  const linkNewC67xx = document.getElementById('link-new-c67xx');
  if (linkNewC67xx) {
    linkNewC67xx.addEventListener('click', (e) => {
      e.preventDefault();
      createNewProject('ti_c67xx');
    });
  }
  
  const linkOpenProject = document.getElementById('link-open-project');
  if (linkOpenProject) {
    linkOpenProject.addEventListener('click', (e) => {
      e.preventDefault();
      handleMenuCommand('open-project');
    });
  }
}

/**
 * 处理菜单命令
 */
function handleMenuCommand(command) {
  console.log('执行命令:', command);
  
  switch (command) {
    case 'new-project':
      showNewProjectDialog();
      break;
    case 'open-project':
      openProject();
      break;
    case 'save':
      saveCurrentFile();
      break;
    case 'save-all':
      saveAllFiles();
      break;
    case 'build':
      buildProject();
      break;
    case 'rebuild':
      rebuildProject();
      break;
    case 'clean':
      cleanProject();
      break;
    case 'start-debug':
      startDebug();
      break;
    case 'stop-debug':
      stopDebug();
      break;
    case 'flash':
      flashProgram();
      break;
    case 'toolchain-manager':
      showToolchainManager();
      break;
    case 'settings':
      showSettings();
      break;
    default:
      console.log('未知命令:', command);
  }
}

/**
 * 显示新建项目对话框
 */
function showNewProjectDialog() {
  // 简化版本：直接选择处理器类型
  const processorType = prompt('请选择处理器类型:\n1 - STM32F429\n2 - TI C67XX');
  
  if (processorType === '1') {
    createNewProject('stm32f429');
  } else if (processorType === '2') {
    createNewProject('ti_c67xx');
  }
}

/**
 * 创建新项目
 */
function createNewProject(processorType) {
  logOutput(`创建新项目: ${processorType}`);
  updateStatus(`正在创建 ${processorType} 项目...`);
  
  // TODO: 实现实际的项目创建逻辑
  logOutput('项目创建功能正在开发中...');
  updateStatus('就绪');
}

/**
 * 打开项目
 */
function openProject() {
  logOutput('打开项目...');
  
  ipcRenderer.send('show-open-dialog', {
    title: '打开项目',
    properties: ['openDirectory']
  });
  
  ipcRenderer.once('open-dialog-result', (event, result) => {
    if (!result.canceled && result.filePaths.length > 0) {
      const projectPath = result.filePaths[0];
      loadProject(projectPath);
    }
  });
}

/**
 * 加载项目
 */
function loadProject(projectPath) {
  logOutput(`加载项目: ${projectPath}`);
  updateStatus('正在加载项目...');
  
  try {
    // 检查项目配置文件
    const configPath = path.join(projectPath, '.zside', 'project.json');
    
    if (fs.existsSync(configPath)) {
      const projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      currentProject = {
        path: projectPath,
        config: projectConfig
      };
      
      logOutput(`项目加载成功: ${projectConfig.name}`);
      updateStatus(`项目: ${projectConfig.name}`);
      updateProjectTree(projectPath);
      updateProcessorStatus(projectConfig.processorType);
      
      // 隐藏欢迎屏幕
      document.querySelector('.welcome-screen').style.display = 'none';
    } else {
      logOutput('错误: 未找到项目配置文件', 'error');
      updateStatus('就绪');
    }
  } catch (error) {
    logOutput(`错误: ${error.message}`, 'error');
    updateStatus('就绪');
  }
}

/**
 * 更新项目树
 */
function updateProjectTree(projectPath) {
  const projectTree = document.getElementById('project-tree');
  projectTree.innerHTML = '<div class="project-item">📁 ' + path.basename(projectPath) + '</div>';
}

/**
 * 构建项目
 */
function buildProject() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  logOutput('=== 开始构建 ===');
  updateStatus('正在构建...');
  
  // TODO: 实现实际的构建逻辑
  setTimeout(() => {
    logOutput('构建功能正在开发中...');
    logOutput('=== 构建完成 ===');
    updateStatus('构建完成');
  }, 1000);
}

/**
 * 重新构建项目
 */
function rebuildProject() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  logOutput('=== 开始重新构建 ===');
  cleanProject();
  buildProject();
}

/**
 * 清理项目
 */
function cleanProject() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  logOutput('清理构建文件...');
  updateStatus('正在清理...');
  
  // TODO: 实现实际的清理逻辑
  setTimeout(() => {
    logOutput('清理完成');
    updateStatus('就绪');
  }, 500);
}

/**
 * 启动调试
 */
function startDebug() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  logOutput('=== 启动调试 ===');
  updateStatus('正在调试...');
  
  // TODO: 实现实际的调试逻辑
  logOutput('调试功能正在开发中...');
}

/**
 * 停止调试
 */
function stopDebug() {
  logOutput('停止调试');
  updateStatus('就绪');
}

/**
 * 烧录程序
 */
function flashProgram() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  logOutput('=== 开始烧录程序 ===');
  updateStatus('正在烧录...');
  
  // TODO: 实现实际的烧录逻辑
  setTimeout(() => {
    logOutput('烧录功能正在开发中...');
    logOutput('=== 烧录完成 ===');
    updateStatus('烧录完成');
  }, 2000);
}

/**
 * 保存当前文件
 */
function saveCurrentFile() {
  logOutput('保存文件...');
  // TODO: 实现文件保存逻辑
}

/**
 * 保存所有文件
 */
function saveAllFiles() {
  logOutput('保存所有文件...');
  // TODO: 实现保存所有文件逻辑
}

/**
 * 显示工具链管理器
 */
function showToolchainManager() {
  logOutput('打开工具链管理器...');
  // TODO: 实现工具链管理器界面
}

/**
 * 显示设置
 */
function showSettings() {
  logOutput('打开设置...');
  // TODO: 实现设置界面
}

/**
 * 输出日志
 */
function logOutput(message, type = 'info') {
  const outputContent = document.getElementById('output-content');
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const pre = outputContent.querySelector('pre');
  
  let prefix = '';
  if (type === 'error') {
    prefix = '[错误] ';
  } else if (type === 'warning') {
    prefix = '[警告] ';
  } else if (type === 'success') {
    prefix = '[成功] ';
  }
  
  pre.textContent += `\n[${timestamp}] ${prefix}${message}`;
  outputContent.scrollTop = outputContent.scrollHeight;
}

/**
 * 清除输出
 */
function clearOutput() {
  const outputContent = document.getElementById('output-content');
  const pre = outputContent.querySelector('pre');
  pre.textContent = '就绪';
}

/**
 * 更新状态栏
 */
function updateStatus(text) {
  document.getElementById('status-text').textContent = text;
}

/**
 * 更新处理器状态
 */
function updateProcessorStatus(processorType) {
  const processorNames = {
    'stm32f429': 'STM32F429',
    'ti_c67xx': 'TI C67XX'
  };
  
  document.getElementById('status-processor').textContent = 
    processorNames[processorType] || '未知处理器';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
