# 📋 MockFly CLI 工具详细规划文档

### 🎯 项目概述

基于现有 `./temp/mock-server` 项目，创建轻量、高性能的 MockFly Mock API 服务 CLI 工具，专注于为前端开发提供简洁易用的本地 Mock 服务。

### 📊 现有项目分析

#### ✅ 保留的核心功能

| 功能模块 | 现有实现 | 保留原因 |
|---------|---------|----------|
| 配置驱动 Mock API | JSON 配置文件 | 核心功能，用户友好 |
| 热重载机制 | chokidar 文件监听 | 开发体验关键 |
| 模板变量支持 | Handlebars 引擎 | 动态响应必需 |
| 多种响应类型 | JSON/文件流/CSV/SQLite | 满足不同场景 |
| CORS 支持 | cors 中间件 | 跨域访问必需 |
| 响应延迟模拟 | setTimeout 中间件 | 网络模拟 |
| 路由默认配置 | routeDefaults 系统 | 减少配置重复 |
| 健康检查端点 | `/health` 路由 | 服务监控 |
| 测试套件 | node:test + supertest | 质量保证 |

#### ❌ 移除的功能模块

| 功能模块 | 现有文件 | 移除原因 |
|---------|---------|----------|
| 文档生成 | `docs-generator.js` | 简化项目复杂度 |
| VitePress 集成 | `src/cli/docs.js` | 非核心功能 |
| Markdown 处理 | `mdast-*` 依赖 | 减少依赖体积 |
| CLI init 命令 | `src/cli/init.js` | 简化使用流程 |
| CLI docs 命令 | `bin/cli.js` docs 相关 | 聚焦核心功能 |

### 🏗️ 技术架构重构

#### 框架迁移：Express.js → Fastify

**优势对比：**
- **性能提升**：Fastify 比 Express 快 2-3 倍
- **TypeScript 支持**：更好的类型推导
- **Hook 系统**：更优雅的中间件处理
- **Schema 验证**：内置 JSON Schema 支持

**迁移映射：**
```javascript
// Express.js
app.use(cors())
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Fastify
fastify.register(import('@fastify/cors'))
fastify.get('/health', () => ({ status: 'ok' }))
```

#### 函数式编程重构

**现有面向对象代码：**
```javascript
class MockServer {
  constructor() { this.app = express() }
  async start() { /* 复杂逻辑 */ }
}
```

**重构为函数式：**
```javascript
const createServer = (config) => {
  const fastify = fastifyInstance(config)
  return { server: fastify, start: () => startServer(fastify, config) }
}
```

### 📁 新项目结构设计

```
mockfly-next/
├── src/
│   ├── server.js           # Fastify 服务器创建
│   ├── config.js           # 配置加载与验证
│   ├── routes.js           # 路由注册与管理
│   ├── handlers.js         # 请求处理函数
│   ├── templates.js        # 模板变量处理
│   ├── utils.js            # 工具函数集合
│   └── cli/
│       ├── start.js        # start 命令实现
│       └── dev.js          # dev 命令实现
├── bin/
│   └── cli.js              # CLI 入口文件
├── tests/
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   ├── e2e/               # 端到端测试
│   └── fixtures/          # 测试数据
├── examples/              # 示例配置
├── package.json
├── README.md
└── CHANGELOG.md
```

### 📦 依赖管理策略

#### 新增依赖

```json
{
  "dependencies": {
    "fastify": "^4.24.3",
    "@fastify/cors": "^9.0.1",
    "@fastify/static": "^7.0.4"
  }
}
```

#### 移除依赖

```json
{
  "removed": [
    "express",
    "cors", 
    "markdown-it",
    "markdown-it-async",
    "markdown-it-container",
    "mdast-builder",
    "mdast-util-gfm-table",
    "mdast-util-to-markdown",
    "vitepress"
  ]
}
```

#### 保留依赖

```json
{
  "kept": [
    "commander",
    "handlebars", 
    "better-sqlite3",
    "csv",
    "chokidar",
    "lodash.merge",
    "lodash.omit",
    "path-to-regexp"
  ]
}
```

### ⚙️ 配置系统优化

#### 新的默认配置路径

```
用户项目根目录/
├── mockfly/
│   ├── mock.config.json    # 主配置文件
│   └── data/               # 数据文件目录
│       ├── users.json
│       ├── products.json
│       └── reports.xlsx
```

#### 配置文件示例

```json
{
  "port": 3001,
  "host": "localhost", 
  "baseUrl": "/api",
  "delay": 0,
  "cors": true,
  "mockDir": "./mockfly/data",
  "routes": [
    {
      "name": "获取用户列表",
      "path": "/users",
      "method": "GET", 
      "responseFile": "users.json"
    },
    {
      "name": "获取用户详情",
      "path": "/users/:id",
      "method": "GET",
      "response": {
        "id": "{{params.id}}",
        "name": "用户{{params.id}}",
        "email": "user{{params.id}}@example.com"
      }
    }
  ]
}
```

### 🔧 CLI 工具简化

#### 命令结构

```bash
# 启动生产模式
mockfly start

# 启动开发模式（热重载）
mockfly dev

# 指定配置文件
mockfly start --config ./custom-config.json

# 指定端口
mockfly start --port 3002
```

#### CLI 实现

```javascript
// bin/cli.js
#!/usr/bin/env node
import { program } from 'commander'
import { startCommand } from '../src/cli/start.js'
import { devCommand } from '../src/cli/dev.js'

program
  .name('mockfly')
  .description('轻量级 Mock API 服务 CLI 工具')
  .version('1.0.0')

program
  .command('start')
  .description('启动 Mock 服务器（生产模式）')
  .option('-c, --config <path>', '配置文件路径', 'mockfly/mock.config.json')
  .option('-p, --port <number>', '端口号')
  .action(startCommand)

program
  .command('dev') 
  .description('启动 Mock 服务器（开发模式，支持热重载）')
  .option('-c, --config <path>', '配置文件路径', 'mockfly/mock.config.json')
  .option('-p, --port <number>', '端口号')
  .action(devCommand)
```

### 🧪 测试策略

#### 测试分层

1. **单元测试** (`tests/unit/`)
   - 配置加载函数测试
   - 模板处理函数测试
   - 路由处理函数测试

2. **集成测试** (`tests/integration/`)
   - 服务器启动测试
   - 路由注册测试
   - 中间件集成测试

3. **E2E 测试** (`tests/e2e/`)
   - 完整 API 流程测试
   - 热重载功能测试
   - 文件下载测试

#### 测试配置

```javascript
// tests/test.config.js
export const testConfig = {
  port: 3002,
  baseUrl: '/api',
  mockDir: './tests/fixtures/data',
  routes: [
    {
      path: '/test-users',
      method: 'GET',
      responseFile: 'test-users.json'
    }
  ]
}
```

### 📈 性能优化策略

#### 1. Fastify 性能优化
- 启用路由缓存
- 使用异步钩子
- 优化 JSON 序列化

#### 2. 文件处理优化
- 流式文件读取
- 缓存小文件内容
- 压缩响应数据

#### 3. 热重载优化
- 防抖文件监听
- 增量配置更新
- 智能路由重注册

### 🚀 实施时间线

#### 第一阶段：基础架构（高优先级）
- [x] 项目结构创建
- [ ] Fastify 服务器搭建
- [ ] 基础 CLI 工具
- [ ] 配置系统重构

#### 第二阶段：核心功能（中优先级）
- [ ] 路由系统迁移
- [ ] 模板变量处理
- [ ] 文件响应支持
- [ ] 热重载机制

#### 第三阶段：完善优化（低优先级）
- [ ] 测试套件编写
- [ ] 性能优化
- [ ] 文档编写
- [ ] 错误处理完善

### 📋 质量保证

#### 代码规范
- ESLint + Prettier 配置
- 函数式编程原则
- TypeScript 类型检查（可选）

#### Git 工作流
- 语义化提交信息
- 自动化测试流水线
- 版本管理策略

#### 发布策略
- npm 包发布
- GitHub Release
- 文档网站部署

### 🎯 成功指标

1. **性能指标**
   - 服务器启动时间 < 1s
   - API 响应时间 < 10ms
   - 内存占用 < 50MB

2. **功能指标**
   - 100% 核心功能覆盖
   - 90%+ 测试覆盖率
   - 零配置开箱即用

3. **用户体验**
   - CLI 响应时间 < 100ms
   - 热重载延迟 < 500ms
   - 错误信息清晰明确

---

这个规划文档将指导整个 MockFly 项目的开发过程，确保项目按照既定目标有序推进，最终产出高质量、高性能的 Mock API 服务工具。