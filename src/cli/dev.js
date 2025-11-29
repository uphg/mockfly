import chokidar from 'chokidar'
import path from 'path'
import { loadConfig } from '../config.js'
import { startServer } from '../server.js'

let currentServer = null
let isRestarting = false

export const devCommand = async (options) => {
  try {
    const cliOptions = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port)
    }
    
    const config = await loadConfig(options.config, cliOptions)
    currentServer = await startServer(config)
    
    console.log('\n🔥 Hot reload enabled - watching for changes...\n')
    
    const watchPaths = [
      config.configPath,
      config.mockDir
    ]
    
    const watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    })
    
    let debounceTimer = null
    
    watcher.on('all', (event, filepath) => {
      if (isRestarting) return
      
      console.log(`\n📝 File ${event}: ${path.relative(process.cwd(), filepath)}`)
      
      clearTimeout(debounceTimer)
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
    console.error('Failed to start dev server:', error.message)
    process.exit(1)
  }
}

const restartServer = async (options) => {
  if (isRestarting) return
  isRestarting = true
  
  try {
    console.log('🔄 Restarting server...')
    
    if (currentServer) {
      await currentServer.close()
    }
    
    const cliOptions = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port)
    }
    
    const config = await loadConfig(options.config, cliOptions)
    currentServer = await startServer(config)
    
    console.log('✅ Server restarted successfully\n')
  } catch (error) {
    console.error('❌ Failed to restart server:', error.message)
  } finally {
    isRestarting = false
  }
}
