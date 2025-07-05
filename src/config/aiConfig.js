// AI 配置文件
export const aiConfig = {
  // API 配置
  apiUrl: '/api/claude', // 使用本地代理地址
  apiKey: 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK', // 您的 API 密钥
  model: 'claude-3-7-sonnet-20250219', // 使用的模型
  
  // 请求配置
  temperature: 0.7,
  maxTokens: 64000,
  timeout: 30000,
  
  // 是否启用流式响应
  enableStreaming: true,
  
  // 自定义 API 调用函数
  customAPICall: null
}

// 设置自定义 API 调用函数
export const setCustomAPICall = (apiCallFunction) => {
  aiConfig.customAPICall = apiCallFunction
}



// OpenAI 兼容的 API 调用函数
export const openAICompatibleCall = async (requestData) => {
  try {
    const response = await fetch(aiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'User-Agent': 'PlanCard/1.0'
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: requestData.messages,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
        tools: requestData.tools,
        tool_choice: requestData.tool_choice,
        stream: aiConfig.enableStreaming
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API 调用失败: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('OpenAI API 调用失败:', error)
    throw error
  }
}



// Claude API 调用函数
export const claudeAPICall = async (requestData) => {
  try {
    // 转换消息格式为 Claude 格式，移除不被支持的字段
    const messages = requestData.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    const systemMessage = requestData.messages.find(msg => msg.role === 'system')
    
    // 构建 Claude API 请求
    const claudeRequest = {
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      messages: messages,
      ...(systemMessage && { system: systemMessage.content })
    }
    
    // 如果有工具调用，添加工具定义
    if (requestData.tools && requestData.tools.length > 0) {
      claudeRequest.tools = requestData.tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters
      }))
    }
    
    console.log('Claude API 请求:', claudeRequest)
    
    const response = await fetch(aiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`
      },
      body: JSON.stringify(claudeRequest)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Claude API 调用失败: ${response.status} - ${errorData.error?.message || response.statusText}`)
    }
    
    const claudeResponse = await response.json()
    console.log('Claude API 响应:', claudeResponse)
    
    // 转换为 OpenAI 格式的响应
    const openAIResponse = {
      choices: [{
        message: {
          role: 'assistant',
          content: claudeResponse.content || '抱歉，我无法处理您的请求。'
        }
      }]
    }
    
    // 处理工具调用
    if (claudeResponse.content) {
      const toolUses = claudeResponse.content.filter(item => item.type === 'tool_use')
      if (toolUses.length > 0) {
        openAIResponse.choices[0].message.tool_calls = toolUses.map(toolUse => ({
          id: toolUse.id,
          type: 'function',
          function: {
            name: toolUse.name,
            arguments: JSON.stringify(toolUse.input)
          }
        }))
      }
    }
    
    return openAIResponse
    
  } catch (error) {
    console.error('Claude API 调用失败:', error)
    throw error
  }
}

// 获取当前配置的 API 调用函数
export const getAPICall = () => {
  if (aiConfig.customAPICall) {
    return aiConfig.customAPICall
  }
  
  // 如果是 Claude API，使用专门的调用函数
  if (aiConfig.apiUrl.includes('anthropic') || aiConfig.apiUrl.includes('/api/claude')) {
    return claudeAPICall
  }
  
  return openAICompatibleCall
} 