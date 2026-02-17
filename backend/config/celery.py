import logging
import os

from celery import Celery

logger = logging.getLogger('config.celery')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for verifying Celery configuration."""
    logger.debug("Celery debug task request: %r", self.request)
