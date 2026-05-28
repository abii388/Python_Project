from django.db import models
from apps.accounts.models import CustomUser

class Fund(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    managers = models.ManyToManyField(CustomUser, related_name='managed_funds', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self._state.adding and self.current_balance == 0:
            self.current_balance = self.total_budget
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - Budget: {self.total_budget}"