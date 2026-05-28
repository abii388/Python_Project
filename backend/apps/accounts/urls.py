from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import LogoutView,AdminPasswordResetView, UserProfileView, RegisterView,UpdateProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
  
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='user_profile_update'),
    path ('password-reset/<int:user_id>/', AdminPasswordResetView.as_view(), name='admin_password_reset')
]
