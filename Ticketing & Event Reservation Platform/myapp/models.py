from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    user_role=models.CharField(max_length=10,default="user")
    ph_no=models.CharField(max_length=10,unique=True)

class Concert(models.Model):
    concert_name = models.CharField(max_length=100,blank=False,null=False)
    concert_date = models.DateField(blank=False,null=False)
    concert_time = models.CharField(max_length=250,blank=False,null=False)
    concert_location = models.CharField(max_length=100, blank=False, null=False)  
    available_tickets = models.CharField(max_length=100,blank=False,null=False) 
    prize = models.DecimalField(max_digits=10, decimal_places=2) 
    status = models.CharField(max_length=50, default='Disable')
    image = models.ImageField(upload_to='concert_images/', blank=True, null=True)
class Booked_concert(models.Model):
    concert=models.ForeignKey(Concert,on_delete=models.CASCADE)
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    ticket_no=models.CharField(max_length=10)
    total_price=models.DecimalField(max_digits=10, decimal_places=2,blank=False,null=False) 
    concert_name = models.CharField(max_length=100,blank=False,null=False)
    concert_date = models.DateField(blank=False,null=False)
    concert_time = models.CharField(max_length=250,blank=False,null=False)
    concert_location = models.CharField(max_length=100, blank=False, null=False)  
    user_name=models.CharField(max_length=250,blank=False,null=False,default="")
    prize = models.DecimalField(max_digits=10, decimal_places=2) 

