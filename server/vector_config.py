"""
向量搜索配置文件
统一管理向量搜索相关的配置参数
"""

import json
import os
from typing import Dict, List, Any

class VectorConfig:
    """向量搜索配置类"""
    
    def __init__(self):
        self.config = {
            # 搜索选项
            'search_options': {
                'similarity_threshold': 0.15,
                'max_results': 20,
                'embedding_model': 'paraphrase-multilingual-MiniLM-L12-v2'
            },
            
            # 中文停用词
            'stopwords': [
                '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', 
                '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', 
                '自己', '这', '那', '他', '她', '它', '们', '个', '只', '条', '张', '片', '块',
                '把', '被', '给', '让', '使', '得', '地', '得', '着', '过', '来', '去', '回',
                '进', '出', '上', '下', '左', '右', '前', '后', '里', '外', '中', '间', '旁边',
                '附近', '周围', '里面', '外面', '上面', '下面', '前面', '后面', '左边', '右边'
            ],
            
            # 实体词典
            'entity_dict': {
                'names': [
                    '李秀英', '林美华', 'Lin Meihua', '妈妈', '父亲', '爸爸'
                ],
                'foods': [
                    '红烧肉', '糖醋里脊', '清蒸鲈鱼', '麻婆豆腐', '宫保鸡丁', '蒜蓉西兰花', 
                    '番茄炒蛋', '酸菜鱼', '意大利菜', '日式', '定食', '生鱼片', '芥末', 
                    '榴莲', '臭豆腐', '苦瓜', '粥', '包子', '豆浆', '油条', '米饭', 
                    '炒菜', '汤', '面条', '饺子'
                ],
                'activities': [
                    '园艺', '烹饪', '广场舞', '看电视剧', '阅读', '插花', '散步', 
                    '买菜', '购物', '看电视', '打电话', '整理家务'
                ],
                'places': [
                    '北京', '海淀区', '万柳中路小区', '北医三院', '新中关购物中心', 
                    '西单大悦城', 'Trattoria Roma', '元气寿司'
                ],
                'health': [
                    '高血压', '糖尿病前期', '降压药', '降糖药', '海鲜过敏', '花生过敏', 
                    '少盐', '少油', '少糖'
                ],
                'personality': [
                    '细心', '节俭', '关心家人', '传统', '勤劳', '温柔', '喜欢计划'
                ]
            },
            
            # 姓名特殊处理配置
            'name_search_config': {
                # 姓名查询关键词
                'name_query_keywords': [
                    '名字', '姓名', '叫什么', '李秀英', '林美华', 'Lin Meihua'
                ],
                # 姓名映射关系
                'name_mappings': {
                    '妈妈': ['妈妈', '母亲', '李秀英', '林美华', 'lin meihua'],
                    '李秀英': ['李秀英', '林美华', 'lin meihua', '妈妈'],
                    '林美华': ['李秀英', '林美华', 'lin meihua', '妈妈']
                }
            },
            
            # 搜索策略权重配置
            'strategy_weights': {
                'name-search': 0.5,
                'semantic-vector': 0.35,
                'tfidf-search': 0.3,
                'keyword-match': 0.25,
                'entity-match': 0.2,
                'fuzzy-search': 0.15
            },
            
            # TF-IDF配置
            'tfidf_config': {
                'max_features': 1000,
                'ngram_range': (1, 2)
            },
            
            # 关键词匹配配置
            'keyword_match_config': {
                'min_word_length': 2,
                'fuzzy_ratio_threshold': 80,
                'partial_match_ratio': 0.5
            },
            
            # 实体匹配配置
            'entity_match_config': {
                'exact_match_score': 1.0,
                'content_match_score': 0.8,
                'relationship_match_score': 0.9,
                'name_match_score': 0.95
            }
        }
    
    def get_config(self, key: str) -> Any:
        """获取配置值"""
        return self.config.get(key)
    
    def get_search_options(self) -> Dict:
        """获取搜索选项"""
        return self.config['search_options']
    
    def get_stopwords(self) -> List[str]:
        """获取停用词列表"""
        return self.config['stopwords']
    
    def get_entity_dict(self) -> Dict:
        """获取实体词典"""
        return self.config['entity_dict']
    
    def get_name_search_config(self) -> Dict:
        """获取姓名搜索配置"""
        return self.config['name_search_config']
    
    def get_strategy_weights(self) -> Dict:
        """获取搜索策略权重"""
        return self.config['strategy_weights']
    
    def get_tfidf_config(self) -> Dict:
        """获取TF-IDF配置"""
        return self.config['tfidf_config']
    
    def get_keyword_match_config(self) -> Dict:
        """获取关键词匹配配置"""
        return self.config['keyword_match_config']
    
    def get_entity_match_config(self) -> Dict:
        """获取实体匹配配置"""
        return self.config['entity_match_config']
    
    def update_config(self, key: str, value: Any) -> None:
        """更新配置"""
        if key in self.config:
            self.config[key] = value
    
    def load_from_file(self, file_path: str) -> bool:
        """从文件加载配置"""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    file_config = json.load(f)
                    self.config.update(file_config)
                return True
            return False
        except Exception as e:
            print(f"加载配置文件失败: {e}")
            return False
    
    def save_to_file(self, file_path: str) -> bool:
        """保存配置到文件"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"保存配置文件失败: {e}")
            return False
    
    def reset_to_default(self) -> None:
        """重置到默认配置"""
        self.__init__()

# 创建全局配置实例
vector_config = VectorConfig()

def get_vector_config() -> VectorConfig:
    """获取向量配置实例"""
    return vector_config 