#!/usr/bin/env python3
"""
Python向量数据库服务测试脚本
"""

import asyncio
import sys
import os

# 添加server目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

from vectorDBService import professional_vector_db_service

async def test_python_vector_service():
    """测试Python向量数据库服务"""
    print("🧪 开始测试Python向量数据库服务...\n")
    
    try:
        # 初始化服务
        await professional_vector_db_service.initialize()
        
        # 测试查询列表
        test_queries = [
            "妈妈的名字",
            "妈妈叫什么",
            "李秀英是谁",
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
        ]
        
        print("📋 测试查询列表:")
        for i, query in enumerate(test_queries, 1):
            print(f"{i}. {query}")
        print()
        
        # 执行测试
        for query in test_queries:
            print(f"🔍 测试查询: '{query}'")
            
            result = await professional_vector_db_service.query_documents(query, {
                'similarity_threshold': 0.1,
                'max_results': 10
            })
            
            if result['success']:
                print(f"  ✅ 查询成功，找到 {result['totalResults']} 个结果")
                
                if result['totalResults'] > 0:
                    for i, match in enumerate(result['results'][:3], 1):
                        print(f"    {i}. 文档ID: {match['docId']}")
                        print(f"       相似度: {match['similarity']*100:.1f}%")
                        print(f"       策略: {', '.join(match.get('strategies', []))}")
                        print(f"       内容片段: {match['document'][:100]}...")
                        print()
                else:
                    print("    ❌ 未找到相关结果")
            else:
                print(f"  ❌ 查询失败: {result['error']}")
            
            print("─" * 50)
        
        print("✅ Python向量数据库服务测试完成！")
        
    except Exception as error:
        print(f"❌ 测试失败: {error}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_python_vector_service()) 