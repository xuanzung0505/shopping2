from django.shortcuts import render
from django.views import View

# Create your views here.

class FAQPage(View):
    def get(self,request):
        context = {}
        return render(request,'hybrid/FAQpage/FAQ.html', context)

class TermsOfServicePage(View):
    def get(self,request):
        context = {}
        return render(request,'hybrid/termsofservicepage/termsofservice.html', context)