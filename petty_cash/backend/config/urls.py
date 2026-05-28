from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/funds/', include('apps.funds.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/reports/', include('apps.reports.urls')),
    
    # Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
