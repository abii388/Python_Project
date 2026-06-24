from rest_framework import permissions
from .models import Role
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN)

class IsCashier(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.CASHIER)

class IsApprover(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.APPROVER)

class IsAuditor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.AUDITOR)

class IsAdminOrAuditor(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [Role.ADMIN, Role.AUDITOR]
        )


class IsAdminOrAssignedCashier(BasePermission):

    def has_permission(self, request, view):

        if request.method in SAFE_METHODS:#('GET', 'HEAD', 'OPTIONS')
            return request.user.is_authenticated

        return request.user.role in ['Admin', 'Cashier']

    def has_object_permission(self, request, view, obj):

        # Admin full access
        if request.user.role == 'Admin':
            return True

        # Cashier can access assigned funds only
        if request.user.role == 'Cashier':
            return obj.managers.filter(id=request.user.id).exists()

        # Auditor readonly
        return request.method in SAFE_METHODS


class CanCreateTransaction(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role in [
                Role.ADMIN,
                Role.CASHIER
            ]
        )

class CanApproveTransaction(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role in [
                Role.ADMIN,
                Role.APPROVER
            ]
        )

class CanDeleteTransaction(BasePermission):
    message = 'Only Admin can delete transactions.'
    def has_permission(self, request, view):

        return (
            request.user.is_authenticated and
            request.user.role == Role.ADMIN
        )