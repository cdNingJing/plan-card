/**
 * 任务管理 Agent API
 * 专门用于任务分析、分类和管理
 */

const TASK_AGENT_CONFIG = {
  baseURL: '', // 使用相对路径，通过Vite代理
  endpoint: '/api/ai',
  model: 'deepseek-r1-distill-llama-70b',
  apiKey: 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK'
}

/**
 * 任务管理 Agent API 类
 */
class TaskAgentApiService {
  constructor(config = TASK_AGENT_CONFIG) {
    this.config = config
    this.baseURL = config.baseURL
    this.endpoint = config.endpoint
    this.model = config.model
    this.apiKey = config.apiKey
  }

  /**
   * 分析用户消息中的任务
   * @param {string} userMessage - 用户消息
   * @param {Array} existingTasks - 现有任务列表
   * @returns {Promise} API响应
   */
  async analyzeTasks(userMessage, existingTasks = []) {
    try {
      const prompt = this.buildTaskAnalysisPrompt(userMessage, existingTasks)
      
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的任务分析和管理专家。你的职责是分析用户消息中的任务，并进行智能分类和管理。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      }

      console.log('任务分析请求:', JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('任务分析API错误:', errorText)
        throw new Error(`任务分析请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // 清除think标签内容
      if (data.choices && data.choices[0] && data.choices[0].message) {
        let content = data.choices[0].message.content
        
        // 移除<think>标签及其内容
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '')
        
        // 查找JSON内容
        const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[1])
            return {
              success: true,
              data: parsedData,
              message: '任务分析成功'
            }
          } catch (error) {
            console.error('解析JSON失败:', error)
            return {
              success: false,
              error: '解析响应数据失败',
              message: '任务分析失败'
            }
          }
        }
      }
      
      return {
        success: true,
        data: data,
        message: '任务分析成功'
      }
    } catch (error) {
      console.error('任务分析API调用错误:', error)
      return {
        success: false,
        error: error.message,
        message: '任务分析失败'
      }
    }
  }

  /**
   * 构建任务分析提示
   * @param {string} userMessage - 用户消息
   * @param {Array} existingTasks - 现有任务列表
   * @returns {string} 分析提示
   */
  buildTaskAnalysisPrompt(userMessage, existingTasks) {
    const existingTasksText = existingTasks.length > 0 
      ? `\n\n## 现有任务列表\n${existingTasks.map((task, index) => `${index + 1}. ${task.content || task.task} (当前分类: ${task.quadrant || '未分类'})`).join('\n')}`
      : '\n\n## 现有任务列表\n暂无任务'

    return `
# 任务分析和管理

## 用户消息
${userMessage}

${existingTasksText}

## 分析要求

请分析用户消息中是否包含新的任务，并对所有任务进行智能分类和管理。

**重要**：你需要主动分析对话内容，识别任何可能影响现有任务的信息，包括但不限于：
- 时间变化（如"现在是下午"、"时间已经到了"等）
- 位置变化（如"已经到了西安"、"在绿地酒店"等）
- 状态变化（如"任务已完成"、"会议结束了"等）
- 人员变化（如"小李安排了"、"张磊同行"等）
- 计划变化（如"改期了"、"取消了"等）

即使用户没有明确提及任务，也要根据这些信息主动更新相关任务。

### 任务识别规则：
1. 明确的任务描述（如"需要完成"、"要处理"、"必须做"等）
2. 时间相关的任务（如"明天要"、"下周需要"等）
3. 紧急情况（如"立刻"、"马上"、"紧急"等）
4. 重要事项（如"重要"、"关键"、"影响"等）

### 任务更新和清理规则：
1. **时间过期任务**：如果任务中提到的时间已经过去（如"中午起飞"但现在是下午），应该删除或更新
2. **已完成任务**：如果任务已经完成或情况已改变，应该删除
3. **信息更新**：根据新的情况信息更新任务内容（如位置变化、时间变化等）
4. **状态变化**：如果任务的状态发生重大变化，需要重新评估重要性和紧急性
5. **持续监控**：基于对话上下文，主动识别需要更新的任务，包括：
   - 任务优先级的变化
   - 任务依赖关系的变化
   - 任务完成状态的变化
   - 任务时间安排的变化
   - 任务相关人员的变更
6. **主动更新**：即使对话中没有明确提及任务，也要根据以下信息主动更新相关任务：
   - 时间变化（如"现在是下午"、"时间已经到了"等）
   - 位置变化（如"已经到了西安"、"在绿地酒店"等）
   - 状态变化（如"任务已完成"、"会议结束了"等）
   - 人员变化（如"小李安排了"、"张磊同行"等）
   - 计划变化（如"改期了"、"取消了"等）

### 任务分类标准：
- **重要且紧急**：高重要性 + 高紧急性，需要立即处理
- **重要不紧急**：高重要性 + 中/低紧急性，需要规划处理
- **紧急不重要**：中/低重要性 + 高紧急性，可以委托或简化处理
- **不重要不紧急**：中/低重要性 + 中/低紧急性，可以删除或延后

### 输出格式要求：
请严格按照以下JSON格式返回，不能有任何其他内容：

\`\`\`json
{
  "newTasks": [
    {
      "task": "任务内容描述",
      "importance": "high/medium/low",
      "urgency": "high/medium/low", 
      "reason": "分类原因分析",
      "quadrant": "important-urgent/important-not-urgent/urgent-not-important/not-important-not-urgent"
    }
  ],
  "updatedTasks": [
    {
      "id": "任务ID",
      "task": "更新后的任务内容",
      "importance": "high/medium/low",
      "urgency": "high/medium/low",
      "reason": "更新原因",
      "quadrant": "important-urgent/important-not-urgent/urgent-not-important/not-important-not-urgent"
    }
  ],
  "deletedTasks": ["任务ID1", "任务ID2"],
  "analysis": "整体任务分析说明"
}
\`\`\`

### 注意事项：
1. 只返回用户消息中真正的新任务
2. 根据任务的重要性和紧急性进行合理分类
3. 提供清晰的分类原因
4. 保持任务描述的简洁明了
5. 考虑任务的优先级和依赖关系
6. 如果现有任务需要更新或删除，请在相应字段中指定
7. **重要**：根据当前时间和情况，自动清理过时或已完成的任务
8. **重要**：根据新的信息更新任务内容，确保任务信息的准确性
9. **持续监控**：基于对话上下文，主动识别任务状态变化，包括：
   - 任务完成状态的变化
   - 任务优先级的变化
   - 任务时间安排的变化
   - 任务相关人员的变更
   - 任务依赖关系的变化
10. **智能更新**：根据对话中的新信息，主动更新相关任务，无需用户明确提及
`;
  }

  /**
   * 重新分类所有任务
   * @param {Array} allTasks - 所有任务列表
   * @returns {Promise} API响应
   */
  async reclassifyAllTasks(allTasks) {
    try {
      const prompt = this.buildReclassificationPrompt(allTasks)
      
      const requestBody = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的任务分类专家。你的职责是对任务进行重新分类和优化。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      }

      const response = await fetch(`${this.baseURL}${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`重新分类请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      // 清除think标签内容
      if (data.choices && data.choices[0] && data.choices[0].message) {
        let content = data.choices[0].message.content
        
        // 移除<think>标签及其内容
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '')
        
        // 查找JSON内容
        const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
        if (jsonMatch) {
          try {
            const parsedData = JSON.parse(jsonMatch[1])
            return {
              success: true,
              data: parsedData,
              message: '重新分类成功'
            }
          } catch (error) {
            console.error('解析JSON失败:', error)
            return {
              success: false,
              error: '解析响应数据失败',
              message: '重新分类失败'
            }
          }
        }
      }
      
      return {
        success: true,
        data: data,
        message: '重新分类成功'
      }
    } catch (error) {
      console.error('重新分类API调用错误:', error)
      return {
        success: false,
        error: error.message,
        message: '重新分类失败'
      }
    }
  }

  /**
   * 构建重新分类提示
   * @param {Array} allTasks - 所有任务列表
   * @returns {string} 重新分类提示
   */
  buildReclassificationPrompt(allTasks) {
    const tasksText = allTasks.map((task, index) => 
      `${index + 1}. ${task.content || task.task} (当前分类: ${task.quadrant || '未分类'})`
    ).join('\n')

    return `
# 任务重新分类

## 当前任务列表
${tasksText}

## 重新分类要求

请对所有任务进行重新分类和优化，确保每个任务都在正确的象限中。

### 分类标准：
- **重要且紧急**：高重要性 + 高紧急性
- **重要不紧急**：高重要性 + 中/低紧急性  
- **紧急不重要**：中/低重要性 + 高紧急性
- **不重要不紧急**：中/低重要性 + 中/低紧急性

### 输出格式：
\`\`\`json
{
  "reclassifiedTasks": [
    {
      "id": "任务ID",
      "task": "任务内容",
      "importance": "high/medium/low",
      "urgency": "high/medium/low",
      "reason": "分类原因",
      "quadrant": "important-urgent/important-not-urgent/urgent-not-important/not-important-not-urgent"
    }
  ],
  "analysis": "重新分类分析说明"
}
\`\`\`
`;
  }
}

// 创建默认实例
const taskAgentApiService = new TaskAgentApiService()

// 导出实例和类
export default taskAgentApiService
export { TaskAgentApiService, TASK_AGENT_CONFIG } 