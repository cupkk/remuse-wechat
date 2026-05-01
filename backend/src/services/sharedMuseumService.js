const { v4: uuidv4 } = require('uuid')
const logger = require('./logger')

/**
 * 共建藏馆服务
 * 支持公共藏馆创建、浏览、藏品贡献、内容审核
 */
class SharedMuseumService {
  constructor() {
    // 藏馆可见性
    this.visibility = {
      PRIVATE: 'private', // 私有，仅创建者可见
      UNLISTED: 'unlisted', // 不公开，有链接可访问
      PUBLIC: 'public' // 公开，所有人可见
    }

    // 贡献审核状态
    this.contributionStatus = {
      PENDING: 'pending', // 待审核
      APPROVED: 'approved', // 已通过
      REJECTED: 'rejected' // 已拒绝
    }

    // 藏馆角色
    this.roles = {
      OWNER: 'owner', // 创建者/拥有者
      CURATOR: 'curator', // 馆长
      CONTRIBUTOR: 'contributor', // 贡献者
      VISITOR: 'visitor' // 访客
    }
  }

  /**
   * 创建公共藏馆
   * @param {string} userId 创建者用户ID
   * @param {object} museumInfo 藏馆信息
   * @returns {object} 创建的藏馆
   */
  async createMuseum(userId, museumInfo) {
    try {
      const { name, description, visibility = this.visibility.PRIVATE, tags = [], coverImage = '' } = museumInfo

      if (!name || name.trim().length === 0) {
        throw new Error('藏馆名称不能为空')
      }

      const museumId = uuidv4()
      const museum = {
        id: museumId,
        name: name.trim(),
        description: description || '',
        ownerId: userId,
        visibility,
        tags: Array.isArray(tags) ? tags : [],
        coverImage,
        itemCount: 0,
        viewCount: 0,
        likeCount: 0,
        isVerified: false, // 是否官方认证
        createdAt: new Date(),
        updatedAt: new Date(),
        curators: [], // 馆长列表
        allowedContribution: true, // 是否允许贡献
        requireApproval: true // 贡献是否需要审核
      }

      // 实际项目中保存到数据库
      // await MuseumModel.create(museum)

      logger.info(`✅ 用户${userId}创建了公共藏馆: ${name} (${museumId})`)
      return museum

    } catch (error) {
      logger.error('创建公共藏馆失败:', error)
      throw error
    }
  }

  /**
   * 获取藏馆列表
   * @param {object} options 查询选项
   * @returns {object} 藏馆列表
   */
  async getMuseumList(options = {}) {
    try {
      const { page = 1, limit = 20, keyword = '', tags = [], sortBy = 'createdAt', order = 'desc' } = options

      // 实际项目中从数据库查询公开藏馆
      return {
        items: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }

    } catch (error) {
      logger.error('获取藏馆列表失败:', error)
      throw error
    }
  }

  /**
   * 获取藏馆详情
   * @param {string} museumId 藏馆ID
   * @param {string} userId 当前用户ID（可选）
   * @returns {object} 藏馆详情
   */
  async getMuseumDetail(museumId, userId = null) {
    try {
      // 实际项目中从数据库查询
      const museum = {
        id: museumId,
        name: '测试藏馆',
        description: '这是一个测试公共藏馆',
        ownerId: 'user_123',
        visibility: this.visibility.PUBLIC,
        tags: ['复古', '收藏'],
        coverImage: '',
        itemCount: 0,
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        curators: []
      }

      // 增加浏览量
      // await MuseumModel.increment('viewCount', { where: { id: museumId } })

      // 检查用户权限
      museum.role = await this.getUserRole(museumId, userId)
      
      return museum

    } catch (error) {
      logger.error('获取藏馆详情失败:', error)
      throw error
    }
  }

  /**
   * 更新藏馆信息
   * @param {string} museumId 藏馆ID
   * @param {string} userId 用户ID
   * @param {object} updateInfo 更新内容
   * @returns {object} 更新后的藏馆
   */
  async updateMuseum(museumId, userId, updateInfo) {
    try {
      // 检查用户是否有权限
      const role = await this.getUserRole(museumId, userId)
      if (role !== this.roles.OWNER && role !== this.roles.CURATOR) {
        throw new Error('没有权限修改该藏馆')
      }

      const allowedFields = ['name', 'description', 'visibility', 'tags', 'coverImage', 'allowedContribution', 'requireApproval']
      const updateData = {}
      
      Object.keys(updateInfo).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = updateInfo[key]
        }
      })

      updateData.updatedAt = new Date()

      // 实际项目中更新数据库
      // await MuseumModel.update(updateData, { where: { id: museumId } })

      logger.info(`✅ 用户${userId}更新了藏馆${museumId}`)
      return await this.getMuseumDetail(museumId, userId)

    } catch (error) {
      logger.error('更新藏馆失败:', error)
      throw error
    }
  }

  /**
   * 删除藏馆
   * @param {string} museumId 藏馆ID
   * @param {string} userId 用户ID
   */
  async deleteMuseum(museumId, userId) {
    try {
      // 仅创建者可以删除
      const museum = await this.getMuseumDetail(museumId, userId)
      if (museum.ownerId !== userId) {
        throw new Error('只有创建者可以删除藏馆')
      }

      // 实际项目中删除数据库记录
      // await MuseumModel.destroy({ where: { id: museumId } })

      logger.info(`✅ 用户${userId}删除了藏馆${museumId}`)
      return true

    } catch (error) {
      logger.error('删除藏馆失败:', error)
      throw error
    }
  }

  /**
   * 贡献藏品到藏馆
   * @param {string} museumId 藏馆ID
   * @param {string} userId 用户ID
   * @param {string} itemId 藏品ID
   * @param {string} message 贡献留言
   * @returns {object} 贡献记录
   */
  async contributeItem(museumId, userId, itemId, message = '') {
    try {
      // 检查藏馆是否允许贡献
      const museum = await this.getMuseumDetail(museumId)
      if (!museum.allowedContribution) {
        throw new Error('该藏馆不允许贡献')
      }

      // 检查用户是否拥有该藏品
      // const item = await ItemModel.findOne({ where: { id: itemId, userId } })
      // if (!item) {
      //   throw new Error('只能贡献自己的藏品')
      // }

      // 检查是否已经贡献过
      // const existing = await ContributionModel.findOne({ where: { museumId, itemId } })
      // if (existing) {
      //   throw new Error('该藏品已贡献过')
      // }

      const contribution = {
        id: uuidv4(),
        museumId,
        itemId,
        userId,
        message,
        status: museum.requireApproval ? this.contributionStatus.PENDING : this.contributionStatus.APPROVED,
        createdAt: new Date(),
        reviewedAt: museum.requireApproval ? null : new Date(),
        reviewedBy: null,
        reviewNote: ''
      }

      // 实际项目中保存贡献记录
      // await ContributionModel.create(contribution)

      // 如果不需要审核，直接添加到藏馆
      if (!museum.requireApproval) {
        // await MuseumItemModel.create({ museumId, itemId, contributedBy: userId })
        // await MuseumModel.increment('itemCount', { where: { id: museumId } })
      }

      logger.info(`✅ 用户${userId}向藏馆${museumId}贡献了藏品${itemId}`)
      return contribution

    } catch (error) {
      logger.error('贡献藏品失败:', error)
      throw error
    }
  }

  /**
   * 审核贡献的藏品
   * @param {string} museumId 藏馆ID
   * @param {string} userId 审核用户ID
   * @param {string} contributionId 贡献记录ID
   * @param {string} status 审核状态
   * @param {string} reviewNote 审核备注
   */
  async reviewContribution(museumId, userId, contributionId, status, reviewNote = '') {
    try {
      // 检查用户是否有权限审核
      const role = await this.getUserRole(museumId, userId)
      if (role !== this.roles.OWNER && role !== this.roles.CURATOR) {
        throw new Error('没有审核权限')
      }

      if (!Object.values(this.contributionStatus).includes(status)) {
        throw new Error('无效的审核状态')
      }

      // 实际项目中更新贡献记录
      // await ContributionModel.update(
      //   { status, reviewedAt: new Date(), reviewedBy: userId, reviewNote },
      //   { where: { id: contributionId, museumId } }
      // )

      // 如果审核通过，添加到藏馆
      if (status === this.contributionStatus.APPROVED) {
        // const contribution = await ContributionModel.findByPk(contributionId)
        // await MuseumItemModel.create({ museumId, itemId: contribution.itemId, contributedBy: contribution.userId })
        // await MuseumModel.increment('itemCount', { where: { id: museumId } })
      }

      logger.info(`✅ 用户${userId}审核了贡献${contributionId}，状态: ${status}`)
      return true

    } catch (error) {
      logger.error('审核贡献失败:', error)
      throw error
    }
  }

  /**
   * 获取藏馆的藏品列表
   * @param {string} museumId 藏馆ID
   * @param {object} options 查询选项
   */
  async getMuseumItems(museumId, options = {}) {
    try {
      const { page = 1, limit = 20, keyword = '', sortBy = 'createdAt', order = 'desc' } = options
      
      // 实际项目中查询藏馆藏品
      return {
        items: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit)
      }

    } catch (error) {
      logger.error('获取藏馆藏品失败:', error)
      throw error
    }
  }

  /**
   * 获取待审核的贡献列表
   * @param {string} museumId 藏馆ID
   * @param {string} userId 用户ID
   */
  async getPendingContributions(museumId, userId) {
    try {
      // 检查权限
      const role = await this.getUserRole(museumId, userId)
      if (role !== this.roles.OWNER && role !== this.roles.CURATOR) {
        throw new Error('没有查看权限')
      }

      // 实际项目中查询待审核贡献
      return {
        items: [],
        total: 0
      }

    } catch (error) {
      logger.error('获取待审核贡献失败:', error)
      throw error
    }
  }

  /**
   * 获取用户创建的藏馆列表
   * @param {string} userId 用户ID
   */
  async getUserOwnedMuseums(userId) {
    try {
      // 实际项目中查询用户创建的藏馆
      return {
        items: [],
        total: 0
      }

    } catch (error) {
      logger.error('获取用户藏馆失败:', error)
      throw error
    }
  }

  /**
   * 获取用户参与的藏馆列表
   * @param {string} userId 用户ID
   */
  async getUserJoinedMuseums(userId) {
    try {
      // 实际项目中查询用户参与的藏馆
      return {
        items: [],
        total: 0
      }

    } catch (error) {
      logger.error('获取用户参与的藏馆失败:', error)
      throw error
    }
  }

  /**
   * 点赞/取消点赞藏馆
   * @param {string} museumId 藏馆ID
   * @param {string} userId 用户ID
   */
  async toggleLike(museumId, userId) {
    try {
      // 实际项目中实现点赞逻辑
      return {
        liked: true,
        likeCount: 1
      }

    } catch (error) {
      logger.error('点赞藏馆失败:', error)
      throw error
    }
  }

  /**
   * 获取用户在藏馆中的角色
   * @param {string} museumId 藏馆ID
   * @param {string} userId 用户ID
   */
  async getUserRole(museumId, userId) {
    if (!userId) {
      return this.roles.VISITOR
    }

    // 实际项目中查询用户角色
    // const museum = await MuseumModel.findByPk(museumId)
    // if (museum.ownerId === userId) {
    //   return this.roles.OWNER
    // }
    // if (museum.curators.includes(userId)) {
    //   return this.roles.CURATOR
    // }
    // 检查是否有贡献记录
    // const hasContribution = await ContributionModel.findOne({ where: { museumId, userId } })
    // if (hasContribution) {
    //   return this.roles.CONTRIBUTOR
    // }

    return this.roles.VISITOR
  }
}

module.exports = new SharedMuseumService()
module.exports.SharedMuseumService = SharedMuseumService
