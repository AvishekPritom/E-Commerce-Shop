from rest_framework import serializers
from.models import Product, Cart, CartItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta :
        model= Product
        fields=["id","name","slug","image","description","category","price"]

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    class Meta:
        model = CartItem
        fields = ["product", "quantity"]

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(source='cartitem_set', many=True)
    class Meta:
        model = Cart
        fields = ["id", "user", "items"]