import path from 'path'
import merge from 'lodash.merge'
import { fileExists, readJsonFile } from './utils.ts'
import type { MockflyConfig, CliOptions, Route } from '../utility-types'

const defaultConfig: MockflyConfig = {
  port: 4000,
  host: 'localhost',
  baseUrl: '/api',
  delay: 0,
  cors: true,
  mockDir: './mockfly/data',
  routes: []
}

export const defaultConfigPath = 'mockfly/mock.config.json'

export const loadConfig = async (
  configPath = defaultConfigPath,
  cliOptions: CliOptions = {}
): Promise<MockflyConfig> => {
  const cwd = process.cwd()
  const resolvedPath = path.resolve(cwd, configPath)
  
  let fileConfig: Partial<MockflyConfig> = {}
  if (await fileExists(resolvedPath)) {
    fileConfig = await readJsonFile(resolvedPath)
  } else {
    console.warn(`Config file not found: ${resolvedPath}, using default config`)
  }

  const config = merge({}, defaultConfig, fileConfig, cliOptions) as MockflyConfig
  
  config.mockDir = path.resolve(cwd, config.mockDir)
  config.configPath = resolvedPath
  config.configDir = path.dirname(resolvedPath)
  
  validateConfig(config)
  
  return config
}

const validateConfig = (config: MockflyConfig): void => {
  if (!config.port || typeof config.port !== 'number') {
    throw new Error('Invalid port number')
  }
  
  if (!config.host || typeof config.host !== 'string') {
    throw new Error('Invalid host')
  }
  
  if (!Array.isArray(config.routes)) {
    throw new Error('Routes must be an array')
  }
  
  config.routes.forEach((route: Route, index: number) => {
    if (!route.path) {
      throw new Error(`Route at index ${index} missing required 'path' property`)
    }
    if (!route.method) {
      route.method = 'GET'
    }
    if (!route.response && !route.responseFile) {
      throw new Error(`Route '${route.path}' must have either 'response' or 'responseFile' property`)
    }
  })
}

export const reloadConfig = async (
  configPath: string,
  cliOptions: CliOptions = {}
): Promise<MockflyConfig> => {
  return await loadConfig(configPath, cliOptions)
}