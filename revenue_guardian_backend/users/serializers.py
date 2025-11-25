from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Used to view user details (SAFE).
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'agent_code', 'phone', 'is_agency_admin']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Used to register a new agent (WRITES Password).
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'agent_code', 'phone']

    def create(self, validated_data):
        # We must use create_user to properly hash the password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            agent_code=validated_data.get('agent_code', ''),
            phone=validated_data.get('phone', '')
        )
        return user