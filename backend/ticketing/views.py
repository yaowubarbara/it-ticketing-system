import logging

from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import Ticket, Employee, KnowledgeBase, TicketHistory
from .serializers import (
    TicketSerializer,
    TicketDetailSerializer,
    EmployeeSerializer,
    KnowledgeBaseSerializer,
)
from .tasks import analyze_ticket_task, generate_knowledge_embedding_task

logger = logging.getLogger('ticketing.views')


# ==================== Employee APIs ====================

class EmployeeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/employees/  - 获取员工列表
    POST /api/employees/  - 创建新员工
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/employees/<employee_id>/  - 获取员工详情
    PATCH  /api/employees/<employee_id>/  - 更新员工信息
    DELETE /api/employees/<employee_id>/  - 删除员工
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    lookup_field = 'employee_id'  # 使用employee_id而不是默认的pk


# ==================== Ticket APIs ====================

class TicketListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/tickets/  - 获取工单列表
    POST /api/tickets/  - 创建新工单（自动触发AI分析）
    """
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'priority', 'employee_id', 'assigned_to']
    ordering_fields = ['created_at', 'priority']

    def perform_create(self, serializer):
        """创建工单时触发AI分析"""
        ticket = serializer.save()
        # 异步触发AI分析任务
        analyze_ticket_task.delay(ticket.id)


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/tickets/<id>/  - 获取工单详情
    PATCH  /api/tickets/<id>/  - 更新工单
    DELETE /api/tickets/<id>/  - 删除工单
    """
    queryset = Ticket.objects.all()

    def get_serializer_class(self):
        """GET请求用详细序列化器，其他请求用普通序列化器"""
        if self.request.method == 'GET':
            return TicketDetailSerializer
        return TicketSerializer


# ==================== Ticket Actions ====================

@api_view(['POST'])
def assign_ticket(request, pk):
    """
    POST /api/tickets/<id>/assign/
    分配工单给IT人员

    请求体：{"assigned_to": "IT001"}
    """
    ticket = get_object_or_404(Ticket, pk=pk)
    assigned_to = request.data.get('assigned_to')

    if not assigned_to:
        return Response(
            {"error": "assigned_to字段是必需的"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 更新工单
    old_assigned_to = ticket.assigned_to
    ticket.assigned_to = assigned_to
    ticket.status = 'in_progress'
    ticket.save()

    # 记录历史
    TicketHistory.objects.create(
        ticket=ticket,
        changed_field='assigned_to',
        old_value=old_assigned_to or '',
        new_value=assigned_to,
        changed_by=assigned_to,
        comment='工单已分配'
    )

    return Response(
        TicketSerializer(ticket).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def resolve_ticket(request, pk):
    """
    POST /api/tickets/<id>/resolve/
    标记工单为已解决

    请求体：{"resolved_by": "IT001", "comment": "已重启路由器"}
    """
    ticket = get_object_or_404(Ticket, pk=pk)
    resolved_by = request.data.get('resolved_by')
    comment = request.data.get('comment', '')

    if not resolved_by:
        return Response(
            {"error": "resolved_by字段是必需的"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 更新工单
    ticket.status = 'resolved'
    ticket.resolved_at = timezone.now()
    ticket.save()

    # 记录历史
    TicketHistory.objects.create(
        ticket=ticket,
        changed_field='status',
        old_value='in_progress',
        new_value='resolved',
        changed_by=resolved_by,
        comment=comment
    )

    return Response(
        TicketSerializer(ticket).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
def close_ticket(request, pk):
    """
    POST /api/tickets/<id>/close/
    关闭工单（用户确认）

    请求体：{"closed_by": "W001", "comment": "问题已解决"}
    """
    ticket = get_object_or_404(Ticket, pk=pk)
    closed_by = request.data.get('closed_by')
    comment = request.data.get('comment', '')

    if ticket.status != 'resolved':
        return Response(
            {"error": "只有已解决的工单才能关闭"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 更新工单
    ticket.status = 'closed'
    ticket.closed_at = timezone.now()
    ticket.save()

    # 记录历史
    TicketHistory.objects.create(
        ticket=ticket,
        changed_field='status',
        old_value='resolved',
        new_value='closed',
        changed_by=closed_by,
        comment=comment
    )

    return Response(
        TicketSerializer(ticket).data,
        status=status.HTTP_200_OK
    )


# ==================== Knowledge Base APIs ====================


class KnowledgeBaseListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/knowledge-base/  - 获取知识库列表
    POST /api/knowledge-base/  - 创建知识库文档（异步生成向量）
    """
    queryset = KnowledgeBase.objects.all().order_by('-created_at')
    serializer_class = KnowledgeBaseSerializer

    def get_queryset(self):
        """按类别过滤"""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    def perform_create(self, serializer):
        """Create knowledge article and trigger async embedding generation."""
        knowledge = serializer.save()
        logger.info("Knowledge #%s saved, submitting embedding task", knowledge.id)
        generate_knowledge_embedding_task.delay(knowledge.id)


class KnowledgeBaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/knowledge-base/<id>/  - 获取知识库详情
    PUT    /api/knowledge-base/<id>/  - 完整更新知识库（异步重新生成向量）
    PATCH  /api/knowledge-base/<id>/  - 部分更新知识库（异步重新生成向量）
    DELETE /api/knowledge-base/<id>/  - 删除知识库
    """
    queryset = KnowledgeBase.objects.all()
    serializer_class = KnowledgeBaseSerializer

    def perform_update(self, serializer):
        """更新时异步重新生成向量"""
        knowledge = serializer.save()

        logger.info("Knowledge #%s updated, submitting embedding task", knowledge.id)
        generate_knowledge_embedding_task.delay(knowledge.id)
