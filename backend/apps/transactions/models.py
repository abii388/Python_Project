from django.db import models
from apps.accounts.models import CustomUser
from apps.funds.models import Fund

class TransactionType(models.TextChoices):
    EXPENSE = 'Expense', 'Expense'
    REPLENISHMENT = 'Replenishment', 'Replenishment'

class TransactionStatus(models.TextChoices):
    PENDING = 'Pending', 'Pending'
    APPROVED = 'Approved', 'Approved'
    REJECTED = 'Rejected', 'Rejected'

class Transaction(models.Model):
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE, related_name='transactions')
    requester = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='requested_transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices, default=TransactionType.EXPENSE)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    description = models.TextField()
    receipt = models.FileField(upload_to='receipts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction_type} of {self.amount} for {self.fund.name} - {self.status}"
