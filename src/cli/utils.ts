import type { CliOptions } from '../utility-types'

/**
 * 解析 CLI 选项中的端口号
 * @param options CLI 选项
 * @returns 解析后的端口号或 undefined
 */
export const parsePort = (options: CliOptions): number | undefined => {
  if (options.port) {
    const port = parseInt(options.port.toString())
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${options.port}`)
    }
    return port
  }
  return undefined
}

/**
 * 创建 CLI 选项对象
 * @param options CLI 选项
 * @returns 处理后的 CLI 选项
 */
export const createCliOptions = (options: CliOptions): Partial<CliOptions> => {
  const cliOptions: Partial<CliOptions> = {}
  const port = parsePort(options)
  if (port !== undefined) {
    cliOptions.port = port
  }
  return cliOptions
}

/**
 * 验证端口号是否可用
 * @param port 端口号
 * @returns 端口号是否有效
 */
export const isValidPort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}
