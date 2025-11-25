from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    The SaaS User (Insurance Agent/Agency Admin).
    Extends standard Django Auth.
    """
    is_agency_admin = models.BooleanField(default=False)
    agent_code = models.CharField(max_length=50, blank=True, help_text="Internal code used by the agency")
    phone = models.CharField(max_length=20, blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.agent_code})"