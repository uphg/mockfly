import { promises } from 'node:fs'

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await promises.access(filePath)
    return true
  } catch {
    return false
  }
}

export const delay = (ms?: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms ?? 0))