from rest_framework import serializers
from .models import CustomUser, Role


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirmation = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'email',
            'password',
            'password_confirmation',
            'role',
            'first_name',
            'last_name',
            'is_active',
            'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirmation']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirmation')

        request = self.context.get("request")

        if not (request and request.user.is_authenticated and request.user.role == Role.ADMIN):
            validated_data["role"] = Role.CASHIER

        password = validated_data.pop('password')
    
        # use the manager method instead of manual save
        user = CustomUser.objects.create_user(password=password, **validated_data)

        return user



class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name']