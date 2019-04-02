from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from undp_admin.models import AboutUs, AdminLog, JOBS, LOG_STATUSES
from undp_admin.serializers import AboutUsSerializer
from utilities.mixins import ResponseViewMixin
from utilities.pagination import CustomOffsetPagination
from utilities.utils import get_last_updated_date, last_day_of_month


class AboutUsViewSet(GenericViewSet, ResponseViewMixin):
    queryset = AboutUs.objects.filter()
    serializer_class = AboutUsSerializer
    pagination_class = CustomOffsetPagination

    def retrieve(self, request, *args, **kwargs):
        """
            Retrieve About Us.
        """
        try:
            instance = self.get_object()
        except Exception as e:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY', [str(e)])
        serializer = self.serializer_class(instance, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data})

    def list(self, request, *args, **kwargs):
        """
            List About Us.
        """
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.order_by('-id')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data})


class LastUpdatedView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        # executed_date = get_last_updated_date()
        executed_date = last_day_of_month()
        return self.jp_response(s_code='HTTP_200_OK', data={'last_updated_date': executed_date})
