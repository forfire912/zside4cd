/**
 * 调试管理器 - 负责程序调试
 * ZSide4CD IDE
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

class DebugManager {
    constructor() {
        this.debugSession = null;
        this.gdbProcess = null;
        this.openocdProcess = null;
        this.xdsProcess = null;
    }

    /**
     * 启动调试会话
     * @param {Object} project - 项目信息
     * @param {Object} toolchain - 工具链信息
     * @param {String} elfFile - ELF文件路径
     * @param {Function} outputCallback - 输出回调函数
     * @returns {Promise<Object>} 调试会话信息
     */
    async startDebugSession(project, toolchain, elfFile, outputCallback) {
        if (this.debugSession) {
            throw new Error('已有调试会话正在运行');
        }

        outputCallback(`启动调试会话: ${project.name}\n`);
        outputCallback(`处理器类型: ${project.processorType}\n`);
        outputCallback('='.repeat(60) + '\n');

        try {
            if (project.processorType === 'stm32') {
                return await this.startSTM32Debug(project, toolchain, elfFile, outputCallback);
            } else if (project.processorType === 'c67xx') {
                return await this.startC67XXDebug(project, toolchain, elfFile, outputCallback);
            } else {
                throw new Error(`不支持的处理器类型: ${project.processorType}`);
            }
        } catch (error) {
            outputCallback(`✗ 调试启动失败: ${error.message}\n`);
            this.stopDebugSession();
            throw error;
        }
    }

    /**
     * 启动STM32调试（使用OpenOCD + GDB）
     */
    async startSTM32Debug(project, toolchain, elfFile, outputCallback) {
        // 检查ELF文件
        if (!fs.existsSync(elfFile)) {
            throw new Error(`找不到ELF文件: ${elfFile}`);
        }

        const gdbPath = path.join(toolchain.path, 'bin', 'arm-none-eabi-gdb.exe');
        if (!fs.existsSync(gdbPath)) {
            throw new Error(`找不到GDB: ${gdbPath}`);
        }

        // 查找OpenOCD
        const openocdPath = this.findOpenOCD();
        if (!openocdPath) {
            throw new Error('未找到OpenOCD，请先安装OpenOCD调试工具');
        }

        // 启动OpenOCD
        outputCallback('启动OpenOCD服务器...\n');
        await this.startOpenOCD(openocdPath, outputCallback);

        // 等待OpenOCD就绪
        await this.waitForPort(3333, 5000);
        outputCallback('OpenOCD已就绪\n');

        // 启动GDB
        outputCallback('启动GDB调试器...\n');
        await this.startGDB(gdbPath, elfFile, outputCallback);

        this.debugSession = {
            type: 'stm32',
            project: project.name,
            elfFile: elfFile,
            startTime: Date.now()
        };

        outputCallback('✓ 调试会话已建立\n');
        outputCallback('GDB端口: 3333\n');

        return this.debugSession;
    }

    /**
     * 启动C67XX调试（使用TI XDS）
     */
    async startC67XXDebug(project, toolchain, elfFile, outputCallback) {
        // 检查OUT文件
        if (!fs.existsSync(elfFile)) {
            throw new Error(`找不到OUT文件: ${elfFile}`);
        }

        outputCallback('启动TI XDS调试器...\n');
        outputCallback('注意: 请确保已连接XDS仿真器并安装了CCS调试工具\n');

        // TI调试通常通过CCS进行，这里提供基本框架
        this.debugSession = {
            type: 'c67xx',
            project: project.name,
            elfFile: elfFile,
            startTime: Date.now(),
            note: '请使用Code Composer Studio进行调试'
        };

        outputCallback('✓ 调试会话信息已准备\n');
        outputCallback('提示: 可以在CCS中导入并调试此项目\n');

        return this.debugSession;
    }

    /**
     * 启动OpenOCD
     */
    startOpenOCD(openocdPath, outputCallback) {
        return new Promise((resolve, reject) => {
            // OpenOCD配置
            const args = [
                '-f', 'interface/stlink.cfg',
                '-f', 'target/stm32f4x.cfg'
            ];

            this.openocdProcess = spawn(openocdPath, args);

            let hasError = false;

            this.openocdProcess.stdout.on('data', (data) => {
                outputCallback(`[OpenOCD] ${data.toString()}`);
            });

            this.openocdProcess.stderr.on('data', (data) => {
                const text = data.toString();
                outputCallback(`[OpenOCD] ${text}`);
                
                // 检查是否成功启动
                if (text.includes('Listening on port 3333')) {
                    resolve();
                }
            });

            this.openocdProcess.on('error', (error) => {
                hasError = true;
                reject(new Error(`OpenOCD启动失败: ${error.message}`));
            });

            this.openocdProcess.on('close', (code) => {
                if (!hasError && code !== 0) {
                    reject(new Error(`OpenOCD退出，代码: ${code}`));
                }
            });

            // 超时处理
            setTimeout(() => {
                if (!hasError) {
                    resolve(); // 假设启动成功
                }
            }, 2000);
        });
    }

    /**
     * 启动GDB
     */
    startGDB(gdbPath, elfFile, outputCallback) {
        return new Promise((resolve, reject) => {
            const args = [
                elfFile,
                '-ex', 'target remote localhost:3333',
                '-ex', 'load',
                '-ex', 'monitor reset halt'
            ];

            this.gdbProcess = spawn(gdbPath, args);

            this.gdbProcess.stdout.on('data', (data) => {
                outputCallback(`[GDB] ${data.toString()}`);
            });

            this.gdbProcess.stderr.on('data', (data) => {
                outputCallback(`[GDB] ${data.toString()}`);
            });

            this.gdbProcess.on('error', (error) => {
                reject(new Error(`GDB启动失败: ${error.message}`));
            });

            this.gdbProcess.on('close', (code) => {
                outputCallback(`GDB会话结束\n`);
            });

            // 给GDB一些时间连接
            setTimeout(resolve, 1000);
        });
    }

    /**
     * 查找OpenOCD
     */
    findOpenOCD() {
        const possiblePaths = [
            'C:\\OpenOCD\\bin\\openocd.exe',
            'C:\\Program Files\\OpenOCD\\bin\\openocd.exe',
            'C:\\Program Files (x86)\\OpenOCD\\bin\\openocd.exe',
            path.join(process.env.OPENOCD_PATH || '', 'bin', 'openocd.exe')
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }

        // 尝试PATH环境变量
        const pathEnv = process.env.PATH || '';
        const pathDirs = pathEnv.split(';');
        
        for (const dir of pathDirs) {
            const openocdPath = path.join(dir, 'openocd.exe');
            if (fs.existsSync(openocdPath)) {
                return openocdPath;
            }
        }

        return null;
    }

    /**
     * 等待端口可用
     */
    waitForPort(port, timeout) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const tryConnect = () => {
                const socket = new net.Socket();
                
                socket.setTimeout(1000);
                
                socket.on('connect', () => {
                    socket.destroy();
                    resolve();
                });

                socket.on('error', () => {
                    socket.destroy();
                    
                    if (Date.now() - startTime < timeout) {
                        setTimeout(tryConnect, 500);
                    } else {
                        reject(new Error('等待端口超时'));
                    }
                });

                socket.connect(port, 'localhost');
            };

            tryConnect();
        });
    }

    /**
     * 停止调试会话
     */
    stopDebugSession() {
        if (this.gdbProcess) {
            this.gdbProcess.kill();
            this.gdbProcess = null;
        }

        if (this.openocdProcess) {
            this.openocdProcess.kill();
            this.openocdProcess = null;
        }

        if (this.xdsProcess) {
            this.xdsProcess.kill();
            this.xdsProcess = null;
        }

        this.debugSession = null;
    }

    /**
     * 获取当前调试会话
     */
    getDebugSession() {
        return this.debugSession;
    }

    /**
     * 发送GDB命令
     */
    sendGDBCommand(command) {
        if (!this.gdbProcess) {
            throw new Error('没有活动的GDB会话');
        }

        this.gdbProcess.stdin.write(command + '\n');
    }
}

module.exports = DebugManager;
