import { loadConfig } from '../config.js'
import { startServer } from '../server.js'

export const startCommand = async (options) => {
  try {
    const cliOptions = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port)
    }
    
    const config = await loadConfig(options.config, cliOptions)
    await startServer(config)
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}
