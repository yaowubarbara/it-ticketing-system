from ticketing.models import Employee


class TestTicketModel:
    def test_creation_defaults(self, sample_ticket):
        assert sample_ticket.status == 'pending'
        assert sample_ticket.priority == 'medium'
        assert sample_ticket.assigned_to is None
        assert sample_ticket.embedding is None

    def test_str_representation(self, sample_ticket):
        expected = f"{sample_ticket.ticket_number} - {sample_ticket.title}"
        assert str(sample_ticket) == expected


class TestEmployeeModel:
    def test_primary_key_is_employee_id(self, sample_employee):
        assert sample_employee.pk == 'W001'
        fetched = Employee.objects.get(pk='W001')
        assert fetched.name == 'Alice Wang'


class TestKnowledgeBaseModel:
    def test_creation_defaults(self, sample_knowledge):
        assert sample_knowledge.usage_count == 0
        assert sample_knowledge.embedding is None
        assert sample_knowledge.tags == []
