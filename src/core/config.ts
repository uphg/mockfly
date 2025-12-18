import path from 'node:path'
import merge from 'lodash.merge'
import { fileExists } from './utils.ts'
import { createError, ErrorCodes, logWarning } from './errors.ts'
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

// 配置文件优先级顺序
const configFileExtensions = ['.ts', '.js'] as const

// 按优先级搜索配置文件
const findConfigFile = async (basePath?: string): Promise<string | null> => {
  const cwd = process.cwd()
  const mockDir = path.join(cwd, 'mockfly');
  const baseName = basePath ? path.basename(basePath, path.extname(basePath)) : 'mock.config'

  if (basePath) {
    // 如果指定了具体路径，优先使用该路径
    if (path.isAbsolute(basePath) || basePath.includes(path.sep)) {
      const resolvedPath = path.resolve(cwd, basePath)
      if (await fileExists(resolvedPath)) {
        return resolvedPath
      }
      return null
    }
  } else {
      // 按优先级搜索默认配置文件名
      for (const ext of configFileExtensions) {
        const configPath = path.resolve(mockDir, `${baseName}${ext}`)
        if (await fileExists(configPath)) {
          return configPath
        }
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
      throw createError(
        ErrorCodes.CONFIG_FUNCTION_INVALID_RETURN,
        'Config function must return an object'
      )
    } else if (typeof config === 'object' && config !== null) {
      // 静态对象配置
      return config as Partial<MockflyConfig>
    } else {
      throw createError(
        ErrorCodes.CONFIG_INVALID_EXPORT,
        'Config file must export a default object or function'
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw createError(
      ErrorCodes.CONFIG_LOAD_FAILED,
      `Failed to load JS/TS config file ${filePath}: ${message}`,
      { filePath, originalError: message }
    )
  }
}

export async function loadConfig (configPath?: string, cliOptions: CliOptions = {}): Promise<MockflyConfig> {
  const cwd = process.cwd()
  
  // 搜索配置文件
  const resolvedPath = await findConfigFile(configPath)
  
  let fileConfig: Partial<MockflyConfig> = {}
  if (resolvedPath) {
    const ext = path.extname(resolvedPath).toLowerCase()
    if (ext === '.js' || ext === '.ts') {
      // JS/TS 配置文件
      fileConfig = await loadJsConfig(resolvedPath)
    } else {
      throw createError(
        ErrorCodes.CONFIG_UNSUPPORTED_EXT,
        `Unsupported config file extension: ${ext}`,
        { filePath: resolvedPath, extension: ext }
      )
    }
  } else {
    logWarning(`Config file not found: ${configPath}, using default config`)
  }

  const config = merge({}, defaultConfig, fileConfig, cliOptions) as MockflyConfig
  
  config.mockDir = path.resolve(cwd, config.mockDir || './mockfly/data')
  config.configPath = resolvedPath || (configPath ? path.resolve(cwd, configPath) : path.resolve(cwd, 'mockfly/mock.config.ts'))
  config.configDir = path.dirname(config.configPath)
  
  validateConfig(config)
  
  return config
}

const validateConfig = (config: MockflyConfig): void => {
  if (!config.port || typeof config.port !== 'number') {
    throw createError(
      ErrorCodes.CONFIG_INVALID_PORT,
      'Invalid port number',
      { port: config.port }
    )
  }
  
  if (!config.host || typeof config.host !== 'string') {
    throw createError(
      ErrorCodes.CONFIG_INVALID_HOST,
      'Invalid host',
      { host: config.host }
    )
  }
  
  if (!Array.isArray(config.routes)) {
    throw createError(
      ErrorCodes.CONFIG_INVALID_ROUTES,
      'Routes must be an array',
      { routes: config.routes }
    )
  }
  
  config.routes.forEach((route: Route, index: number) => {
    if (!route.path) {
      throw createError(
        ErrorCodes.CONFIG_MISSING_PATH,
        `Route at index ${index} missing required 'path' property`,
        { index, route }
      )
    }
    if (!route.method) {
      route.method = 'GET'
    }
    if (!route.response) {
      throw createError(
        ErrorCodes.CONFIG_MISSING_RESPONSE,
        `Route '${route.path}' must have either 'response' property`,
        { path: route.path, route }
      )
    }
  })
}
