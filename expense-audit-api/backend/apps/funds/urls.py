from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FundViewSet

router = DefaultRouter()
router.register(r'', FundViewSet, basename='fund')

urlpatterns = [
    path('', include(router.urls)),
]
