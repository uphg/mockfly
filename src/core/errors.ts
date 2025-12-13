export class MockflyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'MockflyError'
  }
}

export const ErrorCodes = {
  // 配置相关错误
  CONFIG_INVALID_PORT: 'CONFIG_INVALID_PORT',
  CONFIG_INVALID_HOST: 'CONFIG_INVALID_HOST',
  CONFIG_INVALID_ROUTES: 'CONFIG_INVALID_ROUTES',
  CONFIG_MISSING_PATH: 'CONFIG_MISSING_PATH',
  CONFIG_MISSING_RESPONSE: 'CONFIG_MISSING_RESPONSE',
  CONFIG_FILE_NOT_FOUND: 'CONFIG_FILE_NOT_FOUND',
  CONFIG_UNSUPPORTED_EXT: 'CONFIG_UNSUPPORTED_EXT',
  CONFIG_INVALID_EXPORT: 'CONFIG_INVALID_EXPORT',
  CONFIG_FUNCTION_INVALID_RETURN: 'CONFIG_FUNCTION_INVALID_RETURN',
  CONFIG_LOAD_FAILED: 'CONFIG_LOAD_FAILED',
  
  // 模板相关错误
  TEMPLATE_COMPILE_FAILED: 'TEMPLATE_COMPILE_FAILED',
  TEMPLATE_RENDER_FAILED: 'TEMPLATE_RENDER_FAILED',
  
  // 服务器相关错误
  SERVER_START_FAILED: 'SERVER_START_FAILED',
  SERVER_RESTART_FAILED: 'SERVER_RESTART_FAILED',
  
  // 初始化相关错误
  INIT_TEMPLATE_NOT_FOUND: 'INIT_TEMPLATE_NOT_FOUND',
  INIT_FILE_EXISTS: 'INIT_FILE_EXISTS',
  INIT_FAILED: 'INIT_FAILED',
  
  // 通用错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export const createError = (
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): MockflyError => {
  return new MockflyError(message, code, details)
}

export const handleError = (error: unknown): never => {
  if (error instanceof MockflyError) {
    console.error(`❌ [${error.code}] ${error.message}`)
    if (error.details) {
      console.error('   Details:', error.details)
    }
  } else if (error instanceof Error) {
    console.error(`❌ ${error.message}`)
  } else {
    console.error('❌ 未知错误')
  }
  
  process.exit(1)
}

export const logWarning = (message: string, details?: Record<string, unknown>) => {
  console.warn(`⚠️ ${message}`)
  if (details) {
    console.warn('   Details:', details)
  }
}

export const logInfo = (message: string) => {
  console.log(`- ${message}`)
}