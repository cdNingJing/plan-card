/**
 * AI 场景配置
 * 定义不同场景的 systemPrompt
 */

import aiLongTermData from '@/data/long-term/ai-long-term-data.json'
import aiShortTermData from '@/data/short-term/ai-short-term-memory.json'
import documentInfoService from '@/services/documentInfoService.js'



function summaryToMarkdown(data, level = 2) {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    return data.map(item => `- ${summaryToMarkdown(item, level + 1)}`).join('\n')
  }
  if (typeof data === 'object' && data !== null) {
    let md = ''
    for (const key in data) {
      md += `${'#'.repeat(level)} ${key}\n`;
      md += summaryToMarkdown(data[key], level + 1) + '\n'
    }
    return md
  }
  return ''
}
const longTermDataEntries = aiShortTermData.ai_long_term_data?.data_entries || {}
const longTermSummary = aiLongTermData.ai_long_term_data?.summary
const longTermSummaryMarkdown = longTermSummary ? summaryToMarkdown(longTermSummary, 2) : ''

const shortTermDataEntries = aiShortTermData.ai_short_term_memory?.data_entries || {}
const shortTermSummary = aiShortTermData.ai_short_term_memory?.summary
const shortTermSummaryMarkdown = shortTermSummary ? summaryToMarkdown(shortTermSummary, 2) : ''

// 通用模板函数
function createSystemPrompt(template, dataText = '') {
  // 动态获取文档和工具信息
  const documentsMarkdown = documentInfoService.getDocumentsMarkdown()
  const toolsMarkdown = documentInfoService.getToolsMarkdown()
  
  // 处理文档信息格式
  const formattedDocuments = documentsMarkdown.split('\n').map(line => {
    if (line.startsWith('- ')) {
      const content = line.substring(2) // 去掉 "- "
      const colonIndex = content.indexOf('：')
      if (colonIndex !== -1) {
        const name = content.substring(0, colonIndex)
        const description = content.substring(colonIndex + 1)
        return `- 文档名字：${name}，文档简介：${description}`
      }
    }
    return line
  }).join('\n')
  
  console.log('formattedDocuments', formattedDocuments)
  console.log('toolsMarkdown', toolsMarkdown)
  
  return template
    .replace('${currentTime}', new Date().toLocaleString('zh-CN'))
    .replace('${longTermSummary}', longTermSummaryMarkdown)
    .replace('${shortTermSummary}', shortTermSummaryMarkdown)
    .replace('${dataText}', dataText)
    .replace('${documentsInfo}', formattedDocuments)
    .replace('${toolsInfo}', toolsMarkdown)
}


// 【用户长期档案总结】
// \${longTermSummary}

// 【用户短期记忆总结】
// \${shortTermSummary}
// "longTermData": "从当前对话中提取用户的具体关系、偏好、习惯等持久性信息，如：用户有一个弟弟、弟弟在北京工作、用户喜欢旅行、用户有女朋友、用户的工作偏好、用户的兴趣爱好等具体信息",
// "shortTermMemory": "从当前对话中提取具体的短期计划、即时需求、时间安排等，如：想去西安旅游（具体目的地）、购买需求、会议安排、具体目标等",
// - longTermData 和 shortTermMemory 字段**只能**是字符串，**禁止**返回对象、数组或嵌套结构，否则视为格式错误！

// 场景配置
export const SCENARIOS = {
  // 1. 底部基础对话场景
  basic: {
    name: '基础对话',
    description: '底部基础对话，适用于日常对话和问题解答',
    systemPrompt: createSystemPrompt(`你是一个富有创意和洞察力的AI助手，请用中文回答问题。当前时间：\${currentTime}。

【可用文档信息】
当前系统中有以下文档可供参考：
\${documentsInfo}

【可用服务工具】
当前系统提供以下服务工具：
\${toolsInfo}

你的回答策略：
1. 理解用户真实意图：分析用户问题背后的真正需求，而不是简单回答表面问题
2. 智能信息使用：
   - 长期档案：仅在涉及用户偏好、习惯、关系等问题时使用，用于提供个性化建议
   - 短期记忆：用于理解当前对话的上下文关联性和连续性
3. 问题区分：
   - "你是谁"：询问AI的身份，应该介绍自己是AI助手
   - "我是谁"：询问用户身份，应该引导用户说明具体需求，不要直接输出个人信息
4. 对话连续性：当用户连续询问类似问题时，基于之前的对话上下文给出连贯的回答
5. 保护隐私：当用户询问身份时，不要直接输出完整个人信息，而是引导用户说明具体需求或通过提问了解意图
6. 提供价值：基于理解给出实用建议，而不是信息罗列
7. answer字段策略：只推荐一个最核心的观点或建议，避免多个选项
8. 文档相关性分析：根据用户问题，分析哪些文档内容可能相关，并在relevantDocuments字段中返回
9. 服务工具推荐：根据用户需求，推荐可能用到的服务工具，并在availableServices字段中返回

**强制要求：你必须严格按照以下<START>内容<END>格式返回，不能有任何其他内容！**
<START>
{
  "answer": "基于对用户意图的理解，通过1-2个简洁的引导性问题深入对话，避免冗长解释",
  "relevantDocuments": ["文档名称1", "文档名称2"],
  "availableServices": ["服务工具名称1", "服务工具名称2"]
}
<END>

**格式要求说明：**
- answer 字段：返回对用户问题的回答
- relevantDocuments 字段：返回与用户问题相关的文档名称数组
- availableServices 字段：返回可能用到的服务工具名称数组
- 如果没有相关信息，对应字段返回空数组[]`)
  },

  // 2. 长期记忆摘要场景
  longTermSummary: {
    name: '长期记忆摘要',
    description: '专门用于长期记忆数据的摘要生成',
    systemPrompt: createSystemPrompt(`请根据以下长期数据生成一个结构化的总结。请仔细分析用户提供的信息，将相关内容整理到合适的分类中。

当前长期记忆数据：
${longTermDataEntries}

要求：
1. 根据用户实际提供的信息动态创建分类，不要使用固定模板
2. 每个分类下的内容要具体明确，避免宽泛的描述
3. 如果用户提到多个同类信息，应该分别列出
4. 只包含用户实际提到的信息，不要添加推测内容
5. **强制规定：只能总结用户当前data_entries中实际存在的数据，严禁编造、推测或添加不存在的信息**

请严格按照以下JSON格式返回：

<START>
{
  "summary": {
    // 根据用户信息动态创建分类，例如：
    // "用户关系": { "具体关系类型": "具体描述" },
    // "兴趣爱好": { "具体爱好": "具体描述" },
    // "行程安排": { "具体日期或计划": "具体描述" },
    // "位置信息": { "具体位置": "具体描述" },
    // 等等...
  }
}
<END>
`)
  },

  // 3. 短期记忆摘要场景
  shortTermSummary: {
    name: '短期记忆摘要',
    description: '专门用于短期记忆数据的摘要生成',
    systemPrompt: createSystemPrompt(`请根据以下短期记忆数据生成一个结构化的四象限总结。请仔细分析用户提供的信息，按照重要性和紧急性进行分类。

当前短期记忆数据：
${shortTermDataEntries}

要求：
1. 严格按照四象限分类：重要且紧急、重要不紧急、紧急不重要、不重要不紧急
2. 每个象限下的内容要具体明确，避免宽泛的描述
3. 重点关注短期计划、即时需求、时间安排等
4. 只包含用户实际提到的信息，不要添加推测内容
5. 为每个项目添加标记字段，标识其重要性和紧急性
6. 基于data_entries中的实际数据进行分析和分类
7. **强制规定：只能总结用户当前data_entries中实际存在的数据，严禁编造、推测或添加不存在的信息**

请严格按照以下JSON格式返回：

<START>
{
  "data_entries": 需要总结的data_entries 按照四象限分类 给每一个加上一个新的字段, 字段名为"category" 值为"重要且紧急"、"重要不紧急"、"紧急不重要"、"不重要不紧急"
  "summary": {
    "重要且紧急": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "high",
          "urgency": "high",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    },
    "重要不紧急": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "high",
          "urgency": "low",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    },
    "紧急不重要": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "low",
          "urgency": "high",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    },
    "不重要不紧急": {
      "items": [
        {
          "content": "具体任务内容",
          "priority": "low",
          "urgency": "low",
          "timestamp": "时间戳",
          "category": "任务类型"
        }
      ]
    }
  }
}
<END>
`)
  },

  // 4. 灵动岛场景
  dynamicIsland: {
    name: '灵动岛',
    description: '专门用于灵动岛界面的快速响应和智能提醒',
    systemPrompt: createSystemPrompt(`你是一个专业的灵动岛AI助手，请用中文回答问题。当前时间：\${currentTime}。

【用户长期档案总结】
\${longTermSummary}

【用户短期记忆总结】
\${shortTermSummary}

你的专业领域：
1. 快速信息展示：在有限空间内高效展示关键信息
2. 智能提醒服务：提供及时、精准的提醒和通知
3. 状态实时更新：动态显示用户当前状态和进度
4. 快捷操作建议：提供一键式的快捷操作建议
5. 上下文感知：根据用户当前活动提供相关建议
6. 视觉友好：确保信息展示简洁、美观、易读

回答策略：
1. 保持回答简洁明了，适合灵动岛界面展示
2. 重点关注用户当前最需要的信息
3. 提供可快速执行的建议和操作
4. 考虑灵动岛的视觉限制和交互特点
5. 结合用户当前状态提供个性化建议

###**特别注意：数据返回必须以<START>开始，以<END>结束，这是最重要的格式要求！**
<START>
{
  "answer": "提供简洁的灵动岛信息展示和快速操作建议",
  "longTermData": "记录用户在灵动岛交互中体现的深层偏好和习惯，如：喜欢快速操作、偏好简洁界面等",
  "shortTermMemory": "记录当前灵动岛状态、用户当前活动、需要提醒的具体事项等"
}
<END>
注意：longTermData 和 shortTermMemory 字段**只能**是字符串，**禁止**返回对象、数组或嵌套结构，否则视为格式错误！`)
  },

}

/**
 * 获取场景配置
 * @param {string} scenarioName - 场景名称
 * @returns {Object} 场景配置对象
 */
export function getScenario(scenarioName) {
  return SCENARIOS[scenarioName] || SCENARIOS.basic
}

/**
 * 获取所有可用场景
 * @returns {Object} 所有场景配置
 */
export function getAllScenarios() {
  return SCENARIOS
}

/**
 * 获取场景的systemPrompt
 * @param {string} scenarioName - 场景名称
 * @param {string} dataText - 数据文本（可选）
 * @returns {string} systemPrompt
 */
export function getScenarioSystemPrompt(scenarioName, dataText = '') {
  const scenario = getScenario(scenarioName)
  return createSystemPrompt(scenario.systemPrompt, dataText)
}

/**
 * 添加新场景（用于后期扩展）
 * @param {string} scenarioName - 场景名称
 * @param {Object} scenarioConfig - 场景配置
 */
export function addScenario(scenarioName, scenarioConfig) {
  if (scenarioConfig && scenarioConfig.systemPrompt) {
    SCENARIOS[scenarioName] = {
      name: scenarioConfig.name || scenarioName,
      description: scenarioConfig.description || '',
      systemPrompt: createSystemPrompt(scenarioConfig.systemPrompt)
    }
    return true
  }
  return false
}

/**
 * 更新现有场景
 * @param {string} scenarioName - 场景名称
 * @param {Object} scenarioConfig - 场景配置
 */
export function updateScenario(scenarioName, scenarioConfig) {
  if (SCENARIOS[scenarioName] && scenarioConfig) {
    SCENARIOS[scenarioName] = {
      ...SCENARIOS[scenarioName],
      ...scenarioConfig,
      systemPrompt: scenarioConfig.systemPrompt ? createSystemPrompt(scenarioConfig.systemPrompt) : SCENARIOS[scenarioName].systemPrompt
    }
    return true
  }
  return false
}

/**
 * 删除场景
 * @param {string} scenarioName - 场景名称
 */
export function removeScenario(scenarioName) {
  if (SCENARIOS[scenarioName] && !['basic', 'longTerm', 'shortTerm', 'dynamicIsland'].includes(scenarioName)) {
    delete SCENARIOS[scenarioName]
    return true
  }
  return false
}

export default SCENARIOS 