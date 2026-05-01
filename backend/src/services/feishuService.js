const FEISHU_API_BASE = 'https://open.feishu.cn/open-apis'

let tokenCache = {
  value: null,
  expiresAt: 0
}

const getConfig = (overrides = {}) => {
  const documentId = overrides.documentId || process.env.FEISHU_DOC_ID

  return {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    documentId
  }
}

const assertConfigured = (config, requireDocument = false) => {
  if (!config.appId || !config.appSecret) {
    throw new Error('飞书未配置，请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET')
  }

  if (requireDocument && !config.documentId) {
    throw new Error('缺少飞书文档 ID，请设置 FEISHU_DOC_ID 或在请求中传入 documentId')
  }
}

const feishuRequest = async (path, options = {}) => {
  const response = await fetch(`${FEISHU_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(options.headers || {})
    }
  })

  const rawText = await response.text()
  let data = null

  try {
    data = rawText ? JSON.parse(rawText) : {}
  } catch (error) {
    throw new Error(`飞书返回了无法解析的响应: ${rawText}`)
  }

  if (!response.ok || data.code !== 0) {
    const statusText = response.status ? `HTTP ${response.status}` : 'HTTP 未知状态'
    const message = data?.msg || rawText || '未知错误'
    throw new Error(`飞书接口调用失败: ${statusText} ${message}`)
  }

  return data
}

const getTenantAccessToken = async (forceRefresh = false) => {
  const config = getConfig()
  assertConfigured(config)

  const now = Date.now()
  if (!forceRefresh && tokenCache.value && tokenCache.expiresAt - now > 5 * 60 * 1000) {
    return tokenCache.value
  }

  const data = await feishuRequest('/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    body: JSON.stringify({
      app_id: config.appId,
      app_secret: config.appSecret
    })
  })

  tokenCache = {
    value: data.tenant_access_token,
    expiresAt: now + (data.expire || 7200) * 1000
  }

  return tokenCache.value
}

const getAuthorizationHeader = async () => {
  const accessToken = await getTenantAccessToken()
  return {
    Authorization: `Bearer ${accessToken}`
  }
}

const getDocumentInfo = async (documentId) => {
  const config = getConfig({ documentId })
  assertConfigured(config, true)

  const data = await feishuRequest(`/docx/v1/documents/${config.documentId}`, {
    method: 'GET',
    headers: await getAuthorizationHeader()
  })

  return data.data || {}
}

const getDocumentBlocks = async (documentId) => {
  const config = getConfig({ documentId })
  assertConfigured(config, true)

  let pageToken = ''
  let hasMore = true
  const items = []

  while (hasMore) {
    const params = new URLSearchParams({
      document_revision_id: '-1',
      page_size: '200'
    })

    if (pageToken) {
      params.set('page_token', pageToken)
    }

    const data = await feishuRequest(`/docx/v1/documents/${config.documentId}/blocks?${params.toString()}`, {
      method: 'GET',
      headers: await getAuthorizationHeader()
    })

    const pageItems = data?.data?.items || []
    items.push(...pageItems)
    hasMore = Boolean(data?.data?.has_more)
    pageToken = data?.data?.page_token || ''
  }

  return items
}

const getRootBlockChildCount = async (documentId) => {
  const blocks = await getDocumentBlocks(documentId)
  const rootBlock = blocks.find((block) => block.block_id === documentId)

  if (!rootBlock) {
    return 0
  }

  return Array.isArray(rootBlock.children) ? rootBlock.children.length : 0
}

const createBlocks = async (documentId, parentBlockId, children, index = 0) => {
  const config = getConfig({ documentId })
  assertConfigured(config, true)

  const data = await feishuRequest(
    `/docx/v1/documents/${config.documentId}/blocks/${parentBlockId}/children?document_revision_id=-1`,
    {
      method: 'POST',
      headers: await getAuthorizationHeader(),
      body: JSON.stringify({
        index,
        children
      })
    }
  )

  return data.data || {}
}

const appendBlocksToDocument = async (documentId, children) => {
  const config = getConfig({ documentId })
  assertConfigured(config, true)

  const index = await getRootBlockChildCount(config.documentId)
  return createBlocks(config.documentId, config.documentId, children, index)
}

const buildTextBlock = (content) => ({
  block_type: 2,
  text: {
    elements: [
      {
        text_run: {
          content
        }
      }
    ]
  }
})

const buildHeadingBlock = (content, level = 2) => {
  const safeLevel = Math.min(Math.max(level, 1), 9)
  const key = `heading${safeLevel}`

  return {
    block_type: safeLevel + 2,
    [key]: {
      elements: [
        {
          text_run: {
            content
          }
        }
      ]
    }
  }
}

const buildBulletBlock = (content) => ({
  block_type: 12,
  bullet: {
    elements: [
      {
        text_run: {
          content
        }
      }
    ]
  }
})

const appendPlainText = async ({ documentId, title, lines = [] }) => {
  const children = []

  if (title) {
    children.push(buildHeadingBlock(title, 2))
  }

  for (const line of lines) {
    if (!line) continue
    children.push(buildTextBlock(line))
  }

  if (!children.length) {
    throw new Error('没有可写入飞书文档的内容')
  }

  return appendBlocksToDocument(documentId, children)
}

const appendItemSummary = async ({ documentId, item }) => {
  if (!item) {
    throw new Error('缺少要同步的藏品数据')
  }

  const children = [
    buildHeadingBlock(`藏品同步：${item.name || '未命名藏品'}`, 2)
  ]

  if (item.category) {
    children.push(buildBulletBlock(`分类：${item.category}`))
  }

  if (item.material) {
    children.push(buildBulletBlock(`材质：${item.material}`))
  }

  if (item.date) {
    children.push(buildBulletBlock(`日期：${item.date}`))
  }

  if (Array.isArray(item.tags) && item.tags.length > 0) {
    children.push(buildBulletBlock(`标签：${item.tags.join('、')}`))
  }

  if (item.story) {
    children.push(buildTextBlock(`故事：${item.story}`))
  }

  return appendBlocksToDocument(documentId, children)
}

module.exports = {
  getConfig,
  getTenantAccessToken,
  getDocumentInfo,
  getDocumentBlocks,
  appendPlainText,
  appendItemSummary
}
