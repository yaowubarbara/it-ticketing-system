from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('ticketing.urls')),  # 包含ticketing应用的所有路由
]
