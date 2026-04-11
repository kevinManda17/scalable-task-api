from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('', ensure_csrf_cookie(TemplateView.as_view(template_name='home.html')), name='home'),
    path('dashboard/', ensure_csrf_cookie(TemplateView.as_view(template_name='home.html')), name='dashboard'),
    path('tasks/', ensure_csrf_cookie(TemplateView.as_view(template_name='tasks.html')), name='tasks'),
    path('login/', ensure_csrf_cookie(TemplateView.as_view(template_name='login.html')), name='login'),
    path('register/', ensure_csrf_cookie(TemplateView.as_view(template_name='register.html')), name='register'),
]