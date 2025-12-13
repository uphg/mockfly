import fs from 'fs/promises'
import path from 'path'
// import { fileURLToPath } from 'url'
import { fileExists } from '../core/utils'
import { createError, ErrorCodes, handleError } from '../core/errors'

// 获取当前文件的目录路径（ES 模块兼容）
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename) // 暂时未使用，保留以备将来需要

interface InitOptions {
  configExt?: string
}

export const initCommand = async (options: InitOptions = {}) => {
  try {
    const cwd = process.cwd()
    console.log('🚀 开始初始化 Mockfly 项目...')

    // 1. 检测配置文件类型
    const configExt = await detectConfigType(cwd, options.configExt)
    console.log(`📝 检测到配置文件类型: ${configExt}`)

    // 2. 创建目录结构
    await createDirectoryStructure(cwd)
    console.log('📁 创建目录结构完成')

    // 3. 从模板复制文件
    await copyFromTemplate(cwd, configExt)
    console.log('⚙️  生成配置文件完成')

    // 4. 复制示例数据
    await copySampleData(cwd)
    console.log('📊 创建示例数据完成')

    console.log('✅ Mockfly 项目初始化完成！')
    console.log('')
    console.log('📋 接下来可以：')
    console.log('1. 编辑 mockfly/mock.config' + configExt + ' 文件来配置你的 Mock API')
    console.log('2. 在 mockfly/data/ 目录下添加你的 Mock 数据文件')
    console.log('3. 运行 "mockfly dev" 启动开发服务器')
    console.log('4. 运行 "mockfly start" 启动生产服务器')

  } catch (error) {
    handleError(error)
  }
}

// 检测配置文件类型
const detectConfigType = async (cwd: string, forcedExt?: string): Promise<string> => {
  // 如果用户强制指定了后缀，直接使用
  if (forcedExt && ['.js', '.ts', '.json'].includes(forcedExt)) {
    return forcedExt.startsWith('.') ? forcedExt : `.${forcedExt}`
  }

  // 检测用户目录中的配置文件
  const hasTsConfig = await fileExists(path.join(cwd, 'tsconfig.json'))
  const hasJsConfig = await fileExists(path.join(cwd, 'jsconfig.json'))

  if (hasTsConfig) {
    return '.ts'
  } else if (hasJsConfig) {
    return '.js'
  } else {
    // 默认使用 .js
    return '.js'
  }
}

// 创建目录结构
const createDirectoryStructure = async (cwd: string) => {
  const directories = [
    'mockfly',
    'mockfly/data'
  ]

  for (const dir of directories) {
    const fullPath = path.join(cwd, dir)
    try {
      await fs.mkdir(fullPath, { recursive: true })
    } catch (error) {
      // 目录已存在时忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error
      }
    }
  }
}

// 从模板复制文件
const copyFromTemplate = async (cwd: string, ext: string) => {
  const templateType = ext.slice(1) // 移除点号，得到 'js', 'ts'
  const templatePath = path.join('/home/uphg/projects/mockfly-next/templates', templateType)
  const targetPath = path.join(cwd, 'mockfly')
  
  try {
    // 检查模板目录是否存在
    await fs.access(templatePath)
  } catch (error) {
    throw createError(
      ErrorCodes.INIT_TEMPLATE_NOT_FOUND,
      `Template not found for type: ${templateType}`,
      { templateType, templatePath }
    )
  }

  // 递归复制模板文件
  await copyDirectory(templatePath, targetPath, cwd)
}

// 递归复制目录
const copyDirectory = async (src: string, dest: string, rootDir: string) => {
  const entries = await fs.readdir(src, { withFileTypes: true })

  await fs.mkdir(dest, { recursive: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, rootDir)
    } else {
      // 检查目标文件是否已存在
      if (await fileExists(destPath)) {
        console.log(`⚠️  文件已存在: ${path.relative(rootDir, destPath)}，跳过创建`)
        continue
      }

      // 复制文件
      await fs.copyFile(srcPath, destPath)
    }
  }
}

// 复制示例数据（如果不存在）
const copySampleData = async (cwd: string) => {
  const dataDir = path.join(cwd, 'mockfly', 'data')
  const sampleFile = path.join(dataDir, 'users.json')

  // 如果示例数据文件已存在，跳过
  if (await fileExists(sampleFile)) {
    console.log('⚠️  示例数据文件已存在，跳过创建')
    return
  }

  // 从模板复制示例数据
  const templateType = await detectConfigType(cwd)
  const templateDataPath = path.join('/home/uphg/projects/mockfly-next/templates', templateType.slice(1), 'data', 'users.json')
  
  try {
    await fs.copyFile(templateDataPath, sampleFile)
  } catch (error) {
    // 如果模板中没找到示例数据，创建默认的
    const defaultData = `{
  "users": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "status": "active"
    },
    {
      "id": 2,
      "name": "李四",
      "email": "lisi@example.com",
      "status": "inactive"
    }
  ]
}
`
    await fs.writeFile(sampleFile, defaultData, 'utf-8')
  }
}
