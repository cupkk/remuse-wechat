const { v4: uuidv4 } = require('uuid')
const { ChromaClient } = require('chromadb')
const aiService = require('./aiService')
const logger = require('./logger')

/**
 * 记忆RAG服务
 * 基于向量数据库的记忆检索与对话系统
 */
class MemoryRagService {
  constructor() {
    this.client = null
    this.collection = null
    this.embeddingModel = 'text-embedding-001'
    this.collectionName = 'user_memories'
    this.maxContextLength = 2000 // 最大上下文长度
    this.chunkSize = 500 // 文本分块大小
    this.chunkOverlap = 50 // 分块重叠大小
  }

  /**
   * 初始化向量数据库连接
   */
  async init() {
    try {
      this.client = new ChromaClient({
        path: process.env.CHROMA_DB_PATH || 'http://localhost:8000'
      })

      // 获取或创建集合
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: '用户记忆向量库' }
      })

      logger.info('✅ 记忆RAG服务初始化完成')
      return true
    } catch (error) {
      logger.error('❌ 记忆RAG服务初始化失败:', error)
      // 降级模式，不使用向量数据库
      this.collection = null
      return false
    }
  }

  /**
   * 生成文本向量
   * @param {string} text 输入文本
   * @returns {Array<number>} 向量数组
   */
  async generateEmbedding(text) {
    try {
      // 调用AI服务生成向量
      return await aiService.generateEmbedding(text)
    } catch (error) {
      logger.error('生成向量失败:', error)
      // 降级返回随机向量（实际项目需要处理）
      return Array(1536).fill(0).map(() => Math.random())
    }
  }

  /**
   * 将长文本分块
   * @param {string} text 长文本
   * @returns {Array<string>} 文本块数组
   */
  splitTextIntoChunks(text) {
    const chunks = []
    const sentences = text.replace(/\n/g, ' ').split(/([。！？.!?])/)
    
    let currentChunk = ''
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '')
      
      if (currentChunk.length + sentence.length < this.chunkSize) {
        currentChunk += sentence + ' '
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        // 保留重叠部分
        const overlapStart = Math.max(0, currentChunk.length - this.chunkOverlap)
        currentChunk = currentChunk.slice(overlapStart) + sentence + ' '
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  /**
   * 为藏品构建记忆索引
   * @param {string} userId 用户ID
   * @param {object} item 藏品信息
   */
  async buildMemoryIndex(userId, item) {
    try {
      if (!this.collection) {
        logger.warn('向量数据库未连接，跳过记忆索引构建')
        return false
      }

      // 构建待索引文本
      let text = `物品名称：${item.name}\n`
      text += `物品分类：${item.category}\n`
      text += `物品材质：${item.material || '未知'}\n`
      if (item.tags && item.tags.length > 0) {
        text += `物品标签：${item.tags.join('、')}\n`
      }
      if (item.story) {
        text += `物品故事：${item.story}\n`
      }
      if (item.description) {
        text += `物品描述：${item.description}\n`
      }

      // 分块处理
      const chunks = this.splitTextIntoChunks(text)

      // 为每个块生成向量并存储
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embedding = await this.generateEmbedding(chunk)
        const memoryId = uuidv4()

        await this.collection.add({
          ids: [memoryId],
          embeddings: [embedding],
          metadatas: [{
            userId,
            itemId: item.id,
            itemName: item.name,
            chunkIndex: i,
            text: chunk,
            type: 'item_memory',
            createdAt: new Date().toISOString()
          }],
          documents: [chunk]
        })
      }

      logger.info(`✅ 为用户${userId}的藏品${item.id}构建记忆索引完成，共${chunks.length}个块`)
      return true

    } catch (error) {
      logger.error('构建记忆索引失败:', error)
      return false
    }
  }

  /**
   * 检索相关记忆
   * @param {string} userId 用户ID
   * @param {string} query 用户查询
   * @param {number} limit 返回结果数量
   * @returns {Array} 相关记忆列表
   */
  async retrieveRelevantMemories(userId, query, limit = 5) {
    try {
      if (!this.collection) {
        return []
      }

      // 生成查询向量
      const queryEmbedding = await this.generateEmbedding(query)

      // 检索相似记忆
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: { userId }
      })

      // 格式化结果
      const memories = []
      if (results && results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          memories.push({
            text: results.documents[0][i],
            metadata: results.metadatas[0][i],
            distance: results.distances[0][i]
          })
        }
      }

      return memories

    } catch (error) {
      logger.error('检索相关记忆失败:', error)
      return []
    }
  }

  /**
   * 构建对话上下文
   * @param {string} userId 用户ID
   * @param {string} query 用户当前查询
   * @param {Array} history 历史对话
   * @returns {string} 构建好的上下文
   */
  async buildContext(userId, query, history = []) {
    // 检索相关记忆
    const relevantMemories = await this.retrieveRelevantMemories(userId, query)
    
    // 构建上下文
    let context = '已知信息：\n'
    relevantMemories.forEach((memory, index) => {
      context += `${index + 1}. ${memory.text}\n`
      if (memory.metadata.itemName) {
        context += `   来源：${memory.metadata.itemName}\n`
      }
    })

    // 添加历史对话
    if (history.length > 0) {
      context += '\n对话历史：\n'
      history.forEach(msg => {
        context += `${msg.role === 'user' ? '用户' : '助手'}: ${msg.content}\n`
      })
    }

    // 添加当前查询
    context += `\n用户问题：${query}\n`
    context += '请基于以上已知信息回答用户的问题，保持语气亲切，像老朋友聊天一样。如果信息不足，请如实告知不知道，不要编造信息。'

    // 截断过长的上下文
    if (context.length > this.maxContextLength) {
      context = context.slice(0, this.maxContextLength) + '...[内容过长已截断]'
    }

    return context
  }

  /**
   * 生成对话回复
   * @param {string} userId 用户ID
   * @param {string} query 用户查询
   * @param {Array} history 历史对话
   * @returns {object} 回复结果
   */
  async generateResponse(userId, query, history = []) {
    try {
      // 构建上下文
      const context = await this.buildContext(userId, query, history)

      // 调用AI生成回复
      const response = await aiService.generateChatResponse(context, {
        temperature: 0.8,
        maxOutputTokens: 1000
      })

      // 保存对话记录
      const messageId = uuidv4()
      const newMessage = {
        id: messageId,
        userId,
        query,
        response,
        timestamp: new Date(),
        contextUsed: context
      }

      // 这里可以保存对话记录到数据库
      // await this.saveChatHistory(newMessage)

      return {
        messageId,
        response,
        hasRelevantInfo: context.length > 100,
        relatedMemoriesCount: (await this.retrieveRelevantMemories(userId, query)).length
      }

    } catch (error) {
      logger.error('生成对话回复失败:', error)
      return {
        response: '抱歉，我现在有点记不清了，我们换个话题聊聊吧？',
        error: true
      }
    }
  }

  /**
   * 删除用户的所有记忆
   * @param {string} userId 用户ID
   */
  async deleteUserMemories(userId) {
    try {
      if (!this.collection) {
        return false
      }

      await this.collection.delete({
        where: { userId }
      })

      logger.info(`✅ 已删除用户${userId}的所有记忆`)
      return true

    } catch (error) {
      logger.error('删除用户记忆失败:', error)
      return false
    }
  }

  /**
   * 删除特定藏品的记忆
   * @param {string} userId 用户ID
   * @param {string} itemId 藏品ID
   */
  async deleteItemMemory(userId, itemId) {
    try {
      if (!this.collection) {
        return false
      }

      await this.collection.delete({
        where: { userId, itemId }
      })

      logger.info(`✅ 已删除用户${userId}的藏品${itemId}的记忆`)
      return true

    } catch (error) {
      logger.error('删除藏品记忆失败:', error)
      return false
    }
  }
}

module.exports = new MemoryRagService()
module.exports.MemoryRagService = MemoryRagService
