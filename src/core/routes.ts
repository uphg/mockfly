import { createRouteHandler, createHealthHandler } from './handlers.ts'
import type { FastifyInstance } from 'fastify'
import type { MockflyConfig } from '../utility-types'

export const registerRoutes = async (fastify: FastifyInstance, config: MockflyConfig): Promise<void> => {
  fastify.get('/health', createHealthHandler())
  
  for (const route of config.routes) {
    const fullPath = config.baseUrl + route.path
    const handler = createRouteHandler(route, config)
    const routeName = route.name || route.path
    
    switch (route.method.toLowerCase()) {
      case 'get':
        fastify.get(fullPath, handler)
        break
      case 'post':
        fastify.post(fullPath, handler)
        break
      case 'put':
        fastify.put(fullPath, handler)
        break
      case 'delete':
        fastify.delete(fullPath, handler)
        break
      case 'patch':
        fastify.patch(fullPath, handler)
        break
      case 'options':
        fastify.options(fullPath, handler)
        break
      case 'head':
        fastify.head(fullPath, handler)
        break
      default:
        console.warn(`Unknown HTTP method: ${route.method}`)
    }
    
    console.log(`Registered route: [${route.method}] ${fullPath} - ${routeName}`)
  }
}

export const clearRoutes = (fastify: FastifyInstance): void => {
  fastify.close()
}