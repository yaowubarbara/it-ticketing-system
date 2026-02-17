from unittest.mock import patch
from ticketing.models import AIResponse


class TestAnalyzeTicketTask:
    @patch('ticketing.utils.analyze_with_llm', return_value=None)
    @patch('ticketing.utils.generate_embedding', return_value=None)
    def test_fallback_path_creates_ai_response(self, mock_embed, mock_llm, sample_ticket):
        from ticketing.tasks import analyze_ticket_task
        result = analyze_ticket_task(sample_ticket.id)
        assert 'ticket_id' in result
        assert AIResponse.objects.filter(ticket=sample_ticket).exists()

    @patch('ticketing.utils.analyze_with_llm', side_effect=Exception('LLM error'))
    @patch('ticketing.utils.generate_embedding', return_value=None)
    def test_llm_failure_still_creates_response(self, mock_embed, mock_llm, sample_ticket):
        from ticketing.tasks import analyze_ticket_task
        result = analyze_ticket_task(sample_ticket.id)
        # Should handle exception and return error
        assert AIResponse.objects.filter(ticket=sample_ticket).exists() or 'error' in result


class TestGenerateKnowledgeEmbeddingTask:
    @patch('ticketing.utils.generate_embedding', return_value=[0.1] * 384)
    def test_success(self, mock_embed, sample_knowledge):
        from ticketing.tasks import generate_knowledge_embedding_task
        result = generate_knowledge_embedding_task(sample_knowledge.id)
        assert result['status'] == 'success'
        sample_knowledge.refresh_from_db()
        assert sample_knowledge.embedding is not None
