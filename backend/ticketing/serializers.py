from rest_framework import serializers
from .models import Ticket, Employee, AIResponse, KnowledgeBase, TicketHistory
from datetime import datetime


class TicketSerializer(serializers.ModelSerializer):
    """工单序列化器（列表用，不包含embedding）"""
    
    # 让 ticket_number 可选，由后端自动生成
    ticket_number = serializers.CharField(read_only=True)
    
    class Meta:
        model = Ticket
        exclude = ['embedding']  # 排除大的向量字段
    
    def create(self, validated_data):
        # 自动生成工单号
        date_str = datetime.now().strftime('%Y%m%d')
        
        # 获取今天的工单数量
        today_count = Ticket.objects.filter(
            ticket_number__startswith=f'TK{date_str}'
        ).count()
        
        ticket_number = f'TK{date_str}{str(today_count + 1).zfill(3)}'
        validated_data['ticket_number'] = ticket_number
        
        return super().create(validated_data)


class AIResponseSerializer(serializers.ModelSerializer):
    """AI分析结果序列化器"""
    
    class Meta:
        model = AIResponse
        fields = '__all__'


class TicketDetailSerializer(serializers.ModelSerializer):
    """工单详情序列化器（包含AI分析）"""
    ai_responses = AIResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        exclude = ['embedding']  # 详情页也不需要返回embedding
        depth = 1


class EmployeeSerializer(serializers.ModelSerializer):
    """员工序列化器"""
    
    class Meta:
        model = Employee
        fields = '__all__'


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    """知识库序列化器"""
    
    class Meta:
        model = KnowledgeBase
        exclude = ['embedding']  # 同样排除embedding


class TicketHistorySerializer(serializers.ModelSerializer):
    """工单历史序列化器"""
    
    class Meta:
        model = TicketHistory
        fields = '__all__'