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

export type AsyncFunResponse = (req: TemplateContext) => Promise<ResponseData>
export type FunResponse = (req: TemplateContext) => ResponseData

export type ResponseData = string | number | boolean | null | ResponseObject | ResponseArray

export interface ResponseObject {
  [key: string]: ResponseData
}

export interface ResponseArray extends Array<ResponseData> {}

export interface TemplateContext {
  params: Record<string, string>
  query: Record<string, string | string[]>
  body: unknown
  headers: Record<string, string>
}

export interface CliOptions {
  port?: number
  config?: string
}