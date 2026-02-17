from ticketing.serializers import TicketSerializer


class TestTicketSerializer:
    def test_auto_generates_ticket_number(self, db, sample_employee):
        data = {
            'title': 'Cannot print',
            'description': 'Printer offline',
            'category': 'hardware',
            'priority': 'medium',
            'employee_id': sample_employee.employee_id,
            'employee_name_snapshot': sample_employee.name,
            'department_snapshot': sample_employee.department,
        }
        serializer = TicketSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        ticket = serializer.save()
        assert ticket.ticket_number.startswith('TK')

    def test_ticket_number_format(self, db, sample_employee):
        data = {
            'title': 'Test ticket',
            'description': 'Test description',
            'category': 'software',
            'priority': 'low',
            'employee_id': sample_employee.employee_id,
            'employee_name_snapshot': sample_employee.name,
            'department_snapshot': sample_employee.department,
        }
        serializer = TicketSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        # Format: TK{YYYYMMDD}{###}
        assert len(ticket.ticket_number) >= 13
        assert ticket.ticket_number[:2] == 'TK'

    def test_embedding_excluded_from_output(self, sample_ticket):
        serializer = TicketSerializer(sample_ticket)
        assert 'embedding' not in serializer.data

    def test_sequential_numbering(self, db, sample_employee):
        data_base = {
            'title': 'Ticket',
            'description': 'Description',
            'category': 'other',
            'priority': 'low',
            'employee_id': sample_employee.employee_id,
            'employee_name_snapshot': sample_employee.name,
            'department_snapshot': sample_employee.department,
        }
        s1 = TicketSerializer(data={**data_base, 'title': 'First'})
        s1.is_valid(raise_exception=True)
        t1 = s1.save()

        s2 = TicketSerializer(data={**data_base, 'title': 'Second'})
        s2.is_valid(raise_exception=True)
        t2 = s2.save()

        # The numeric suffix of t2 should be greater than t1
        num1 = int(t1.ticket_number[-3:])
        num2 = int(t2.ticket_number[-3:])
        assert num2 > num1
