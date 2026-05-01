const { v4: uuidv4 } = require('uuid')
const fs = require('fs/promises')
const path = require('path')
const { generateGuidePrompt } = require('../prompts/aiPrompts')
const aiService = require('./aiService')

/**
 * 旧物改造指南生成服务
 * 基于藏品信息AI生成个性化改造方案
 */
class TransformationGuideService {
  constructor() {
    // 改造难度等级
    this.difficultyLevels = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      expert: '专家'
    }

    // 改造类型分类
    this.guideTypes = [
      '家居装饰',
      '实用工具',
      '创意摆件',
      '收纳整理',
      '电子配件',
      '饰品佩戴',
      '儿童玩具',
      '其他'
    ]

    // 基础材料库
    this.basicMaterials = [
      '胶水', '剪刀', '美工刀', '尺子', '画笔', '颜料',
      '麻绳', '铁丝', '胶带', '螺丝', '螺母', '热熔胶枪'
    ]
  }

  /**
   * 生成改造指南
   * @param {object} itemInfo 藏品信息
   * @param {object} options 生成选项
   * @returns {object} 改造指南
   */
  async generateGuide(itemInfo, options = {}) {
    try {
      const { name, category, material, story = '' } = itemInfo
      const { style = 'practical', difficulty = 'all' } = options

      // 1. 构建AI提示词
      const prompt = generateGuidePrompt({
        itemName: name,
        category,
        material,
        story,
        style,
        difficulty
      })

      // 2. 调用AI生成内容
      const aiResponse = await aiService.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2000
      })

      // 3. 解析AI返回的结构化内容
      const guideContent = this._parseAIGuideResponse(aiResponse, itemInfo)

      // 4. 生成指南ID并保存
      const guideId = uuidv4()
      const outputDir = path.join(process.cwd(), 'uploads', 'guides')
      await fs.mkdir(outputDir, { recursive: true })

      // 保存为Markdown文件
      const markdownContent = this._generateMarkdown(guideContent)
      const mdPath = path.join(outputDir, `${guideId}.md`)
      await fs.writeFile(mdPath, markdownContent)

      // 保存为PDF文件
      const pdfPath = path.join(outputDir, `${guideId}.pdf`)
      await this._generatePdf(guideContent, pdfPath)

      const baseUrl = process.env.BASE_URL || 'https://remuse.top'

      return {
        guideId,
        title: guideContent.title,
        itemName: name,
        type: guideContent.type,
        difficulty: guideContent.difficulty,
        estimatedTime: guideContent.estimatedTime,
        cost: guideContent.cost,
        description: guideContent.description,
        materials: guideContent.materials,
        tools: guideContent.tools,
        steps: guideContent.steps,
        tips: guideContent.tips,
        safetyNotes: guideContent.safetyNotes,
        markdownUrl: `${baseUrl}/uploads/guides/${guideId}.md`,
        pdfUrl: `${baseUrl}/uploads/guides/${guideId}.pdf`,
        coverImage: guideContent.coverImage || itemInfo.coverUrl,
        createdAt: new Date()
      }

    } catch (error) {
      console.error('生成改造指南失败:', error)
      throw new Error('改造指南生成失败')
    }
  }

  /**
   * 解析AI返回的指南内容
   */
  _parseAIGuideResponse(response, itemInfo) {
    // 简化解析逻辑，实际项目中需要根据AI返回的格式进行结构化解析
    return {
      title: `${itemInfo.name}改造方案`,
      type: this.guideTypes[Math.floor(Math.random() * this.guideTypes.length)],
      difficulty: Object.values(this.difficultyLevels)[Math.floor(Math.random() * 4)],
      estimatedTime: `${Math.floor(Math.random() * 8 + 1)}小时`,
      cost: `¥${Math.floor(Math.random() * 100 + 10)}`,
      description: `这是一个将${itemInfo.name}改造为精美实用物品的创意方案，保留了原物品的记忆价值，同时赋予它新的生命和用途。`,
      materials: [
        { name: itemInfo.name, quantity: '1个', note: '需要改造的原物品' },
        { name: '热熔胶', quantity: '1根', note: '' },
        { name: '颜料', quantity: '若干', note: '自选颜色' }
      ],
      tools: this.basicMaterials.slice(0, Math.floor(Math.random() * 5 + 3)),
      steps: [
        { step: 1, title: '准备工作', description: '将原物品清洗干净，擦干表面水分' },
        { step: 2, title: '初步处理', description: '根据设计方案对物品进行裁剪、打磨等基础处理' },
        { step: 3, title: '上色装饰', description: '按照设计进行上色和装饰' },
        { step: 4, title: '组装固定', description: '使用热熔胶等工具将各部分组装固定' },
        { step: 5, title: '完成调整', description: '检查稳固性，做最后的调整' }
      ],
      tips: [
        '操作时注意安全，避免划伤',
        '上色前可以先做小面积测试',
        '可以根据自己的喜好调整颜色和样式'
      ],
      safetyNotes: [
        '使用美工刀、剪刀等锋利工具时注意安全',
        '使用热熔胶时小心烫伤',
        '儿童操作需要家长陪同'
      ],
      coverImage: itemInfo.coverUrl
    }
  }

  /**
   * 生成Markdown格式的指南
   */
  _generateMarkdown(guide) {
    let md = `# ${guide.title}\n\n`
    md += `## 基本信息\n\n`
    md += `- **改造类型**: ${guide.type}\n`
    md += `- **难度**: ${guide.difficulty}\n`
    md += `- **预计耗时**: ${guide.estimatedTime}\n`
    md += `- **预计成本**: ${guide.cost}\n\n`
    md += `## 方案描述\n\n${guide.description}\n\n`
    
    md += `## 材料清单\n\n`
    guide.materials.forEach(material => {
      md += `- ${material.name}: ${material.quantity} ${material.note ? `(${material.note})` : ''}\n`
    })
    md += `\n`

    md += `## 所需工具\n\n`
    guide.tools.forEach(tool => {
      md += `- ${tool}\n`
    })
    md += `\n`

    md += `## 操作步骤\n\n`
    guide.steps.forEach(step => {
      md += `### 步骤${step.step}: ${step.title}\n\n${step.description}\n\n`
    })

    md += `## 小贴士\n\n`
    guide.tips.forEach(tip => {
      md += `- ${tip}\n`
    })
    md += `\n`

    md += `## 安全注意事项\n\n`
    guide.safetyNotes.forEach(note => {
      md += `⚠️ ${note}\n`
    })
    md += `\n`

    md += `---\n\n*Generated by Re-MUSE AI at ${new Date().toLocaleString()}*`
    
    return md
  }

  /**
   * 生成PDF格式指南
   */
  async _generatePdf(guide, outputPath) {
    // 简化实现，实际项目使用PDF库生成
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 1000 >>
stream
BT
/F1 24 Tf
100 800 Td
(${guide.title}) Tj
ET
BT
/F1 16 Tf
100 770 Td
(改造类型: ${guide.type}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000001400 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1500
%%EOF`

    await fs.writeFile(outputPath, pdfContent)
    return true
  }

  /**
   * 获取用户的改造指南列表
   */
  async getUserGuides(userId, options = {}) {
    const { page = 1, limit = 20 } = options
    // 实际项目中从数据库查询
    return {
      items: [],
      total: 0,
      page,
      limit
    }
  }

  /**
   * 删除改造指南
   */
  async deleteGuide(guideId, userId) {
    // 实际项目中删除数据库记录和文件
    return true
  }
}

module.exports = new TransformationGuideService()
module.exports.TransformationGuideService = TransformationGuideService
