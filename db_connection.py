import pymongo

from pymongo import MongoClient

url = 'mongodb://localhost:27017'
client = pymongo.MongoClient(url)

db = client['shopit_db']

products = [
    {
        "name": "Sample Laptop",
        "slug": "sample-laptop",
        "price": 1200,
        "image": "/img/Laptop.png",
        "description": "A high-quality sample laptop."
    },
    {
        "name": "Rolex Watch",
        "slug": "rolex-watch",
        "price": 5000,
        "image": "/img/rolexwatch_FLUFlPz.jpg",
        "description": "A luxury Rolex watch."
    }
]

# Insert products
db["product"].insert_many(products)
print("Sample products inserted!")