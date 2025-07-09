from rest_framework.decorators import api_view
from rest_framework.response import Response
from bson import ObjectId, errors
from db_connection import db

def serialize_doc(doc):
    """Convert ObjectId to string for JSON serialization"""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

@api_view(["GET"])
def products(request):
    products = list(db["product"].find())
    for p in products:
        p["_id"] = str(p["_id"])
    return Response(products)

@api_view(["GET"])
def product_detail(request, slug):
    product = db["product"].find_one({"slug": slug})
    if not product:
        return Response({"error": "Product not found"}, status=404)
    product["_id"] = str(product["_id"])
    return Response(product)

@api_view(["POST"])
def add_item(request):
    cart_code = request.data.get("cart_code")
    product_id = request.data.get("product_id")
    print("add_item called with:", cart_code, product_id)

    if not cart_code or not product_id:
        print("Missing cart_code or product_id")
        return Response({"error": "cart_code and product_id are required"}, status=400)

    try:
        product_obj_id = ObjectId(product_id)
    except errors.InvalidId:
        print("Invalid product_id:", product_id)
        return Response({"error": "Invalid product_id"}, status=400)

    cart = db["cart"].find_one({"cart_code": cart_code})
    if not cart:
        cart = {"cart_code": cart_code, "paid": False}
        db["cart"].insert_one(cart)
        print("Created new cart:", cart)

    cartitem = db["cart_item"].find_one({"cart_code": cart_code, "product_id": product_obj_id})
    if cartitem:
        new_quantity = cartitem.get("quantity", 1) + 1
        db["cart_item"].update_one(
            {"_id": cartitem["_id"]},
            {"$set": {"quantity": new_quantity}}
        )
        print("Updated cart_item:", cartitem)
    else:
        db["cart_item"].insert_one({
            "cart_code": cart_code,
            "product_id": product_obj_id,
            "quantity": 1
        })
        print("Inserted new cart_item for:", cart_code, product_obj_id)
    return Response({"message": "Item added to cart successfully"})

@api_view(["GET"])
def products_in_cart(request):
    cart_code = request.query_params.get("cart_code")
    product_id = request.query_params.get("product_id")

    if not cart_code or not product_id:
        return Response({"error": "cart_code and product_id required"}, status=400)

    try:
        product_obj_id = ObjectId(product_id)
    except errors.InvalidId:
        return Response({"error": "Invalid product_id"}, status=400)

    exists = db["cart_item"].count_documents({"cart_code": cart_code, "product_id": product_obj_id}) > 0
    return Response({"exists": exists})

@api_view(["GET"])
def get_cart_stat(request):
    cart_code = request.query_params.get("cart_code")
    if not cart_code:
        return Response({"error": "cart_code is required"}, status=400)

    cart = db["cart"].find_one({"cart_code": cart_code})
    if not cart:
        # Create new unpaid cart if doesn't exist
        cart = {"cart_code": cart_code, "paid": False}
        db["cart"].insert_one(cart)

    cart["_id"] = str(cart["_id"])
    
    # Calculate total quantity and total price
    items_cursor = db["cart_item"].find({"cart_code": cart_code})
    total_quantity = 0
    total_price = 0.0

    for item in items_cursor:
        quantity = item.get("quantity", 0)
        total_quantity += quantity

        # Fetch product price
        try:
            product = db["product"].find_one({"_id": ObjectId(item["product_id"])})
            if product and "price" in product:
                total_price += product["price"] * quantity
        except errors.InvalidId:
            continue

    return Response({
        "cart_code": cart_code,
        "total_items": total_quantity,
        "total_price": total_price,
        "paid": cart.get("paid", False)
    })

@api_view(["GET"])
def get_cart(request):
    cart_code = request.query_params.get("cart_code")
    if not cart_code:
        return Response({"error": "cart_code is required"}, status=400)

    cart = db["cart"].find_one({"cart_code": cart_code, "paid": False})
    if not cart:
        return Response({"error": "Cart not found"}, status=404)

    cart["_id"] = str(cart["_id"])
    items_cursor = db["cart_item"].find({"cart_code": cart_code})
    items = []
    for item in items_cursor:
        item["_id"] = str(item["_id"])
        try:
            product = db["product"].find_one({"_id": ObjectId(item["product_id"])})
            if product:
                product["_id"] = str(product["_id"])
                item["product"] = product
        except errors.InvalidId:
            item["product"] = None
        item["product_id"] = str(item["product_id"])
        items.append(item)

    cart["items"] = items

    return Response(cart)

@api_view(["PATCH"])
def update_quantity(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")
    print("update_quantity called with:", item_id, quantity)

    if not item_id or quantity is None:
        return Response({"error": "item_id and quantity are required"}, status=400)

    try:
        quantity = int(quantity)
        if quantity < 1:
            return Response({"error": "Quantity must be at least 1"}, status=400)
    except ValueError:
        return Response({"error": "Quantity must be an integer"}, status=400)

    try:
        item_obj_id = ObjectId(item_id)
    except errors.InvalidId:
        return Response({"error": "Invalid item_id"}, status=400)

    result = db["cart_item"].update_one(
        {"_id": item_obj_id},
        {"$set": {"quantity": quantity}}
    )
    if result.matched_count == 0:
        return Response({"error": "CartItem not found"}, status=404)

    cartitem = db["cart_item"].find_one({"_id": item_obj_id})
    cartitem["_id"] = str(cartitem["_id"])
    return Response({"data": cartitem, "message": "CartItem updated successfully"})

@api_view(["DELETE"])
def remove_cart_item(request):
    item_id = request.data.get("item_id")
    if not item_id:
        return Response({"error": "item_id is required"}, status=400)
    try:
        item_obj_id = ObjectId(item_id)
    except errors.InvalidId:
        return Response({"error": "Invalid item_id"}, status=400)
    result = db["cart_item"].delete_one({"_id": item_obj_id})
    if result.deleted_count == 0:
        return Response({"error": "CartItem not found"}, status=404)
    return Response({"message": "CartItem removed successfully"})
