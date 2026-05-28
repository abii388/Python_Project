from django.db import transaction as db_transaction
from django.utils import timezone

from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from .models import Transaction, TransactionStatus, TransactionType
from .serializers import TransactionSerializer



from apps.accounts.models import Role
from apps.accounts.permissions import (
    CanCreateTransaction,
    CanApproveTransaction,
    CanDeleteTransaction
)


class TransactionViewSet(viewsets.ModelViewSet):

    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = [
        'fund',
        'status',
        'transaction_type'
    ]

    search_fields = ['description']

    ordering_fields = [
        'created_at',
        'amount'
    ]

    ordering = ['-created_at']

    # =====================================
    # DYNAMIC PERMISSIONS
    # =====================================

    def get_permissions(self):

        # Create transaction
        if self.action == 'create':

            permission_classes = [
                IsAuthenticated,
                CanCreateTransaction
            ]

        # Approve / Reject / Pending Requests
        elif self.action in [
            'approve',
            'reject',
            'pending_requests'
        ]:

            permission_classes = [
                IsAuthenticated,
                CanApproveTransaction
            ]

        # Delete transaction
        elif self.action == 'destroy':

            permission_classes = [
                IsAuthenticated,
                CanDeleteTransaction
            ]

        # Default access
        else:
            permission_classes = [IsAuthenticated]

        return [
            permission()
            for permission in permission_classes
        ]

    # =====================================
    # QUERYSET
    # =====================================

    def get_queryset(self):

        user = self.request.user

        # Admin / Auditor / Approver
        if user.role in [
            Role.ADMIN,
            Role.AUDITOR,
            Role.APPROVER
        ]:
            return Transaction.objects.all()

        # Cashier -> own transactions only
        return Transaction.objects.filter(
            requester=user
        )

    # =====================================
    # CREATE TRANSACTION
    # =====================================

    def perform_create(self, serializer):

        serializer.save(
            requester=self.request.user,
            status=TransactionStatus.PENDING
        )

    # =====================================
    # UPDATE TRANSACTION
    # =====================================

    def update(self, request, *args, **kwargs):

        transaction = self.get_object()

        # Cannot edit approved/rejected
        if transaction.status != TransactionStatus.PENDING:

            return Response(
                {
                    'detail': (
                        'Approved or rejected '
                        'transactions cannot be edited.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Admin full access
        if request.user.role == Role.ADMIN:
            return super().update(request, *args, **kwargs)

        # Cashier can edit own pending requests only
        if (
            request.user.role == Role.CASHIER and
            transaction.requester == request.user
        ):
            return super().update(request, *args, **kwargs)

        return Response(
            {
                'detail': (
                    'You do not have permission '
                    'to edit this transaction.'
                )
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # =====================================
    # DELETE TRANSACTION
    # =====================================

    def destroy(self, request, *args, **kwargs):

        return super().destroy(request, *args, **kwargs)

    # =====================================
    # APPROVE TRANSACTION
    # =====================================

    @action(detail=True,methods=['post'],permission_classes=[
            IsAuthenticated,
            CanApproveTransaction
        ]
    )
    def approve(self, request, pk=None):

        transaction = self.get_object()

        # Already processed
        if transaction.status != TransactionStatus.PENDING:

            return Response(
                {
                    'detail': (
                        f'Cannot approve a '
                        f'{transaction.status.lower()} transaction.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        comments = request.data.get('comments', '')

        fund = transaction.fund

        # Prevent negative balance
        if (
            transaction.transaction_type ==
            TransactionType.EXPENSE and
            fund.current_balance < transaction.amount
        ):

            return Response(
                {
                    'detail': 'Insufficient fund balance.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():

            # =====================================
            # UPDATE FUND BALANCE
            # =====================================

            if (
                transaction.transaction_type ==
                TransactionType.EXPENSE
            ):
                fund.current_balance -= transaction.amount

            elif (
                transaction.transaction_type ==
                TransactionType.REPLENISHMENT
            ):
                fund.current_balance += transaction.amount

            fund.save()

            # =====================================
            # UPDATE TRANSACTION
            # =====================================

            transaction.status = TransactionStatus.APPROVED
            transaction.save()

           

        return Response(
            {
                'detail': (
                    'Transaction approved successfully.'
                ),
                'transaction': (
                    TransactionSerializer(transaction).data
                )
            },
            status=status.HTTP_200_OK
        )

    # =====================================
    # REJECT TRANSACTION
    # =====================================

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[
            IsAuthenticated,
            CanApproveTransaction
        ]
    )
    def reject(self, request, pk=None):

        transaction = self.get_object()

        # Already processed
        if transaction.status != TransactionStatus.PENDING:

            return Response(
                {
                    'detail': (
                        f'Cannot reject a '
                        f'{transaction.status.lower()} transaction.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        comments = request.data.get('comments', '')

        # Comments required
        if not comments:

            return Response(
                {
                    'detail': (
                        'Rejection comments are required.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with db_transaction.atomic():

            # =====================================
            # UPDATE TRANSACTION
            # =====================================

            transaction.status = TransactionStatus.REJECTED

            transaction.save()

           

        return Response(
            {
                'detail': (
                    'Transaction rejected successfully.'
                ),
                'transaction': (
                    TransactionSerializer(transaction).data
                )
            },
            status=status.HTTP_200_OK
        )

    # =====================================
    # PENDING REQUESTS
    # =====================================

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[
            IsAuthenticated,
            CanApproveTransaction
        ]
    )
    def pending_requests(self, request):

        pending_transactions = (
            Transaction.objects.filter(
                status=TransactionStatus.PENDING
            ).order_by('-created_at')
        )

        page = self.paginate_queryset(
            pending_transactions
        )

        if page is not None:

            serializer = self.get_serializer(
                page,
                many=True
            )

            return self.get_paginated_response(
                serializer.data
            )

        serializer = self.get_serializer(
            pending_transactions,
            many=True
        )

        return Response(serializer.data)