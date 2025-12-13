import { loadConfig } from '../core/config'
import { startServer } from '../core/server'
import type { CliOptions } from '../utility-types'

export const startCommand = async (options: CliOptions) => {
  try {
    const cliOptions: Partial<CliOptions> = {}
    if (options.port) {
      cliOptions.port = parseInt(options.port.toString())
    }
    
    const config = await loadConfig(options.config, cliOptions)
    await startServer(config)
  } catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}