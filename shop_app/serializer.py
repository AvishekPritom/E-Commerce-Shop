from rest_framework import serializers

class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(source='_id', read_only=True)
    name = serializers.CharField()
    slug = serializers.CharField()
    image = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    category = serializers.CharField()
    price = serializers.FloatField()

class DetailProductSerializer(ProductSerializer):
    similar_products = serializers.ListField(child=ProductSerializer(), read_only=True)

class CartItemSerializer(serializers.Serializer):
    id = serializers.CharField(source='_id', read_only=True)
    cart_code = serializers.CharField()
    product = DetailProductSerializer()
    quantity = serializers.IntegerField()
    total = serializers.SerializerMethodField()

    def get_total(self, obj):
        return obj["product"]["price"] * obj["quantity"]

class CartSerializer(serializers.Serializer):
    id = serializers.CharField(source='_id', read_only=True)
    cart_code = serializers.CharField()
    items = CartItemSerializer(many=True)
    sum_total = serializers.SerializerMethodField()
    num_of_items = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()
    modified_at = serializers.DateTimeField()

    def get_sum_total(self, obj):
        return sum(item["product"]["price"] * item["quantity"] for item in obj["items"])

    def get_num_of_items(self, obj):
        return sum(item["quantity"] for item in obj["items"])

class SimpleCartSerializer(serializers.Serializer):
    id = serializers.CharField(source='_id', read_only=True)
    cart_code = serializers.CharField()
    num_of_items = serializers.SerializerMethodField()

    def get_num_of_items(self, obj):
        return sum(item["quantity"] for item in obj.get("items", []))
