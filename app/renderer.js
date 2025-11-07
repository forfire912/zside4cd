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
  
  // 监听构建输出
  ipcRenderer.on('build-output', (event, output) => {
    logOutput(output, 'build');
  });
  
  // 监听调试输出
  ipcRenderer.on('debug-output', (event, output) => {
    logOutput(output, 'debug');
  });
  
  // 监听烧录输出
  ipcRenderer.on('flash-output', (event, output) => {
    logOutput(output, 'flash');
  });
  
  console.log('应用初始化完成');
  
  // 监听主进程发送的工具链检测状态
  ipcRenderer.on('toolchains-status', (event, data) => {
    console.log('收到工具链检测状态:', data);
    if (data && Array.isArray(data.list)) {
      const statusElem = document.getElementById('status-toolchain');
      if (statusElem) {
        const first = data.list.find(item => item.valid) || data.list[0] || null;
        statusElem.textContent = first ? `${first.name} (${first.valid ? '可用' : '不可用'})` : '未配置工具链';
      }
    }
  });

  // 工具链面板相关
  const btnDetect = document.getElementById('btn-detect-toolchains');
  const btnRefresh = document.getElementById('btn-refresh-toolchains');
  const toolchainListElem = document.getElementById('toolchain-list');

  if (btnDetect) {
    btnDetect.addEventListener('click', () => {
      logOutput('开始检测工具链...');
      ipcRenderer.send('detect-toolchains');
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      refreshToolchainList();
    });
  }

  // 接收检测结果
  ipcRenderer.on('toolchains-detected', (event, detected) => {
    logOutput(`检测到 ${detected.length} 个工具链`);
    refreshToolchainList();
  });

  function refreshToolchainList() {
    const list = ipcRenderer.sendSync('get-toolchains') || [];
    while (toolchainListElem && toolchainListElem.firstChild) toolchainListElem.removeChild(toolchainListElem.firstChild);

    if (!list || list.length === 0) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = '未检测到工具链，点击“检测工具链”以开始。';
      toolchainListElem.appendChild(p);
      return;
    }

    list.forEach(tc => {
      const item = document.createElement('div');
      item.className = 'toolchain-item';
      
      // 信息区
      const info = document.createElement('div');
      info.className = 'toolchain-info';
      const title = document.createElement('div');
      title.innerHTML = `<strong>${tc.name}</strong> <span class="muted">(${tc.type})</span>`;
      const pth = document.createElement('div');
      pth.className = 'toolchain-path';
      pth.textContent = tc.path;
      info.appendChild(title);
      info.appendChild(pth);
      
      // 操作区按钮（使用图标）
       const btnValidate = document.createElement('button');
      btnValidate.innerHTML = '🔍 验证';
       btnValidate.addEventListener('click', () => {
         const res = ipcRenderer.sendSync('validate-toolchain', tc);
         logOutput(`${tc.name} 验证: ${res.valid ? '可用' : '不可用 - ' + res.error}`);
         refreshToolchainList();
       });
 
       const btnLocate = document.createElement('button');
      btnLocate.innerHTML = '📂 打开';
       btnLocate.addEventListener('click', () => {
         ipcRenderer.send('show-open-dialog', { title: '工具链目录', defaultPath: tc.path, properties: ['openDirectory'] });
       });
 
       const btnRemove = document.createElement('button');
      btnRemove.innerHTML = '🗑️ 移除';
       btnRemove.addEventListener('click', () => {
         const res = ipcRenderer.sendSync('remove-toolchain', tc.id);
         if (res.success) {
           logOutput(`已移除 ${tc.name}`);
           refreshToolchainList();
         } else {
           logOutput(`移除失败: ${res.error}`, 'error');
         }
       });
 
       const actions = document.createElement('div');
       actions.className = 'toolchain-actions-row';
       actions.appendChild(btnValidate);
       actions.appendChild(btnLocate);
       actions.appendChild(btnRemove);
 
      // 组合信息和操作到同一行
      item.appendChild(info);
      item.appendChild(actions);
      toolchainListElem.appendChild(item);
    });
  }

  // 初始刷新
  refreshToolchainList();

  // 手动添加工具链表单处理
  const btnAdd = document.getElementById('btn-add-toolchain');
  const tcPathInput = document.getElementById('tc-path');
  const tcPathBtn = document.createElement('button');
  tcPathBtn.textContent = '…';
  tcPathBtn.title = '选择目录';
  tcPathBtn.style.marginLeft = '6px';
  if (tcPathInput && tcPathInput.parentElement) {
    tcPathInput.parentElement.appendChild(tcPathBtn);
  }

  if (tcPathBtn) {
    tcPathBtn.addEventListener('click', async () => {
      const res = await ipcRenderer.invoke('choose-directory', { properties: ['openDirectory'] });
      if (res && !res.canceled && res.filePaths && res.filePaths.length) {
        tcPathInput.value = res.filePaths[0];
      }
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      const name = document.getElementById('tc-name').value.trim();
      const type = document.getElementById('tc-type').value;
      const p = document.getElementById('tc-path').value.trim();
      const compiler = document.getElementById('tc-compiler').value.trim();
      const linker = document.getElementById('tc-linker').value.trim();
      const debuggerExe = document.getElementById('tc-debugger').value.trim();

      if (!name || !p) {
        logOutput('请填写名称和路径', 'error');
        return;
      }

      const toolchain = {
        id: `${type}-${Date.now()}`,
        name: name,
        type: type,
        path: p,
        version: '未知',
        compiler: compiler || undefined,
        linker: linker || undefined,
        debugger: debuggerExe || undefined
      };

      const res = ipcRenderer.sendSync('add-toolchain', toolchain);
      if (res.success) {
        logOutput(`已添加工具链: ${name}`);
        refreshToolchainList();
      } else {
        logOutput(`添加工具链失败: ${res.error}`, 'error');
      }
    });
  }

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
      
      // 选择最佳工具链
      selectToolchainForProject(projectConfig.processorType);
      
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
 * 为项目选择工具链
 */
function selectToolchainForProject(processorType) {
  const toolchain = ipcRenderer.sendSync('select-best-toolchain', processorType);
  
  if (toolchain) {
    logOutput(`已选择工具链: ${toolchain.name}`);
    document.getElementById('status-toolchain').textContent = toolchain.name;
  } else {
    logOutput('警告: 未找到适合的工具链', 'warning');
    document.getElementById('status-toolchain').textContent = '未配置工具链';
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
async function buildProject() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  // 获取当前工具链
  const toolchain = ipcRenderer.sendSync('get-current-toolchain');
  if (!toolchain) {
    logOutput('错误: 未配置工具链，请先配置工具链', 'error');
    return;
  }
  
  logOutput('=== 开始构建 ===\n');
  updateStatus('正在构建...');
  
  try {
    const result = await ipcRenderer.invoke('build-project', currentProject, toolchain);
    
    if (result.success) {
      updateStatus('构建成功');
    } else {
      logOutput(`\n构建失败: ${result.error}`, 'error');
      updateStatus('构建失败');
    }
  } catch (error) {
    logOutput(`构建错误: ${error.message}`, 'error');
    updateStatus('构建失败');
  }
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
async function cleanProject() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  logOutput('清理构建文件...\n');
  updateStatus('正在清理...');
  
  try {
    const result = await ipcRenderer.invoke('clean-build', currentProject.path);
    
    if (result.success) {
      logOutput('✓ 清理完成\n');
      updateStatus('就绪');
    } else {
      logOutput(`清理失败: ${result.error}`, 'error');
      updateStatus('就绪');
    }
  } catch (error) {
    logOutput(`清理错误: ${error.message}`, 'error');
    updateStatus('就绪');
  }
}

/**
 * 启动调试
 */
async function startDebug() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  // 获取当前工具链
  const toolchain = ipcRenderer.sendSync('get-current-toolchain');
  if (!toolchain) {
    logOutput('错误: 未配置工具链，请先配置工具链', 'error');
    return;
  }
  
  // 确定ELF文件路径
  const buildDir = path.join(currentProject.path, 'build');
  let elfFile;
  
  if (currentProject.processorType === 'stm32') {
    elfFile = path.join(buildDir, currentProject.name + '.elf');
  } else if (currentProject.processorType === 'c67xx') {
    elfFile = path.join(buildDir, currentProject.name + '.out');
  }
  
  if (!fs.existsSync(elfFile)) {
    logOutput('错误: 未找到可执行文件，请先构建项目', 'error');
    return;
  }
  
  logOutput('=== 启动调试会话 ===\n');
  updateStatus('正在调试...');
  
  try {
    const result = await ipcRenderer.invoke('start-debug', currentProject, toolchain, elfFile);
    
    if (result.success) {
      updateStatus('调试中');
    } else {
      logOutput(`\n调试启动失败: ${result.error}`, 'error');
      updateStatus('就绪');
    }
  } catch (error) {
    logOutput(`调试错误: ${error.message}`, 'error');
    updateStatus('就绪');
  }
}

/**
 * 停止调试
 */
async function stopDebug() {
  logOutput('停止调试会话\n');
  
  try {
    await ipcRenderer.invoke('stop-debug');
    logOutput('✓ 调试会话已停止\n');
    updateStatus('就绪');
  } catch (error) {
    logOutput(`停止调试失败: ${error.message}`, 'error');
  }
}

/**
 * 烧录程序
 */
async function flashProgram() {
  if (!currentProject) {
    logOutput('错误: 未打开项目', 'error');
    return;
  }
  
  // 确定烧录文件路径
  const buildDir = path.join(currentProject.path, 'build');
  let binaryFile;
  
  if (currentProject.processorType === 'stm32') {
    binaryFile = path.join(buildDir, currentProject.name + '.hex');
  } else if (currentProject.processorType === 'c67xx') {
    binaryFile = path.join(buildDir, currentProject.name + '.out');
  }
  
  if (!fs.existsSync(binaryFile)) {
    logOutput('错误: 未找到烧录文件，请先构建项目', 'error');
    return;
  }
  
  logOutput('=== 开始烧录程序 ===\n');
  updateStatus('正在烧录...');
  
  try {
    const result = await ipcRenderer.invoke('flash-program', currentProject, binaryFile);
    
    if (result.success) {
      updateStatus('烧录完成');
    } else {
      logOutput(`\n烧录失败: ${result.error || result.note}`, 'error');
      updateStatus('烧录失败');
    }
  } catch (error) {
    logOutput(`烧录错误: ${error.message}`, 'error');
    updateStatus('烧录失败');
  }
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
  
  // 获取当前已配置的工具链
  const toolchains = ipcRenderer.sendSync('get-toolchains');
  
  logOutput(`当前已配置 ${toolchains.length} 个工具链:`);
  toolchains.forEach((tc, index) => {
    logOutput(`  ${index + 1}. ${tc.name} (${tc.type}) - ${tc.path}`);
  });
  
  // 显示菜单选项
  const choice = prompt(
    '工具链管理选项:\n' +
    '1 - 自动检测所有工具链\n' +
    '2 - 配置 TI CGT C6000 工具链\n' +
    '3 - 查看当前工具链\n' +
    '\n请输入选项 (1-3):'
  );
  
  if (choice === '1') {
    detectAndShowToolchains();
  } else if (choice === '2') {
    openTICGTConfigDialog();
  } else if (choice === '3') {
    // 已经在上面显示了
    logOutput('工具链列表已显示');
  }
}

/**
 * 打开 TI CGT 配置对话框
 */
function openTICGTConfigDialog() {
  logOutput('打开 TI CGT 工具链配置界面...');
  ipcRenderer.send('open-toolchain-config-dialog');
}

/**
 * 检测并显示工具链
 */
function detectAndShowToolchains() {
  logOutput('正在检测工具链...');
  updateStatus('正在检测工具链...');
  
  ipcRenderer.send('detect-toolchains');
  
  ipcRenderer.once('toolchains-detected', (event, detected) => {
    logOutput(`检测完成，发现 ${detected.length} 个工具链`);
    
    if (detected.length > 0) {
      detected.forEach((tc, index) => {
        logOutput(`  ${index + 1}. ${tc.name} (${tc.version})`);
        logOutput(`     路径: ${tc.path}`);
      });
      logOutput('工具链信息已保存', 'success');
    } else {
      logOutput('未检测到任何工具链', 'warning');
      logOutput('请确保已安装 ARM GCC 或 TI CGT 工具链');
    }
    
    updateStatus('就绪');
  });
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
