import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerRoutes } from '../../src/core/routes.js'
import type { MockflyConfig } from '../../src/utility-types'
import type { FastifyInstance } from 'fastify'

describe('routes', () => {
  describe('registerRoutes', () => {
    let mockFastify: FastifyInstance
    let consoleWarnSpy: any
    let consoleLogSpy: any

    const baseConfig: MockflyConfig = {
      port: 4000,
      host: 'localhost',
      baseUrl: '/api',
      delay: 0,
      cors: true,
      mockDir: './mockfly/data',
      routes: []
    }

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      mockFastify = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        options: vi.fn(),
        head: vi.fn()
      } as unknown as FastifyInstance
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should register health endpoint', async () => {
      await registerRoutes(mockFastify, baseConfig)

      expect(mockFastify.get).toHaveBeenCalledWith('/health', expect.any(Function))
    })

    it('should register GET route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users',
            method: 'GET',
            response: { users: [] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.get).toHaveBeenCalledWith('/api/users', expect.any(Function))
      expect(consoleLogSpy).toHaveBeenCalledWith('[Registered route] [GET] /api/users - /users')
    })

    it('should register POST route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            name: '创建用户',
            path: '/users',
            method: 'POST',
            response: { success: true }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.post).toHaveBeenCalledWith('/api/users', expect.any(Function))
      expect(consoleLogSpy).toHaveBeenCalledWith('[Registered route] [POST] /api/users - 创建用户')
    })

    it('should register PUT route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users/:id',
            method: 'PUT',
            response: { updated: true }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.put).toHaveBeenCalledWith('/api/users/:id', expect.any(Function))
    })

    it('should register DELETE route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users/:id',
            method: 'DELETE',
            response: { deleted: true }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.delete).toHaveBeenCalledWith('/api/users/:id', expect.any(Function))
    })

    it('should register PATCH route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users/:id',
            method: 'PATCH',
            response: { patched: true }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.patch).toHaveBeenCalledWith('/api/users/:id', expect.any(Function))
    })

    it('should register OPTIONS route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users',
            method: 'OPTIONS',
            response: { allowed: ['GET', 'POST'] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.options).toHaveBeenCalledWith('/api/users', expect.any(Function))
    })

    it('should register HEAD route', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users',
            method: 'HEAD',
            response: {}
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.head).toHaveBeenCalledWith('/api/users', expect.any(Function))
    })

    it('should handle multiple routes', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users',
            method: 'GET',
            response: { users: [] }
          },
          {
            path: '/users',
            method: 'POST',
            response: { created: true }
          },
          {
            path: '/products',
            method: 'GET',
            response: { products: [] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.get).toHaveBeenCalledTimes(3) // health + /users + /products
      expect(mockFastify.post).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledTimes(3) // 3 routes (health endpoint doesn't log)
    })

    it('should use route name in log when provided', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            name: '获取用户列表',
            path: '/users',
            method: 'GET',
            response: { users: [] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(consoleLogSpy).toHaveBeenCalledWith('[Registered route] [GET] /api/users - 获取用户列表')
    })

    it('should use path as name when route name not provided', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users',
            method: 'GET',
            response: { users: [] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(consoleLogSpy).toHaveBeenCalledWith('[Registered route] [GET] /api/users - /users')
    })

    it('should warn for unknown HTTP method', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/test',
            method: 'UNKNOWN' as any,
            response: {}
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown HTTP method: UNKNOWN')
    })

    it('should handle case-insensitive HTTP methods', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        routes: [
          {
            path: '/users',
            method: 'get' as any, // 小写
            response: { users: [] }
          },
          {
            path: '/users',
            method: 'Post' as any, // 首字母大写
            response: { created: true }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.get).toHaveBeenCalledWith('/api/users', expect.any(Function))
      expect(mockFastify.post).toHaveBeenCalledWith('/api/users', expect.any(Function))
    })

    it('should handle empty baseUrl', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        baseUrl: '',
        routes: [
          {
            path: '/users',
            method: 'GET',
            response: { users: [] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.get).toHaveBeenCalledWith('/users', expect.any(Function))
    })

    it('should handle custom baseUrl', async () => {
      const config: MockflyConfig = {
        ...baseConfig,
        baseUrl: '/v2/api',
        routes: [
          {
            path: '/users',
            method: 'GET',
            response: { users: [] }
          }
        ]
      }

      await registerRoutes(mockFastify, config)

      expect(mockFastify.get).toHaveBeenCalledWith('/v2/api/users', expect.any(Function))
    })
  })
})