
# Create your views here.

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .serializers import SignupSerializer
from rest_framework.authtoken.models import Token
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND,HTTP_401_UNAUTHORIZED
from django.contrib.auth import authenticate,login as user_login,logout as user_logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .forms import *
from django.db.models import F
from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore
from django.shortcuts import get_object_or_404

from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    data = request.data
    password = data.get("password")
    confirm_password = data.pop("confirm_password", None)

    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, 
                      status=status.HTTP_400_BAD_REQUEST)

    serializer = SignupSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, 
                      status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    user.set_password(password)
    user.save()
    
    # Create token for new user

    
    return Response({
        "message": "Account created successfully",
     
     
        "userId": user.id
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    
    if not username or not password:
        return Response({'error': 'Please provide both username and password'},
                      status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials'},
                      status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'userRole': user.user_role,
        'userId': user.id
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    request.auth.delete()  
    return Response({"message": "Successfully logged out"},
                   status=status.HTTP_200_OK)

#======================Admin page ==================================================

def is_admin(user):
    return user.user_role == "admin"



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_concert(request):
    if not is_admin(request.user):
        return Response({"error": "Admin access required"},
                      status=status.HTTP_403_FORBIDDEN)

    serializer = ConcertSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors,
                      status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_concerts(request):
    concerts = Concert.objects.all().order_by("concert_name")
    serializer = ConcertSerializer(concerts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def concert_details(request, id):
    concert = Concert.objects.get(id=id)
    
    
    if request.method == "GET":
        serializer = ConcertSerializer(concert)
        return Response(serializer.data, status=status.HTTP_200_OK)
    if not is_admin(request.user):
        return Response({"error": "Admin access required"},
                      status=status.HTTP_403_FORBIDDEN)

    if request.method == "PUT":
        #You're binding incoming data (request.data) to an existing instance (concert) using the ConcertSerializer. 
        # This is called deserialization for update
        serializer = ConcertSerializer(concert, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors,
                          status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "DELETE":
        concert.delete()
        return Response({"message": "Concert deleted successfully"},
                       status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search(request):
    if request.method == "GET":
        searchvalue = request.GET.get('search')
       
        concertName = Concert.objects.filter(concert_name=searchvalue)
        concertLocation = Concert.objects.filter(concert_location=searchvalue)
        concertDate=Concert.objects.filter(concert_date=searchvalue)
        concert =concertName|concertLocation|concertDate
        if concert:
            serializer = ConcertSerializer(concert, many=True)
            return Response(serializer.data,status=status.HTTP_200_OK)
        else:
            return Response({"message":"No data found"},status=status.HTTP_404_NOT_FOUND)
        


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def booked_concert_deatials(request,id):
    if not is_admin(request.user):
        return Response({"error": "Admin access required"},
                      status=status.HTTP_403_FORBIDDEN)
    
    no_of_ticket_booked=Booked_concert.objects.filter(concert_id=id)
    print(no_of_ticket_booked)
    if no_of_ticket_booked:
        serializer=BookedConcert(no_of_ticket_booked,many=True)
        print(serializer.data)
        return Response({"message": "The booked details are","data": serializer.data}, status=status.HTTP_200_OK)
    return Response({"message":"No data found"},status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def status_update(request ,id):
    if not is_admin(request.user):
        return Response({"error": "Admin access required"},
                      status=status.HTTP_403_FORBIDDEN)
    concert=Concert.objects.get(id=id)
    if concert:
        if concert.status == "Disable":
                concert.status = "Enable"
                
        else:
                concert.status = "Disable"
        concert.save()
        serializer=ConcertSerializer(concert)
        return Response({"message":"status updated","updated data":serializer.data},status=status.HTTP_200_OK)
    return Response ({"message":"error geting the data"},status=status.HTTP_400_BAD_REQUEST)


    #===========================================Admin manage user =====================================================
    
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_details(request ):
    print("hi")
    if not is_admin(request.user):
        return Response({"error": "Admin access required"},
                      status=status.HTTP_403_FORBIDDEN)
    data=User.objects.all()
    print(data)
    if data:
        serializer=UserList(data,many=True)
        return Response({"The user data ":serializer.data},status=status.HTTP_200_OK)    

@api_view(["GET","PUT","DELETE"])
@permission_classes([IsAuthenticated])
def view_user(request,id):
    if not is_admin(request.user):
        return Response({"error": "Admin access required"},status=status.HTTP_403_FORBIDDEN)
     
    try:
        user=User.objects.get(id=id)                 
    except User.DoesNotExist:
        return Response({"error":"No User in this ID"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer=UserList(user)
        return Response({"the user data":serializer.data})
    elif request.method == "PUT":
        serializer=UserList(user,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"mesage ":"updated succesfully"})
        return Response({"mesage ":"the error in updating the data"},status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        user.delete()
        return Response({"mesage ":"delete succesfully"})


#================================userpage==========================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_concert_price(request, c_id):
    concert = get_object_or_404(Concert, id=c_id)
    return Response({"price": concert.prize}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_concert(request, c_id):
    concert = get_object_or_404(Concert, id=c_id)

    if concert.available_tickets == "sold out":
        return Response({"message": "No tickets available"},
                      status=status.HTTP_400_BAD_REQUEST)

  
    ticket_no = int(request.data.get("ticket_no", 0))
    print(ticket_no)
    if ticket_no <= 0:
         return Response({"error": "Invalid ticket number"},
                      status=status.HTTP_400_BAD_REQUEST)
    if ticket_no >3:
            return Response({"error": "one person can book only 3 tickets"},
                      status=status.HTTP_400_BAD_REQUEST)
  
      

    total_price = ticket_no * concert.prize

    booking_data = {
        "concert": concert.id,
        "user": request.user.id,
        "concert_name": concert.concert_name,
        "concert_date": concert.concert_date,
        "concert_time": concert.concert_time,
        "concert_location": concert.concert_location,
        "prize": concert.prize,
        "ticket_no": ticket_no,
        "total_price": total_price,
        "user_name": request.user.username,
    }

    serializer = BookedConcert(data=booking_data)
    if not serializer.is_valid():
        return Response(serializer.errors,
                      status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    
    # Update available tickets atomically
    Concert.objects.filter(id=c_id).update(
        available_tickets=F('available_tickets') - ticket_no
    )
    
    # Check if tickets are sold out
    #refersh_from_db is ued for when multiple user booking a tickets then instanly update in db
    concert.refresh_from_db()
    if int(concert.available_tickets) <= 0:
        Concert.objects.filter(id=c_id).update(available_tickets='sold out')

    return Response({
        "message": "Concert booked successfully",
        "booking_id": serializer.data.get("id")
    }, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def booking_history(request):
   
    
    bookings = Booked_concert.objects.filter(user=request.user)
    serializer = BookedConcert(bookings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_history(request,c_id):
    try:
        booking = Booked_concert.objects.get(id=c_id,user_id=request.user.id)
        deleted_id=booking.id
        booking.delete()
        return Response({"message":"the data is delete","id":deleted_id},status.HTTP_200_OK)
    except Booked_concert.DoesNotExist:
        return Response({"message": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
        
        


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Optional: only if you want auth
def pdf_generate(request, id):
    # Get the product object
    concert = Booked_concert.objects.get(id=id)

    # Render the HTML template with product data
    template = get_template('concert.html')
    html = template.render({'concert': concert})

    # Create a PDF buffer
    buffer = BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=buffer)

    if pisa_status.err:
        return Response({"error": "PDF creation error"}, status=500)

    # Create HTTP response with PDF content
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{concert.concert_name}.pdf"'
    return response
    

































# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def view_concert(request):
#     if request.method == "GET":
#         concert = Concert.objects.all()
#         serializer = ConcertSerializer(concert, many=True)
#         return Response(serializer.data,status=status.HTTP_200_OK)
#     return Response({"message":"error getting data"},status=status.HTTP_400_BAD_REQUEST)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def book_concert(request,c_id):
#     if request.method == "GET":
#         try:
#             concert = Concert.objects.get(id=c_id)
#             serializer = ConcertSerializer(concert)
#             return Response(serializer.data["prize"],status=status.HTTP_200_OK)
#         #Here, serializer.data is not a Python object.
#         # It is a dictionary (dict) that contains serialized data.
#         #Trying serializer.data.prize will fail because serializer.data is not an object but a dictionary.Analogy
#         # concert.prize → Works because concert is a Django model object.
#         # serializer.data["prize"] → Works because serializer.data is a dictionary.
#         # serializer.data.prize → ❌ Fails because dictionaries don’t use dot notation for keys.
#         except Concert.DoesNotExist:
#             return Response({"message":"Data not found"},status=status.HTTP_404_NOT_FOUND)

# # Assuming BookingSerializer is defined

# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def confirm_concert(request, c_id):
#     if request.method == "POST":
        
#         try:
#             concert = Concert.objects.get(id=c_id)
#             if concert.available_tickets == "sold out":
#                 return Response({"message":"No tickets available"},status=status.HTTP_400_BAD_REQUEST)
#             print(concert)
#         except Concert.DoesNotExist:
#             return Response({"message": "Concert not found"}, status=status.HTTP_404_NOT_FOUND)

#         userid = request.session.get("user_id")
#         print(userid)
#         if userid is None:
#             return Response({"message": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

#         try:
#             user = User.objects.get(id=userid)
#             print(user)
#         except User.DoesNotExist:
#             return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         ticket_no = request.data.get("ticket_no")
#         print(type(ticket_no))
#         total_price = ticket_no * concert.prize
#         print(total_price)
#         # Creating a new Booking instance
#         data = {
#             "concert": concert.id,
#             "user": user.id,
#             "concert_name": concert.concert_name,
#             "concert_date": concert.concert_date,
#             "concert_time": concert.concert_time,
#             "concert_location": concert.concert_location,  
#             "prize": concert.prize,
#             "ticket_no": ticket_no,
#             "total_price": total_price,
#             "user_name": user.username,
#         }

#         serializer = BookedConcert(data=data)  
#         if serializer.is_valid():
#             serializer.save()
#             total_ticket=serializer.data.get("ticket_no")
#             print(total_ticket)
#             Concert.objects.filter(id=c_id).update(available_tickets=F('available_tickets') - int( total_ticket) )
#             # obj=Concert.objects.get(id=c_id)
#               # Fetch the updated concert object
#             concert.refresh_from_db() 
#             print(concert.available_tickets)
#             if concert.available_tickets == "0":
               
#                 Concert.objects.filter(id=c_id).update(available_tickets='sold out')
#             return Response({"message": "Concert booked successfully"}, status=status.HTTP_200_OK)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_history(request):
#     try:
#         userid = request.session.get("user_id")
#         booked_concerts=Booked_concert.objects.filter(user_id=userid)
#         serializer =BookedConcert(booked_concerts, many=True)
#         return Response({"data":serializer.data},status=status.HTTP_200_OK)
#     except Booked_concert.DoesNotExist:
#         return Response({"message": "User not logged in"}, status=status.HTTP_401_UNAUTHORIZED)

    
    
    
