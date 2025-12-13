import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startServer } from '../../src/core/server.js'
import { loadConfig } from '../../src/core/config.js'
import path from 'path'
import fs from 'fs/promises'

describe('Config Integration Tests', () => {
  const testDir = path.join(__dirname, '../root-temp')
  const configsDir = path.join(__dirname, '../fixtures/config')

  beforeAll(async () => {
    // 确保测试目录存在
    await fs.mkdir(testDir, { recursive: true })
  })

  afterAll(async () => {
    // 清理测试文件
    const files = await fs.readdir(testDir)
    for (const file of files) {
      if (file !== '.keep') {
        await fs.unlink(path.join(testDir, file))
      }
    }
  })

  describe('Config File Loading', () => {
    it('should load JS config file', async () => {
      const configPath = path.join(configsDir, 'mock.config.js')
      const config = await loadConfig(configPath)
      
      expect(config.port).toBe(3001)
      expect(config.host).toBe('localhost')
      expect(config.baseUrl).toBe('/api')
      expect(config.routes).toHaveLength(1)
      expect(config.routes[0]!.name).toBe('获取用户列表')
    })

    it('should load TS config file', async () => {
      const configPath = path.join(configsDir, 'mock.config.ts')
      const config = await loadConfig(configPath)
      
      expect(config.port).toBe(3002)
      expect(config.host).toBe('0.0.0.0')
      expect(config.baseUrl).toBe('/v2/api')
      expect(config.delay).toBe(100)
      expect(config.cors).toBe(false)
      expect(config.routes).toHaveLength(1)
      expect(config.routes[0]!.name).toBe('获取用户列表 V2')
    })

    it('should load JS config with function', async () => {
      const configPath = path.join(configsDir, 'mock.config.func.js')
      const config = await loadConfig(configPath)
      
      expect(config.port).toBe(3003)
      expect(config.baseUrl).toBe('/func-api')
      expect(config.routes).toHaveLength(1)
      expect(config.routes[0]!.name).toBe('函数配置路由')
    })

    it('should load JS config with async function', async () => {
      const configPath = path.join(configsDir, 'mock.config.async.js')
      const config = await loadConfig(configPath)
      
      expect(config.port).toBe(3004)
      expect(config.baseUrl).toBe('/async-api')
      expect(config.delay).toBe(50)
      expect(config.routes).toHaveLength(1)
      expect(config.routes[0]!.name).toBe('异步配置路由')
    })

    it('should use default config when file not found', async () => {
      const config = await loadConfig('non-existent-config.js')
      
      expect(config.port).toBe(4000)
      expect(config.host).toBe('localhost')
      expect(config.baseUrl).toBe('/api')
      expect(config.routes).toEqual([])
    })

    it('should override config with CLI options', async () => {
      const config = await loadConfig('non-existent-config.js', { port: 5000 })
      
      expect(config.port).toBe(5000)
      expect(config.host).toBe('localhost')
    })
  })

  describe('Config Priority', () => {
    it('should prioritize .ts over .js config files', async () => {
      const tsConfigPath = path.join(testDir, 'test-priority.ts')
      const jsConfigPath = path.join(testDir, 'test-priority.js')
      
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
      
      // 清理
      await fs.unlink(tsConfigPath)
      await fs.unlink(jsConfigPath)
    })
  })

  describe('Server Startup with Config', () => {
    it('should start server with JS config', async () => {
      const configPath = path.join(configsDir, 'mock.config.js')
      const config = await loadConfig(configPath)
      
      const server = await startServer(config)
      
      try {
        expect(server).toBeDefined()
        
        // 测试健康检查
        const response = await server.inject({
          method: 'GET',
          url: '/health'
        })
        
        expect(response.statusCode).toBe(200)
        const body = JSON.parse(response.body)
        expect(body.status).toBe('ok')
      } finally {
        await server.close()
      }
    })

    it('should start server with TS config', async () => {
      const configPath = path.join(configsDir, 'mock.config.ts')
      const config = await loadConfig(configPath)
      
      const server = await startServer(config)
      
      try {
        expect(server).toBeDefined()
        
        // 测试路由
        const response = await server.inject({
          method: 'GET',
          url: '/v2/api/users'
        })
        
        expect(response.statusCode).toBe(200)
      } finally {
        await server.close()
      }
    })

    it('should handle config validation errors', async () => {
      const invalidConfigPath = path.join(testDir, 'invalid-config.js')
      const invalidConfig = `export default {
        port: 'not-a-number', // 无效的端口
        host: 'localhost',
        routes: []
      }`
      
      await fs.writeFile(invalidConfigPath, invalidConfig)
      
      await expect(loadConfig(invalidConfigPath))
        .rejects
        .toThrow(/Invalid port number/)
      
      await fs.unlink(invalidConfigPath)
    })

    it('should handle missing route response', async () => {
      const invalidConfigPath = path.join(testDir, 'no-response-config.js')
      const invalidConfig = `export default {
        port: 4000,
        host: 'localhost',
        routes: [{ path: '/test', method: 'GET' }] // 缺少 response
      }`
      
      await fs.writeFile(invalidConfigPath, invalidConfig)
      
      await expect(loadConfig(invalidConfigPath))
        .rejects
        .toThrow(/must have either 'response' property/)
      
      await fs.unlink(invalidConfigPath)
    })
  })

  describe('Config Path Resolution', () => {
    it('should resolve absolute config path', async () => {
      const configPath = path.join(configsDir, 'mock.config.js')
      const config = await loadConfig(configPath)
      
      expect(config.configPath).toBe(configPath)
      expect(config.configDir).toBe(path.dirname(configPath))
    })

    it('should resolve relative config path', async () => {
      const configPath = '../fixtures/config/mock.config.js'
      const config = await loadConfig(configPath)
      
      expect(config.configPath).toContain('mock.config.js')
      expect(config.configDir).toContain('fixtures/config')
    })

    it('should set mockDir relative to config', async () => {
      const configPath = path.join(configsDir, 'mock.config.js')
      const config = await loadConfig(configPath)
      
      expect(config.mockDir).toBe(path.resolve(process.cwd(), './mockfly/data'))
    })
  })
})