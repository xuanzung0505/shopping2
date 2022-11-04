from django.db import models
from product.models import Item
from django.contrib.auth.models import User
# Create your models here.

class Order(models.Model):
    purchaseType = models.CharField(default='COD', max_length=255)
    clientName = models.CharField(default='', max_length=255)
    tel = models.CharField(default='', max_length=255)
    shippingAddress = models.CharField(default='', max_length=255)
    detail = models.CharField(default='', max_length=255)
    totalPrice = models.FloatField(default=0)
    status = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    create_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

class RequestSupport(models.Model):
    order = models.ForeignKey(Order,on_delete=models.CASCADE)
    detail = models.CharField(default='', max_length=255)
    finish = models.BooleanField(default=False)

class OrderItem(models.Model):
    order = models.ForeignKey(Order,on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    totalPrice = models.FloatField(default=0)
