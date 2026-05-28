from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
import openpyxl
from io import BytesIO
from apps.transactions.models import Transaction

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def transactions_excel(self, request):
        user = request.user
        if user.role in ['Admin', 'Auditor']:
            qs = Transaction.objects.all()
        elif user.role == 'Approver':
            qs = Transaction.objects.filter(fund__managers=user)
        else:
            qs = Transaction.objects.filter(requester=user)
            
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Transactions"
        ws.append(["ID", "Fund", "Amount", "Status", "Date"])
        
        for t in qs:
            ws.append([t.id, t.fund.name, float(t.amount), t.status, t.created_at.strftime("%Y-%m-%d")])
            
        stream = BytesIO()
        wb.save(stream)
        stream.seek(0)
        
        response = HttpResponse(stream.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="transactions_report.xlsx"'
        return response
