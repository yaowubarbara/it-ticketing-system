from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

# ==================== Ticket 工单表 ====================
class Ticket(models.Model):
    """工单主表"""

    # 状态选择
    STATUS_CHOICES = [
        ('pending', _('待处理')),
        ('in_progress', _('处理中')),
        ('resolved', _('已解决')),
        ('closed', _('已关闭')),
    ]

    # 类别选择
    CATEGORY_CHOICES = [
        ('hardware', _('硬件问题')),
        ('software', _('软件问题')),
        ('network', _('网络问题')),
        ('permission', _('权限问题')),
        ('other', _('其他')),
    ]

    # 优先级选择
    PRIORITY_CHOICES = [
        ('low', _('低')),
        ('medium', _('中')),
        ('high', _('高')),
        ('urgent', _('紧急')),
    ]

    # 基础字段
    ticket_number = models.CharField(max_length=20, unique=True, verbose_name='工单编号')
    title = models.CharField(max_length=200, verbose_name='标题')
    description = models.TextField(verbose_name='详细描述')

    # 分类字段
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='问题类型')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', verbose_name='优先级')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='状态')

    # 用户信息（快照）
    employee_id = models.CharField(max_length=50, verbose_name='员工工号')
    employee_name_snapshot = models.CharField(max_length=100, verbose_name='员工姓名快照')
    department_snapshot = models.CharField(max_length=100, verbose_name='部门快照')

    # 分配信息
    assigned_to = models.CharField(max_length=50, null=True, blank=True, verbose_name='分配给（IT工程师工号）')

    # 附件（JSON格式存储文件路径列表）
    attachments = models.JSONField(default=list, blank=True, null=True, verbose_name='附件')

    # ✨ 向量字段（用于RAG相似度搜索）
    embedding = models.JSONField(null=True, blank=True, verbose_name='描述向量')

    # 时间字段
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    estimated_resolution_time = models.DateTimeField(null=True, blank=True, verbose_name='预计解决时间')
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name='实际解决时间')
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name='关闭时间')

    class Meta:
        db_table = 'tickets'
        verbose_name = '工单'
        verbose_name_plural = '工单'
        ordering = ['-created_at']  # 默认按创建时间倒序
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.ticket_number} - {self.title}"


# ==================== User 用户表 ====================
class Employee(models.Model):
    """员工/用户表"""

    ROLE_CHOICES = [
        ('employee', _('普通员工')),
        ('it_staff', _('IT人员')),
        ('admin', _('管理员')),
    ]

    employee_id = models.CharField(max_length=50, primary_key=True, verbose_name='员工工号')
    email = models.EmailField(unique=True, verbose_name='邮箱')
    name = models.CharField(max_length=100, verbose_name='姓名')
    department = models.CharField(max_length=100, verbose_name='部门')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee', verbose_name='角色')
    office_location = models.CharField(max_length=100, blank=True, verbose_name='办公地点')
    is_active = models.BooleanField(default=True, verbose_name='是否在职')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'employees'
        verbose_name = '员工'
        verbose_name_plural = '员工'
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id} - {self.name}"


# ==================== AIResponse AI分析结果表 ====================
class AIResponse(models.Model):
    """AI分析结果表"""

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='ai_responses',
        verbose_name='关联工单'
    )

    suggested_category = models.CharField(max_length=20, verbose_name='建议分类')
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, verbose_name='置信度')
    suggested_solution = models.TextField(verbose_name='建议解决方案')

    # RAG相似工单结果（JSON格式）
    similar_tickets = models.JSONField(default=list, blank=True, verbose_name='相似历史工单')

    model_used = models.CharField(max_length=50, default='gpt-4o-mini', verbose_name='使用的模型')
    processing_time_ms = models.IntegerField(null=True, blank=True, verbose_name='处理时间(毫秒)')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'ai_responses'
        verbose_name = 'AI分析结果'
        verbose_name_plural = 'AI分析结果'
        ordering = ['-created_at']

    def __str__(self):
        return f"AI分析 - {self.ticket.ticket_number}"


# ==================== KnowledgeBase 知识库表 ====================
class KnowledgeBase(models.Model):
    """知识库文档表（用于RAG）"""

    CATEGORY_CHOICES = [
        ('hardware', '硬件问题'),
        ('software', '软件问题'),
        ('network', '网络问题'),
        ('permission', '权限问题'),
        ('other', '其他'),
    ]

    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='类型')

    # ✨ 向量字段（用于RAG相似度搜索）
    embedding = models.JSONField(null=True, blank=True, verbose_name='向量嵌入')

    usage_count = models.IntegerField(default=0, verbose_name='使用次数')
    success_rate = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        verbose_name='成功率'
    )

    created_by = models.CharField(max_length=50, verbose_name='创建人工号')
    tags = models.JSONField(default=list, blank=True, verbose_name='标签')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'knowledge_base'
        verbose_name = '知识库文档'
        verbose_name_plural = '知识库文档'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['usage_count']),
        ]

    def __str__(self):
        return self.title


# ==================== TicketHistory 工单历史表 ====================
class TicketHistory(models.Model):
    """工单变更历史表（审计日志）"""

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='history',
        verbose_name='关联工单'
    )

    changed_field = models.CharField(max_length=50, verbose_name='变更字段')
    old_value = models.TextField(null=True, blank=True, verbose_name='旧值')
    new_value = models.TextField(null=True, blank=True, verbose_name='新值')

    changed_by = models.CharField(max_length=50, verbose_name='操作人工号')
    comment = models.TextField(blank=True, verbose_name='备注')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='操作时间')

    class Meta:
        db_table = 'ticket_history'
        verbose_name = '工单历史'
        verbose_name_plural = '工单历史'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ticket']),
            models.Index(fields=['changed_by']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.ticket.ticket_number} - {self.changed_field} 变更"
