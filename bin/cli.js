#!/usr/bin/env node
import { program } from 'commander'
import { startCommand, devCommand, initCommand } from '../dist/cli.mjs'

program
  .name('mockfly')
  .description('轻量级 Mock API 服务 CLI 工具')
  .version('1.0.0')

program
  .command('init')
  .description('初始化 Mockfly 项目')
  .option('-e, --ext <extension>', '配置文件后缀 (.js, .ts, .json)', undefined)
  .action(async (options) => {
    await initCommand({
      configExt: options.ext
    })
  })

program
  .command('start')
  .description('启动 Mock 服务器（生产模式）')
  .option('-c, --config <path>', '配置文件路径')
  .option('-p, --port <number>', '端口号')
  .action(startCommand)

program
  .command('dev')
  .description('启动 Mock 服务器（开发模式，支持热重载）')
  .option('-c, --config <path>', '配置文件路径')
  .option('-p, --port <number>', '端口号')
  .action(devCommand)

program.parse()
