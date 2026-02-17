import pytest
from ticketing.models import Ticket, Employee, KnowledgeBase


@pytest.fixture
def sample_employee(db):
    return Employee.objects.create(
        employee_id='W001',
        email='alice@example.com',
        name='Alice Wang',
        department='Engineering',
        role='employee',
    )


@pytest.fixture
def sample_ticket(db, sample_employee):
    return Ticket.objects.create(
        ticket_number='TK20260101001',
        title='Printer not working',
        description='The HP printer on 3rd floor is offline',
        category='hardware',
        priority='medium',
        employee_id=sample_employee.employee_id,
        employee_name_snapshot=sample_employee.name,
        department_snapshot=sample_employee.department,
    )


@pytest.fixture
def resolved_ticket(db, sample_employee):
    from django.utils import timezone
    return Ticket.objects.create(
        ticket_number='TK20260101002',
        title='VPN connection drops',
        description='VPN disconnects every 10 minutes',
        category='network',
        priority='high',
        status='resolved',
        employee_id=sample_employee.employee_id,
        employee_name_snapshot=sample_employee.name,
        department_snapshot=sample_employee.department,
        resolved_at=timezone.now(),
    )


@pytest.fixture
def sample_knowledge(db):
    return KnowledgeBase.objects.create(
        title='How to reset network adapter',
        content='Open Device Manager, find network adapter, right-click and disable, then enable.',
        category='network',
        created_by='IT001',
    )


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()
