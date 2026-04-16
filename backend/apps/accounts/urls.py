from django.urls import path
from .views import AdminUserListView, RegisterView, LoginView, LogoutView, MeView

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),

     path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<str:username>/', AdminUserListView.as_view(), name='admin-user-delete'),
]