from django.urls import path
from . import views

app_name = 'ticketing'

urlpatterns = [
    # ==================== Employee APIs ====================
    path('employees/', views.EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('employees/<str:employee_id>/', views.EmployeeDetailView.as_view(), name='employee-detail'),

    # ==================== Ticket APIs ====================
    path('tickets/', views.TicketListCreateView.as_view(), name='ticket-list-create'),
    path('tickets/<int:pk>/', views.TicketDetailView.as_view(), name='ticket-detail'),

    # Ticket Actions
    path('tickets/<int:pk>/assign/', views.assign_ticket, name='ticket-assign'),
    path('tickets/<int:pk>/resolve/', views.resolve_ticket, name='ticket-resolve'),
    path('tickets/<int:pk>/close/', views.close_ticket, name='ticket-close'),

    # ==================== Knowledge Base APIs ====================
    path('knowledge-base/', views.KnowledgeBaseListCreateView.as_view(), name='knowledge-base-list-create'),
    path('knowledge-base/<int:pk>/', views.KnowledgeBaseDetailView.as_view(), name='knowledge-base-detail'),
]
