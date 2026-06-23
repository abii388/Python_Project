

# Create your tests here.
from django.test import TestCase
from .models import Admin_add_book, User
from django.urls import reverse
class BookModelTest(TestCase):

    def test_create_book(self):
        book = Admin_add_book.objects.create(
            Book_name="Python Basics",
            Author_name="John",
            Quantity=10
        )

        self.assertEqual(book.Book_name, "Python Basics")
        self.assertEqual(book.Author_name, "John")  
        self.assertEqual(book.Quantity, 10)





class UserRegistrationTest(TestCase):

    def test_user_registration(self):

        response = self.client.post(
            reverse('myapp_reg'),
            {
                'ad_no': '1001',
                'f_name': 'Abhu',
                'l_name': 'Kumar',
                'u_name': 'Abhilash',
                'pass': 'test123',
                'c_pass': 'test123'
            }
        )

        self.assertEqual(response.status_code, 302)

        self.assertTrue(
            User.objects.filter(admission_number='1001').exists()
        )



class LoginTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(
         
            username='Abhilash',
            password='test123'
        )

    def test_login(self):

        response = self.client.post(
            reverse('login'),
            {
                'username': 'Abhilash',
                'password': 'test123'
            }
        )

        self.assertEqual(response.status_code, 302)