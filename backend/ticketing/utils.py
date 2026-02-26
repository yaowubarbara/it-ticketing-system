import os
import numpy as np
from openai import OpenAI
from sentence_transformers import SentenceTransformer

# 加载本地模型（第一次会自动下载，约90MB）
_embedding_model = None

def get_embedding_model():
    """获取或初始化embedding模型"""
    global _embedding_model
    if _embedding_model is None:
        print("📥 首次使用，正在加载本地embedding模型...")
        _embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("✅ 模型加载完成！")
    return _embedding_model


def generate_embedding(text):
    """
    使用本地模型生成文本向量
    模型：paraphrase-multilingual-MiniLM-L12-v2
    - 支持中文
    - 向量维度：384
    - 完全离线
    """
    try:
        model = get_embedding_model()
        
        # 生成向量
        embedding = model.encode(text, convert_to_numpy=True)
        
        # 转换为列表格式（用于JSON存储）
        embedding_list = embedding.tolist()
        
        print(f"✅ 向量生成成功，维度: {len(embedding_list)}")
        return embedding_list
        
    except Exception as e:
        print(f"❌ 生成向量失败: {str(e)}")
        return None


def cosine_similarity(vec1, vec2):
    """
    计算两个向量的余弦相似度
    """
    if not vec1 or not vec2:
        return 0.0
    
    # 转换为numpy数组
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    
    # 计算余弦相似度
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    
    similarity = dot_product / (norm_v1 * norm_v2)
    return float(similarity)


def find_similar_tickets(query_embedding, limit=5):
    """
    根据向量查找相似的已解决工单
    """
    from .models import Ticket
    
    if not query_embedding:
        return []
    
    # 获取所有已关闭且有向量的工单
    tickets = Ticket.objects.filter(
        status='closed',
        embedding__isnull=False
    ).values('id', 'ticket_number', 'title', 'category', 'embedding')
    
    # 计算相似度
    similarities = []
    for ticket in tickets:
        similarity = cosine_similarity(query_embedding, ticket['embedding'])
        if similarity > 0.5:  # 只返回相似度>0.5的
            similarities.append({
                'ticket_id': ticket['id'],
                'ticket_number': ticket['ticket_number'],
                'title': ticket['title'],
                'category': ticket['category'],
                'similarity': similarity
            })
    
    # 按相似度排序
    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    
    return similarities[:limit]


def find_similar_knowledge(query_embedding, category=None, limit=3):
    """
    从知识库中查找相似文档
    """
    from .models import KnowledgeBase
    
    if not query_embedding:
        return []
    
    # 查询知识库
    queryset = KnowledgeBase.objects.filter(embedding__isnull=False)
    if category:
        queryset = queryset.filter(category=category)
    
    knowledge_list = queryset.values('id', 'title', 'content', 'category', 'embedding')
    
    # 计算相似度
    similarities = []
    for kb in knowledge_list:
        similarity = cosine_similarity(query_embedding, kb['embedding'])
        if similarity > 0.5:  # 只返回相似度>0.5的
            similarities.append({
                'knowledge_id': kb['id'],
                'title': kb['title'],
                'content': kb['content'][:200],  # 截取前200字符
                'category': kb['category'],
                'similarity': similarity
            })
    
    # 按相似度排序
    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    
    return similarities[:limit]

def analyze_with_llm(ticket_title, ticket_description, ticket_category, similar_tickets=None, similar_knowledge=None):
    """
    使用本地LLaMA 3.2模型分析工单
    """
    try:
        import ollama
        
        # 构建提示词
        prompt = f"""你是一个专业的IT支持助手。请分析以下IT工单并提供建议。

工单信息：
标题：{ticket_title}
描述：{ticket_description}
当前分类：{ticket_category}

"""
        
        # 添加相似历史案例
        if similar_tickets and len(similar_tickets) > 0:
            prompt += "\n相似历史案例：\n"
            for i, st in enumerate(similar_tickets[:2], 1):
                prompt += f"{i}. {st['title']} (相似度: {st['similarity']:.0%})\n"
        
        # 添加知识库信息
        if similar_knowledge and len(similar_knowledge) > 0:
            prompt += "\n知识库相关文档：\n"
            for i, kb in enumerate(similar_knowledge[:2], 1):
                prompt += f"{i}. {kb['title']}\n{kb['content'][:200]}\n\n"
        
        prompt += """
请提供：
1. 问题分类建议（从hardware/software/network/permission/other中选择一个）
2. 分类置信度（0-1之间的小数，例如0.85）
3. 详细的解决方案（3-5个具体步骤）

请直接用自然语言回答，不需要JSON格式。
"""
        
        print("🤖 调用本地LLaMA 3.2模型...")
        
        # 调用Ollama
        response = ollama.chat(
            model='llama3.2:3b',
            messages=[
                {
                    'role': 'system',
                    'content': '你是一个专业的IT技术支持工程师，擅长分析和解决各类IT问题。'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            options={
                'temperature': 0.7,
                'num_predict': 500,
            }
        )
        
        # 获取响应
        ai_text = response['message']['content']
        print(f"✅ LLaMA 3.2分析完成，响应长度: {len(ai_text)} 字符")
        
        # 简单的分类提取（从文本中提取关键词）
        suggested_category = ticket_category  # 默认使用原分类
        confidence_score = 0.8
        
        text_lower = ai_text.lower()
        if 'hardware' in text_lower or '硬件' in text_lower:
            suggested_category = 'hardware'
            confidence_score = 0.85
        elif 'network' in text_lower or '网络' in text_lower:
            suggested_category = 'network'
            confidence_score = 0.85
        elif 'software' in text_lower or '软件' in text_lower:
            suggested_category = 'software'
            confidence_score = 0.85
        elif 'permission' in text_lower or '权限' in text_lower:
            suggested_category = 'permission'
            confidence_score = 0.85
        
        return {
            'category': suggested_category,
            'confidence': confidence_score,
            'solution': ai_text
        }
        
    except Exception as e:
        print(f"❌ LLaMA 3.2分析失败: {str(e)}")
        import traceback
        traceback.print_exc()
        # 返回None，让系统降级到规则系统
        return None


def analyze_category(title, description):
    """基于关键词分析工单类别"""
    text = (title + " " + description).lower()
    
    # 关键词匹配
    if any(word in text for word in ['打印', 'printer', '打印机', '墨盒', '卡纸']):
        return 'hardware'
    elif any(word in text for word in ['wifi', '网络', 'network', '连接', '路由', '上网', 'ip', 'dhcp']):
        return 'network'
    elif any(word in text for word in ['软件', 'software', 'outlook', 'office', '应用', '程序', '崩溃', '闪退']):
        return 'software'
    elif any(word in text for word in ['权限', 'permission', '访问', 'access', '账号', '密码']):
        return 'permission'
    else:
        return 'other'


def generate_general_solution(category, title, description):
    """生成通用解决方案建议"""
    solutions = {
        'hardware': """💻 硬件问题通用排查步骤：
1. 检查设备电源和连接线是否正常
2. 重启设备
3. 检查设备驱动是否需要更新
4. 查看设备管理器是否有错误提示
5. 如问题持续，联系IT部门现场检查""",
        
        'software': """🖥️ 软件问题通用排查步骤：
1. 重启软件应用程序
2. 检查软件是否有可用更新
3. 清除应用缓存和临时文件
4. 尝试以管理员身份运行
5. 如问题持续，考虑重新安装软件或联系IT支持""",
        
        'network': """🌐 网络问题通用排查步骤：
1. 检查网线连接或WiFi信号
2. 重启网络设备（路由器、交换机）
3. 检查IP配置是否正确（ipconfig）
4. 尝试刷新DNS缓存（ipconfig /flushdns）
5. 测试其他设备是否也有同样问题
6. 如问题持续，联系网络管理员""",
        
        'permission': """🔐 权限问题处理步骤：
1. 确认您的账号和所需访问的资源
2. 联系直属经理获取权限审批
3. 提交IT支持工单，附上经理批准邮件
4. IT部门将在1-2个工作日内处理权限申请""",
        
        'other': """📋 一般性问题处理建议：
1. 详细记录问题发生的时间和频率
2. 截图或记录错误信息
3. 尝试重启相关设备或应用
4. 联系IT支持团队获取进一步帮助"""
    }
    
    return solutions.get(category, solutions['other'])