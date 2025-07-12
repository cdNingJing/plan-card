/**
 * 文档匹配测试脚本
 * 用于验证改进后的匹配效果
 */

const { ProfessionalVectorDBService } = require('./server/vectorDBService.js');

async function testDocumentMatching() {
  console.log('🧪 开始测试文档匹配改进效果...\n');
  
  const vectorDB = new ProfessionalVectorDBService();
  
  try {
    // 初始化服务
    await vectorDB.initialize();
    
    // 测试查询列表
    const testQueries = [
      "妈妈喜欢吃什么？",
      "妈妈有什么忌口？",
      "妈妈的健康状况如何？",
      "妈妈的性格特点",
      "妈妈不喜欢什么食物？",
      "妈妈每天做什么？",
      "妈妈有什么爱好？",
      "妈妈的家庭关系",
      "妈妈最近有什么活动？",
      "妈妈喜欢什么礼物？"
    ];
    
    console.log('📋 测试查询列表:');
    testQueries.forEach((query, index) => {
      console.log(`${index + 1}. ${query}`);
    });
    console.log('');
    
    // 执行测试
    for (const query of testQueries) {
      console.log(`🔍 测试查询: "${query}"`);
      
      const result = await vectorDB.queryDocuments(query, {
        similarityThreshold: 0.1,
        maxResults: 10
      });
      
      if (result.success) {
        console.log(`  ✅ 查询成功，找到 ${result.totalResults} 个结果`);
        
        if (result.totalResults > 0) {
          result.results.slice(0, 3).forEach((match, index) => {
            console.log(`    ${index + 1}. 文档ID: ${match.docId}`);
            console.log(`       相似度: ${(match.similarity * 100).toFixed(1)}%`);
            console.log(`       策略: ${match.strategies.join(', ')}`);
            console.log(`       内容片段: ${match.document.substring(0, 100)}...`);
            console.log('');
          });
        } else {
          console.log('    ❌ 未找到相关结果');
        }
      } else {
        console.log(`  ❌ 查询失败: ${result.error}`);
      }
      
      console.log('─'.repeat(50));
    }
    
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testDocumentMatching(); 