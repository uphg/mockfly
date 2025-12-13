import { delay } from './utils.ts'
import { createTemplateContext, renderTemplate } from './templates.ts'
import type { Route, MockflyConfig, ResponseData } from '../utility-types'

export const createRouteHandler = (route: Route, config: MockflyConfig) => {
  return async (request: any, reply: any) => {
    if (route.delay || config.delay) {
      await delay(route.delay || config.delay)
    }

    const context = createTemplateContext(request)

    if (route.response) {
      if (typeof route.response === 'function') {
        return await route.response(context)
      }
      const result = renderTemplate(route.response as ResponseData, context)
      return reply.send(result)
    }
    
    return reply.code(500).send({ error: 'No response configured' })
  }
}

export const createHealthHandler = () => {
  return async (_request: any, reply: any) => {
    return reply.send({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  }
}