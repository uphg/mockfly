import Handlebars from 'handlebars'

export const createTemplateContext = (request) => {
  return {
    params: request.params || {},
    query: request.query || {},
    body: request.body || {},
    headers: request.headers || {}
  }
}

export const compileTemplate = (template) => {
  if (typeof template === 'string') {
    return Handlebars.compile(template)
  }
  return null
}

export const renderTemplate = (data, context) => {
  if (typeof data === 'string') {
    const template = compileTemplate(data)
    return template ? template(context) : data
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => renderTemplate(item, context))
    }
    
    const result = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = renderTemplate(value, context)
    }
    return result
  }
  
  return data
}

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context)
})

Handlebars.registerHelper('eq', function(a, b) {
  return a === b
})

Handlebars.registerHelper('ne', function(a, b) {
  return a !== b
})

Handlebars.registerHelper('gt', function(a, b) {
  return a > b
})

Handlebars.registerHelper('lt', function(a, b) {
  return a < b
})
