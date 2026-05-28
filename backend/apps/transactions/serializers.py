from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    approver_comments = serializers.CharField(write_only=True, required=False, allow_blank=True)
    requester_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['id', 'requester', 'status', 'created_at', 'updated_at', 'requester_name']
    
    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.email
