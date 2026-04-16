from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator


@method_decorator(ensure_csrf_cookie, name='dispatch')
class HomeView(TemplateView):
    template_name = 'home.html'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class RegisterView(TemplateView):
    template_name = 'register.html'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(TemplateView):
    template_name = 'login.html'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class DashboardView(TemplateView):
    template_name = 'dashboard.html'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class TasksView(TemplateView):
    template_name = 'tasks.html'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class AdminView(TemplateView):
    template_name = 'admin_dashboard.html'