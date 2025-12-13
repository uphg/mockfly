export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

export interface MockflyConfig {
  port: number
  host: string
  baseUrl: string
  delay?: number
  cors?: boolean
  staticDir?: string
  mockDir?: string
  routes: Route[]
  configPath?: string
  configDir?: string
}

export interface Route {
  name?: string
  path: string
  method: HttpMethod
  response?: ResponseData | FunResponse | AsyncFunResponse
  delay?: number
}

interface AsyncFunResponse {
  async (req: TemplateContext): ResponseData
}

interface FunResponse {
  (req: TemplateContext): ResponseData
}

export type ResponseData = string | number | boolean | null | ResponseObject | ResponseArray

export interface ResponseObject {
  [key: string]: ResponseData | ResponseTemplate
}

export interface ResponseArray extends Array<ResponseData | ResponseTemplate> {}

export interface ResponseTemplate {
  [templateKey: string]: string | ResponseTemplate | ResponseTemplate[]
}

export interface TemplateContext {
  params: Record<string, any>
  query: Record<string, any>
  body: any
  headers: Record<string, any>
}

export interface CliOptions {
  port?: number
  config?: string
}