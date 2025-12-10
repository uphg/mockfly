import Handlebars from 'handlebars'
import type { TemplateContext, ResponseData } from '../utility-types'

export const createTemplateContext = (request: any): TemplateContext => {
  return {
    params: request.params || {},
    query: request.query || {},
    body: request.body || {},
    headers: request.headers || {}
  }
}

export const compileTemplate = (template: string): Handlebars.TemplateDelegate | null => {
  if (typeof template === 'string') {
    return Handlebars.compile(template)
  }
  return null
}

export const renderTemplate = (data: ResponseData, context: TemplateContext): any => {
  if (typeof data === 'string') {
    const template = compileTemplate(data)
    return template ? template(context) : data
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => renderTemplate(item, context))
    }
    
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = renderTemplate(value as ResponseData, context)
    }
    return result
  }
  
  return data
}

Handlebars.registerHelper('json', function(context: any) {
  return JSON.stringify(context)
})

Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b
})

Handlebars.registerHelper('ne', function(a: any, b: any) {
  return a !== b
})

Handlebars.registerHelper('gt', function(a: any, b: any) {
  return a > b
})

Handlebars.registerHelper('lt', function(a: any, b: any) {
  return a < b
})