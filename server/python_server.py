"""
Python API服务器
提供向量数据库查询服务
"""

import asyncio
import json
from aiohttp import web, ClientSession
import aiohttp_cors
import logging
from vectorDBService import professional_vector_db_service

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PythonAPIServer:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        self.setup_cors()
        self.vector_service = professional_vector_db_service

    def setup_routes(self):
        """设置路由"""
        self.app.router.add_post('/api/document-query', self.handle_document_query)
        self.app.router.add_get('/api/health', self.handle_health)
        self.app.router.add_get('/api/status', self.handle_status)

    def setup_cors(self):
        """设置CORS"""
        cors = aiohttp_cors.setup(self.app, defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            )
        })

    async def handle_document_query(self, request):
        """处理文档查询请求"""
        try:
            # 解析请求体
            data = await request.json()
            query = data.get('query')
            options = data.get('options', {})
            
            if not query or not isinstance(query, str):
                return web.json_response({
                    'success': False,
                    'error': '缺少必填字段: query'
                }, status=400)
            
            logger.info(f'[Document Query] 收到查询请求: {query}')
            
            # 调用Python向量数据库服务
            result = await self.vector_service.query_documents(query, options)
            
            if result['success']:
                logger.info(f'[Document Query] 查询成功，找到 {result["totalResults"]} 个结果')
                return web.json_response(result)
            else:
                logger.error(f'[Document Query] 查询失败: {result["error"]}')
                return web.json_response(result, status=500)
                
        except Exception as error:
            logger.error(f'[Document Query] 查询失败: {error}')
            return web.json_response({
                'success': False,
                'error': str(error) or '文档查询失败'
            }, status=500)

    async def handle_health(self, request):
        """健康检查"""
        return web.json_response({
            'status': 'healthy',
            'service': 'python-vector-db-service',
            'initialized': self.vector_service.is_initialized
        })

    async def handle_status(self, request):
        """状态检查"""
        return web.json_response({
            'status': 'running',
            'service': 'python-vector-db-service',
            'documents_count': len(self.vector_service.documents),
            'initialized': self.vector_service.is_initialized,
            'search_options': self.vector_service.search_options
        })

    async def start_server(self, host='localhost', port=3002):
        """启动服务器"""
        logger.info(f"🚀 启动Python API服务器: http://{host}:{port}")
        
        # 初始化向量数据库服务
        await self.vector_service.initialize()
        
        # 启动服务器
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logger.info(f"✅ Python API服务器已启动: http://{host}:{port}")
        
        # 保持服务器运行
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("🛑 正在关闭Python API服务器...")
            await runner.cleanup()

async def main():
    """主函数"""
    server = PythonAPIServer()
    await server.start_server()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止") 