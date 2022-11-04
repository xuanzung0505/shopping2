from rest_framework import serializers
from .models import *
from core.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields=('id', 'title', 'description', 'active')

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields=('id', 'title', 'description', 'unitPrice', 'totalReview', 'totalStar', 'quantity', 'category', 'imgPath', 
        'active', 'reviews')
    
    def to_representation(self, instance):
        self.fields['reviews'] = ReviewSerializer(read_only=True, many=True)
        return super(ProductSerializer, self).to_representation(instance)

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields=('id', 'title', 'unitPrice', 'quantity', 'product', 'imgPath', 'attrValue','active')
    
    def to_representation(self, instance):
        self.fields['product'] =  ProductSerializer(read_only=True)
        return super(ItemSerializer, self).to_representation(instance)

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields=('id', 'title', 'detail', 'rating', 'user', 'product', 'create_at')
    
    def to_representation(self, instance):
        self.fields['user'] =  UserSerializer(read_only=True)
        return super(ReviewSerializer, self).to_representation(instance)