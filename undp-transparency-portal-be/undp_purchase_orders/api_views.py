from django.core.exceptions import ObjectDoesNotExist
from django.db.models.aggregates import Sum
from django.db.models.expressions import F
from django.db.models.query_utils import Q
from django.shortcuts import render
from rest_framework.generics import GenericAPIView

from undp_purchase_orders.models import PurchaseOrder
from undp_purchase_orders.serializers import PurchaseOrderSerializer
from utilities.mixins import ResponseViewMixin
from utilities.pagination import CustomOffsetPagination


class PurchaseOrderView(GenericAPIView, ResponseViewMixin):
    queryset = PurchaseOrder.objects.all()
    pagination_class = CustomOffsetPagination

    def get(self, request, *args, **kwargs):
        project_id = request.GET.get('project_id', '')
        year = request.GET.get('year', '')
        if not project_id:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a project ID'])

        query = Q(project_id=project_id)
        if year:
            query.add(Q(order_date__year=year), Q.AND)
        queryset = PurchaseOrder.objects.filter(query).values('ref', 'operating_unit')\
            .annotate(order_amount=Sum('amount'), order_ref=F('ref'))\
            .values('vendor_name', 'project_id', 'order_id', 'order_date',
                    'order_amount', 'order_ref')\
            .order_by('-order_date')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PurchaseOrderSerializer(page, many=True)
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = PurchaseOrderSerializer(queryset, many=True)

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
