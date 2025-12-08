import type { Route } from './config'

export interface RouteRegistration {
  route: Route
  fullPath: string
  method: string
  handler: any
}

export interface RouteHandler {
  (request: any, reply: any): Promise<any> | any
}

export interface HealthCheckHandler {
  (request: any, reply: any): { status: string; timestamp: string }
}