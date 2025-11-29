import { test } from 'node:test'
import assert from 'node:assert'
import { fileExists, readJsonFile, resolveFilePath, getContentType } from '../../src/utils.js'
import { promises as fs } from 'fs'
import path from 'path'

test('fileExists - 文件存在返回 true', async () => {
  const result = await fileExists(import.meta.filename)
  assert.strictEqual(result, true)
})

test('fileExists - 文件不存在返回 false', async () => {
  const result = await fileExists('/non-existent-file.txt')
  assert.strictEqual(result, false)
})

test('readJsonFile - 成功读取 JSON 文件', async () => {
  const testFile = path.join(process.cwd(), 'test-temp.json')
  const testData = { name: 'test', value: 123 }
  await fs.writeFile(testFile, JSON.stringify(testData))
  
  const result = await readJsonFile(testFile)
  assert.deepStrictEqual(result, testData)
  
  await fs.unlink(testFile)
})

test('readJsonFile - 无效 JSON 抛出错误', async () => {
  const testFile = path.join(process.cwd(), 'test-invalid.json')
  await fs.writeFile(testFile, 'invalid json')
  
  await assert.rejects(
    async () => await readJsonFile(testFile),
    /Failed to read JSON file/
  )
  
  await fs.unlink(testFile)
})

test('resolveFilePath - 解析绝对路径', () => {
  const result = resolveFilePath('/base', '/absolute/path.txt')
  assert.strictEqual(result, '/absolute/path.txt')
})

test('resolveFilePath - 解析相对路径', () => {
  const result = resolveFilePath('/base', 'relative/path.txt')
  assert.strictEqual(result, '/base/relative/path.txt')
})

test('getContentType - JSON 文件', () => {
  assert.strictEqual(getContentType('file.json'), 'application/json')
})

test('getContentType - HTML 文件', () => {
  assert.strictEqual(getContentType('file.html'), 'text/html')
})

test('getContentType - 未知类型', () => {
  assert.strictEqual(getContentType('file.unknown'), 'application/octet-stream')
})
