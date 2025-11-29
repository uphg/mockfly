import { test } from 'node:test'
import assert from 'node:assert'
import { createTemplateContext, renderTemplate } from '../../src/templates.js'

test('createTemplateContext - 创建完整的上下文对象', () => {
  const request = {
    params: { id: '123' },
    query: { name: 'test' },
    body: { value: 456 },
    headers: { 'content-type': 'application/json' }
  }
  
  const context = createTemplateContext(request)
  
  assert.deepStrictEqual(context, {
    params: { id: '123' },
    query: { name: 'test' },
    body: { value: 456 },
    headers: { 'content-type': 'application/json' }
  })
})

test('renderTemplate - 渲染字符串模板', () => {
  const template = 'Hello {{name}}'
  const context = { name: 'World' }
  
  const result = renderTemplate(template, context)
  assert.strictEqual(result, 'Hello World')
})

test('renderTemplate - 渲染对象模板', () => {
  const template = {
    id: '{{params.id}}',
    name: 'User {{params.id}}'
  }
  const context = { params: { id: '123' } }
  
  const result = renderTemplate(template, context)
  assert.deepStrictEqual(result, {
    id: '123',
    name: 'User 123'
  })
})

test('renderTemplate - 渲染数组模板', () => {
  const template = ['{{params.id}}', 'User {{params.id}}']
  const context = { params: { id: '456' } }
  
  const result = renderTemplate(template, context)
  assert.deepStrictEqual(result, ['456', 'User 456'])
})

test('renderTemplate - 嵌套对象模板', () => {
  const template = {
    user: {
      id: '{{params.id}}',
      email: 'user{{params.id}}@example.com'
    }
  }
  const context = { params: { id: '789' } }
  
  const result = renderTemplate(template, context)
  assert.deepStrictEqual(result, {
    user: {
      id: '789',
      email: 'user789@example.com'
    }
  })
})

test('renderTemplate - 返回非模板值', () => {
  assert.strictEqual(renderTemplate(123, {}), 123)
  assert.strictEqual(renderTemplate(true, {}), true)
  assert.strictEqual(renderTemplate(null, {}), null)
})
