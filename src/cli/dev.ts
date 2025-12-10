import chokidar from 'chokidar'
import path from 'path'
import { defaultConfigPath, loadConfig } from '../core/config'
import { startServer } from '../core/server'
import type { FastifyInstance } from 'fastify'
import type { CliOptions } from '../utility-types'

let currentServer: FastifyInstance | null = null
let isRestarting = false

export const devCommand = async (options: CliOptions) => {
  try {
    const cliOptions: Partial<CliOptions> = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port.toString())
    }
    
    const config = await loadConfig(options.config || defaultConfigPath, cliOptions)
    currentServer = await startServer(config)
    
    console.log('\n🔥 Hot reload enabled - watching for changes...\n')
    
    const watchPaths = [
      config.configPath!,
      config.mockDir
    ]
    
    const watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    })
    
    let debounceTimer: NodeJS.Timeout | null = null
    
    watcher.on('all', (event, filepath) => {
      if (isRestarting) return
      
      console.log(`\n📝 File ${event}: ${path.relative(process.cwd(), filepath)}`)
      
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      debounceTimer = setTimeout(async () => {
        await restartServer(options)
      }, 500)
    })
    
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down server...')
      await watcher.close()
      if (currentServer) {
        await currentServer.close()
      }
      process.exit(0)
    })
    
  } catch (error) {
    console.error('Failed to start dev server:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

const restartServer = async (options: CliOptions) => {
  if (isRestarting) return
  isRestarting = true
  
  try {
    console.log('🔄 Restarting server...')
    
    if (currentServer) {
      await currentServer.close()
    }
    
    const cliOptions: Partial<CliOptions> = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port.toString())
    }
    
    const config = await loadConfig(options.config || defaultConfigPath, cliOptions)
    currentServer = await startServer(config)
    
    console.log('✅ Server restarted successfully\n')
  } catch (error) {
    console.error('❌ Failed to restart server:', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    isRestarting = false
  }
}