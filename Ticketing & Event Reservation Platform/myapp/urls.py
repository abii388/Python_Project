from django.contrib import admin
from django.urls import path,include
# from . import views
from .views import *
urlpatterns = [
    path("signup",signup,name="signup"),
    path("login",login,name="login"),
    path("logout",logout,name="logout"),
    
    #========================adminside=============================
    path("createconcert",create_concert,name="create"),
    path("retrieve_concert",list_concerts,name="retrieve"),
    path("concert_details/<int:id>",concert_details,name="concert_details"),
    path("search",search,name="search"),
    path("booked_concert_details/<int:id>",booked_concert_deatials,name="booked_concert_deatials"),
    path("status_update/<int:id>",status_update,name="status_update"),
    path("pdf_generate/<int:id>",pdf_generate,name="pdf_generate"),
    #================= admin manage user======================
    path("user_details",user_details,name="user_details"),
    path("user_view/<int:id>",view_user,name="view_user"),
    
    #============================userside================================
    path("book_concert/<int:c_id>",get_concert_price,name="get_concert"),
    path("confirm_concert/<int:c_id>",book_concert,name="confirm_concert"),
    path("user_history",booking_history,name="user_history"),
    path("delete_history/<int:c_id>",delete_history,name="delete_history"),
   
   
]