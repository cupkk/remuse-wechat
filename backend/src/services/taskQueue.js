const { v4: uuidv4 } = require('uuid')

// 内存任务队列（生产环境可替换为Redis Queue/BullMQ）
const taskQueue = new Map()
const taskResults = new Map()

// 任务状态
const TASK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

/**
 * 添加异步任务
 * @param {string} type - 任务类型
 * @param {object} payload - 任务参数
 * @param {function} handler - 任务处理函数
 * @returns {string} taskId
 */
const addTask = async (type, payload, handler) => {
  const taskId = uuidv4()
  
  const task = {
    id: taskId,
    type,
    payload,
    status: TASK_STATUS.PENDING,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null
  }

  taskQueue.set(taskId, task)

  // 异步执行任务
  processTask(taskId, handler)

  return taskId
}

/**
 * 处理任务
 */
const processTask = async (taskId, handler) => {
  const task = taskQueue.get(taskId)
  if (!task) return

  try {
    task.status = TASK_STATUS.PROCESSING
    task.startedAt = new Date()
    
    // 执行任务处理函数
    const result = await handler(task.payload)
    
    task.status = TASK_STATUS.COMPLETED
    task.result = result
    task.completedAt = new Date()

    // 保存结果，1小时后自动清理
    taskResults.set(taskId, task)
    setTimeout(() => {
      taskQueue.delete(taskId)
      taskResults.delete(taskId)
    }, 3600 * 1000)

  } catch (error) {
    task.status = TASK_STATUS.FAILED
    task.error = error.message
    task.completedAt = new Date()

    taskResults.set(taskId, task)
    setTimeout(() => {
      taskQueue.delete(taskId)
      taskResults.delete(taskId)
    }, 3600 * 1000)

    console.error(`任务执行失败 ${taskId}:`, error)
  }
}

/**
 * 获取任务状态
 * @param {string} taskId - 任务ID
 * @returns {object} 任务状态
 */
const getTaskStatus = (taskId) => {
  const task = taskResults.get(taskId) || taskQueue.get(taskId)
  
  if (!task) {
    return {
      id: taskId,
      status: TASK_STATUS.FAILED,
      error: '任务不存在或已过期'
    }
  }

  // 返回精简信息，避免泄露敏感数据
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    result: task.status === TASK_STATUS.COMPLETED ? task.result : undefined,
    error: task.status === TASK_STATUS.FAILED ? task.error : undefined
  }
}

/**
 * 等待任务完成
 * @param {string} taskId - 任务ID
 * @param {number} timeout - 超时时间（毫秒），默认30秒
 * @returns {object} 任务结果
 */
const waitForTask = async (taskId, timeout = 30000) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const status = getTaskStatus(taskId)
    
    if (status.status === TASK_STATUS.COMPLETED || status.status === TASK_STATUS.FAILED) {
      return status
    }

    // 每500ms轮询一次
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  throw new Error('任务执行超时')
}

module.exports = {
  addTask,
  getTaskStatus,
  waitForTask,
  TASK_STATUS
}
