from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from.models import Product, Cart, CartItem
from.serializer import ProductSerializer, CartSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(["GET"])
def products(request):
    products =Product.objects.all()
    serializer=ProductSerializer(products,many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not created:
        cart_item.quantity += 1
        cart_item.save()
        
    return Response({"message": "Product added to cart successfully"}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_cart(request):
    cart = get_object_or_404(Cart, user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart = get_object_or_404(Cart, user=request.user)
    cart_item = get_object_or_404(CartItem, cart=cart, product=product)
    cart_item.delete()
    return Response({"message": "Product removed from cart successfully"})