from django.urls import path
from myapp import views

urlpatterns = [
    path('',views.index,name="myapp_index"),
    path('log/',views.login_user,name="login_user"),
    # path('stud/',views.stud,name="myapp_stud"),
    path('reg/',views.register,name="myapp_reg"),
    path('add/',views.add_book,name="add_book"),
    path('adm/',views.adminhome,name="adminhome"),
    path('admin_view',views.admin_view,name="admin_view"),
    path('sech',views.b_search,name="search_book"),
    path('upd',views.b_update,name="book_update"),
    path('edit/<Book_id>',views.b_edit,name="book_edit"),
    path("dply",views.show,name="book_view"),
    path('del/<Book_id>',views.b_delete,name="book_del"),
    # path('ad_viw_deta/<int:id>',views.ad_confirm_view,name="ad_confirm_view"),
    path('st_reg',views.student_log,name="student_log"),
    path('st_ord',views.student_order,name="student_order"),
    path('st_view',views.student_view,name="student_view"),
    path('ad_view',views.admin_view_order,name="admin_view"),
    path('od_confirm/<int:id>/<book_id>',views.admin_order_confirmation,name="order_conf"),
    path('st_view_date',views.st_view_date,name="st_date_view"),
    path('st_return_book/<book_id>/<int:id>',views.st_return_book,name="st_date_view"),
]
