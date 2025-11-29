# Changelog

所有重要的项目变更都将记录在此文件中。

## [1.0.0] - 2024-11-29

### 新增

- 🚀 基于 Fastify 的高性能 Mock API 服务器
- 📝 JSON 配置驱动的路由系统
- 🔥 开发模式热重载支持（使用 chokidar）
- 🎨 Handlebars 模板引擎支持动态响应
- 📦 多种响应类型支持：
  - JSON 文件响应
  - CSV 文件响应（自动转换为 JSON）
  - SQLite 数据库响应（可选，需要安装 better-sqlite3）
  - 静态文件下载
- 🌐 内置 CORS 跨域支持
- ⏱️ 响应延迟模拟
- 💪 函数式编程架构
- 🧪 完整的单元测试和集成测试（26 个测试用例）
- 📚 详细的文档和示例

### CLI 命令

- `mockfly start` - 启动生产模式服务器
- `mockfly dev` - 启动开发模式服务器（支持热重载）

### 模板变量支持

- `{{params.*}}` - 路径参数
- `{{query.*}}` - 查询参数
- `{{body.*}}` - 请求体
- `{{headers.*}}` - 请求头

### 技术栈

- Fastify 4.x - 高性能 Web 框架
- Handlebars - 模板引擎
- Chokidar - 文件监听
- Commander - CLI 工具
- Node.js 18+ - 运行时环境

### 移除的功能

相比原 mock-server 项目，移除了以下非核心功能以保持简洁：
- 文档自动生成功能
- VitePress 集成
- Markdown 处理
- CLI init 命令

[1.0.0]: https://github.com/yourusername/mockfly/releases/tag/v1.0.0
