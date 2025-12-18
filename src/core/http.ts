import type { Route, HttpMethod, FunResponse, AsyncFunResponse, TemplateContext } from '../utility-types'

export type MockflyRouteHandler<TParams = any> = (params: { params: TParams, query: Record<string, string | string[]>, body: unknown, headers: Record<string, string> }) => any

export type MockHttpOptions = Omit<Route, 'path' | 'method' | 'response'>

export interface HttpRouteBuilder<TParams = any> {
  (path: string, handler: MockflyRouteHandler<TParams>, options: MockHttpOptions): Route
}

export interface MockflyHttp {
  get<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
  post<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
  put<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
  delete<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
  patch<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
  options<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
  head<TParams = any>(path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route
}

function createRouteBuilder<TParams = any>(method: HttpMethod): HttpRouteBuilder<TParams> {
  return (path: string, handler: MockflyRouteHandler<TParams>, options?: MockHttpOptions): Route => {
    const response: FunResponse | AsyncFunResponse = (context: TemplateContext) => {
      return handler(context as any)
    }
    
    return {
      path,
      method,
      response,
      ...options
    }
  }
}

export function createMockflyHttp(): MockflyHttp {
  return {
    get: createRouteBuilder('GET'),
    post: createRouteBuilder('POST'),
    put: createRouteBuilder('PUT'),
    delete: createRouteBuilder('DELETE'),
    patch: createRouteBuilder('PATCH'),
    options: createRouteBuilder('OPTIONS'),
    head: createRouteBuilder('HEAD')
  }
}

export const http = createMockflyHttp()