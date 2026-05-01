const sharp = require('sharp')
const path = require('path')
const fs = require('fs/promises')
const { v4: uuidv4 } = require('uuid')

/**
 * 图片处理器，支持格式转换、压缩、裁剪等功能
 */
class ImageProcessor {
  constructor(options = {}) {
    this.quality = options.quality || 80
    this.maxWidth = options.maxWidth || 1920
    this.maxHeight = options.maxHeight || 1920
    this.allowFormats = ['jpeg', 'png', 'webp', 'gif']
    this.outputFormat = options.outputFormat || 'webp' // 默认输出WebP格式
  }

  /**
   * 处理上传的图片
   * @param {string} inputPath - 输入文件路径
   * @param {object} options - 处理选项
   * @returns {object} 处理结果
   */
  async processImage(inputPath, options = {}) {
    try {
      const image = sharp(inputPath)
      const metadata = await image.metadata()
      
      // 验证格式
      if (!this.allowFormats.includes(metadata.format)) {
        throw new Error(`不支持的图片格式: ${metadata.format}`)
      }

      // 生成输出文件名
      const outputFilename = `${uuidv4()}.${this.outputFormat}`
      const outputDir = options.outputDir || path.join(process.cwd(), 'uploads', 'processed')
      
      // 确保输出目录存在
      await fs.mkdir(outputDir, { recursive: true })
      const outputPath = path.join(outputDir, outputFilename)

      // 处理图片
      let process = image
        .rotate() // 自动校正方向
        .resize({
          width: options.maxWidth || this.maxWidth,
          height: options.maxHeight || this.maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        })

      // 根据输出格式处理
      if (this.outputFormat === 'webp') {
        process = process.webp({
          quality: options.quality || this.quality,
          effort: 4 // 压缩级别，0最快，6最慢
        })
      } else if (this.outputFormat === 'jpeg') {
        process = process.jpeg({
          quality: options.quality || this.quality,
          mozjpeg: true
        })
      } else if (this.outputFormat === 'png') {
        process = process.png({
          quality: options.quality || this.quality,
          compressionLevel: 6
        })
      }

      // 保存处理后的图片
      await process.toFile(outputPath)

      // 获取处理后的文件信息
      const stats = await fs.stat(outputPath)
      const processedMetadata = await sharp(outputPath).metadata()

      return {
        success: true,
        filename: outputFilename,
        path: outputPath,
        size: stats.size,
        width: processedMetadata.width,
        height: processedMetadata.height,
        format: processedMetadata.format,
        originalSize: metadata.size,
        originalFormat: metadata.format,
        compressionRatio: ((metadata.size - stats.size) / metadata.size * 100).toFixed(2) + '%'
      }

    } catch (error) {
      console.error('图片处理失败:', error)
      throw error
    }
  }

  /**
   * 生成不同尺寸的缩略图
   * @param {string} inputPath - 输入图片路径
   * @param {Array} sizes - 尺寸数组，如[{name: 'small', width: 300}, {name: 'medium', width: 800}]
   * @param {object} options - 处理选项
   * @returns {Array} 缩略图列表
   */
  async generateThumbnails(inputPath, sizes, options = {}) {
    const thumbnails = []
    
    for (const size of sizes) {
      try {
        const outputFilename = `${uuidv4()}_${size.name}.${this.outputFormat}`
        const outputDir = options.outputDir || path.join(process.cwd(), 'uploads', 'thumbnails')
        await fs.mkdir(outputDir, { recursive: true })
        const outputPath = path.join(outputDir, outputFilename)

        await sharp(inputPath)
          .rotate()
          .resize(size.width, size.height || size.width, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: options.quality || this.quality })
          .toFile(outputPath)

        const stats = await fs.stat(outputPath)
        thumbnails.push({
          name: size.name,
          filename: outputFilename,
          path: outputPath,
          size: stats.size,
          width: size.width,
          height: size.height || size.width
        })

      } catch (error) {
        console.error(`生成缩略图 ${size.name} 失败:`, error)
      }
    }

    return thumbnails
  }

  /**
   * 获取图片信息
   * @param {string} imagePath - 图片路径
   * @returns {object} 图片元数据
   */
  async getImageInfo(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata()
      const stats = await fs.stat(imagePath)
      
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: stats.size,
        channels: metadata.channels,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation
      }
    } catch (error) {
      console.error('获取图片信息失败:', error)
      throw error
    }
  }
}

module.exports = new ImageProcessor()
module.exports.ImageProcessor = ImageProcessor
