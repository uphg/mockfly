import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { registerRoutes } from './routes.ts'
import { createError, ErrorCodes, logInfo } from './errors.ts'
import type { MockflyConfig } from '../utility-types'

export const createServer = async (config: MockflyConfig) => {
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

export const startServer = async (config: MockflyConfig) => {
  const fastify = await createServer(config)

  try {
    await fastify.listen({ 
      port: config.port, 
      host: config.host 
    })
    console.log('')
    logInfo(`MockFly server running at http://${config.host}:${config.port}`)
    logInfo(`Base URL: ${config.baseUrl}`)
    logInfo(`Health check: http://${config.host}:${config.port}/health`)
    return fastify
  } catch (err) {
    throw createError(
      ErrorCodes.SERVER_START_FAILED,
      `Failed to start server on ${config.host}:${config.port}`,
      { host: config.host, port: config.port, error: err instanceof Error ? err.message : 'Unknown error' }
    )
  }
}