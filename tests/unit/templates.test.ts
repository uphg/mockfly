import { describe, it, expect } from 'vitest'
import { createTemplateContext, renderTemplate } from '../../src/core/templates.js'

describe('templates', () => {
  describe('createTemplateContext', () => {
    it('should create complete context object', () => {
      const request = {
        params: { id: '123' },
        query: { name: 'test' },
        body: { value: 456 },
        headers: { 'content-type': 'application/json' }
      }
      
      const context = createTemplateContext(request)
      
      expect(context).toEqual({
        params: { id: '123' },
        query: { name: 'test' },
        body: { value: 456 },
        headers: { 'content-type': 'application/json' }
      })
    })
  })

  describe('renderTemplate', () => {
    it('should render string template', () => {
      const template = 'Hello {{name}}'
      const context = { 
        params: {}, 
        query: {}, 
        body: {}, 
        headers: {},
        name: 'World' 
      } as any
      
      const result = renderTemplate(template, context)
      expect(result).toBe('Hello World')
    })

    it('should render object template', () => {
      const template = {
        id: '{{params.id}}',
        name: 'User {{params.id}}'
      }
      const context = { 
        params: { id: '123' }, 
        query: {}, 
        body: {}, 
        headers: {} 
      }
      
      const result = renderTemplate(template, context)
      expect(result).toEqual({
        id: '123',
        name: 'User 123'
      })
    })

    it('should render array template', () => {
      const template = ['{{params.id}}', 'User {{params.id}}']
      const context = { 
        params: { id: '456' }, 
        query: {}, 
        body: {}, 
        headers: {} 
      }
      
      const result = renderTemplate(template, context)
      expect(result).toEqual(['456', 'User 456'])
    })

    it('should render nested object template', () => {
      const template = {
        user: {
          id: '{{params.id}}',
          email: 'user{{params.id}}@example.com'
        }
      }
      const context = { 
        params: { id: '789' }, 
        query: {}, 
        body: {}, 
        headers: {} 
      }
      
      const result = renderTemplate(template, context)
      expect(result).toEqual({
        user: {
          id: '789',
          email: 'user789@example.com'
        }
      })
    })

    it('should return non-template values', () => {
      const context = { 
        params: {}, 
        query: {}, 
        body: {}, 
        headers: {} 
      }
      expect(renderTemplate(123, context)).toBe(123)
      expect(renderTemplate(true, context)).toBe(true)
      expect(renderTemplate(null, context)).toBe(null)
    })
  })
})