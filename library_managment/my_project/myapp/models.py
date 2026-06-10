from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    admission_number=models.BigAutoField(
       

    primary_key=True,
        
    )
class Admin_add_book(models.Model):
    
   
    Book_id=models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True
        
    )
    Book_name=models.CharField(
        null=True,
        blank=True,
        max_length=230
    )
    Author_name=models.CharField(
        null=True,
        blank=True,
        max_length=230
    )
  
    Quantity=models.CharField(
       blank=True,
        null=True,
        max_length=23
    )
    
def __str__(self):
        return self.Book_name
    
class Student_book_details(models.Model): 
  
      
    user=models.ForeignKey(
        to=User,
        on_delete=models.CASCADE
    )
    
    Book=models.CharField(
        null=True,
        blank=True,
        max_length=230
    
    )
    book_id=models.IntegerField(
        null=False,
        blank=False,
        default=0
    )
    
    issue_date=models.DateField(
       auto_now=True
      
    )
    expiry_date=models.DateField(
     
        auto_now=True
     )
    fine=models.IntegerField(
        null=False,
        blank=False,
        default=0
     
    )
    stud_id=models.IntegerField(
        null=False,
        blank=False,
        default=0
    )
    stud_name=models.CharField(
        null=True,
        blank=True,
        max_length=230
    )
    auth_name=models.CharField(
        null=True,
        blank=True,
        max_length=230
    )
    stock_status=models.CharField(
      
        null=True,
        blank=True,
        max_length=50
        )
def __str__(self):
        return self.Book
