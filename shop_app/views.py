from django.shortcuts import render
from rest_framework.decorators import api_view
from.models import Product, Cart, CartItem
from.serializer import ProductSerializer, CartItemSerializer, DetailProductSerializer, SimpleCartSerializer, CartSerializer
from rest_framework.response import Response
# Create your views here.

@api_view(["GET"])
def products(request):
    products =Product.objects.all()
    serializer=ProductSerializer(products,many=True)
    return Response(serializer.data)


@api_view(["GET"])
def product_detail(request,slug):
    product = Product.objects.get(slug=slug)
    serializer = ProductSerializer(product)
    return Response(serializer.data)


@api_view(["POST"])
def add_item(request):
    try:
        cart_code = request.data.get('cart_code')
        product_id = request.data.get('product_id')

        cart, created = Cart.objects.get_or_create(cart_code=cart_code)
        product = Product.objects.get(id=product_id)

        cartitem, created = CartItem.objects.get_or_create(cart=cart, product=product)
        cartitem.quantity = 1
        cartitem.save()

        serializer = CartItemSerializer(cartitem)
        return Response({"datat":serializer.data,"message":"Item added to cart successfully"}, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
def products_in_cart(request):
    cart_code = request.query_params.get('cart_code')
    product_id = request.query_params.get('product_id')

    cart= Cart.objects.get(cart_code=cart_code)
    product = Product.objects.get(id=product_id)

    products_exists_in_cart = CartItem.objects.filter(cart=cart, product=product).exists()

    return Response({'exists': products_exists_in_cart}, status=200)

@api_view(["GET"])
def get_cart_stat(request):
    cart_code = request.query_params.get('cart_code')

    if not cart_code:
        return Response({'error': 'cart_code is required'}, status=400)

    try:
        cart = Cart.objects.get(cart_code=cart_code, paid=False)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=404)

    serializer = SimpleCartSerializer(cart)
    return Response(serializer.data)


@api_view(["GET"])
def get_cart(request):  
    cart_code = request.query_params.get('cart_code')
    cart = Cart.objects.get(cart_code=cart_code, paid=False)
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(["PATCH"])
def update_quantity(request):
    try:
        cartitem_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        quantity = int(quantity)
        cartitem = CartItem.objects.get(id=cartitem_id)
        cartitem.quantity = quantity
        cartitem.save()
        serializer = CartItemSerializer(cartitem)
        return Response({"data": serializer.data, "message": "Cartitem updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
