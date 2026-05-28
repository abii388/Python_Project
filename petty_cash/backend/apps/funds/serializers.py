from rest_framework import serializers
from .models import Fund

class FundSerializer(serializers.ModelSerializer):
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Fund
        fields = ['id', 'name', 'description', 'total_budget', 'current_balance', 'managers', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
