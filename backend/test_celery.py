import os
import django

# 设置Django配置
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# 现在可以导入Django相关模块
from ticketing.tasks import test_task, analyze_ticket_task

print("=== 测试1: 简单任务 ===")
result1 = test_task.delay("Hello Celery!")
print(f"任务ID: {result1.id}")
print(f"任务状态: {result1.status}")
print("请查看Celery Worker终端！\n")

print("=== 测试2: 分析工单任务 ===")
result2 = analyze_ticket_task.delay(5)
print(f"任务ID: {result2.id}")
print("任务已发送到队列，正在后台处理...")
print("请查看Celery Worker终端！")
