from rest_framework import serializers

from undp_purchase_orders.models import PurchaseOrder, Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    # vendor = VendorSerializer()
    vendor_name = serializers.CharField(required=False)
    description = serializers.CharField(source='order_ref')
    amount = serializers.CharField(source='order_amount')
    order_date = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ('project_id', 'order_id', 'output_id', 'description',
                  'amount', 'order_date', 'vendor_name')

    def get_order_date(self, obj):
        return obj['order_date'].date()
