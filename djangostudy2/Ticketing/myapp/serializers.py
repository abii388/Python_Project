from rest_framework import serializers
from .models import *

class SignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True,required=False) # Ensures password is not returned in responses
    class Meta:
        model = User
    
        fields = ['username','email', 'password', 'ph_no','confirm_password']
class UserList(serializers.ModelSerializer):
    class Meta:
        model=User
      
        fields = ['username','email','ph_no']
      
class ConcertSerializer(serializers.ModelSerializer):
    concert_date = serializers.DateField(format="%d-%m-%Y", input_formats=["%d-%m-%Y"]) 
    class Meta:
        model = Concert
        fields = ['id','concert_name','concert_date','concert_time','concert_location','prize','available_tickets','status','image']
class BookedConcert(serializers.ModelSerializer):
    class Meta:
        model = Booked_concert
        fields='__all__'
