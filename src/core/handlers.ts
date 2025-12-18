import { delay } from './utils.ts'
import type { Route, MockflyConfig, TemplateContext } from '../utility-types'
import type { FastifyRequest, FastifyReply } from 'fastify'

export function createRouteHandler(route: Route, config: MockflyConfig) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (route.delay || config.delay) {
      await delay(route.delay || config.delay)
    }

    const context: TemplateContext = {
      params: request.params as Record<string, string>,
      query: request.query as Record<string, string | string[]>,
      body: request.body,
      headers: request.headers as Record<string, string>
    }

    if (route.response) {
      if (typeof route.response === 'function') {
        const result = await route.response(context)
        return reply.send(result)
      }
      return reply.send(route.response)
    }
    
    return reply.code(500).send({ error: 'No response configured' })
  }
}

export function createHealthHandler() {
  return async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  }
}