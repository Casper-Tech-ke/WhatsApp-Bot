// handlers/hotReload.js
// Hot Reload System for ALICIAH AI
// Automatically detects command changes and reloads them
// Powered by CASPER TECH KE

import fs from 'fs';
import path from 'path';
import { watch } from 'fs';

class HotReloadSystem {
    constructor() {
        this.watchers = new Map();
        this.commandsMap = null;
        this.commandCategoriesMap = null;
        this.reloadCallback = null;
        this.isWatching = false;
        this.pendingReloads = new Map();
        this.reloadDebounceTime = 500;
    }

    initialize(commandsMap, commandCategoriesMap, onReloadComplete) {
        this.commandsMap = commandsMap;
        this.commandCategoriesMap = commandCategoriesMap;
        this.reloadCallback = onReloadComplete;
        this.startWatching();
        console.log(chalk.cyan('🔥 Hot Reload System initialized'));
    }

    startWatching() {
        if (this.isWatching) return;
        
        const commandsPath = path.resolve('./commands');
        
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
        }
        
        this.watchDirectory(commandsPath);
        this.isWatching = true;
        console.log(chalk.blue('👀 Watching for command changes...'));
    }

    watchDirectory(directory) {
        try {
            const watcher = watch(directory, { recursive: true }, (eventType, filename) => {
                if (!filename) return;
                if (!filename.endsWith('.js')) return;
                
                const fullPath = path.join(directory, filename);
                
                if (this.pendingReloads.has(fullPath)) {
                    clearTimeout(this.pendingReloads.get(fullPath));
                }
                
                this.pendingReloads.set(fullPath, setTimeout(() => {
                    this.pendingReloads.delete(fullPath);
                    this.handleFileChange(fullPath);
                }, this.reloadDebounceTime));
            });
            
            this.watchers.set(directory, watcher);
            
            const items = fs.readdirSync(directory);
            for (const item of items) {
                const fullPath = path.join(directory, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    this.watchDirectory(fullPath);
                }
            }
        } catch (error) {
            console.log(chalk.yellow(`Could not watch directory: ${error.message}`));
        }
    }

    async handleFileChange(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(chalk.yellow(`📁 File deleted: ${path.basename(filePath)}`));
                await this.reloadCommands();
                return;
            }
            
            const fileName = path.basename(filePath);
            if (!fileName.endsWith('.js') || fileName.includes('.test.') || fileName.includes('.disabled.')) {
                return;
            }
            
            console.log(chalk.cyan(`🔄 Detected change in: ${fileName}`));
            await this.clearFileFromCache(filePath);
            await this.reloadCommands();
            
        } catch (error) {
            console.log(chalk.red(`Error handling file change: ${error.message}`));
        }
    }

    async clearFileFromCache(filePath) {
        try {
            const resolvedPath = path.resolve(filePath);
            if (require.cache[resolvedPath]) {
                delete require.cache[resolvedPath];
            }
        } catch (error) {
            // Ignore
        }
    }

    async reloadCommands() {
        try {
            console.log(chalk.magenta('🔥 Hot reloading commands...'));
            
            const startTime = Date.now();
            const oldCommandCount = this.commandsMap.size;
            const oldCategories = new Map(this.commandCategoriesMap);
            
            this.commandsMap.clear();
            this.commandCategoriesMap.clear();
            
            await this.loadCommandsFromFolder('./commands');
            
            const newCommandCount = this.commandsMap.size;
            const reloadTime = Date.now() - startTime;
            
            this.logChanges(oldCommandCount, newCommandCount, oldCategories);
            
            if (this.reloadCallback) {
                await this.reloadCallback({
                    oldCount: oldCommandCount,
                    newCount: newCommandCount,
                    reloadTime: reloadTime,
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log(chalk.green(`✅ Hot reload completed in ${reloadTime}ms | ${oldCommandCount} → ${newCommandCount} commands`));
            
        } catch (error) {
            console.log(chalk.red(`Failed to reload commands: ${error.message}`));
        }
    }

    async loadCommandsFromFolder(folderPath, category = 'general') {
        const absolutePath = path.resolve(folderPath);
        if (!fs.existsSync(absolutePath)) {
            fs.mkdirSync(absolutePath, { recursive: true });
            return;
        }
        
        try {
            const items = fs.readdirSync(absolutePath);
            
            for (const item of items) {
                const fullPath = path.join(absolutePath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    await this.loadCommandsFromFolder(fullPath, item);
                } else if (item.endsWith('.js')) {
                    try {
                        if (item.includes('.test.') || item.includes('.disabled.')) continue;
                        
                        await this.clearFileFromCache(fullPath);
                        const commandModule = await import(`file://${fullPath}?update=${Date.now()}`);
                        const command = commandModule.default || commandModule;
                        
                        if (command && command.name) {
                            command.category = command.category || category;
                            command.ownerOnly = command.ownerOnly || false;
                            command.groupOnly = command.groupOnly || false;
                            command.adminOnly = command.adminOnly || false;
                            command.whitelistOnly = command.whitelistOnly || false;
                            
                            this.commandsMap.set(command.name.toLowerCase(), command);
                            
                            if (!this.commandCategoriesMap.has(command.category)) {
                                this.commandCategoriesMap.set(command.category, []);
                            }
                            if (!this.commandCategoriesMap.get(command.category).includes(command.name)) {
                                this.commandCategoriesMap.get(command.category).push(command.name);
                            }
                            
                            if (Array.isArray(command.alias)) {
                                command.alias.forEach(alias => {
                                    this.commandsMap.set(alias.toLowerCase(), command);
                                });
                            }
                        }
                    } catch (error) {
                        console.log(chalk.yellow(`Failed to load command from ${item}: ${error.message}`));
                    }
                }
            }
        } catch (error) {
            console.log(chalk.red(`Error loading commands from ${folderPath}: ${error.message}`));
        }
    }

    logChanges(oldCount, newCount, oldCategories) {
        const added = newCount - oldCount;
        
        for (const [category, commands] of this.commandCategoriesMap) {
            if (!oldCategories.has(category)) {
                console.log(chalk.green(`📁 New category added: ${category}`));
            }
        }
        
        for (const [category] of oldCategories) {
            if (!this.commandCategoriesMap.has(category)) {
                console.log(chalk.yellow(`📁 Category removed: ${category}`));
            }
        }
        
        if (added > 0) {
            console.log(chalk.green(`✨ Added ${added} new command${added > 1 ? 's' : ''}`));
        } else if (added < 0) {
            console.log(chalk.yellow(`🗑️ Removed ${Math.abs(added)} command${Math.abs(added) > 1 ? 's' : ''}`));
        }
    }

    stopWatching() {
        for (const [dir, watcher] of this.watchers) {
            try {
                watcher.close();
            } catch (error) {}
        }
        this.watchers.clear();
        this.isWatching = false;
        console.log(chalk.blue('👀 Hot reload watching stopped'));
    }

    getStatus() {
        return {
            isWatching: this.isWatching,
            watchedDirectories: this.watchers.size,
            pendingReloads: this.pendingReloads.size,
            commandCount: this.commandsMap?.size || 0,
            categoryCount: this.commandCategoriesMap?.size || 0
        };
    }
}

export default HotReloadSystem;