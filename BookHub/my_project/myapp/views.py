from django.shortcuts import render,redirect,HttpResponse
from .models import *
from django.db.models import F
from django.contrib.auth import authenticate,login,logout



# Create your views here.
def index(request):
    return render(request,"index.html")

def adminhome(request):
    return render(request,'admin.html')

def login_user(request):
    error=""
    if request.method=="POST":
        user=authenticate(
            request,
            username=request.POST["username"],
            password=request.POST["password"]
        )
        if user is not None:
            login(request,user)
            if user.is_superuser:
                return redirect(adminhome) 
            else:
                
                return redirect(student_log)
        else:
            error="Invalid username / password"
            return HttpResponse(error)
    return render(request,"login.html",)


# def stud(request):
#     return render(request,"stud_reg.html")
def register(request):
    if request.method =='POST':
      
        name=request.POST['f_name']
        l_name=request.POST['l_name']
        u_name=request.POST['u_name']
        ad_no=request.POST['ad_no']
        pas=request.POST['pass']
        c_pas=request.POST['c_pass'] 
        if User.objects.filter(username=u_name).exists():
            return HttpResponse("username already exist")

        User.objects.create_user(first_name=name,last_name=l_name,username=u_name,admission_number=ad_no,password=c_pas,is_active=1)
        return redirect(login_user)
    else:
    
        return render (request,"stud_reg.html")
    
def add_book(request):
    if request.method =='POST':
      
        b_id=request.POST['book_id']
        b_name=request.POST['Book_name']
        b_authname=request.POST['author_name']
      
        b_quant=request.POST['Book_quantity']
        

        Admin_add_book.objects.create( Book_id=b_id,Book_name= b_name, Author_name=b_authname, Quantity=b_quant)
        return render(request,"add_book.html")
    else:
        return render(request,"add_book.html")
    
def admin_view(request):
    context={}
    context["Books"]=Admin_add_book.objects.all()
    return render(request,"admin_view.html",context)
    
def b_search(request,):
   if request.method=='POST':
       b_id=request.POST['book_id']

       obj=Admin_add_book.objects.get(Book_id=b_id)
       return render(request, 'view.html',{'items': obj})
       
   else:
      return render(request,"book_search.html")
  
def b_update(request):
    if request.method=='POST':
       b_id=request.POST['book_id']
       obj=Admin_add_book.objects.get(Book_id=b_id)
       return render(request, 'book_update.html',{'items': obj})
    else:
      return render(request,"book_search.html")
  
  
  
def b_edit(request,Book_id):
 if request.method=='POST':
  
    b_id=request.POST['book_id']
    b_name=request.POST['Book_name']
    b_authname=request.POST['author_name']
    b_quant=request.POST['Book_quantity']
   
    Admin_add_book.objects.filter(Book_id=Book_id).update( Book_id= b_id,Book_name=b_name,Author_name=b_authname,Quantity=b_quant)
    obj=Admin_add_book.objects.get(Book_id=Book_id)
    return render(request,"book_update.html",{'items': obj})
    
    # obj.Book_id=b_id
    # obj.Book_name=b_name
    # obj.Author_name=b_authname
    # obj.Book_cost=b_cost
    # obj.Quantity=b_quant
    # obj.save()
    # return redirect("book_update")
    # Admin_add_book.objects.filter(Book_id=request.user.id)
 else:
    obj=Admin_add_book.objects.get(Book_id=Book_id)
    print(obj)
    return render(request,"edit.html",{'items': obj})

                                                         

def b_delete(request,Book_id):
    obj=Admin_add_book.objects.get(Book_id=Book_id)
    obj.delete()
    return redirect(show)

# def ad_confirm_view(request,id):
#     # context={}
#     # context["Books"]=Admin_add_book.objects.get(pk=id)
#     # obj=Student_book_details.objects.get(pk=id)
    
#     # return render(request,"ad_confirm_view.html",{'items':obj})
#     context={}
#     context["Books"]=Student_book_details.objects.all()
#     return render(request,"ad_confirm_view.html",context)
    

def show(request):
    context={}
    context["Books"]=Admin_add_book.objects.all()
    return render(request,"display.html",context)

def user_logout(request):
    logout(request)
    return redirect(" ")

def student_log(request):
    context={}
    context["Books"]=User.objects.filter(username=request.user)
    
    return render(request,"student.html",context)
  
def student_book(request,id):
    context={}
    context["Books"]=Admin_add_book.objects.all(book_id=id)
    return render(request,"display.html",context)

def student_order(request):
    if request.method =='POST':
      
        b_name=request.POST['b_name']
        a_name=request.POST['a_name']
        s_name=request.POST['s_name']
        s_id=request.POST['s_id']
        b_id=request.POST['b_id']
        

        Student_book_details.objects.create ( Book=b_name,stud_name=s_name,auth_name=a_name,user_id=s_id,book_id=b_id,issue_date=None,
                                             expiry_date=None)
        return render(request,"stud_order.html")
    else:
       return render(request,"stud_order.html")
   
def student_view(request):
    context={}
    context["Books"]=Admin_add_book.objects.all()
    return render(request,"view.html",context)

def admin_view_order(request):
    context={}
    context["Books"]=Student_book_details.objects.all()
    return render(request,"admin_view_order.html",context)

def admin_order_confirmation(request,id,book_id):
    if request.method =='POST':
        
        obj=Student_book_details.objects.get(pk=id)
        # obj=Admin_add_book.objects.get(Book_id=book_id)
        if obj != None:
            i_date=request.POST['issue_date']
            e_date=request.POST['expiry_date']
            fine=request.POST['fine']
            status=request.POST['status']
            
            Student_book_details.objects.filter(pk=id).update(issue_date=i_date,expiry_date=e_date,fine=fine,stock_status=status)
            if status == "approve":
              Admin_add_book.objects.filter(Book_id=book_id).update(Quantity=F('Quantity') - 1)
              
            obt=Admin_add_book.objects.get(Book_id=book_id)
            
            a=int( obt.Quantity)
           
          
            if  a <= 0 :
                    Admin_add_book.objects.filter(Book_id=book_id).update(Quantity="out of stock")
                
            return redirect(admin_view_order)
    else:
        obj=Student_book_details.objects.get(pk=id)
         
      
        return render(request,"admin_order_confirmation.html",{'items': obj})
    
    
def st_view_date(request):
    
    context={}
    context["Books"]=Student_book_details.objects.filter(user=request.user)
    
    return render(request,"st_date_view.html",context) 
    
   
def st_return_book(request,book_id,id):
    Admin_add_book.objects.filter(Book_id=book_id).update(Quantity=F('Quantity') + 1)
    obj=Student_book_details.objects.get(id=id)
    obj.delete()
    return redirect("st_date_view")
