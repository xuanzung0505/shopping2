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

app_name = 'shopping'

urlpatterns = [   
    path('', IndexPage.as_view(), name='index'),
    path('login/', LoginPage.as_view(), name='login'),
    path('logout/', LogoutPage.as_view(), name='logout'),
    path('register/', RegisterPage.as_view(), name='register'),

    path('catalog/', CatalogPage.as_view(), name='catalog'),
    path('catalog/search/', CatalogSearch.as_view(), name='catalogsearch'),
    # path('catalog/search/All/', views.catalogSearchAll.as_view(), name='catalogsearchall'),
    path('catalog/filter/<str:category_id>/', CatalogFilter.as_view(), name='catalogfilter'),

    path('detail/<int:item_id>/', ItemDetailPage.as_view(), name='itemdetail'),
    path('detail/add/<int:variance_id>/', AddToCart.as_view(), name='addtocart'),
    
    path('cart/', CartPage.as_view(), name='cartpage'),
    path('cart/delete/<str:id>/', CartItemDelete.as_view(), name='cartdeletepage'),
    path('cart/quantityChange/<str:id>/<str:quantity>/', CartItemQuantityChange.as_view(), name='cartquantitypage'),

    path('checkout/',CheckoutPage.as_view(), name='checkout'),
    # path('success/',SuccessPage.as_view(), name='success'),
    
    path('order/', OrderPage.as_view(), name='order'),
    path('order/filter/', OrderFilterPage.as_view(), name='orderfilter'),
    path('order/<int:order_id>/', OrderDetailPage.as_view(), name='orderdetail'),
    path('order/abort/<int:order_id>/', OrderAbortPage.as_view(), name='orderabort'),

    path('review/<int:product_id>/', ReviewPage.as_view(), name='review'),
    path('review/<int:product_id>/', ReviewPage.as_view(), name='review'),

    path('myaccount/', MyAccountPage.as_view(), name='myaccount'),
    path('myaccount/editpassword/', MyAccountEditPasswordPage.as_view(), name='myaccounteditpassword'),
    path('myaccount/deactivate/', MyAccountDeactivatePage.as_view(), name='myaccountdeactivate'),
    
    path('FAQ/', FAQPage.as_view(), name='FAQ'),
]
