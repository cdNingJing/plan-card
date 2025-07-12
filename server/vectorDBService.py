"""
专业向量数据库服务 - Python版本
使用先进的NLP技术实现高质量语义搜索
"""

import json
import os
import re
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import jieba
import jieba.posseg as pseg
from fuzzywuzzy import fuzz
from fuzzywuzzy import process
from vector_config import get_vector_config

class ProfessionalVectorDBService:
    def __init__(self):
        self.documents = []
        self.embeddings = []
        self.sentence_model = None
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.is_initialized = False
        
        # 加载配置
        self.config = get_vector_config()
        
        # 从配置获取搜索选项
        self.search_options = self.config.get_search_options()
        
        # 从配置获取停用词
        self.stopwords = set(self.config.get_stopwords())
        
        # 从配置获取实体词典
        self.entity_dict = self.config.get_entity_dict()

    async def initialize(self):
        """初始化服务"""
        print("🚀 初始化Python向量数据库服务...")
        
        try:
            # 加载句子转换模型
            print("📦 加载句子转换模型...")
            self.sentence_model = SentenceTransformer(self.search_options['embedding_model'])
            
            # 加载文档
            await self.load_documents()
            
            # 生成嵌入向量
            await self.generate_embeddings()
            
            self.is_initialized = True
            print("✅ Python向量数据库服务初始化完成")
            
        except Exception as e:
            print(f"❌ 初始化失败: {e}")
            raise

    async def load_documents(self):
        """加载文档"""
        try:
            # 加载向量化虚拟妈妈档案
            mom_vectors_path = os.path.join(os.path.dirname(__file__), '../src/data/long-term/virtual-mom-vectors.json')
            
            if os.path.exists(mom_vectors_path):
                with open(mom_vectors_path, 'r', encoding='utf-8') as f:
                    vectors_data = json.load(f)
                self.process_vector_documents(vectors_data)
                print(f"✅ 向量化文档已加载，共 {len(self.documents)} 个文档")
            else:
                print("⚠️ 向量化文档文件不存在，数据库将为空")
                
        except Exception as e:
            print(f"❌ 加载文档失败: {e}")
            raise

    def process_vector_documents(self, vectors_data):
        """处理向量化文档"""
        if not vectors_data.get('documents') or not isinstance(vectors_data['documents'], list):
            print("⚠️ 向量数据格式不正确")
            return

        for doc in vectors_data['documents']:
            if doc.get('id') and doc.get('content'):
                processed_doc = self.process_document(doc)
                self.documents.append(processed_doc)
                print(f"📄 处理文档 {doc['id']}: {doc['category']}")

    def process_document(self, doc):
        """处理单个文档"""
        # 提取关键词和实体
        keywords = self.extract_keywords(doc['content'])
        entities = self.extract_entities(doc['content'])
        
        return {
            'id': doc['id'],
            'content': doc['content'],
            'category': doc['category'],
            'tags': doc.get('tags', []),
            'keywords': keywords,
            'entities': entities,
            'metadata': {
                'category': doc['category'],
                'tags': doc.get('tags', []),
                'keywords': keywords,
                'entities': entities
            }
        }

    def extract_keywords(self, text):
        """提取关键词（改进版本）"""
        # 使用jieba分词
        words = jieba.lcut(text)
        
        # 过滤停用词和短词
        filtered_words = [word for word in words if 
                         len(word) > 1 and 
                         word not in self.stopwords and
                         not re.match(r'^[0-9\s]+$', word)]
        
        # 添加实体词典中的相关词
        for category, words_list in self.entity_dict.items():
            for word in words_list:
                if word in text:
                    filtered_words.append(word)
        
        # 去重并返回
        return list(set(filtered_words))

    def extract_entities(self, text):
        """提取实体（改进版本）"""
        entities = {
            'names': [],
            'foods': [],
            'activities': [],
            'places': [],
            'health': [],
            'personality': []
        }
        
        # 从实体词典中提取
        for category, words_list in self.entity_dict.items():
            for word in words_list:
                if word in text:
                    entities[category].append(word)
        
        # 使用jieba词性标注提取人名
        words_pos = pseg.lcut(text)
        for word, flag in words_pos:
            if flag == 'nr' and len(word) > 1:  # nr表示人名
                entities['names'].append(word)
        
        return entities

    async def generate_embeddings(self):
        """生成文档嵌入向量"""
        print("🔢 生成文档嵌入向量...")
        
        try:
            # 准备文档文本
            doc_texts = [doc['content'] for doc in self.documents]
            
            # 生成句子嵌入向量
            embeddings = self.sentence_model.encode(doc_texts, convert_to_tensor=True)
            self.embeddings = embeddings.cpu().numpy()
            
            # 从配置获取TF-IDF配置
            tfidf_config = self.config.get_tfidf_config()
            
            # 生成TF-IDF向量
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=tfidf_config['max_features'],
                stop_words=None,  # 我们手动处理停用词
                ngram_range=tfidf_config['ngram_range']
            )
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(doc_texts)
            
            print(f"✅ 生成了 {len(self.documents)} 个文档的嵌入向量")
            
        except Exception as e:
            print(f"❌ 生成嵌入向量失败: {e}")
            raise

    async def query_documents(self, query, options=None):
        """查询文档"""
        if not self.is_initialized:
            await self.initialize()

        try:
            print(f"🔍 Python专业查询: '{query}'")
            
            # 合并选项
            search_options = {**self.search_options}
            if options:
                search_options.update(options)
            
            # 多策略搜索
            results = await self.multi_strategy_search(query, search_options)
            
            return {
                'success': True,
                'query': query,
                'results': results,
                'totalResults': len(results),
                'searchStrategy': 'python-professional-multi-strategy'
            }
            
        except Exception as error:
            print(f"❌ Python专业查询失败: {error}")
            return {
                'success': False,
                'error': str(error),
                'query': query
            }

    async def multi_strategy_search(self, query, options):
        """多策略搜索"""
        results = []
        seen_docs = set()

        # 1. 语义向量搜索
        semantic_results = await self.semantic_search(query)
        for result in semantic_results:
            if result['docId'] not in seen_docs:
                results.append({**result, 'strategy': 'semantic-vector'})
                seen_docs.add(result['docId'])

        # 2. TF-IDF搜索
        tfidf_results = self.tfidf_search(query)
        for result in tfidf_results:
            if result['docId'] not in seen_docs:
                results.append({**result, 'strategy': 'tfidf-search'})
                seen_docs.add(result['docId'])

        # 3. 关键词搜索
        keyword_results = self.keyword_search(query)
        for result in keyword_results:
            if result['docId'] not in seen_docs:
                results.append({**result, 'strategy': 'keyword-match'})
                seen_docs.add(result['docId'])

        # 4. 实体搜索
        entity_results = self.entity_search(query)
        for result in entity_results:
            if result['docId'] not in seen_docs:
                results.append({**result, 'strategy': 'entity-match'})
                seen_docs.add(result['docId'])

        # 5. 模糊搜索
        fuzzy_results = self.fuzzy_search(query)
        for result in fuzzy_results:
            if result['docId'] not in seen_docs:
                results.append({**result, 'strategy': 'fuzzy-search'})
                seen_docs.add(result['docId'])

        # 6. 姓名专门搜索
        name_results = self.name_search(query)
        for result in name_results:
            if result['docId'] not in seen_docs:
                results.append({**result, 'strategy': 'name-search'})
                seen_docs.add(result['docId'])

        # 合并和排序结果
        combined_results = self.combine_and_rank_results(results, query)
        
        # 过滤和限制结果
        return [r for r in combined_results if r['similarity'] >= options['similarity_threshold']][:options['max_results']]

    async def semantic_search(self, query):
        """语义向量搜索"""
        try:
            # 生成查询向量
            query_embedding = self.sentence_model.encode([query], convert_to_tensor=True)
            query_embedding = query_embedding.cpu().numpy()
            
            # 计算余弦相似度
            similarities = cosine_similarity(query_embedding, self.embeddings)[0]
            
            results = []
            for i, similarity in enumerate(similarities):
                if similarity > 0.1:
                    results.append({
                        'docId': self.documents[i]['id'],
                        'document': self.documents[i]['content'],
                        'metadata': self.documents[i]['metadata'],
                        'similarity': float(similarity),
                        'score': float(similarity)
                    })
            
            return sorted(results, key=lambda x: x['similarity'], reverse=True)
            
        except Exception as e:
            print(f"❌ 语义搜索失败: {e}")
            return []

    def tfidf_search(self, query):
        """TF-IDF搜索"""
        try:
            # 转换查询为TF-IDF向量
            query_vector = self.tfidf_vectorizer.transform([query])
            
            # 计算余弦相似度
            similarities = cosine_similarity(query_vector, self.tfidf_matrix)[0]
            
            results = []
            for i, similarity in enumerate(similarities):
                if similarity > 0.1:
                    results.append({
                        'docId': self.documents[i]['id'],
                        'document': self.documents[i]['content'],
                        'metadata': self.documents[i]['metadata'],
                        'similarity': float(similarity),
                        'score': float(similarity)
                    })
            
            return sorted(results, key=lambda x: x['similarity'], reverse=True)
            
        except Exception as e:
            print(f"❌ TF-IDF搜索失败: {e}")
            return []

    def keyword_search(self, query):
        """关键词搜索"""
        query_keywords = self.extract_keywords(query)
        print(f"🔍 查询关键词: {query_keywords}")
        
        # 从配置获取关键词匹配配置
        keyword_config = self.config.get_keyword_match_config()
        
        results = []
        
        for doc in self.documents:
            doc_content = doc['content'].lower()
            doc_keywords = doc.get('keywords', [])
            matches = 0
            total_score = 0
            
            for query_keyword in query_keywords:
                keyword = query_keyword.lower()
                
                # 1. 直接匹配
                if keyword in doc_content:
                    matches += 1
                    total_score += 1.0
                # 2. 在文档关键词中匹配
                elif any(doc_keyword.lower().find(keyword) != -1 or 
                        keyword.find(doc_keyword.lower()) != -1 or
                        fuzz.ratio(doc_keyword.lower(), keyword) > keyword_config['fuzzy_ratio_threshold']
                        for doc_keyword in doc_keywords):
                    matches += 1
                    total_score += 0.8
                # 3. 部分匹配（对于中文）
                elif len(keyword) > keyword_config['min_word_length']:
                    partial_matches = sum(1 for char in keyword if char in doc_content)
                    if partial_matches >= len(keyword) * keyword_config['partial_match_ratio']:
                        matches += 1
                        total_score += 0.3
            
            if matches > 0:
                similarity = min(total_score / len(query_keywords), 1.0)
                results.append({
                    'docId': doc['id'],
                    'document': doc['content'],
                    'metadata': doc['metadata'],
                    'similarity': similarity,
                    'score': similarity,
                    'matches': matches
                })
        
        return sorted(results, key=lambda x: x['similarity'], reverse=True)

    def entity_search(self, query):
        """实体搜索"""
        query_entities = self.extract_entities(query)
        print(f"🔍 查询实体: {query_entities}")
        
        # 从配置获取实体匹配配置
        entity_config = self.config.get_entity_match_config()
        name_config = self.config.get_name_search_config()
        
        results = []
        
        for doc in self.documents:
            doc_entities = doc.get('entities', {})
            doc_content = doc['content'].lower()
            matches = 0
            total_score = 0
            total_entities = 0
            
            for entity_type, query_entity_list in query_entities.items():
                doc_entity_list = doc_entities.get(entity_type, [])
                
                for query_entity in query_entity_list:
                    entity = query_entity.lower()
                    total_entities += 1
                    
                    # 1. 在文档实体中匹配
                    if any(doc_entity.lower().find(entity) != -1 or 
                           entity.find(doc_entity.lower()) != -1
                           for doc_entity in doc_entity_list):
                        matches += 1
                        total_score += entity_config['exact_match_score']
                    # 2. 在文档内容中匹配
                    elif entity in doc_content:
                        matches += 1
                        total_score += entity_config['content_match_score']
                    # 3. 关系词特殊处理
                    elif entity_type == 'names' and entity == '妈妈':
                        name_mappings = name_config['name_mappings'].get('妈妈', [])
                        if any(name in doc_content for name in name_mappings):
                            matches += 1
                            total_score += entity_config['relationship_match_score']
                    # 4. 姓名特殊处理
                    elif entity_type == 'names' and entity in ['李秀英', '林美华']:
                        name_mappings = name_config['name_mappings'].get(entity, [])
                        if any(name in doc_content for name in name_mappings):
                            matches += 1
                            total_score += entity_config['name_match_score']
            
            if matches > 0 and total_entities > 0:
                similarity = min(total_score / total_entities, 1.0)
                results.append({
                    'docId': doc['id'],
                    'document': doc['content'],
                    'metadata': doc['metadata'],
                    'similarity': similarity,
                    'score': similarity,
                    'entityMatches': matches
                })
        
        return sorted(results, key=lambda x: x['similarity'], reverse=True)

    def fuzzy_search(self, query):
        """模糊搜索"""
        results = []
        
        for doc in self.documents:
            # 使用fuzzywuzzy计算相似度
            similarity = fuzz.ratio(query.lower(), doc['content'].lower()) / 100.0
            
            if similarity > 0.1:
                results.append({
                    'docId': doc['id'],
                    'document': doc['content'],
                    'metadata': doc['metadata'],
                    'similarity': similarity,
                    'score': similarity
                })
        
        return sorted(results, key=lambda x: x['similarity'], reverse=True)

    def name_search(self, query):
        """姓名专门搜索"""
        results = []
        name_keywords = ['名字', '姓名', '叫什么', '李秀英', '林美华', 'Lin Meihua']
        
        # 检查查询是否包含姓名相关关键词
        has_name_query = any(keyword in query for keyword in name_keywords)
        
        if has_name_query:
            print('🔍 检测到姓名查询，执行专门搜索')
            
            for doc in self.documents:
                doc_content = doc['content'].lower()
                score = 0
                
                # 检查是否包含姓名信息
                if '李秀英' in doc_content:
                    score += 1.0
                if '林美华' in doc_content:
                    score += 1.0
                if 'lin meihua' in doc_content:
                    score += 1.0
                if '妈妈' in doc_content and ('李秀英' in doc_content or '林美华' in doc_content):
                    score += 0.5
                
                if score > 0:
                    results.append({
                        'docId': doc['id'],
                        'document': doc['content'],
                        'metadata': doc['metadata'],
                        'similarity': min(score, 1.0),
                        'score': score,
                        'strategy': 'name-search'
                    })
        
        return sorted(results, key=lambda x: x['similarity'], reverse=True)

    def combine_and_rank_results(self, results, query):
        """合并和排序结果"""
        print(f"🔍 合并搜索结果，共 {len(results)} 个结果")
        
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
            if 'name-search' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['name-search'] * 0.5
            if 'semantic-vector' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['semantic-vector'] * 0.35
            if 'tfidf-search' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['tfidf-search'] * 0.3
            if 'keyword-match' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['keyword-match'] * 0.25
            if 'entity-match' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['entity-match'] * 0.2
            if 'fuzzy-search' in doc['strategyScores']:
                weighted_score += doc['strategyScores']['fuzzy-search'] * 0.15
            
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
                'maxScore': doc['maxScore'],
                'strategyScores': doc['strategyScores']
            })
        
        sorted_results = sorted(final_results, key=lambda x: x['similarity'], reverse=True)
        
        print('📊 最终排序结果:', [
            {
                'docId': r['docId'],
                'similarity': f"{r['similarity']:.3f}",
                'strategies': r['strategies']
            } for r in sorted_results[:5]
        ])
        
        return sorted_results

    def get_document_info(self, doc_id):
        """获取文档信息"""
        for doc in self.documents:
            if doc['id'] == doc_id:
                return doc
        return None

    def get_all_documents(self):
        """获取所有文档"""
        return self.documents

    def update_search_options(self, options):
        """更新搜索选项"""
        self.search_options.update(options)

# 创建单例实例
professional_vector_db_service = ProfessionalVectorDBService() 