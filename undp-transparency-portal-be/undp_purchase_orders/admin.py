from django.contrib import admin

from undp_purchase_orders.models import Vendor, PurchaseOrder


class VendorAdmin(admin.ModelAdmin):
    list_display = ('vendor_id', 'classification_type', 'name')
    search_fields = ('name', 'vendor_id')
    list_filter = ('classification_type',)


class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'project_id', 'output_id', 'vendor_id', 'line_nbr', 'amount', 'order_date')
    search_fields = ('order_id',)
    # list_filter = ('ref',)


admin.site.register(Vendor, VendorAdmin)
admin.site.register(PurchaseOrder, PurchaseOrderAdmin)
