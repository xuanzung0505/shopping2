from django.urls import path, include
from .views import *

app_name = 'hybrid'

urlpatterns = [
    path('FAQ/', FAQPage.as_view(), name='FAQ'),
    path('termsofservice/', TermsOfServicePage.as_view(), name='termsofservice'),
]