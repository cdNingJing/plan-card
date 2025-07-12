/**
 * 文档查询服务使用示例
 */

import documentQueryService from '../services/documentQueryService.js'

// 使用示例
async function exampleUsage() {
  console.log('📖 文档查询服务使用示例')
  
  try {
    // 1. 初始化服务
    console.log('🔧 初始化服务...')
    await documentQueryService.initialize()
    
    // 2. 测试各种查询
    const testQueries = [
      "妈妈喜欢吃什么？",
      "妈妈有什么过敏？", 
      "妈妈的健康状况如何？",
      "妈妈的性格特点",
      "妈妈不喜欢什么食物？",
      "妈妈每天做什么？",
      "妈妈有什么爱好？",
      "妈妈的家庭关系",
      "妈妈最近有什么活动？",
      "妈妈喜欢什么礼物？"
    ]
    
    console.log('🔍 开始测试查询...\n')
    
    for (const query of testQueries) {
      console.log(`查询: "${query}"`)
      
      const result = await documentQueryService.queryDocuments(query, {
        useAI: true,
        similarityThreshold: 0.1
      })
      
      if (result.success) {
        if (result.totalResults === 0) {
          console.log('  ❌ 未找到相关信息')
        } else if (result.enhanced && result.aiAnalysis) {
          console.log('  ✅ AI分析结果:', result.aiAnalysis.substring(0, 100) + '...')
        } else {
          console.log(`  ✅ 找到 ${result.totalResults} 个相关片段`)
          result.results.forEach((docResult, index) => {
            console.log(`    文档 ${index + 1}: ${docResult.results.length} 个匹配`)
          })
        }
      } else {
        console.log('  ❌ 查询失败:', result.error)
      }
      
      console.log('')
    }
    
    console.log('✅ 示例测试完成！')
    
  } catch (error) {
    console.error('❌ 示例运行失败:', error)
  }
}

// 导出示例函数
if (typeof window !== 'undefined') {
  window.exampleUsage = exampleUsage
  console.log('🎯 示例函数已加载，可以运行 exampleUsage() 查看使用示例')
}

export default exampleUsage 