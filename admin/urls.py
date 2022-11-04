"""draft URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from .views import *

app_name = 'admin'

urlpatterns = [
    path('login/', LoginPage.as_view(), name='login'),
    path('logout/', LogoutPage.as_view(), name='logout'),
    path('', IndexPage.as_view(), name='index'),

    path('order/', OrderPage.as_view(), name='order'),
    path('order/filter/', OrderFilterPage.as_view(), name='orderfilter'),
    path('order/<int:order_id>/', OrderDetailPage.as_view(), name='orderdetail'),
    path('order/submit/<int:order_id>/', OrderDetailSubmitPage.as_view(), name='orderdetailsubmit'),

    path('product/', ProductPage.as_view(), name='product'),
    path('product/search/', ProductSearch.as_view(), name='productsearch'),
    path('product/filter/<str:category_id>/', ProductFilter.as_view(), name='productfilter'),

    path('product/<int:item_id>/', ProductDetailPage.as_view(), name='productdetail'),

    path('product/add/', ProductAddPage.as_view(), name='productadd'),

    path('product/img/update/<int:img_id>/', ProductImgPage.as_view(), name='productimgUpdate'),
    path('product/img/add/', ProductImgAddPage.as_view(), name='productimgAdd'),
    path('product/img/delete/<int:img_id>/', ProductImgDeletePage.as_view(), name='productimgDelete'),

    path('product/attr/update/<int:attr_id>/', ProductAttributePage.as_view(), name='productattributeUpdate'),
    path('product/attr/add/<int:product_id>/', ProductAttributeAddPage.as_view(), name='productattributeAdd'),
    path('product/attr/delete/<int:attr_id>/', ProductAttributeDeletePage.as_view(), name='productattributeDelete'),

    path('product/attrvalue/update/<int:attrval_id>/', ProductAttributeValueUpdatePage.as_view(), name='productattributevalueUpdate'),
    path('product/attrvalue/add/<int:attr_id>/', ProductAttributeValueAddPage.as_view(), name='productattributevalueAdd'),
    path('product/attrvalue/delete/<int:attrval_id>/', ProductAttributeValueDeletePage.as_view(), name='productattributevalueDelete'),

    path('product/variance/add/', ProductVarianceAddPage.as_view(), name='productvarianceAdd'),
    path('product/variance/edit/<int:variance_id>/', ProductVarianceEditPage.as_view(), name='productvarianceEdit'),
    path('product/variance/delete/<int:variance_id>/', ProductVarianceDeletePage.as_view(), name='productvarianceDelete'),

    path('user/', UserPage.as_view(), name='user'),
    path('user/filter/', UserFilterPage.as_view(), name='userfilter'),
    path('user/<int:user_id>/', UserDetailPage.as_view(), name='userdetail'),
    path('user/delete/<int:user_id>/', UserDeletePage.as_view(), name='userdelete'),

    path('myaccount/', MyAccountPage.as_view(), name='myaccount'),
    path('myaccount/editpassword/', MyAccountEditPasswordPage.as_view(), name='myaccounteditpassword'),
    path('myaccount/deactivate/', MyAccountDeactivatePage.as_view(), name='myaccountdeactivate'),

    path('category/', CategoryPage.as_view(), name='category'),
    path('category/<int:category_id>/', CategoryDetailPage.as_view(), name='categorydetail'),
    path('category/add/', CategoryAddPage.as_view(), name='categoryadd'),
    path('category/delete/<int:category_id>/', CategoryDeletePage.as_view(), name='categorydelete'),

    path('statistics/', StatisticsPage.as_view(), name='statistics'),

    path('FAQ/', FAQPage.as_view(), name='FAQ'),
]
