import { createRouteHandler, createHealthHandler } from './handlers.js'

export const registerRoutes = async (fastify, config) => {
  fastify.get('/health', createHealthHandler())
  
  for (const route of config.routes) {
    const method = route.method.toLowerCase()
    const fullPath = config.baseUrl + route.path
    const handler = createRouteHandler(route, config)
    
    fastify[method](fullPath, handler)
    
    const routeName = route.name || route.path
    console.log(`Registered route: [${route.method}] ${fullPath} - ${routeName}`)
  }
}

export const clearRoutes = (fastify) => {
  fastify.close()
}
