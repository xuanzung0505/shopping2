from dataclasses import field
from rest_framework import serializers
from django.contrib.auth.models import User
from user.models import MyUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields=('id', 'username', 'password', 'first_name', 'last_name', 'email', 'date_joined','is_active', 'is_staff', 
        'is_superuser', 'myuser')

    def to_representation(self, instance):
        self.fields['myuser'] = MyUserSerializer(read_only=True)
        return super(UserSerializer,self).to_representation(instance)

class MyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields=('id','email','tel')