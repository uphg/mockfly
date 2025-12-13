import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouteHandler, createHealthHandler } from '../../src/core/handlers.js'
import type { Route, MockflyConfig } from '../../src/utility-types'

describe('handlers', () => {
  describe('createRouteHandler', () => {
    const mockRequest = {
      params: { id: '123' },
      query: { page: '1' },
      body: { name: 'test' },
      headers: { 'content-type': 'application/json' }
    } as any

    const mockReply = {
      send: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis()
    } as any

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
      vi.clearAllMocks()
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should handle static response', async () => {
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: { message: 'Hello World' }
      }

      const handler = createRouteHandler(route, baseConfig)
      await handler(mockRequest, mockReply)

      expect(mockReply.send).toHaveBeenCalledWith({ message: 'Hello World' })
    })

    it('should handle function response', async () => {
      const mockResponse = { data: 'from function' }
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: () => mockResponse
      }

      const handler = createRouteHandler(route, baseConfig)
      await handler(mockRequest, mockReply)

      expect(mockReply.send).toHaveBeenCalledWith(mockResponse)
    })

    it('should handle async function response', async () => {
      const mockResponse = { data: 'from async function' }
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: async () => {
          // 不使用 setTimeout，直接返回
          return mockResponse
        }
      }

      const handler = createRouteHandler(route, baseConfig)
      await handler(mockRequest, mockReply)

      expect(mockReply.send).toHaveBeenCalledWith(mockResponse)
    })

    it('should apply route delay', async () => {
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: { message: 'delayed' },
        delay: 100
      }

      const handler = createRouteHandler(route, baseConfig)
      
      const handlerPromise = handler(mockRequest, mockReply)
      await vi.advanceTimersByTimeAsync(100)
      
      await handlerPromise
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'delayed' })
    })

    it('should apply config delay', async () => {
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: { message: 'delayed' }
      }

      const configWithDelay = { ...baseConfig, delay: 50 }
      const handler = createRouteHandler(route, configWithDelay)
      
      const handlerPromise = handler(mockRequest, mockReply)
      await vi.advanceTimersByTimeAsync(50)
      
      await handlerPromise
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'delayed' })
    })

    it('should prioritize route delay over config delay', async () => {
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: { message: 'delayed' },
        delay: 100
      }

      const configWithDelay = { ...baseConfig, delay: 50 }
      const handler = createRouteHandler(route, configWithDelay)
      
      const handlerPromise = handler(mockRequest, mockReply)
      await vi.advanceTimersByTimeAsync(100)
      
      await handlerPromise
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'delayed' })
    })

    it('should handle static object response', async () => {
      const route: Route = {
        path: '/users/:id',
        method: 'GET',
        response: { 
          userId: '123',
          page: '1',
          name: 'test'
        }
      }

      const handler = createRouteHandler(route, baseConfig)
      await handler(mockRequest, mockReply)

      expect(mockReply.send).toHaveBeenCalledWith({
        userId: '123',
        page: '1',
        name: 'test'
      })
    })

    it('should return 500 error when no response configured', async () => {
      const route: Route = {
        path: '/test',
        method: 'GET'
        // 故意不设置 response
      } as any // 使用类型断言绕过 TypeScript 检查

      const handler = createRouteHandler(route, baseConfig)
      await handler(mockRequest, mockReply)

      expect(mockReply.code).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'No response configured' })
    })

    it('should pass template context to function response', async () => {
      const mockFunction = vi.fn().mockReturnValue({ success: true })
      const route: Route = {
        path: '/test',
        method: 'GET',
        response: mockFunction
      }

      const handler = createRouteHandler(route, baseConfig)
      await handler(mockRequest, mockReply)

      expect(mockFunction).toHaveBeenCalledWith({
        params: { id: '123' },
        query: { page: '1' },
        body: { name: 'test' },
        headers: { 'content-type': 'application/json' }
      })
    })
  })

  describe('createHealthHandler', () => {
    const mockReply = {
      send: vi.fn().mockReturnThis()
    } as any

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return health status', async () => {
      const handler = createHealthHandler()
      await handler({} as any, mockReply)

      expect(mockReply.send).toHaveBeenCalledWith({
        status: 'ok',
        timestamp: expect.any(String)
      })
    })

    it('should include valid ISO timestamp', async () => {
      const handler = createHealthHandler()
      await handler({} as any, mockReply)

      expect(mockReply.send).toHaveBeenCalled()
      
      const callArgs = mockReply.send.mock.calls[0]
      expect(callArgs).toBeDefined()
      
      const response = callArgs![0]
      const timestamp = response.timestamp
      expect(() => new Date(timestamp)).not.toThrow()
      expect(new Date(timestamp).toISOString()).toBe(timestamp)
    })
  })
})