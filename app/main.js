/**
 * ZSide4CD 主进程
 * 
 * 基于 VSCodium (MIT License)
 * 这是 Electron 应用的主进程入口
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ToolchainManager = require('./toolchain-manager');
const BuildManager = require('./build-manager');
const DebugManager = require('./debug-manager');
const FlashManager = require('./flash-manager');

// 全局变量
let mainWindow = null;
let config = null;
let toolchainManager = null;
let buildManager = null;
let debugManager = null;
let flashManager = null;

/**
 * 加载配置
 */
function loadConfig() {
  const configPath = path.join(app.getPath('userData'), 'settings.json');
  
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('配置已加载');
    } else {
      // 使用默认配置
      config = {
        language: 'zh-CN',
        theme: 'dark',
        branding: {
          productName: 'ZSide4CD',
          companyName: 'ZSide4CD Team',
          copyright: 'Copyright © 2025 ZSide4CD Team. All rights reserved.',
          basedOn: 'Based on VSCodium (MIT License) - https://vscodium.com',
          aboutText: 'ZSide4CD - 嵌入式开发集成环境\n\n基于 VSCodium\n许可证: MIT\nhttps://vscodium.com'
        },
        defaultProcessor: 'stm32f429',
        autoDetectToolchains: true,
        showWelcomePage: true
      };
      saveConfig();
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    config = {};
  }
}

/**
 * 保存配置
 */
function saveConfig() {
  const configPath = path.join(app.getPath('userData'), 'settings.json');
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('配置已保存');
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

/**
 * 创建主窗口
 */
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: config.branding.productName || 'ZSide4CD',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../resources/icons/app.ico')
  });

  // 加载 index.html
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 打开开发者工具（开发阶段）
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 创建菜单
  createMenu();

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('主窗口已创建');
}

/**
 * 创建应用菜单
 */
function createMenu() {
  const i18n = loadI18n(config.language || 'zh-CN');
  
  const menuTemplate = [
    {
      label: i18n.menu.file.label,
      submenu: [
        {
          label: i18n.menu.file.newProject,
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu-command', 'new-project');
          }
        },
        {
          label: i18n.menu.file.openProject,
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            mainWindow.webContents.send('menu-command', 'open-project');
          }
        },
        { type: 'separator' },
        {
          label: i18n.menu.file.save,
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-command', 'save');
          }
        },
        {
          label: i18n.menu.file.saveAll,
          accelerator: 'CmdOrCtrl+K S',
          click: () => {
            mainWindow.webContents.send('menu-command', 'save-all');
          }
        },
        { type: 'separator' },
        {
          label: i18n.menu.file.exit,
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: i18n.menu.edit.label,
      submenu: [
        { label: i18n.menu.edit.undo, accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: i18n.menu.edit.redo, accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: i18n.menu.edit.cut, accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: i18n.menu.edit.copy, accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: i18n.menu.edit.paste, accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { type: 'separator' },
        {
          label: i18n.menu.edit.find,
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow.webContents.send('menu-command', 'find');
          }
        }
      ]
    },
    {
      label: i18n.menu.build.label,
      submenu: [
        {
          label: i18n.menu.build.build,
          accelerator: 'F7',
          click: () => {
            mainWindow.webContents.send('menu-command', 'build');
          }
        },
        {
          label: i18n.menu.build.rebuild,
          accelerator: 'Shift+F7',
          click: () => {
            mainWindow.webContents.send('menu-command', 'rebuild');
          }
        },
        {
          label: i18n.menu.build.clean,
          click: () => {
            mainWindow.webContents.send('menu-command', 'clean');
          }
        }
      ]
    },
    {
      label: i18n.menu.debug.label,
      submenu: [
        {
          label: i18n.menu.debug.start,
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu-command', 'start-debug');
          }
        },
        {
          label: i18n.menu.debug.stop,
          accelerator: 'Shift+F5',
          click: () => {
            mainWindow.webContents.send('menu-command', 'stop-debug');
          }
        },
        { type: 'separator' },
        {
          label: i18n.menu.debug.stepOver,
          accelerator: 'F10',
          click: () => {
            mainWindow.webContents.send('menu-command', 'step-over');
          }
        },
        {
          label: i18n.menu.debug.stepInto,
          accelerator: 'F11',
          click: () => {
            mainWindow.webContents.send('menu-command', 'step-into');
          }
        }
      ]
    },
    {
      label: i18n.menu.tools.label,
      submenu: [
        {
          label: i18n.menu.tools.flash,
          accelerator: 'Ctrl+Alt+F',
          click: () => {
            mainWindow.webContents.send('menu-command', 'flash');
          }
        },
        { type: 'separator' },
        {
          label: i18n.menu.tools.toolchains,
          click: () => {
            mainWindow.webContents.send('menu-command', 'toolchain-manager');
          }
        },
        {
          label: i18n.menu.tools.settings,
          accelerator: 'Ctrl+,',
          click: () => {
            mainWindow.webContents.send('menu-command', 'settings');
          }
        }
      ]
    },
    {
      label: i18n.menu.help.label,
      submenu: [
        {
          label: i18n.menu.help.documentation,
          click: () => {
            mainWindow.webContents.send('menu-command', 'documentation');
          }
        },
        { type: 'separator' },
        {
          label: i18n.menu.help.about,
          click: () => {
            showAboutDialog(i18n);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

/**
 * 加载国际化资源
 */
function loadI18n(language) {
  const i18nPath = path.join(__dirname, '../resources/i18n', `${language}.json`);
  
  try {
    if (fs.existsSync(i18nPath)) {
      return JSON.parse(fs.readFileSync(i18nPath, 'utf8'));
    }
  } catch (error) {
    console.error('加载国际化资源失败:', error);
  }
  
  // 返回默认中文
  return require('../resources/i18n/zh-CN.json');
}

/**
 * 显示关于对话框
 */
function showAboutDialog(i18n) {
  const packageJson = require('../package.json');
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: i18n.dialog.about.title,
    message: `${config.branding.productName} v${packageJson.version}`,
    detail: config.branding.aboutText,
    buttons: [i18n.dialog.about.close]
  });
}

// IPC 事件处理
ipcMain.on('get-config', (event) => {
  event.returnValue = config;
});

ipcMain.on('save-config', (event, newConfig) => {
  config = { ...config, ...newConfig };
  saveConfig();
  event.returnValue = true;
});

ipcMain.on('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  event.reply('open-dialog-result', result);
});

ipcMain.on('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  event.reply('save-dialog-result', result);
});

// 工具链管理 IPC 事件
ipcMain.on('detect-toolchains', (event) => {
  console.log('开始检测工具链...');
  const detected = toolchainManager.detectToolchains();
  event.reply('toolchains-detected', detected);
});

ipcMain.on('detect-ti-cgt-toolchains', (event) => {
  console.log('开始检测 TI CGT 工具链...');
  const detected = toolchainManager.detectTICGT();
  event.reply('ti-cgt-detected', detected);
});

ipcMain.on('get-toolchains', (event) => {
  const toolchains = toolchainManager.getToolchains();
  event.returnValue = toolchains;
});

ipcMain.on('add-toolchain', (event, toolchain) => {
  const result = toolchainManager.addToolchain(toolchain);
  event.returnValue = result;
});

ipcMain.on('remove-toolchain', (event, toolchainId) => {
  const result = toolchainManager.removeToolchain(toolchainId);
  event.returnValue = result;
});

ipcMain.on('validate-toolchain', (event, toolchain) => {
  const result = toolchainManager.validateToolchain(toolchain);
  event.returnValue = result;
});

ipcMain.on('select-best-toolchain', (event, processorType) => {
  const toolchain = toolchainManager.selectBestToolchain(processorType);
  event.returnValue = toolchain;
});

ipcMain.on('get-current-toolchain', (event) => {
  const toolchain = toolchainManager.getCurrentToolchain();
  event.returnValue = toolchain;
});

// 打开工具链配置对话框
ipcMain.on('open-toolchain-config-dialog', (event) => {
  const configWindow = new BrowserWindow({
    width: 900,
    height: 700,
    parent: mainWindow,
    modal: true,
    title: 'TI CGT 工具链配置',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  configWindow.loadFile(path.join(__dirname, 'toolchain-config-dialog.html'));
  
  // 开发模式下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    configWindow.webContents.openDevTools();
  }
});

// 应用生命周期
app.whenReady().then(() => {
  console.log('应用已准备就绪');
  loadConfig();
  
  // 初始化管理器
  toolchainManager = new ToolchainManager();
  toolchainManager.initialize(app.getPath('userData'));
  
  buildManager = new BuildManager();
  debugManager = new DebugManager();
  flashManager = new FlashManager();
  
  // 如果配置为自动检测，则在启动时检测工具链
  if (config.autoDetectToolchains) {
    console.log('自动检测工具链...');
    toolchainManager.detectToolchains();
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  saveConfig();
  
  // 停止所有活动会话
  if (debugManager) {
    debugManager.stopDebugSession();
  }
  if (buildManager) {
    buildManager.cancelBuild();
  }
  if (flashManager) {
    flashManager.cancelFlash();
  }
});

// =============== 构建相关的IPC处理 ===============

// 构建项目
ipcMain.handle('build-project', async (event, project, toolchain) => {
  try {
    const result = await buildManager.buildProject(
      project,
      toolchain,
      (output) => {
        mainWindow.webContents.send('build-output', output);
      }
    );
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 清理构建
ipcMain.handle('clean-build', async (event, projectPath) => {
  try {
    const result = await buildManager.cleanBuild(projectPath);
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 取消构建
ipcMain.handle('cancel-build', async () => {
  const result = buildManager.cancelBuild();
  return { success: result };
});

// 获取构建历史
ipcMain.handle('get-build-history', async () => {
  return buildManager.getBuildHistory();
});

// =============== 调试相关的IPC处理 ===============

// 启动调试
ipcMain.handle('start-debug', async (event, project, toolchain, elfFile) => {
  try {
    const result = await debugManager.startDebugSession(
      project,
      toolchain,
      elfFile,
      (output) => {
        mainWindow.webContents.send('debug-output', output);
      }
    );
    return { success: true, session: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 停止调试
ipcMain.handle('stop-debug', async () => {
  debugManager.stopDebugSession();
  return { success: true };
});

// 获取调试会话
ipcMain.handle('get-debug-session', async () => {
  return debugManager.getDebugSession();
});

// 发送GDB命令
ipcMain.handle('send-gdb-command', async (event, command) => {
  try {
    debugManager.sendGDBCommand(command);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// =============== 烧录相关的IPC处理 ===============

// 烧录程序
ipcMain.handle('flash-program', async (event, project, binaryFile) => {
  try {
    const result = await flashManager.flashProgram(
      project,
      binaryFile,
      (output) => {
        mainWindow.webContents.send('flash-output', output);
      }
    );
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 擦除Flash
ipcMain.handle('erase-flash', async (event, project) => {
  try {
    const result = await flashManager.eraseFlash(
      project,
      (output) => {
        mainWindow.webContents.send('flash-output', output);
      }
    );
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 取消烧录
ipcMain.handle('cancel-flash', async () => {
  const result = flashManager.cancelFlash();
  return { success: result };
});

console.log('ZSide4CD 主进程已启动');
console.log('基于 VSCodium (MIT License)');
console.log(`用户数据目录: ${app.getPath('userData')}`);
