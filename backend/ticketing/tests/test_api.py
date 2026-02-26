import pytest
from rest_framework.test import APIClient
from rest_framework import status
from ticketing.models import Ticket, Employee

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_employee(db):
    return Employee.objects.create(
        employee_id='E001',
        email='admin@test.com',
        name='Admin User',
        department='IT',
        role='admin'
    )

@pytest.fixture
def regular_employee(db):
    return Employee.objects.create(
        employee_id='E002',
        email='user@test.com',
        name='Regular User',
        department='Sales',
        role='employee'
    )

@pytest.mark.django_db
class TestTicketAPI:
    
    def test_create_ticket(self, api_client, regular_employee):
        """测试创建工单"""
        data = {
            'title': 'Test Ticket',
            'description': 'Test Description',
            'category': 'hardware',
            'priority': 'medium',
            'employee_id': regular_employee.employee_id,
            'employee_name_snapshot': regular_employee.name,
            'department_snapshot': regular_employee.department,
        }
        
        response = api_client.post('/api/tickets/', data, format='json')
        
        # 可能需要认证或返回201/200
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK]
    
    def test_list_tickets(self, api_client, regular_employee):
        """测试获取工单列表"""
        Ticket.objects.create(
            ticket_number='T001',
            title='Ticket 1',
            description='Description 1',
            category='software',
            employee_id=regular_employee.employee_id,
            employee_name_snapshot=regular_employee.name,
            department_snapshot=regular_employee.department
        )
        
        response = api_client.get('/api/tickets/')
        
        assert response.status_code == status.HTTP_200_OK
