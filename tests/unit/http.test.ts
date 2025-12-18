import { describe, it, expect } from 'vitest'
import { createMockflyHttp } from '../../src/core/http'
import type { Route } from '../../src/utility-types'

describe('http module', () => {
  it('should create mockfly http instance', () => {
    const http = createMockflyHttp()
    
    expect(http.get).toBeTypeOf('function')
    expect(http.post).toBeTypeOf('function')
    expect(http.put).toBeTypeOf('function')
    expect(http.delete).toBeTypeOf('function')
    expect(http.patch).toBeTypeOf('function')
    expect(http.options).toBeTypeOf('function')
    expect(http.head).toBeTypeOf('function')
  })

  it('should create GET route with typed params', () => {
    const http = createMockflyHttp()
    
    const route = http.get<{ id: string }>('/users/:id', ({ params, query, body, headers }) => {
      return { id: params.id, query, body, headers }
    })
    
    expect(route.path).toBe('/users/:id')
    expect(route.method).toBe('GET')
    expect(route.response).toBeTypeOf('function')
  })

  it('should create POST route with typed body', () => {
    const http = createMockflyHttp()
    
    const route = http.post<{ username: string, password: string }>('/api/login', ({ body }) => {
      const { username, password } = body as { username: string, password: string }
      return username === 'admin' && password === '123456'
        ? { code: 200, data: { token: 'admin-token' } }
        : { code: 401, message: '账号或密码错误' }
    })
    
    expect(route.path).toBe('/api/login')
    expect(route.method).toBe('POST')
    expect(route.response).toBeTypeOf('function')
  })

  it('should create route config example from requirements', () => {
    const http = createMockflyHttp()
    
    const config = {
      port: 3005,
      host: "localhost",
      baseUrl: "/api",
      delay: 100,
      cors: true,
      routes: [
        http.post<{ username: string, password: string }>('/api/login', ({ body }) => {
          const { username, password } = body as { username: string, password: string }
          return username === 'admin' && password === '123456'
            ? { code: 200, data: { token: 'admin-token' } }
            : { code: 401, message: '账号或密码错误' }
        }),
        http.get('/api/route-data', () => {
          return { data: 'route-data' }
        })
      ]
    }
    
    expect(config.routes).toHaveLength(2)
    expect(config.routes[0]?.method).toBe('POST')
    expect(config.routes[0]?.path).toBe('/api/login')
    expect(config.routes[1]?.method).toBe('GET')
    expect(config.routes[1]?.path).toBe('/api/route-data')
  })

  it('should handle all HTTP methods', () => {
    const http = createMockflyHttp()
    
    const routes: Route[] = [
      http.get('/test', () => ({ method: 'GET' })),
      http.post('/test', () => ({ method: 'POST' })),
      http.put('/test', () => ({ method: 'PUT' })),
      http.delete('/test', () => ({ method: 'DELETE' })),
      http.patch('/test', () => ({ method: 'PATCH' })),
      http.options('/test', () => ({ method: 'OPTIONS' })),
      http.head('/test', () => ({ method: 'HEAD' }))
    ]
    
    const methods = routes.map(route => route.method)
    expect(methods).toEqual(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'])
  })
})