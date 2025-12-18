import chokidar from 'chokidar'
import path from 'node:path'
import { loadConfig } from '../core/config'
import { startServer } from '../core/server'
import { handleError, logInfo } from '../core/errors'
import { createCliOptions } from './utils'
import type { CliOptions } from '../utility-types'
import type { FastifyInstance } from 'fastify'

let currentServer: FastifyInstance | null = null
let isRestarting = false
let watcher: chokidar.FSWatcher | null = null
let debounceTimer: NodeJS.Timeout | null = null

export const devCommand = async (options: CliOptions) => {
  try {
    const cliOptions = createCliOptions(options)
    const config = await loadConfig(options.config, cliOptions)
    currentServer = await startServer(config)
    
    console.log('\n🔥 Hot reload enabled - watching for changes...\n')
    
    const watchPaths = [
      config.configPath || 'mockfly/mock.config.ts',
      config.mockDir || 'mockfly/data'
    ]
    
    watcher = chokidar.watch(watchPaths, {
      ignored: [
        /(^|[\/\\])\../, // 隐藏文件
        /node_modules/, // node_modules 目录
        /\.git/, // git 目录
        /\.DS_Store/, // macOS 系统文件
        /\.log$/, // 日志文件
        /\.tmp$/, // 临时文件
        /\.swp$/, // vim 交换文件
        /\.bak$/, // 备份文件
        /\.test\.(js|ts)$/, // 测试文件
        /\.spec\.(js|ts)$/ // 测试文件
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      },
      ignorePermissionErrors: true,
      usePolling: process.platform === 'win32' // Windows 平台使用轮询
    })
    
    let restartInProgress = false
    
    const debouncedRestart = async () => {
      if (restartInProgress) return
      
      restartInProgress = true
      try {
        await restartServer(options)
      } finally {
        restartInProgress = false
      }
    }
    
    watcher.on('all', (event, filepath) => {
      if (isRestarting) return
      
      const relativePath = path.relative(process.cwd(), filepath)
      console.log(`\n📝 File ${event}: ${relativePath}`)
      
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(debouncedRestart, 800) // 增加防抖时间
    })
    
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down server...')
      await cleanupResources()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      console.log('\n\n🔚 Received termination signal...')
      await cleanupResources()
      process.exit(0)
    })

    process.on('uncaughtException', async (error) => {
      console.error('\n\n💥 Uncaught exception:', error)
      await cleanupResources()
      process.exit(1)
    })

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('\n\n⚠️ Unhandled rejection at:', promise, 'reason:', reason)
      await cleanupResources()
      process.exit(1)
    })
    
  } catch (error) {
    handleError(error)
  }
}

const restartServer = async (options: CliOptions) => {
  if (isRestarting) return
  isRestarting = true
  
  try {
    logInfo('🔄 Restarting server...')
    
    if (currentServer) {
      await currentServer.close()
      currentServer = null
    }
    
    const cliOptions = createCliOptions(options)
    const config = await loadConfig(options.config, cliOptions)
    currentServer = await startServer(config)
    
    logInfo('✅ Server restarted successfully\n')
  } catch (error) {
    handleError(error)
  } finally {
    isRestarting = false
  }
}

const cleanupResources = async () => {
  console.log('🧹 Cleaning up resources...')
  
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  
  if (watcher) {
    await watcher.close()
    watcher = null
  }
  
  if (currentServer) {
    await currentServer.close()
    currentServer = null
  }
  
  console.log('✅ Resources cleaned up')
}