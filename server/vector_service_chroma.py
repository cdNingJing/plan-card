"""
基于ChromaDB和LangChain的向量搜索服务
使用成熟的第三方库实现智能文档搜索
"""

import json
import os
import asyncio
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

# 第三方库导入
import chromadb
from chromadb.config import Settings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.schema import Document
from sentence_transformers import SentenceTransformer
import jieba
import jieba.posseg as pseg
from fuzzywuzzy import fuzz
import numpy as np

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChromaVectorService:
    """基于ChromaDB的向量搜索服务"""
    
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.embeddings = None
        self.text_splitter = None
        self.documents = []
        self.is_initialized = False
        
        # 配置
        self.config = {
            'embedding_model': 'paraphrase-multilingual-MiniLM-L12-v2',
            'chunk_size': 500,
            'chunk_overlap': 50,
            'similarity_threshold': 0.15,
            'max_results': 20
        }
        
        # 中文停用词
        self.stopwords = {
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', 
            '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', 
            '自己', '这', '那', '他', '她', '它', '们', '个', '只', '条', '张', '片', '块'
        }

    async def initialize(self):
        """初始化服务"""
        logger.info("🚀 初始化ChromaDB向量搜索服务...")
        
        try:
            # 初始化ChromaDB客户端
            self.chroma_client = chromadb.PersistentClient(
                path="./chroma_db",
                settings=Settings(anonymized_telemetry=False)
            )
            
            # 初始化文本分割器
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.config['chunk_size'],
                chunk_overlap=self.config['chunk_overlap'],
                separators=["\n\n", "\n", "。", "！", "？", "；", "，", " ", ""]
            )
            
            # 初始化嵌入模型
            self.embeddings = HuggingFaceEmbeddings(
                model_name=self.config['embedding_model'],
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            
            # 加载或创建集合
            await self.setup_collection()
            
            # 加载文档
            await self.load_documents()
            
            self.is_initialized = True
            logger.info("✅ ChromaDB向量搜索服务初始化完成")
            
        except Exception as e:
            logger.error(f"❌ 初始化失败: {e}")
            raise

    async def setup_collection(self):
        """设置ChromaDB集合"""
        try:
            # 尝试获取现有集合
            self.collection = self.chroma_client.get_collection("virtual_mom_docs")
            logger.info("📚 使用现有文档集合")
        except:
            # 创建新集合
            self.collection = self.chroma_client.create_collection(
                name="virtual_mom_docs",
                metadata={"description": "虚拟妈妈档案文档集合"}
            )
            logger.info("📚 创建新的文档集合")

    async def load_documents(self):
        """加载文档到ChromaDB"""
        try:
            # 检查集合是否为空
            if self.collection.count() > 0:
                logger.info(f"📚 集合中已有 {self.collection.count()} 个文档")
                return
            
            # 加载向量化文档
            mom_vectors_path = Path("../src/data/long-term/virtual-mom-vectors.json")
            
            if mom_vectors_path.exists():
                with open(mom_vectors_path, 'r', encoding='utf-8') as f:
                    vectors_data = json.load(f)
                
                # 处理文档
                documents = []
                for doc in vectors_data['documents']:
                    if doc.get('id') and doc.get('content'):
                        # 分割文档
                        chunks = self.text_splitter.split_text(doc['content'])
                        
                        for i, chunk in enumerate(chunks):
                            doc_id = f"{doc['id']}_chunk_{i}"
                            documents.append({
                                'id': doc_id,
                                'content': chunk,
                                'metadata': {
                                    'original_id': doc['id'],
                                    'category': doc.get('category', ''),
                                    'tags': doc.get('tags', []),
                                    'chunk_index': i,
                                    'total_chunks': len(chunks)
                                }
                            })
                
                # 添加到ChromaDB
                if documents:
                    self.collection.add(
                        documents=[doc['content'] for doc in documents],
                        metadatas=[doc['metadata'] for doc in documents],
                        ids=[doc['id'] for doc in documents]
                    )
                    logger.info(f"✅ 成功加载 {len(documents)} 个文档块到ChromaDB")
                
            else:
                logger.warning("⚠️ 向量化文档文件不存在")
                
        except Exception as e:
            logger.error(f"❌ 加载文档失败: {e}")
            raise

    async def query_documents(self, query: str, options: Optional[Dict] = None) -> Dict:
        """查询文档"""
        if not self.is_initialized:
            await self.initialize()

        try:
            logger.info(f"🔍 ChromaDB查询: '{query}'")
            
            # 合并选项
            search_options = {**self.config}
            if options:
                search_options.update(options)
            
            # 执行查询
            results = self.collection.query(
                query_texts=[query],
                n_results=search_options['max_results'],
                include=['documents', 'metadatas', 'distances']
            )
            
            # 处理结果
            processed_results = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0], 
                results['metadatas'][0], 
                results['distances'][0]
            )):
                # 计算相似度（距离越小，相似度越高）
                similarity = 1.0 - distance
                
                if similarity >= search_options['similarity_threshold']:
                    processed_results.append({
                        'docId': metadata.get('original_id', f'unknown_{i}'),
                        'document': doc,
                        'metadata': metadata,
                        'similarity': similarity,
                        'distance': distance,
                        'strategy': 'chromadb-semantic'
                    })
            
            return {
                'success': True,
                'query': query,
                'results': processed_results,
                'totalResults': len(processed_results),
                'searchStrategy': 'chromadb-semantic-search'
            }
            
        except Exception as error:
            logger.error(f"❌ ChromaDB查询失败: {error}")
            return {
                'success': False,
                'error': str(error),
                'query': query
            }

    async def semantic_search(self, query: str, top_k: int = 10) -> List[Dict]:
        """语义搜索"""
        try:
            # 使用LangChain的Chroma进行语义搜索
            vectorstore = Chroma(
                client=self.chroma_client,
                collection_name="virtual_mom_docs",
                embedding_function=self.embeddings
            )
            
            # 执行相似度搜索
            docs = vectorstore.similarity_search_with_score(query, k=top_k)
            
            results = []
            for doc, score in docs:
                similarity = 1.0 - score  # 转换距离为相似度
                results.append({
                    'docId': doc.metadata.get('original_id', 'unknown'),
                    'document': doc.page_content,
                    'metadata': doc.metadata,
                    'similarity': similarity,
                    'score': score,
                    'strategy': 'langchain-semantic'
                })
            
            return results
            
        except Exception as e:
            logger.error(f"❌ 语义搜索失败: {e}")
            return []

    async def keyword_search(self, query: str) -> List[Dict]:
        """关键词搜索"""
        try:
            # 使用jieba分词
            keywords = jieba.lcut(query)
            keywords = [kw for kw in keywords if kw not in self.stopwords and len(kw) > 1]
            
            # 在ChromaDB中搜索
            results = self.collection.query(
                query_texts=[query],
                n_results=self.config['max_results'],
                include=['documents', 'metadatas', 'distances']
            )
            
            processed_results = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0], 
                results['metadatas'][0], 
                results['distances'][0]
            )):
                # 计算关键词匹配度
                doc_lower = doc.lower()
                keyword_matches = sum(1 for kw in keywords if kw.lower() in doc_lower)
                keyword_score = keyword_matches / len(keywords) if keywords else 0
                
                # 结合语义相似度和关键词匹配度
                semantic_similarity = 1.0 - distance
                final_similarity = (semantic_similarity + keyword_score) / 2
                
                if final_similarity >= self.config['similarity_threshold']:
                    processed_results.append({
                        'docId': metadata.get('original_id', f'unknown_{i}'),
                        'document': doc,
                        'metadata': metadata,
                        'similarity': final_similarity,
                        'keyword_score': keyword_score,
                        'semantic_similarity': semantic_similarity,
                        'strategy': 'keyword-semantic-hybrid'
                    })
            
            return processed_results
            
        except Exception as e:
            logger.error(f"❌ 关键词搜索失败: {e}")
            return []

    async def fuzzy_search(self, query: str) -> List[Dict]:
        """模糊搜索"""
        try:
            # 获取所有文档
            all_docs = self.collection.get()
            
            results = []
            for i, (doc_id, doc_content, metadata) in enumerate(zip(
                all_docs['ids'], 
                all_docs['documents'], 
                all_docs['metadatas']
            )):
                # 使用fuzzywuzzy计算相似度
                similarity = fuzz.ratio(query.lower(), doc_content.lower()) / 100.0
                
                if similarity >= self.config['similarity_threshold']:
                    results.append({
                        'docId': metadata.get('original_id', doc_id),
                        'document': doc_content,
                        'metadata': metadata,
                        'similarity': similarity,
                        'strategy': 'fuzzy-match'
                    })
            
            # 按相似度排序
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results[:self.config['max_results']]
            
        except Exception as e:
            logger.error(f"❌ 模糊搜索失败: {e}")
            return []

    async def multi_strategy_search(self, query: str, options: Optional[Dict] = None) -> Dict:
        """多策略搜索"""
        try:
            # 合并选项
            search_options = {**self.config}
            if options:
                search_options.update(options)
            
            all_results = []
            seen_docs = set()
            
            # 1. 语义搜索
            semantic_results = await self.semantic_search(query, search_options['max_results'])
            for result in semantic_results:
                if result['docId'] not in seen_docs:
                    all_results.append(result)
                    seen_docs.add(result['docId'])
            
            # 2. 关键词搜索
            keyword_results = await self.keyword_search(query)
            for result in keyword_results:
                if result['docId'] not in seen_docs:
                    all_results.append(result)
                    seen_docs.add(result['docId'])
            
            # 3. 模糊搜索
            fuzzy_results = await self.fuzzy_search(query)
            for result in fuzzy_results:
                if result['docId'] not in seen_docs:
                    all_results.append(result)
                    seen_docs.add(result['docId'])
            
            # 合并和排序结果
            final_results = self.combine_and_rank_results(all_results, query)
            
            # 过滤结果
            filtered_results = [
                r for r in final_results 
                if r['similarity'] >= search_options['similarity_threshold']
            ][:search_options['max_results']]
            
            return {
                'success': True,
                'query': query,
                'results': filtered_results,
                'totalResults': len(filtered_results),
                'searchStrategy': 'multi-strategy-chromadb'
            }
            
        except Exception as error:
            logger.error(f"❌ 多策略搜索失败: {error}")
            return {
                'success': False,
                'error': str(error),
                'query': query
            }

    def combine_and_rank_results(self, results: List[Dict], query: str) -> List[Dict]:
        """合并和排序结果"""
        doc_scores = {}
        
        # 计算综合分数
        for result in results:
            doc_id = result['docId']
            if doc_id not in doc_scores:
                doc_scores[doc_id] = {
                    'docId': doc_id,
                    'document': result['document'],
                    'metadata': result['metadata'],
                    'strategies': [],
                    'totalScore': 0,
                    'maxScore': 0,
                    'matchCount': 0,
                    'strategyScores': {}
                }
            
            doc_score = doc_scores[doc_id]
            doc_score['strategies'].append(result['strategy'])
            doc_score['totalScore'] += result['similarity']
            doc_score['maxScore'] = max(doc_score['maxScore'], result['similarity'])
            doc_score['matchCount'] += 1
            doc_score['strategyScores'][result['strategy']] = result['similarity']
        
        # 计算最终相似度
        final_results = []
        for doc in doc_scores.values():
            weighted_score = 0
            
            # 根据策略类型调整权重
            if 'chromadb-semantic' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['chromadb-semantic'] * 0.4
            if 'langchain-semantic' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['langchain-semantic'] * 0.35
            if 'keyword-semantic-hybrid' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['keyword-semantic-hybrid'] * 0.25
            if 'fuzzy-match' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['fuzzy-match'] * 0.15
            
            # 多策略匹配加分
            if len(doc['strategies']) > 1:
                weighted_score += 0.1
            
            final_results.append({
                'docId': doc['docId'],
                'document': doc['document'],
                'metadata': doc['metadata'],
                'similarity': min(weighted_score, 1),
                'strategies': doc['strategies'],
                'matchCount': doc['matchCount'],
                'maxScore': doc['maxScore']
            })
        
        return sorted(final_results, key=lambda x: x['similarity'], reverse=True)

    def get_collection_info(self) -> Dict:
        """获取集合信息"""
        if not self.collection:
            return {'error': 'Collection not initialized'}
        
        return {
            'count': self.collection.count(),
            'name': self.collection.name,
            'metadata': self.collection.metadata
        }

# 创建单例实例
chroma_vector_service = ChromaVectorService() 