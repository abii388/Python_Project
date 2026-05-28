from rest_framework import viewsets
from apps.accounts.permissions import IsAdminOrAssignedCashier
from .models import Fund
from .serializers import FundSerializer
from apps.accounts.permissions import IsAdmin
from apps.accounts.models import Role

class FundViewSet(viewsets.ModelViewSet):
 
    
    serializer_class = FundSerializer
    permission_classes = [IsAdminOrAssignedCashier]

    def get_queryset(self):

        user = self.request.user

        # Admin and Auditor see all
        if user.role in [Role.ADMIN, Role.AUDITOR]:
            return Fund.objects.all()

        # Cashier sees assigned funds
        return Fund.objects.filter(managers=user)
    
    def perform_create(self, serializer):

        fund = serializer.save()
        print(fund)

        # Auto assign cashier as manager
        if self.request.user.role == Role.CASHIER:
            fund.managers.add(self.request.user)


