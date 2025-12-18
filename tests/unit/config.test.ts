import { describe, it, expect } from 'vitest'
import { loadConfig } from '../../src/core/config.js'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = path.join(process.cwd(), 'tests/root-temp')
const __dirname = path.dirname(new URL(import.meta.url).pathname)

describe('loadConfig', () => {
  it('should load default config when file not found', async () => {
    const config = await loadConfig('non-existent-config.ts')
    
    expect(config.port).toBe(4000)
    expect(config.host).toBe('localhost')
    expect(config.baseUrl).toBe('/api')
    expect(config.routes).toEqual([])
  })

  it('should load custom JS config', async () => {
    const testConfigPath = path.join(rootDir, 'test-config.js')
    const testConfig = `export default {
      port: 4000,
      host: '0.0.0.0',
      routes: [
        { path: '/test', method: 'GET', response: { status: 'ok' } }
      ]
    }`
    
    await fs.writeFile(testConfigPath, testConfig)
    
    const config = await loadConfig(testConfigPath)
    
    expect(config.port).toBe(4000)
    expect(config.host).toBe('0.0.0.0')
    expect(config.routes.length).toBe(1)
    
    await fs.unlink(testConfigPath)
  })

  it('should override config with CLI options', async () => {
    const config = await loadConfig('non-existent.ts', { port: 5000 })
    
    expect(config.port).toBe(5000)
  })

  it('should validate route must have path', async () => {
    const testConfigPath = path.join(rootDir, 'test-invalid-config.js')
    const testConfig = `export default {
      routes: [{ method: 'GET', response: {} }]
    }`
    
    await fs.writeFile(testConfigPath, testConfig)
    
    await expect(
      loadConfig(testConfigPath)
    ).rejects.toThrow(/missing required 'path' property/)
    
    await fs.unlink(testConfigPath)
  })

  it('should validate route must have response', async () => {
    const testConfigPath = path.join(rootDir, 'test-no-response.js')
    const testConfig = `export default {
      routes: [{ path: '/test', method: 'GET' }]
    }`
    
    await fs.writeFile(testConfigPath, testConfig)
    
    await expect(
      loadConfig(testConfigPath)
    ).rejects.toThrow(/must have either 'response'/)
    
    await fs.unlink(testConfigPath)
  })

  it('should default method to GET', async () => {
    const testConfigPath = path.join(rootDir, 'test-default-method.js')
    const testConfig = `export default {
      routes: [{ path: '/test', response: {} }]
    }`
    
    await fs.writeFile(testConfigPath, testConfig)
    
    const config = await loadConfig(testConfigPath)
    
    expect(config.routes[0]!.method).toBe('GET')
    
    await fs.unlink(testConfigPath)
  })

  it('should load JS config file with static object', async () => {
    const configPath = path.join(__dirname, '../fixtures/config/mock.config.js')
    const config = await loadConfig(configPath)
    
    expect(config.port).toBe(3001)
    expect(config.host).toBe('localhost')
    expect(config.baseUrl).toBe('/api')
    expect(config.routes.length).toBe(1)
    expect(config.routes[0]!.name).toBe('获取用户列表')
  })

  it('should load TS config file', async () => {
    const configPath = path.join(__dirname, '../fixtures/config/mock.config.ts')
    const config = await loadConfig(configPath)
    expect(config.port).toBe(3002)
    expect(config.host).toBe('0.0.0.0')
    expect(config.baseUrl).toBe('/v2/api')
    expect(config.delay).toBe(100)
    expect(config.cors).toBe(false)
    expect(config.routes.length).toBe(1)
    expect(config.routes[0]!.name).toBe('获取用户列表 V2')
  })

  it('should load JS config file with function', async () => {
    const configPath = path.join(__dirname, '../fixtures/config/mock.config.func.js')
    const config = await loadConfig(configPath)
    
    expect(config.port).toBe(3003)
    expect(config.baseUrl).toBe('/func-api')
    expect(config.routes.length).toBe(1)
    expect(config.routes[0]!.name).toBe('函数配置路由')
  })

  it('should load JS config file with async function', async () => {
    const configPath = path.join(__dirname, '../fixtures/config/mock.config.async.js')
    const config = await loadConfig(configPath)
    
    expect(config.port).toBe(3004)
    expect(config.baseUrl).toBe('/async-api')
    expect(config.delay).toBe(50)
    expect(config.routes.length).toBe(1)
    expect(config.routes[0]!.name).toBe('异步配置路由')
  })

  it('should prioritize .ts over .js config files', async () => {
    const tsConfigPath = path.join(rootDir, 'test-priority.ts')
    const jsConfigPath = path.join(rootDir, 'test-priority.js')
    
    const tsConfig = `export default {
      port: 7777,
      host: 'ts-host',
      routes: [{ path: '/ts', method: 'GET', response: { from: 'ts' } }]
    }`
    
    const jsConfig = `export default {
      port: 6666,
      host: 'js-host',
      routes: [{ path: '/js', method: 'GET', response: { from: 'js' } }]
    }`
    
    await fs.writeFile(tsConfigPath, tsConfig)
    await fs.writeFile(jsConfigPath, jsConfig)
    
    const config = await loadConfig(tsConfigPath)
    
    expect(config.port).toBe(7777)
    expect(config.host).toBe('ts-host')
    expect(config.routes[0]!.path).toBe('/ts')
    expect((config.routes[0]!.response as any).from).toBe('ts')
    
    await fs.unlink(tsConfigPath)
    await fs.unlink(jsConfigPath)
  })

  it('should support route.response as function', async () => {
    const testConfigPath = path.join(rootDir, 'test-response-func.js')
    const testConfig = `export default {
      routes: [{
        path: '/func',
        method: 'GET',
        response: () => ({ data: 'from function' })
      }]
    }`
    
    await fs.writeFile(testConfigPath, testConfig)
    
    const config = await loadConfig(testConfigPath)
    
    expect(config.routes[0]!.path).toBe('/func')
    expect(typeof config.routes[0]!.response).toBe('function')
    const result = (config.routes[0]!.response as Function)()
    expect(result).toEqual({ data: 'from function' })
    
    await fs.unlink(testConfigPath)
  })

  it('should support route.response as async function', async () => {
    const testConfigPath = path.join(rootDir, 'test-response-async.js')
    const testConfig = `export default {
      routes: [{
        path: '/async',
        method: 'GET',
        response: async () => {
          return { data: 'from async function' }
        }
      }]
    }`
    
    await fs.writeFile(testConfigPath, testConfig)
    
    const config = await loadConfig(testConfigPath)
    
    expect(config.routes[0]!.path).toBe('/async')
    expect(typeof config.routes[0]!.response).toBe('function')
    const result = await (config.routes[0]!.response as Function)()
    expect(result).toEqual({ data: 'from async function' })
    
    await fs.unlink(testConfigPath)
  })

  it('should handle invalid JS/TS config file', async () => {
    const invalidConfigPath = path.join(rootDir, 'test-invalid.js')
    await fs.writeFile(invalidConfigPath, 'export default "invalid"')
    
    await expect(
      loadConfig(invalidConfigPath)
    ).rejects.toThrow(/Config file must export a default object or function/)
    
    await fs.unlink(invalidConfigPath)
  })

  it('should handle JS function that returns non-object', async () => {
    const invalidFuncPath = path.join(rootDir, 'test-invalid-func.js')
    await fs.writeFile(invalidFuncPath, 'export default () => "invalid"')
    
    await expect(
      loadConfig(invalidFuncPath)
    ).rejects.toThrow(/Config function must return an object/)
    
    await fs.unlink(invalidFuncPath)
  })

  it('should handle missing default export in JS/TS config', async () => {
    const noDefaultPath = path.join(rootDir, 'test-no-default.js')
    await fs.writeFile(noDefaultPath, 'export const other = {}')
    
    await expect(
      loadConfig(noDefaultPath)
    ).rejects.toThrow(/Config file must export a default object or function/)
    
    await fs.unlink(noDefaultPath)
  })

  it('should work with absolute config path', async () => {
    const absConfigPath = path.join(__dirname, '../fixtures/config/mock.config.js')
    const config = await loadConfig(absConfigPath)
    
    expect(config.port).toBe(3001)
    expect(config.routes.length).toBe(1)
  })

  it('should set configPath and configDir correctly for JS/TS files', async () => {
    const configPath = path.join(__dirname, '../fixtures/config/mock.config.js')
    const config = await loadConfig(configPath)
    
    expect(config.configPath).toBe(configPath)
    expect(config.configDir).toBe(path.dirname(configPath))
  })
})