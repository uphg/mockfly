import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startServer } from '../../src/core/server.js'
import { loadConfig } from '../../src/core/config.js'
import path from 'path'
import type { MockflyConfig } from '../../src/utility-types'

describe('API Integration Tests', () => {
  let server: any
  let config: MockflyConfig

  beforeAll(async () => {
    // 加载测试配置
    const configPath = path.join(__dirname, 'test-config.js')
    config = await loadConfig(configPath)
    
    // 启动服务器
    server = await startServer(config)
  }, 30000) // 增加超时时间

  afterAll(async () => {
    if (server) {
      await server.close()
    }
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveProperty('status', 'ok')
      expect(body).toHaveProperty('timestamp')
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
    })
  })

  describe('GET Routes', () => {
    it('should return user list', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/users'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toBeInstanceOf(Array)
      expect(body).toHaveLength(3)
      expect(body[0]).toEqual({ id: 1, name: '用户1' })
    })

    it('should return single user with function response', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/users/123?page=1&limit=10'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toEqual({
        id: '123',
        name: '用户123',
        query: { page: '1', limit: '10' }
      })
    })

    it('should handle template response', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/template?name=World',
        headers: {
          'X-Custom-Header': 'test'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.message).toBe('Hello World')
      expect(body).toHaveProperty('timestamp')
      
      // headers 应该是 JSON 字符串
      expect(typeof body.headers).toBe('string')
      // 检查是否包含自定义 header
      expect(body.headers.toLowerCase()).toContain('x-custom-header')
    })
  })

  describe('POST Routes', () => {
    it('should create user with request body', async () => {
      const userData = {
        name: '新用户',
        email: 'new@example.com'
      }

      const response = await server.inject({
        method: 'POST',
        url: '/api/users',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(userData)
      expect(body).toHaveProperty('created')
    })
  })

  describe('PUT Routes', () => {
    it('should update user', async () => {
      const updateData = {
        name: '更新后的用户',
        email: 'updated@example.com'
      }

      const response = await server.inject({
        method: 'PUT',
        url: '/api/users/456',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.id).toBe('456')
      expect(body.data).toEqual(updateData)
      expect(body).toHaveProperty('updated')
    })
  })

  describe('DELETE Routes', () => {
    it('should delete user', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: '/api/users/789'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.id).toBe('789')
      expect(body).toHaveProperty('deleted')
    })
  })

  describe('Delay Feature', () => {
    it('should apply delay to response', async () => {
      const startTime = Date.now()
      
      const response = await server.inject({
        method: 'GET',
        url: '/api/delay'
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toEqual({ message: 'Delayed response' })
      expect(duration).toBeGreaterThanOrEqual(90) // 允许一些误差
    }, 10000) // 增加超时时间
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/non-existent'
      })

      expect(response.statusCode).toBe(404)
    })

    it('should return 404 for route without api prefix', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/users'
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('CORS Support', () => {
    it('should include CORS headers when origin present', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/users',
        headers: {
          'Origin': 'http://example.com'
        }
      })

      expect(response.statusCode).toBe(200)
      // Fastify CORS 插件可能只在有 Origin 头时才添加 CORS 头
      expect(response.headers['access-control-allow-origin']).toBeDefined()
    })
  })
})