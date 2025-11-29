import { promises as fs } from 'fs'
import path from 'path'
import { fileExists, readJsonFile, resolveFilePath, getContentType, delay } from './utils.js'
import { createTemplateContext, renderTemplate } from './templates.js'

export const createRouteHandler = (route, config) => {
  return async (request, reply) => {
    if (route.delay || config.delay) {
      await delay(route.delay || config.delay)
    }

    const context = createTemplateContext(request)
    
    if (route.response) {
      const response = renderTemplate(route.response, context)
      return reply.send(response)
    }
    
    if (route.responseFile) {
      return await handleFileResponse(route.responseFile, config, reply)
    }
    
    return reply.code(500).send({ error: 'No response configured' })
  }
}

const handleFileResponse = async (responseFile, config, reply) => {
  const filePath = resolveFilePath(config.mockDir, responseFile)

  if (!await fileExists(filePath)) {
    return reply.code(404).send({ error: `File not found: ${responseFile}` })
  }

  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.json') {
    const data = await readJsonFile(filePath)
    return reply.send(data)
  }

  const contentType = getContentType(filePath)
  const stream = await fs.readFile(filePath)
  return reply.type(contentType).send(stream)
}

export const createHealthHandler = () => {
  return async (request, reply) => {
    return reply.send({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  }
}
