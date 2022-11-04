from email.policy import default
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class MyUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique = True)
    tel = models.CharField(default='', max_length=255)
    email = models.CharField(default='', max_length=255, unique = True)
    imgPath = models.CharField(default='', max_length=255)