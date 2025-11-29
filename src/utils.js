import { promises as fs } from 'fs'
import path from 'path'

export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export const readJsonFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to read JSON file ${filePath}: ${error.message}`)
  }
}

export const resolveFilePath = (basePath, filePath) => {
  return path.isAbsolute(filePath) 
    ? filePath 
    : path.resolve(basePath, filePath)
}

export const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()
  const contentTypes = {
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.csv': 'text/csv',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.txt': 'text/plain'
  }
  return contentTypes[ext] || 'application/octet-stream'
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
