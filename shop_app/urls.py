from django.urls import path
from.import views

urlpatterns=[
    path("products/",views.products,name="products"),
    path("product_detail/<slug:slug>/",views.product_detail,name="product_detail"),
    path("add_item/",views.add_item,name="add_item"),
    path("products_in_cart/",views.products_in_cart,name="products_in_cart"),
    path("get_cart_stat/",views.get_cart_stat,name="get_cart_stat"),
    path("get_cart/",views.get_cart,name="get_cart"),
    path("update_quantity/",views.update_quantity,name="update_quantity"),
    path("remove_cart_item/", views.remove_cart_item, name="remove_cart_item"),

]

#fetching all products : http://127.0.0.1:8001/admin/shop_app/product/
