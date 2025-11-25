from django.db import models
from policies.models import Policy, Carrier

class CommissionStatement(models.Model):
    """
    Represents the PDF/Excel file uploaded from the Carrier.
    """
    carrier = models.ForeignKey(Carrier, on_delete=models.CASCADE)
    statement_date = models.DateField()
    statement_file = models.FileField(upload_to='commission_statements/')
    
    # Reconciliation Status
    total_amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.carrier.name} - {self.statement_date}"


class CommissionTransaction(models.Model):
    """
    A single line item extracted from the Statement.
    """
    STATUS_CHOICES = [
        ('MATCHED', 'Fully Paid'),
        ('UNDERPAID', 'Underpaid (Discrepancy)'),
        ('OVERPAID', 'Overpaid'),
        ('MISSING', 'Missing from Statement'),
    ]

    statement = models.ForeignKey(CommissionStatement, on_delete=models.CASCADE, related_name='transactions')
    policy = models.ForeignKey(Policy, on_delete=models.SET_NULL, null=True, related_name='commissions')
    
    # The Math
    amount_expected = models.DecimalField(max_digits=10, decimal_places=2, help_text="Calculated by System")
    amount_received = models.DecimalField(max_digits=10, decimal_places=2, help_text="Extracted from Statement")
    
    # The Result
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='MATCHED')
    discrepancy_reason = models.TextField(blank=True, help_text="Auto-generated reason for mismatch")
    
    transaction_date = models.DateField()

    def save(self, *args, **kwargs):
        # Auto-calculate status before saving
        diff = self.amount_received - self.amount_expected
        if diff == 0:
            self.status = 'MATCHED'
        elif diff < 0:
            self.status = 'UNDERPAID'
        else:
            self.status = 'OVERPAID'
        super().save(*args, **kwargs)