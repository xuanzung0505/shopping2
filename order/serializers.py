from rest_framework import serializers
from .models import *
from user.serializers import UserSerializer 
from product.serializers import ItemSerializer

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields=('id','purchaseType','clientName','tel','shippingAddress','detail',
        'totalPrice','status','user','create_at', 'active')
    
    def to_representation(self, instance):
        self.fields['user'] =  UserSerializer(read_only=True)
        return super(OrderSerializer, self).to_representation(instance)

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields=('id','order','item','quantity','totalPrice')
    
    def to_representation(self, instance):
        self.fields['item'] =  ItemSerializer(read_only=True)
        self.fields['order'] =  OrderSerializer(read_only=True)
        return super(OrderItemSerializer, self).to_representation(instance)