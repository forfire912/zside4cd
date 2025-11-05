/**
 * 烧录管理器 - 负责程序烧录到目标硬件
 * ZSide4CD IDE
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class FlashManager {
    constructor() {
        this.flashProcess = null;
    }

    /**
     * 烧录程序到目标设备
     * @param {Object} project - 项目信息
     * @param {String} binaryFile - 二进制文件路径
     * @param {Function} outputCallback - 输出回调函数
     * @returns {Promise<Object>} 烧录结果
     */
    async flashProgram(project, binaryFile, outputCallback) {
        if (this.flashProcess) {
            throw new Error('已有烧录任务正在运行');
        }

        // 检查文件
        if (!fs.existsSync(binaryFile)) {
            throw new Error(`找不到烧录文件: ${binaryFile}`);
        }

        outputCallback(`开始烧录程序: ${project.name}\n`);
        outputCallback(`处理器类型: ${project.processorType}\n`);
        outputCallback(`烧录文件: ${binaryFile}\n`);
        outputCallback('='.repeat(60) + '\n');

        const startTime = Date.now();

        try {
            let result;
            if (project.processorType === 'stm32') {
                result = await this.flashSTM32(binaryFile, outputCallback);
            } else if (project.processorType === 'c67xx') {
                result = await this.flashC67XX(binaryFile, outputCallback);
            } else {
                throw new Error(`不支持的处理器类型: ${project.processorType}`);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            if (result.success) {
                outputCallback('\n' + '='.repeat(60) + '\n');
                outputCallback(`✓ 烧录成功！耗时: ${duration}秒\n`);
            } else {
                outputCallback('\n' + '='.repeat(60) + '\n');
                outputCallback(`✗ 烧录失败！耗时: ${duration}秒\n`);
            }

            return result;

        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            outputCallback('\n' + '='.repeat(60) + '\n');
            outputCallback(`✗ 烧录错误: ${error.message}\n`);
            outputCallback(`耗时: ${duration}秒\n`);
            
            return {
                success: false,
                error: error.message,
                duration: duration
            };
        } finally {
            this.flashProcess = null;
        }
    }

    /**
     * 烧录STM32（使用ST-Link或OpenOCD）
     */
    async flashSTM32(binaryFile, outputCallback) {
        // 尝试使用ST-Link Utility
        const stlinkPath = this.findSTLink();
        
        if (stlinkPath) {
            outputCallback('使用ST-Link Utility进行烧录...\n');
            return await this.flashWithSTLink(stlinkPath, binaryFile, outputCallback);
        }

        // 尝试使用OpenOCD
        const openocdPath = this.findOpenOCD();
        
        if (openocdPath) {
            outputCallback('使用OpenOCD进行烧录...\n');
            return await this.flashWithOpenOCD(openocdPath, binaryFile, outputCallback);
        }

        throw new Error('未找到烧录工具（ST-Link或OpenOCD），请先安装');
    }

    /**
     * 使用ST-Link烧录
     */
    async flashWithSTLink(stlinkPath, binaryFile, outputCallback) {
        const args = [
            '-c', 'SWD',
            '-P', binaryFile,
            '0x08000000',  // STM32 Flash起始地址
            '-V', 'after_programming',
            '-Rst'
        ];

        outputCallback('连接ST-Link调试器...\n');
        
        try {
            await this.runFlashCommand(stlinkPath, args, outputCallback);
            
            return {
                success: true,
                tool: 'ST-Link',
                address: '0x08000000'
            };
        } catch (error) {
            throw new Error(`ST-Link烧录失败: ${error.message}`);
        }
    }

    /**
     * 使用OpenOCD烧录
     */
    async flashWithOpenOCD(openocdPath, binaryFile, outputCallback) {
        const args = [
            '-f', 'interface/stlink.cfg',
            '-f', 'target/stm32f4x.cfg',
            '-c', 'init',
            '-c', 'reset halt',
            '-c', `flash write_image erase ${binaryFile} 0x08000000`,
            '-c', 'reset run',
            '-c', 'shutdown'
        ];

        outputCallback('连接OpenOCD调试器...\n');
        
        try {
            await this.runFlashCommand(openocdPath, args, outputCallback);
            
            return {
                success: true,
                tool: 'OpenOCD',
                address: '0x08000000'
            };
        } catch (error) {
            throw new Error(`OpenOCD烧录失败: ${error.message}`);
        }
    }

    /**
     * 烧录C67XX（使用TI工具）
     */
    async flashC67XX(binaryFile, outputCallback) {
        outputCallback('准备使用TI工具进行DSP程序下载...\n');
        outputCallback('注意: 请确保已连接XDS仿真器\n');

        // TI的烧录通常通过CCS的UniFlash或命令行工具进行
        const uniflashPath = this.findUniFlash();

        if (uniflashPath) {
            outputCallback('使用UniFlash进行烧录...\n');
            return await this.flashWithUniFlash(uniflashPath, binaryFile, outputCallback);
        }

        // 如果没有找到工具，提供手动说明
        outputCallback('\n未找到TI烧录工具\n');
        outputCallback('请使用以下方法之一手动烧录:\n');
        outputCallback('1. 使用Code Composer Studio加载程序\n');
        outputCallback('2. 使用UniFlash工具\n');
        outputCallback('3. 使用XDS仿真器配套软件\n');

        return {
            success: false,
            note: '需要手动使用TI工具进行烧录',
            suggestions: [
                'Code Composer Studio',
                'UniFlash',
                'XDS工具'
            ]
        };
    }

    /**
     * 使用UniFlash烧录
     */
    async flashWithUniFlash(uniflashPath, binaryFile, outputCallback) {
        const args = [
            '-ccxml', 'path/to/target.ccxml',  // 需要配置文件
            '-program', binaryFile
        ];

        try {
            await this.runFlashCommand(uniflashPath, args, outputCallback);
            
            return {
                success: true,
                tool: 'UniFlash'
            };
        } catch (error) {
            throw new Error(`UniFlash烧录失败: ${error.message}`);
        }
    }

    /**
     * 查找ST-Link工具
     */
    findSTLink() {
        const possiblePaths = [
            'C:\\Program Files (x86)\\STMicroelectronics\\STM32 ST-LINK Utility\\ST-LINK Utility\\ST-LINK_CLI.exe',
            'C:\\Program Files\\STMicroelectronics\\STM32 ST-LINK Utility\\ST-LINK Utility\\ST-LINK_CLI.exe'
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }

        return null;
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
     * 查找UniFlash
     */
    findUniFlash() {
        const possiblePaths = [
            'C:\\ti\\uniflash\\dslite.bat',
            'C:\\ti\\ccs\\ccs_base\\DebugServer\\bin\\DSLite.bat'
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                return p;
            }
        }

        return null;
    }

    /**
     * 运行烧录命令
     */
    runFlashCommand(command, args, outputCallback) {
        return new Promise((resolve, reject) => {
            this.flashProcess = spawn(command, args);

            let stdout = '';
            let stderr = '';

            this.flashProcess.stdout.on('data', (data) => {
                const text = data.toString();
                stdout += text;
                if (outputCallback) {
                    outputCallback(text);
                }
            });

            this.flashProcess.stderr.on('data', (data) => {
                const text = data.toString();
                stderr += text;
                if (outputCallback) {
                    outputCallback(text);
                }
            });

            this.flashProcess.on('error', (error) => {
                reject(new Error(`执行失败: ${error.message}`));
            });

            this.flashProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`进程退出码: ${code}`));
                }
            });
        });
    }

    /**
     * 取消烧录
     */
    cancelFlash() {
        if (this.flashProcess) {
            this.flashProcess.kill();
            this.flashProcess = null;
            return true;
        }
        return false;
    }

    /**
     * 擦除Flash
     */
    async eraseFlash(project, outputCallback) {
        outputCallback(`擦除Flash: ${project.name}\n`);
        outputCallback(`处理器类型: ${project.processorType}\n`);
        outputCallback('='.repeat(60) + '\n');

        if (project.processorType === 'stm32') {
            const stlinkPath = this.findSTLink();
            
            if (stlinkPath) {
                const args = ['-c', 'SWD', '-ME'];
                
                try {
                    await this.runFlashCommand(stlinkPath, args, outputCallback);
                    outputCallback('✓ Flash擦除成功\n');
                    return { success: true };
                } catch (error) {
                    throw new Error(`Flash擦除失败: ${error.message}`);
                }
            } else {
                throw new Error('未找到ST-Link工具');
            }
        } else {
            throw new Error('此处理器类型暂不支持Flash擦除功能');
        }
    }
}

module.exports = FlashManager;
