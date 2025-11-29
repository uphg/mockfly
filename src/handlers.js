import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv/sync'
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
  
  if (ext === '.csv') {
    const content = await fs.readFile(filePath, 'utf-8')
    const records = parse(content, { columns: true })
    return reply.type('application/json').send(records)
  }
  
  if (ext === '.db' || ext === '.sqlite' || ext === '.sqlite3') {
    return handleSqliteResponse(filePath, reply)
  }
  
  const contentType = getContentType(filePath)
  const stream = await fs.readFile(filePath)
  return reply.type(contentType).send(stream)
}

const handleSqliteResponse = async (dbPath, reply) => {
  try {
    let Database
    try {
      const module = await import('better-sqlite3')
      Database = module.default
    } catch (error) {
      return reply.code(500).send({ 
        error: 'SQLite support not available. Install better-sqlite3: npm install better-sqlite3' 
      })
    }
    
    const db = new Database(dbPath, { readonly: true })
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    
    if (tables.length === 0) {
      db.close()
      return reply.send({ tables: [] })
    }
    
    const tableName = tables[0].name
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all()
    db.close()
    
    return reply.send(rows)
  } catch (error) {
    return reply.code(500).send({ error: `SQLite error: ${error.message}` })
  }
}

export const createHealthHandler = () => {
  return async (request, reply) => {
    return reply.send({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  }
}
