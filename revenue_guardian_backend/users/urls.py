from django.urls import path
from .views import RegisterView, UserProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Auth Endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Returns Access + Refresh Token
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Get new Access Token
    
    # Profile Endpoint
    path('me/', UserProfileView.as_view(), name='user_profile'),
]