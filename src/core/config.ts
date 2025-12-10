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

// 配置文件优先级顺序
const configFileExtensions = ['.ts', '.js', '.json'] as const

// 按优先级搜索配置文件
const findConfigFile = async (basePath: string): Promise<string | null> => {
  const cwd = process.cwd()
  const baseName = path.basename(basePath, path.extname(basePath))
  
  // 如果指定了具体路径，优先使用该路径
  if (path.isAbsolute(basePath) || basePath.includes(path.sep)) {
    const resolvedPath = path.resolve(cwd, basePath)
    if (await fileExists(resolvedPath)) {
      return resolvedPath
    }
    return null
  }

  // 按优先级搜索默认配置文件名
  for (const ext of configFileExtensions) {
    const configPath = path.resolve(cwd, `${baseName}${ext}`)
    if (await fileExists(configPath)) {
      return configPath
    }
  }

  return null
}

// 加载 JS/TS 配置文件
const loadJsConfig = async (filePath: string): Promise<Partial<MockflyConfig>> => {
  try {
    const configModule = await import(filePath)
    const config = configModule.default

    if (typeof config === 'function') {
      // 函数配置 - 支持同步和异步函数
      const result = await config()
      if (typeof result === 'object' && result !== null) {
        return result as Partial<MockflyConfig>
      }
      throw new Error('Config function must return an object')
    } else if (typeof config === 'object' && config !== null) {
      // 静态对象配置
      return config as Partial<MockflyConfig>
    } else {
      throw new Error('Config file must export a default object or function')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to load JS/TS config file ${filePath}: ${message}`)
  }
}

export const loadConfig = async (
  configPath = defaultConfigPath,
  cliOptions: CliOptions = {}
): Promise<MockflyConfig> => {
  const cwd = process.cwd()
  
  // 搜索配置文件
  const resolvedPath = await findConfigFile(configPath)
  
  let fileConfig: Partial<MockflyConfig> = {}
  if (resolvedPath) {
    const ext = path.extname(resolvedPath).toLowerCase()
    
    if (ext === '.json') {
      // JSON 配置文件
      fileConfig = await readJsonFile(resolvedPath)
    } else if (ext === '.js' || ext === '.ts') {
      // JS/TS 配置文件
      fileConfig = await loadJsConfig(resolvedPath)
    } else {
      throw new Error(`Unsupported config file extension: ${ext}`)
    }
  } else {
    console.warn(`Config file not found: ${configPath}, using default config`)
  }

  const config = merge({}, defaultConfig, fileConfig, cliOptions) as MockflyConfig
  
  config.mockDir = path.resolve(cwd, config.mockDir)
  config.configPath = resolvedPath || path.resolve(cwd, configPath)
  config.configDir = path.dirname(config.configPath)
  
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