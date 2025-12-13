import { loadConfig } from '../core/config'
import { startServer } from '../core/server'
import { handleError } from '../core/errors'
import { createCliOptions } from './utils'
import type { CliOptions } from '../utility-types'

export const startCommand = async (options: CliOptions) => {
  try {
    const cliOptions = createCliOptions(options)
    const config = await loadConfig(options.config, cliOptions)
    await startServer(config)
  } catch (error) {
    handleError(error)
  }
}