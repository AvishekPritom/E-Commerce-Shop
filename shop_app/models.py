from bson import ObjectId
from slugify import slugify
from datetime import datetime
from db_connection import db


# PRODUCTS

def generate_unique_slug(name):
    base_slug = slugify(name)
    slug = base_slug
    count = 1
    while db.product.find_one({"slug": slug}):
        slug = f"{base_slug}-{count}"
        count += 1
    return slug

def create_product(data):
    # data = dict with keys: name, image, description, category, price
    slug = generate_unique_slug(data["name"])
    product = {
        "name": data["name"],
        "slug": slug,
        "image": data.get("image", ""),
        "description": data.get("description", ""),
        "category": data.get("category", ""),
        "price": float(data["price"])
    }
    result = db.product.insert_one(product)
    product["_id"] = str(result.inserted_id)
    return product

def get_all_products():
    products = list(db.product.find())
    for p in products:
        p["_id"] = str(p["_id"])
    return products

def get_product_by_slug(slug):
    product = db.product.find_one({"slug": slug})
    if product:
        product["_id"] = str(product["_id"])
    return product


# CARTS

def get_cart(cart_code):
    return db.cart.find_one({"cart_code": cart_code})

def create_cart(cart_code, user_id=None):
    cart = {
        "cart_code": cart_code,
        "user_id": user_id,
        "paid": False,
        "created_at": datetime.utcnow(),
        "modified_at": datetime.utcnow()
    }
    result = db.cart.insert_one(cart)
    cart["_id"] = str(result.inserted_id)
    return cart

def update_cart_modified_at(cart_code):
    db.cart.update_one(
        {"cart_code": cart_code},
        {"$set": {"modified_at": datetime.utcnow()}}
    )


# CART ITEMS

def get_cart_item(cart_code, product_id):
    return db.cart_item.find_one({"cart_code": cart_code, "product_id": ObjectId(product_id)})

def add_or_update_cart_item(cart_code, product_id, quantity=1):
    existing_item = get_cart_item(cart_code, product_id)
    if existing_item:
        new_qty = existing_item.get("quantity", 1) + quantity
        db.cart_item.update_one(
            {"_id": existing_item["_id"]},
            {"$set": {"quantity": new_qty}}
        )
        existing_item["quantity"] = new_qty
        existing_item["_id"] = str(existing_item["_id"])
        return existing_item
    else:
        cart_item = {
            "cart_code": cart_code,
            "product_id": ObjectId(product_id),
            "quantity": quantity
        }
        result = db.cart_item.insert_one(cart_item)
        cart_item["_id"] = str(result.inserted_id)
        return cart_item

def update_cart_item_quantity(item_id, quantity):
    result = db.cart_item.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"quantity": quantity}}
    )
    return result.matched_count > 0

def get_cart_items(cart_code):
    items = list(db.cart_item.find({"cart_code": cart_code}))
    for item in items:
        item["_id"] = str(item["_id"])
        # Add product details
        product = db.product.find_one({"_id": item["product_id"]})
        if product:
            product["_id"] = str(product["_id"])
            item["product"] = product
        item["product_id"] = str(item["product_id"])
    return items
