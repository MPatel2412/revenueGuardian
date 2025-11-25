from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    Endpoint for new agents to sign up.
    AllowAny permission is needed so unauthenticated users can register.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(APIView):
    """
    Endpoint to get the current logged-in user's details.
    Accessible only with a valid JWT.
    """
    # Permission is IsAuthenticated by default from settings.py

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)