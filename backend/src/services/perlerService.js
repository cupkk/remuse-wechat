const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs/promises')
const path = require('path')

/**
 * 拼豆图案生成服务
 * 支持将普通图片转换为拼豆图纸
 */
class PerlerService {
  constructor() {
    // 常用拼豆颜色配置（RGB）
    this.colorPalette = [
      { name: '白色', r: 255, g: 255, b: 255, code: 'W01' },
      { name: '黑色', r: 0, g: 0, b: 0, code: 'B01' },
      { name: '红色', r: 255, g: 0, b: 0, code: 'R01' },
      { name: '深红', r: 139, g: 0, b: 0, code: 'R02' },
      { name: '粉红', r: 255, g: 192, b: 203, code: 'R03' },
      { name: '橙色', r: 255, g: 165, b: 0, code: 'O01' },
      { name: '黄色', r: 255, g: 255, b: 0, code: 'Y01' },
      { name: '柠檬黄', r: 255, g: 250, b: 205, code: 'Y02' },
      { name: '绿色', r: 0, g: 255, b: 0, code: 'G01' },
      { name: '深绿', r: 0, g: 100, b: 0, code: 'G02' },
      { name: '青色', r: 0, g: 255, b: 255, code: 'C01' },
      { name: '蓝色', r: 0, g: 0, b: 255, code: 'B01' },
      { name: '深蓝', r: 0, g: 0, b: 139, code: 'B02' },
      { name: '紫色', r: 128, g: 0, b: 128, code: 'P01' },
      { name: '棕色', r: 165, g: 42, b: 42, code: 'BR01' },
      { name: '灰色', r: 128, g: 128, b: 128, code: 'GR01' },
      { name: '浅灰', r: 211, g: 211, b: 211, code: 'GR02' },
      { name: '透明', r: 0, g: 0, b: 0, code: 'T01', transparent: true }
    ]

    // 标准拼豆尺寸：5mm/颗
    this.beadSize = 5
    // 常用模板尺寸
    this.templateSizes = {
      small: { width: 29, height: 29, name: '小方形模板' },
      medium: { width: 58, height: 58, name: '中方形模板' },
      large: { width: 116, height: 116, name: '大方形模板' },
      circle: { width: 61, height: 61, name: '圆形模板' },
      heart: { width: 50, height: 50, name: '心形模板' }
    }
  }

  /**
   * 计算两个RGB颜色的欧氏距离
   */
  _colorDistance(color1, color2) {
    const rDiff = color1.r - color2.r
    const gDiff = color1.g - color2.g
    const bDiff = color1.b - color2.b
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
  }

  /**
   * 找到最接近的拼豆颜色
   */
  _findClosestColor(r, g, b) {
    let minDistance = Infinity
    let closestColor = this.colorPalette[0]

    for (const color of this.colorPalette) {
      const distance = this._colorDistance({ r, g, b }, color)
      if (distance < minDistance) {
        minDistance = distance
        closestColor = color
      }
    }

    return closestColor
  }

  /**
   * 生成拼豆图案
   * @param {string} imagePath 输入图片路径
   * @param {object} options 生成选项
   * @param {string} options.size 模板尺寸: small/medium/large/circle/heart
   * @param {number} options.colors 最多使用的颜色数量，默认16色
   * @param {boolean} options.transparent 是否支持透明
   * @returns {object} 拼豆图案数据
   */
  async generatePattern(imagePath, options = {}) {
    try {
      const { size = 'medium', colors = 16, transparent = false } = options
      const template = this.templateSizes[size] || this.templateSizes.medium

      // 1. 读取并处理图片
      const image = sharp(imagePath)
        .rotate() // 自动校正方向
        .resize(template.width, template.height, {
          fit: 'cover',
          position: 'center'
        })
        .removeAlpha()

      // 获取像素数据
      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true })

      const width = info.width
      const height = info.height

      // 2. 像素转换为拼豆颜色
      const pattern = []
      const colorCount = new Map()

      for (let y = 0; y < height; y++) {
        const row = []
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 3
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]

          // 透明处理（如果alpha通道小于阈值视为透明）
          if (transparent && r === 0 && g === 0 && b === 0) {
            const transparentColor = this.colorPalette.find(c => c.transparent)
            row.push(transparentColor)
            colorCount.set(transparentColor.code, (colorCount.get(transparentColor.code) || 0) + 1)
            continue
          }

          // 找到最接近的拼豆颜色
          const closestColor = this._findClosestColor(r, g, b)
          row.push(closestColor)
          colorCount.set(closestColor.code, (colorCount.get(closestColor.code) || 0) + 1)
        }
        pattern.push(row)
      }

      // 3. 统计颜色使用情况
      const colorStatistics = Array.from(colorCount.entries())
        .map(([code, count]) => {
          const color = this.colorPalette.find(c => c.code === code)
          return {
            code,
            name: color.name,
            r: color.r,
            g: color.g,
            b: color.b,
            count,
            // 计算所需数量（每包约100颗）
            packs: Math.ceil(count / 100)
          }
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, colors) // 限制颜色数量

      // 4. 生成预览图
      const previewBuffer = await this._generatePreviewImage(pattern, width, height)

      // 5. 生成PDF图纸
      const pdfBuffer = await this._generatePdfPattern(pattern, colorStatistics, template)

      // 6. 保存文件
      const patternId = uuidv4()
      const outputDir = path.join(process.cwd(), 'uploads', 'perler')
      await fs.mkdir(outputDir, { recursive: true })

      const previewPath = path.join(outputDir, `${patternId}_preview.png`)
      const pdfPath = path.join(outputDir, `${patternId}_pattern.pdf`)

      await fs.writeFile(previewPath, previewBuffer)
      await fs.writeFile(pdfPath, pdfBuffer)

      const baseUrl = process.env.BASE_URL || 'https://remuse.top'

      return {
        patternId,
        size: template.name,
        width: template.width,
        height: template.height,
        totalBeads: width * height,
        colorCount: colorStatistics.length,
        colorStatistics,
        pattern,
        previewUrl: `${baseUrl}/uploads/perler/${patternId}_preview.png`,
        pdfUrl: `${baseUrl}/uploads/perler/${patternId}_pattern.pdf`,
        createdAt: new Date()
      }

    } catch (error) {
      console.error('生成拼豆图案失败:', error)
      throw new Error('拼豆图案生成失败')
    }
  }

  /**
   * 生成拼豆预览图
   */
  async _generatePreviewImage(pattern, width, height) {
    // 每个拼豆在预览图中的像素大小
    const beadPixelSize = 10

    // 创建SVG
    let svg = `<svg width="${width * beadPixelSize}" height="${height * beadPixelSize}" xmlns="http://www.w3.org/2000/svg">`
    
    // 绘制背景网格
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`
    svg += `<defs><pattern id="grid" width="${beadPixelSize}" height="${beadPixelSize}" patternUnits="userSpaceOnUse"><path d="M ${beadPixelSize} 0 L 0 0 0 ${beadPixelSize}" fill="none" stroke="#e5e5e5" stroke-width="1"/></pattern></defs>`
    svg += `<rect width="100%" height="100%" fill="url(#grid)"/>`

    // 绘制每个拼豆
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = pattern[y][x]
        if (color.transparent) continue
        
        const cx = x * beadPixelSize + beadPixelSize / 2
        const cy = y * beadPixelSize + beadPixelSize / 2
        const r = beadPixelSize / 2 - 1
        
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgb(${color.r}, ${color.g}, ${color.b})" stroke="#cccccc" stroke-width="0.5"/>`
      }
    }

    svg += '</svg>'

    // 将SVG转换为PNG
    return sharp(Buffer.from(svg))
      .png()
      .toBuffer()
  }

  /**
   * 生成PDF拼豆图纸
   */
  async _generatePdfPattern(pattern, colorStatistics, template) {
    // 简化实现，实际项目可使用PDF库生成更专业的图纸
    const width = pattern[0].length
    const height = pattern.length
    const beadSizeMM = 5 // 5mm每颗

    // 生成简单PDF格式的内容（实际项目可使用pdfkit等库）
    let pdfContent = `%PDF-1.4
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
(Perler Pattern: ${template.name}) Tj
ET
BT
/F1 16 Tf
100 770 Td
(Size: ${width} x ${height} beads) Tj
ET
BT
/F1 16 Tf
100 740 Td
(Total Beads: ${width * height}) Tj
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

    return Buffer.from(pdfContent)
  }

  /**
   * 获取用户的拼豆图案列表
   */
  async getUserPatterns(userId, options = {}) {
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
   * 删除拼豆图案
   */
  async deletePattern(patternId, userId) {
    // 实际项目中删除数据库记录和文件
    return true
  }
}

module.exports = new PerlerService()
module.exports.PerlerService = PerlerService
