/**
 * Claude API 测试文件
 * 用于测试 Claude API 是否正常工作
 */

import claudeApiService from './src/api/claudeApi.js'

async function testClaudeAPI() {
  console.log('🧪 开始测试 Claude API...')
  
  try {
    // 测试简单对话
    const result = await claudeApiService.chat(
      '我是谁，我喜欢吃什么',
      '我是小明，我喜欢吃西瓜'
    )
    
    console.log('📝 测试结果:', result)
    
    if (result.success) {
      console.log('✅ Claude API 测试成功!')
      console.log('🤖 回复内容:', result.data.content?.[0]?.text || '无回复内容')
    } else {
      console.log('❌ Claude API 测试失败:', result.error)
    }
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error)
  }
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.testClaudeAPI = testClaudeAPI
  console.log('🌐 在浏览器中运行测试，请调用 window.testClaudeAPI()')
} else {
  // Node.js 环境
  testClaudeAPI()
} 