
#fetching all products : http://127.0.0.1:8001/admin/shop_app/product/

from django.urls import path
from.import views

urlpatterns=[
    path("products",views.products,name="products"),
    path('products/<int:product_id>/add_to_cart/', views.add_to_cart, name='add_to_cart'),
    path('cart/', views.view_cart, name='view_cart'),
    path('cart/remove/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),
]