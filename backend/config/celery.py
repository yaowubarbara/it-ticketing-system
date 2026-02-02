import os
from celery import Celery

# 设置Django settings模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 创建Celery实例
app = Celery('config')

# 从Django settings加载配置（所有以CELERY_开头的配置）
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现所有已注册app下的tasks.py
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """调试任务"""
    print(f'Request: {self.request!r}')