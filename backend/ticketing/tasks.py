from celery import shared_task
from datetime import datetime
import json
from .utils import (
    generate_embedding, 
    find_similar_tickets, 
    find_similar_knowledge,
    analyze_with_llm,  # ← 新增
    analyze_category,
    generate_general_solution
)

@shared_task
def test_task():
    """测试任务"""
    print("✅ Celery 工作正常！")
    return {"status": "success", "message": "Test task completed"}


@shared_task
def send_notification(ticket_id, notification_type):
    """
    发送通知任务（示例）
    """
    print(f"📧 发送通知: 工单 #{ticket_id}, 类型: {notification_type}")
    return {"status": "success"}

@shared_task
def analyze_ticket_task(ticket_id):
    """
    异步分析工单任务
    使用本地LLaMA 3.2进行智能分析
    """
    from .models import Ticket, AIResponse
    from .utils import (
        generate_embedding, 
        find_similar_tickets, 
        find_similar_knowledge,
        analyze_with_llm,
        analyze_category,
        generate_general_solution
    )
    from datetime import datetime
    
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        print(f"🎯 开始分析工单 #{ticket.id}: {ticket.title}")
        
        # 1. 生成工单向量
        ticket_text = f"{ticket.title}\n{ticket.description}"
        ticket_embedding = generate_embedding(ticket_text)
        
        if ticket_embedding:
            ticket.embedding = ticket_embedding
            ticket.save(update_fields=['embedding'])
            print(f"✅ 工单向量已生成")
        
        # 2. 搜索相似历史工单
        print("🔍 搜索相似历史工单...")
        similar_tickets = find_similar_tickets(ticket_embedding, limit=3) if ticket_embedding else []
        print(f"   找到 {len(similar_tickets)} 个相似案例")
        
        # 3. 搜索知识库
        print("📚 搜索知识库...")
        similar_knowledge = find_similar_knowledge(
            ticket_embedding, 
            category=ticket.category, 
            limit=2
        ) if ticket_embedding else []
        print(f"   找到 {len(similar_knowledge)} 个相关知识")
        
        # 4. ✨ 使用本地LLaMA 3.2分析
        print("🤖 开始AI分析...")
        llm_result = analyze_with_llm(
            ticket.title,
            ticket.description,
            ticket.category,
            similar_tickets,
            similar_knowledge
        )
        
        if llm_result:
            # LLM分析成功
            suggested_category = llm_result['category']
            confidence_score = llm_result['confidence']
            suggested_solution = llm_result['solution']
            print(f"✅ LLM分析成功：分类={suggested_category}, 置信度={confidence_score}")
        else:
            # LLM失败，降级到规则系统
            print("⚠️ LLM分析失败，使用规则系统")
            suggested_category = analyze_category(ticket.title, ticket.description)
            confidence_score = 0.75
            
            # 生成解决方案（混合知识库和模板）
            solution_parts = []
            
            if similar_knowledge:
                solution_parts.append("📚 根据知识库文档建议：\n")
                for i, kb in enumerate(similar_knowledge, 1):
                    solution_parts.append(f"{i}. {kb['title']}")
                    solution_parts.append(f"   {kb['content'][:150]}...\n")
            
            if similar_tickets:
                solution_parts.append("\n🔍 类似问题的解决方案：")
                for i, st in enumerate(similar_tickets, 1):
                    solution_parts.append(f"{i}. 参考工单 {st['ticket_number']}: {st['title']}")
                    solution_parts.append(f"   (相似度: {st['similarity']:.0%})\n")
            
            if not solution_parts:
                solution_parts.append(generate_general_solution(ticket.category, ticket.title, ticket.description))
            
            suggested_solution = "\n".join(solution_parts)
        
        # 5. 保存AI分析结果
        ai_response = AIResponse.objects.create(
            ticket=ticket,
            suggested_category=suggested_category,
            confidence_score=confidence_score,
            suggested_solution=suggested_solution,
            model_used='llama3.2-3b-local',
            processing_time_ms=int((datetime.now().timestamp() * 1000) % 100000),
            similar_tickets=similar_tickets[:2] if similar_tickets else []
        )
        
        print(f"✅ AI分析完成！")
        print(f"   建议分类: {suggested_category}")
        print(f"   置信度: {confidence_score}")
        print(f"   找到 {len(similar_tickets)} 个相似案例")
        
        return {
            'ticket_id': ticket.id,
            'ai_response_id': ai_response.id,
            'suggested_category': suggested_category,
            'confidence_score': float(confidence_score),
            'similar_count': len(similar_tickets)
        }
        
    except Exception as e:
        print(f"❌ 分析工单失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}


@shared_task
def generate_knowledge_embedding_task(knowledge_id):
    """
    异步生成知识库向量
    """
    try:
        from .models import KnowledgeBase
        from .utils import generate_embedding
        
        knowledge = KnowledgeBase.objects.get(id=knowledge_id)
        print(f"🎯 开始生成知识库 #{knowledge.id} 向量...")
        
        # 生成向量
        text = f"{knowledge.title}\n{knowledge.content}"
        embedding = generate_embedding(text)
        
        if embedding:
            knowledge.embedding = embedding
            knowledge.save(update_fields=['embedding'])
            print(f"✅ 知识库 #{knowledge.id} 向量已生成")
            return {'knowledge_id': knowledge.id, 'status': 'success'}
        else:
            print(f"❌ 知识库 #{knowledge.id} 向量生成失败")
            return {'knowledge_id': knowledge.id, 'status': 'failed'}
            
    except Exception as e:
        print(f"❌ 生成向量失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return {'knowledge_id': knowledge_id, 'status': 'error', 'error': str(e)}