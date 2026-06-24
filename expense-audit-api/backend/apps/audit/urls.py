from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet

router = DefaultRouter()
router.register(r'', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
]
from django.contrib.auth import authenticate
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']          
        print("Email:",email)
        print("Password:",password)
   
       
        user = authenticate(username=email, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            print("Token:",token)
            return Response({'text': 'Login sucessfully', 'token': token.key}, status=HTTP_200_OK)
        else:
            return Response({'text': 'Invalid email or password'},status=HTTP_200_OK)
    return Response(serializer.errors,status=HTTP_200_OK)