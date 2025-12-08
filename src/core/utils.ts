import { promises as fs } from 'fs'
import path from 'path'

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export const readJsonFile = async <T = unknown>(filePath: string): Promise<T> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to read JSON file ${filePath}: ${message}`)
  }
}

export const resolveFilePath = (basePath: string, filePath: string): string => {
  return path.isAbsolute(filePath) 
    ? filePath 
    : path.resolve(basePath, filePath)
}

export const getContentType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase()
  const contentTypes: Record<string, string> = {
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
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.txt': 'text/plain'
  }
  return contentTypes[ext] || 'application/octet-stream'
}

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))