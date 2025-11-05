/**
 * 构建管理器 - 负责项目编译
 * ZSide4CD IDE
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class BuildManager {
    constructor() {
        this.currentBuild = null;
        this.buildHistory = [];
    }

    /**
     * 构建项目
     * @param {Object} project - 项目信息
     * @param {Object} toolchain - 工具链信息
     * @param {Function} outputCallback - 输出回调函数
     * @returns {Promise<Object>} 构建结果
     */
    async buildProject(project, toolchain, outputCallback) {
        if (this.currentBuild) {
            throw new Error('已有构建任务正在运行');
        }

        const buildConfig = this.prepareBuildConfig(project, toolchain);
        const startTime = Date.now();

        outputCallback(`开始构建项目: ${project.name}\n`);
        outputCallback(`处理器类型: ${project.processorType}\n`);
        outputCallback(`工具链: ${toolchain.name} ${toolchain.version}\n`);
        outputCallback(`构建目录: ${buildConfig.buildDir}\n`);
        outputCallback('='.repeat(60) + '\n');

        try {
            // 确保构建目录存在
            if (!fs.existsSync(buildConfig.buildDir)) {
                fs.mkdirSync(buildConfig.buildDir, { recursive: true });
            }

            // 根据处理器类型选择构建方法
            let result;
            if (project.processorType === 'stm32') {
                result = await this.buildSTM32Project(buildConfig, toolchain, outputCallback);
            } else if (project.processorType === 'c67xx') {
                result = await this.buildC67XXProject(buildConfig, toolchain, outputCallback);
            } else {
                throw new Error(`不支持的处理器类型: ${project.processorType}`);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            if (result.success) {
                outputCallback('\n' + '='.repeat(60) + '\n');
                outputCallback(`✓ 构建成功！耗时: ${duration}秒\n`);
                outputCallback(`输出文件: ${result.outputFile}\n`);
            } else {
                outputCallback('\n' + '='.repeat(60) + '\n');
                outputCallback(`✗ 构建失败！耗时: ${duration}秒\n`);
            }

            // 记录构建历史
            this.buildHistory.push({
                timestamp: new Date().toISOString(),
                project: project.name,
                success: result.success,
                duration: duration
            });

            return result;

        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            outputCallback('\n' + '='.repeat(60) + '\n');
            outputCallback(`✗ 构建错误: ${error.message}\n`);
            outputCallback(`耗时: ${duration}秒\n`);
            
            return {
                success: false,
                error: error.message,
                duration: duration
            };
        } finally {
            this.currentBuild = null;
        }
    }

    /**
     * 准备构建配置
     */
    prepareBuildConfig(project, toolchain) {
        const projectDir = project.path;
        const buildDir = path.join(projectDir, 'build');
        const srcDir = path.join(projectDir, 'src');
        
        return {
            projectDir,
            buildDir,
            srcDir,
            projectName: project.name,
            processorType: project.processorType
        };
    }

    /**
     * 构建STM32项目
     */
    async buildSTM32Project(config, toolchain, outputCallback) {
        const compiler = path.join(toolchain.path, 'bin', 'arm-none-eabi-gcc.exe');
        const objcopy = path.join(toolchain.path, 'bin', 'arm-none-eabi-objcopy.exe');
        const size = path.join(toolchain.path, 'bin', 'arm-none-eabi-size.exe');

        // 检查编译器
        if (!fs.existsSync(compiler)) {
            throw new Error(`找不到编译器: ${compiler}`);
        }

        // 查找源文件
        const sourceFiles = this.findSourceFiles(config.srcDir, ['.c']);
        if (sourceFiles.length === 0) {
            throw new Error('未找到源文件(.c)');
        }

        outputCallback(`找到 ${sourceFiles.length} 个源文件\n`);

        // 编译参数
        const compileFlags = [
            '-mcpu=cortex-m4',
            '-mthumb',
            '-mfloat-abi=hard',
            '-mfpu=fpv4-sp-d16',
            '-DSTM32F429xx',
            '-Wall',
            '-fdata-sections',
            '-ffunction-sections',
            '-O2',
            '-g'
        ];

        // 链接参数
        const linkFlags = [
            '-mcpu=cortex-m4',
            '-mthumb',
            '-mfloat-abi=hard',
            '-mfpu=fpv4-sp-d16',
            '-specs=nano.specs',
            '-Wl,--gc-sections',
            '-Wl,-Map=' + path.join(config.buildDir, config.projectName + '.map')
        ];

        // 编译每个源文件
        const objectFiles = [];
        for (const sourceFile of sourceFiles) {
            const objFile = path.join(
                config.buildDir,
                path.basename(sourceFile, '.c') + '.o'
            );
            objectFiles.push(objFile);

            outputCallback(`编译: ${path.basename(sourceFile)}\n`);

            const compileArgs = [
                ...compileFlags,
                '-c',
                sourceFile,
                '-o',
                objFile
            ];

            try {
                await this.runCommand(compiler, compileArgs, outputCallback);
            } catch (error) {
                throw new Error(`编译失败: ${path.basename(sourceFile)} - ${error.message}`);
            }
        }

        // 链接
        const elfFile = path.join(config.buildDir, config.projectName + '.elf');
        outputCallback(`链接: ${config.projectName}.elf\n`);

        const linkArgs = [
            ...linkFlags,
            ...objectFiles,
            '-o',
            elfFile
        ];

        await this.runCommand(compiler, linkArgs, outputCallback);

        // 生成HEX文件
        const hexFile = path.join(config.buildDir, config.projectName + '.hex');
        outputCallback(`生成: ${config.projectName}.hex\n`);

        await this.runCommand(objcopy, ['-O', 'ihex', elfFile, hexFile], outputCallback);

        // 生成BIN文件
        const binFile = path.join(config.buildDir, config.projectName + '.bin');
        outputCallback(`生成: ${config.projectName}.bin\n`);

        await this.runCommand(objcopy, ['-O', 'binary', elfFile, binFile], outputCallback);

        // 显示大小信息
        outputCallback('\n程序大小:\n');
        await this.runCommand(size, [elfFile], outputCallback);

        return {
            success: true,
            outputFile: hexFile,
            binFile: binFile,
            elfFile: elfFile
        };
    }

    /**
     * 构建C67XX项目
     */
    async buildC67XXProject(config, toolchain, outputCallback) {
        const compiler = path.join(toolchain.path, 'bin', 'cl6x.exe');
        const linker = path.join(toolchain.path, 'bin', 'cl6x.exe');

        // 检查编译器
        if (!fs.existsSync(compiler)) {
            throw new Error(`找不到编译器: ${compiler}`);
        }

        // 查找源文件
        const sourceFiles = this.findSourceFiles(config.srcDir, ['.c', '.cpp']);
        if (sourceFiles.length === 0) {
            throw new Error('未找到源文件(.c或.cpp)');
        }

        outputCallback(`找到 ${sourceFiles.length} 个源文件\n`);

        // 编译参数
        const compileFlags = [
            '-mv6700',
            '--abi=eabi',
            '-O2',
            '-g',
            '--diag_warning=225',
            '--display_error_number',
            '--verbose_diagnostics'
        ];

        // 编译每个源文件
        const objectFiles = [];
        for (const sourceFile of sourceFiles) {
            const objFile = path.join(
                config.buildDir,
                path.basename(sourceFile, path.extname(sourceFile)) + '.obj'
            );
            objectFiles.push(objFile);

            outputCallback(`编译: ${path.basename(sourceFile)}\n`);

            const compileArgs = [
                ...compileFlags,
                '-c',
                sourceFile,
                '-fo=' + objFile
            ];

            try {
                await this.runCommand(compiler, compileArgs, outputCallback);
            } catch (error) {
                throw new Error(`编译失败: ${path.basename(sourceFile)} - ${error.message}`);
            }
        }

        // 链接
        const outFile = path.join(config.buildDir, config.projectName + '.out');
        outputCallback(`链接: ${config.projectName}.out\n`);

        const linkArgs = [
            '-mv6700',
            '--abi=eabi',
            '-z',
            ...objectFiles,
            '-o',
            outFile,
            '-m',
            path.join(config.buildDir, config.projectName + '.map')
        ];

        await this.runCommand(linker, linkArgs, outputCallback);

        return {
            success: true,
            outputFile: outFile
        };
    }

    /**
     * 查找源文件
     */
    findSourceFiles(dir, extensions) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.findSourceFiles(fullPath, extensions));
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
        
        return files;
    }

    /**
     * 运行命令
     */
    runCommand(command, args, outputCallback) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                cwd: path.dirname(command)
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                const text = data.toString();
                stdout += text;
                if (outputCallback) {
                    outputCallback(text);
                }
            });

            process.stderr.on('data', (data) => {
                const text = data.toString();
                stderr += text;
                if (outputCallback) {
                    outputCallback(text);
                }
            });

            process.on('error', (error) => {
                reject(new Error(`执行失败: ${error.message}`));
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`进程退出码: ${code}`));
                }
            });
        });
    }

    /**
     * 取消当前构建
     */
    cancelBuild() {
        if (this.currentBuild) {
            this.currentBuild.kill();
            this.currentBuild = null;
            return true;
        }
        return false;
    }

    /**
     * 获取构建历史
     */
    getBuildHistory() {
        return this.buildHistory;
    }

    /**
     * 清理构建输出
     */
    async cleanBuild(projectPath) {
        const buildDir = path.join(projectPath, 'build');
        
        if (fs.existsSync(buildDir)) {
            const files = fs.readdirSync(buildDir);
            for (const file of files) {
                const filePath = path.join(buildDir, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
            return true;
        }
        
        return false;
    }
}

module.exports = BuildManager;
