import { describe, it, expect } from 'vitest'
import { loadConfig } from '../../src/core/config.js'
import { promises as fs } from 'fs'
import path from 'path'

describe('loadConfig', () => {
  it('should load default config', async () => {
    const config = await loadConfig('non-existent-config.json')
    
    expect(config.port).toBe(4000)
    expect(config.host).toBe('localhost')
    expect(config.baseUrl).toBe('/api')
    expect(config.routes).toEqual([])
  })

  it('should load custom config', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-config.json')
    const testConfig = {
      port: 4000,
      host: '0.0.0.0',
      routes: [
        { path: '/test', method: 'GET', response: { status: 'ok' } }
      ]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    const config = await loadConfig('test-config.json')
    
    expect(config.port).toBe(4000)
    expect(config.host).toBe('0.0.0.0')
    expect(config.routes.length).toBe(1)
    
    await fs.unlink(testConfigPath)
  })

  it('should override config with CLI options', async () => {
    const config = await loadConfig('non-existent.json', { port: 5000 })
    
    expect(config.port).toBe(5000)
  })

  it('should validate route must have path', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-invalid-config.json')
    const testConfig = {
      routes: [{ method: 'GET' }]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    await expect(
      loadConfig('test-invalid-config.json')
    ).rejects.toThrow(/missing required 'path' property/)
    
    await fs.unlink(testConfigPath)
  })

  it('should validate route must have response or responseFile', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-no-response.json')
    const testConfig = {
      routes: [{ path: '/test', method: 'GET' }]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    await expect(
      loadConfig('test-no-response.json')
    ).rejects.toThrow(/must have either 'response' or 'responseFile'/)
    
    await fs.unlink(testConfigPath)
  })

  it('should default method to GET', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-default-method.json')
    const testConfig = {
      routes: [{ path: '/test', response: {} }]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    const config = await loadConfig('test-default-method.json')
    
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

  it('should prioritize .js over .json config files', async () => {
    const jsConfigPath = path.join(process.cwd(), 'test-priority.js')
    const jsonConfigPath = path.join(process.cwd(), 'test-priority.json')
    
    const jsConfig = {
      port: 9999,
      host: 'js-host',
      routes: [{ path: '/js', method: 'GET', response: { from: 'js' } }]
    }
    
    const jsonConfig = {
      port: 8888,
      host: 'json-host',
      routes: [{ path: '/json', method: 'GET', response: { from: 'json' } }]
    }
    
    await fs.writeFile(jsConfigPath, `export default ${JSON.stringify(jsConfig)}`)
    await fs.writeFile(jsonConfigPath, JSON.stringify(jsonConfig))
    
    const config = await loadConfig('test-priority')
    
    expect(config.port).toBe(9999)
    expect(config.host).toBe('js-host')
    expect(config.routes[0]!.path).toBe('/js')
    expect((config.routes[0]!.response as any).from).toBe('js')
    
    await fs.unlink(jsConfigPath)
    await fs.unlink(jsonConfigPath)
  })

  it('should prioritize .ts over .js and .json config files', async () => {
    const tsConfigPath = path.join(process.cwd(), 'test-priority-ts.ts')
    const jsConfigPath = path.join(process.cwd(), 'test-priority-ts.js')
    const jsonConfigPath = path.join(process.cwd(), 'test-priority-ts.json')
    
    const tsConfig = {
      port: 7777,
      host: 'ts-host',
      routes: [{ path: '/ts', method: 'GET', response: { from: 'ts' } }]
    }
    
    const jsConfig = {
      port: 6666,
      host: 'js-host',
      routes: [{ path: '/js', method: 'GET', response: { from: 'js' } }]
    }
    
    const jsonConfig = {
      port: 5555,
      host: 'json-host',
      routes: [{ path: '/json', method: 'GET', response: { from: 'json' } }]
    }
    
    await fs.writeFile(tsConfigPath, `export default ${JSON.stringify(tsConfig)}`)
    await fs.writeFile(jsConfigPath, `export default ${JSON.stringify(jsConfig)}`)
    await fs.writeFile(jsonConfigPath, JSON.stringify(jsonConfig))
    
    const config = await loadConfig('test-priority-ts')
    
    expect(config.port).toBe(7777)
    expect(config.host).toBe('ts-host')
    expect(config.routes[0]!.path).toBe('/ts')
    expect((config.routes[0]!.response as any).from).toBe('ts')
    
    await fs.unlink(tsConfigPath)
    await fs.unlink(jsConfigPath)
    await fs.unlink(jsonConfigPath)
  })

  it('should handle invalid JS/TS config file', async () => {
    const invalidConfigPath = path.join(process.cwd(), 'test-invalid.js')
    await fs.writeFile(invalidConfigPath, 'export default "invalid"')
    
    await expect(
      loadConfig(invalidConfigPath)
    ).rejects.toThrow(/Config file must export a default object or function/)
    
    await fs.unlink(invalidConfigPath)
  })

  it('should handle JS function that returns non-object', async () => {
    const invalidFuncPath = path.join(process.cwd(), 'test-invalid-func.js')
    await fs.writeFile(invalidFuncPath, 'export default () => "invalid"')
    
    await expect(
      loadConfig(invalidFuncPath)
    ).rejects.toThrow(/Config function must return an object/)
    
    await fs.unlink(invalidFuncPath)
  })

  it('should handle missing default export in JS/TS config', async () => {
    const noDefaultPath = path.join(process.cwd(), 'test-no-default.js')
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