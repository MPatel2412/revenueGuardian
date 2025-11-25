from django.db import models
from django.conf import settings 

class Client(models.Model):
    """
    The End Customer (Policy Holder).
    """
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]

    # Link client to the Agent who owns this relationship
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='clients')
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.email}"

    @property
    def total_policies(self):
        return self.policies.count()


class Carrier(models.Model):
    """
    Insurance Companies (e.g., MetLife, Allianz).
    """
    name = models.CharField(max_length=100)
    support_email = models.EmailField(blank=True)
    
    def __str__(self):
        return self.name


class Policy(models.Model):
    """
    The Insurance Contract.
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('LAPSED', 'Lapsed'),
        ('CANCELLED', 'Cancelled'),
        ('PENDING', 'Pending Renewal'),
    ]
    
    POLICY_TYPES = [
        ('LIFE', 'Life Insurance'),
        ('HEALTH', 'Health Insurance'),
        ('AUTO', 'Vehicle Insurance'),
        ('HOME', 'Home Insurance'),
    ]

    # Relationships
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='policies')
    carrier = models.ForeignKey(Carrier, on_delete=models.PROTECT, related_name='policies')
    
    # Core Data
    policy_number = models.CharField(max_length=100, unique=True)
    prev_policy_number = models.CharField(max_length=100, blank=True, null=True)
    policy_type = models.CharField(max_length=20, choices=POLICY_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Financials (Use DecimalField for money, NEVER Float)
    premium_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Annual Premium")
    sum_insured = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Dates (Indexed for fast Renewal Alerts)
    start_date = models.DateField()
    end_date = models.DateField()
    renewal_date = models.DateField(db_index=True, help_text="Date when renewal is due")
    
    # Docs
    policy_file = models.FileField(upload_to='policy_docs/', blank=True, null=True)

    def __str__(self):
        return f"{self.policy_number} ({self.client.name})"