import { loadConfig } from '../../core/config.js'
import { startServer } from '../../core/server.js'
import type { CliOptions } from '../../types/config.js'

export const startCommand = async (options: CliOptions) => {
  try {
    const cliOptions: Partial<CliOptions> = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port.toString())
    }
    
    const config = await loadConfig(options.config || 'mockfly/mock.config.json', cliOptions)
    await startServer(config)
  } catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}