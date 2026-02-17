from unittest.mock import patch
from rest_framework import status
from ticketing.models import AIResponse


class TestTicketListCreateView:
    @patch('ticketing.views.analyze_ticket_task.delay')
    def test_create_ticket_returns_201(self, mock_delay, api_client, sample_employee):
        data = {
            'title': 'Email not syncing',
            'description': 'Outlook fails to sync inbox',
            'category': 'software',
            'priority': 'high',
            'employee_id': sample_employee.employee_id,
            'employee_name_snapshot': sample_employee.name,
            'department_snapshot': sample_employee.department,
        }
        response = api_client.post('/api/tickets/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'Email not syncing'

    @patch('ticketing.views.analyze_ticket_task.delay')
    def test_create_ticket_triggers_celery_task(self, mock_delay, api_client, sample_employee):
        data = {
            'title': 'Test ticket',
            'description': 'Test description',
            'category': 'other',
            'priority': 'low',
            'employee_id': sample_employee.employee_id,
            'employee_name_snapshot': sample_employee.name,
            'department_snapshot': sample_employee.department,
        }
        api_client.post('/api/tickets/', data, format='json')
        mock_delay.assert_called_once()

    def test_list_tickets_paginated(self, api_client, sample_ticket):
        response = api_client.get('/api/tickets/')
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert 'count' in response.data

    def test_get_detail_includes_ai_responses(self, api_client, sample_ticket):
        AIResponse.objects.create(
            ticket=sample_ticket,
            suggested_category='hardware',
            confidence_score=0.85,
            suggested_solution='Check printer connection',
            model_used='test',
        )
        response = api_client.get(f'/api/tickets/{sample_ticket.id}/')
        assert response.status_code == status.HTTP_200_OK
        assert 'ai_responses' in response.data
        assert len(response.data['ai_responses']) == 1


class TestAssignTicket:
    def test_assign_changes_status(self, api_client, sample_ticket):
        response = api_client.post(
            f'/api/tickets/{sample_ticket.id}/assign/',
            {'assigned_to': 'IT001'},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        sample_ticket.refresh_from_db()
        assert sample_ticket.status == 'in_progress'
        assert sample_ticket.assigned_to == 'IT001'

    def test_assign_without_field_returns_400(self, api_client, sample_ticket):
        response = api_client.post(
            f'/api/tickets/{sample_ticket.id}/assign/',
            {},
            format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestResolveTicket:
    def test_resolve_sets_resolved_at(self, api_client, sample_ticket):
        # First assign
        sample_ticket.status = 'in_progress'
        sample_ticket.save()

        response = api_client.post(
            f'/api/tickets/{sample_ticket.id}/resolve/',
            {'resolved_by': 'IT001', 'comment': 'Fixed'},
            format='json',
        )
        assert response.status_code == status.HTTP_200_OK
        sample_ticket.refresh_from_db()
        assert sample_ticket.status == 'resolved'
        assert sample_ticket.resolved_at is not None


class TestCloseTicket:
    def test_close_requires_resolved_status(self, api_client, sample_ticket):
        # sample_ticket is 'pending', not 'resolved'
        response = api_client.post(
            f'/api/tickets/{sample_ticket.id}/close/',
            {'closed_by': 'W001'},
            format='json',
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
