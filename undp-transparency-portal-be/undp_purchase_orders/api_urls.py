from django.conf.urls import url, include

from undp_purchase_orders.api_views import PurchaseOrderView

urlpatterns = [
    url(r'^list', PurchaseOrderView.as_view(), name='purchase-order-list'),
]
