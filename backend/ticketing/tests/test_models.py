import pytest
from ticketing.models import Ticket, Employee, KnowledgeBase

@pytest.mark.django_db
class TestTicketModel:
    
    def test_create_ticket(self):
        """测试创建工单"""
        employee = Employee.objects.create(
            employee_id='E001',
            email='test@test.com',
            name='Test User',
            department='IT'
        )
        
        ticket = Ticket.objects.create(
            ticket_number='T001',
            title='Test Ticket',
            description='Test Description',
            category='hardware',
            priority='high',
            status='pending',
            employee_id=employee.employee_id,
            employee_name_snapshot=employee.name,
            department_snapshot=employee.department
        )
        
        assert ticket.title == 'Test Ticket'
        assert ticket.status == 'pending'
        assert ticket.priority == 'high'
        assert str(ticket) == 'T001 - Test Ticket'
    
    def test_ticket_default_values(self):
        """测试工单默认值"""
        employee = Employee.objects.create(
            employee_id='E002',
            email='user@test.com',
            name='User',
            department='Sales'
        )
        
        ticket = Ticket.objects.create(
            ticket_number='T002',
            title='Ticket',
            description='Description',
            category='software',
            employee_id=employee.employee_id,
            employee_name_snapshot=employee.name,
            department_snapshot=employee.department
        )
        
        assert ticket.status == 'pending'
        assert ticket.priority == 'medium'

@pytest.mark.django_db
class TestEmployeeModel:
    
    def test_create_employee(self):
        """测试创建员工"""
        employee = Employee.objects.create(
            employee_id='E001',
            email='test@test.com',
            name='Test Employee',
            department='Engineering',
            role='employee'
        )
        
        assert employee.employee_id == 'E001'
        assert employee.name == 'Test Employee'
        assert employee.is_active is True
        assert str(employee) == 'E001 - Test Employee'

@pytest.mark.django_db
class TestKnowledgeBaseModel:
    
    def test_create_knowledge(self):
        """测试创建知识库"""
        kb = KnowledgeBase.objects.create(
            title='How to reset password',
            content='Step 1: Go to settings...',
            category='software',
            created_by='E001'
        )
        
        assert kb.title == 'How to reset password'
        assert kb.usage_count == 0
        assert str(kb) == 'How to reset password'
