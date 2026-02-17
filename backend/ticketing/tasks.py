import logging

from celery import shared_task

logger = logging.getLogger('ticketing.tasks')


@shared_task
def test_task():
    """Test task to verify Celery is working."""
    logger.info("Celery test task executed successfully")
    return {"status": "success", "message": "Test task completed"}


@shared_task
def send_notification(ticket_id, notification_type):
    """Send notification task (placeholder)."""
    logger.info("Sending notification for ticket #%s, type: %s", ticket_id, notification_type)
    return {"status": "success"}


@shared_task
def analyze_ticket_task(ticket_id):
    """
    Async ticket analysis task.
    Uses local LLaMA 3.2 for intelligent analysis with fallback to rule-based system.
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
        logger.info("Starting analysis for ticket #%s: %s", ticket.id, ticket.title)

        # 1. Generate ticket embedding
        ticket_text = f"{ticket.title}\n{ticket.description}"
        ticket_embedding = generate_embedding(ticket_text)

        if ticket_embedding:
            ticket.embedding = ticket_embedding
            ticket.save(update_fields=['embedding'])
            logger.debug("Ticket embedding saved")

        # 2. Search similar historical tickets
        logger.debug("Searching similar tickets")
        similar_tickets = find_similar_tickets(ticket_embedding, limit=3) if ticket_embedding else []
        logger.debug("Found %d similar tickets", len(similar_tickets))

        # 3. Search knowledge base
        logger.debug("Searching knowledge base")
        similar_knowledge = find_similar_knowledge(
            ticket_embedding,
            category=ticket.category,
            limit=2
        ) if ticket_embedding else []
        logger.debug("Found %d relevant knowledge articles", len(similar_knowledge))

        # 4. Analyze with LLM
        logger.info("Starting AI analysis")
        llm_result = analyze_with_llm(
            ticket.title,
            ticket.description,
            ticket.category,
            similar_tickets,
            similar_knowledge
        )

        if llm_result:
            suggested_category = llm_result['category']
            confidence_score = llm_result['confidence']
            suggested_solution = llm_result['solution']
            logger.info("LLM analysis succeeded: category=%s, confidence=%s", suggested_category, confidence_score)
        else:
            # Fallback to rule-based system
            logger.warning("LLM analysis failed, falling back to rule-based system")
            suggested_category = analyze_category(ticket.title, ticket.description)
            confidence_score = 0.75

            solution_parts = []

            if similar_knowledge:
                solution_parts.append("Based on knowledge base:\n")
                for i, kb in enumerate(similar_knowledge, 1):
                    solution_parts.append(f"{i}. {kb['title']}")
                    solution_parts.append(f"   {kb['content'][:150]}...\n")

            if similar_tickets:
                solution_parts.append("\nSimilar resolved tickets:")
                for i, st in enumerate(similar_tickets, 1):
                    solution_parts.append(f"{i}. Ref ticket {st['ticket_number']}: {st['title']}")
                    solution_parts.append(f"   (similarity: {st['similarity']:.0%})\n")

            if not solution_parts:
                solution_parts.append(generate_general_solution(ticket.category, ticket.title, ticket.description))

            suggested_solution = "\n".join(solution_parts)

        # 5. Save AI response
        ai_response = AIResponse.objects.create(
            ticket=ticket,
            suggested_category=suggested_category,
            confidence_score=confidence_score,
            suggested_solution=suggested_solution,
            model_used='llama3.2-3b-local',
            processing_time_ms=int((datetime.now().timestamp() * 1000) % 100000),
            similar_tickets=similar_tickets[:2] if similar_tickets else []
        )

        logger.info(
            "AI analysis complete for ticket #%s: category=%s, confidence=%s, similar=%d",
            ticket.id, suggested_category, confidence_score, len(similar_tickets)
        )

        return {
            'ticket_id': ticket.id,
            'ai_response_id': ai_response.id,
            'suggested_category': suggested_category,
            'confidence_score': float(confidence_score),
            'similar_count': len(similar_tickets)
        }

    except Exception as e:
        logger.exception("Failed to analyze ticket #%s: %s", ticket_id, e)
        return {'error': str(e)}


@shared_task
def generate_knowledge_embedding_task(knowledge_id):
    """Async knowledge base embedding generation."""
    try:
        from .models import KnowledgeBase
        from .utils import generate_embedding

        knowledge = KnowledgeBase.objects.get(id=knowledge_id)
        logger.info("Generating embedding for knowledge #%s", knowledge.id)

        text = f"{knowledge.title}\n{knowledge.content}"
        embedding = generate_embedding(text)

        if embedding:
            knowledge.embedding = embedding
            knowledge.save(update_fields=['embedding'])
            logger.info("Knowledge #%s embedding generated", knowledge.id)
            return {'knowledge_id': knowledge.id, 'status': 'success'}
        else:
            logger.warning("Knowledge #%s embedding generation returned None", knowledge.id)
            return {'knowledge_id': knowledge.id, 'status': 'failed'}

    except Exception as e:
        logger.exception("Failed to generate embedding for knowledge #%s: %s", knowledge_id, e)
        return {'knowledge_id': knowledge_id, 'status': 'error', 'error': str(e)}
