from rest_framework import serializers
from .models import Cart, CartItem

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields=('id', 'user', 'create_at', 'updated_at', 'totalPrice')

class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields=('id', 'cart', 'item', 'quantity', 'totalPrice')