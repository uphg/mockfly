import type { FastifyInstance } from 'fastify'
import type { MockflyConfig } from './config'

export interface ServerContext {
  fastify?: FastifyInstance
  config?: MockflyConfig
  isShuttingDown?: boolean
}

export interface ServerStartOptions {
  port?: number
  host?: string
}