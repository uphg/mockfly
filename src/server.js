import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { registerRoutes } from './routes.js'

export const createServer = async (config) => {
  const fastify = Fastify({
    logger: false
  })

  if (config.cors) {
    await fastify.register(cors, {
      origin: true,
      credentials: true
    })
  }

  if (config.staticDir) {
    await fastify.register(fastifyStatic, {
      root: config.staticDir,
      prefix: '/static/'
    })
  }

  await registerRoutes(fastify, config)

  return fastify
}

export const startServer = async (config) => {
  const fastify = await createServer(config)

  try {
    await fastify.listen({ 
      port: config.port, 
      host: config.host 
    })
    console.log(`MockFly server running at http://${config.host}:${config.port}`)
    console.log(`Base URL: ${config.baseUrl}`)
    console.log(`Health check: http://${config.host}:${config.port}/health`)
    return fastify
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
