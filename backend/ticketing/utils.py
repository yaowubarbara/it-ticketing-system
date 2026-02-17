import logging

import numpy as np
from sentence_transformers import SentenceTransformer

logger = logging.getLogger('ticketing.utils')

_embedding_model = None


def get_embedding_model():
    """Get or initialize the embedding model."""
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading embedding model paraphrase-multilingual-MiniLM-L12-v2")
        _embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        logger.info("Embedding model loaded")
    return _embedding_model


def generate_embedding(text):
    """
    Generate text embedding using local SentenceTransformer model.
    Model: paraphrase-multilingual-MiniLM-L12-v2
    - Multilingual support
    - Vector dimension: 384
    - Fully offline
    """
    try:
        model = get_embedding_model()
        embedding = model.encode(text, convert_to_numpy=True)
        embedding_list = embedding.tolist()
        logger.debug("Embedding generated, dimension: %d", len(embedding_list))
        return embedding_list
    except Exception as e:
        logger.error("Failed to generate embedding: %s", e)
        return None


def cosine_similarity(vec1, vec2):
    """Calculate cosine similarity between two vectors."""
    if not vec1 or not vec2:
        return 0.0

    v1 = np.array(vec1)
    v2 = np.array(vec2)

    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)

    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0

    similarity = dot_product / (norm_v1 * norm_v2)
    return float(similarity)


def find_similar_tickets(query_embedding, limit=5):
    """Find similar closed tickets by vector similarity."""
    from .models import Ticket

    if not query_embedding:
        return []

    tickets = Ticket.objects.filter(
        status='closed',
        embedding__isnull=False
    ).values('id', 'ticket_number', 'title', 'category', 'embedding')

    similarities = []
    for ticket in tickets:
        similarity = cosine_similarity(query_embedding, ticket['embedding'])
        if similarity > 0.5:
            similarities.append({
                'ticket_id': ticket['id'],
                'ticket_number': ticket['ticket_number'],
                'title': ticket['title'],
                'category': ticket['category'],
                'similarity': similarity
            })

    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    return similarities[:limit]


def find_similar_knowledge(query_embedding, category=None, limit=3):
    """Find similar knowledge base documents by vector similarity."""
    from .models import KnowledgeBase

    if not query_embedding:
        return []

    queryset = KnowledgeBase.objects.filter(embedding__isnull=False)
    if category:
        queryset = queryset.filter(category=category)

    knowledge_list = queryset.values('id', 'title', 'content', 'category', 'embedding')

    similarities = []
    for kb in knowledge_list:
        similarity = cosine_similarity(query_embedding, kb['embedding'])
        if similarity > 0.5:
            similarities.append({
                'knowledge_id': kb['id'],
                'title': kb['title'],
                'content': kb['content'][:200],
                'category': kb['category'],
                'similarity': similarity
            })

    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    return similarities[:limit]


def analyze_with_llm(ticket_title, ticket_description, ticket_category, similar_tickets=None, similar_knowledge=None):
    """Analyze ticket using local LLaMA 3.2 model via Ollama."""
    try:
        import ollama

        prompt = f"""你是一个专业的IT支持助手。请分析以下IT工单并提供建议。

工单信息：
标题：{ticket_title}
描述：{ticket_description}
当前分类：{ticket_category}

"""

        if similar_tickets and len(similar_tickets) > 0:
            prompt += "\n相似历史案例：\n"
            for i, st in enumerate(similar_tickets[:2], 1):
                prompt += f"{i}. {st['title']} (相似度: {st['similarity']:.0%})\n"

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

        logger.info("Calling Ollama LLaMA 3.2 model")

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

        ai_text = response['message']['content']
        logger.info("LLM analysis complete, response length: %d chars", len(ai_text))

        suggested_category = ticket_category
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
        logger.error("LLM analysis failed: %s", e, exc_info=True)
        return None


def analyze_category(title, description):
    """Rule-based ticket category analysis using keyword matching."""
    text = (title + " " + description).lower()

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
    """Generate template-based solution suggestions per category."""
    solutions = {
        'hardware': """Hardware troubleshooting steps:
1. Check device power and cable connections
2. Restart the device
3. Check if device drivers need updating
4. Look for errors in Device Manager
5. If issue persists, contact IT for on-site inspection""",

        'software': """Software troubleshooting steps:
1. Restart the application
2. Check for available software updates
3. Clear application cache and temp files
4. Try running as administrator
5. If issue persists, consider reinstalling or contact IT support""",

        'network': """Network troubleshooting steps:
1. Check cable connection or WiFi signal
2. Restart network devices (router, switch)
3. Verify IP configuration (ipconfig)
4. Try flushing DNS cache (ipconfig /flushdns)
5. Test if other devices have the same issue
6. If issue persists, contact network administrator""",

        'permission': """Permission request steps:
1. Confirm your account and the resource you need access to
2. Contact your direct manager for approval
3. Submit an IT support ticket with manager approval
4. IT department will process within 1-2 business days""",

        'other': """General troubleshooting suggestions:
1. Document when and how often the issue occurs
2. Take screenshots or record error messages
3. Try restarting related devices or applications
4. Contact IT support team for further assistance"""
    }

    return solutions.get(category, solutions['other'])
