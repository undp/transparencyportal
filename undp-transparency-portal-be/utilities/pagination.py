from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination

from utilities.mixins import ResponseViewMixin


class CustomPagesizePagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    page_query_param = 'page'
    max_page_size = 1000


class CustomOffsetPagination(LimitOffsetPagination, ResponseViewMixin):
    default_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 1000

    def get_paginated_response(self, data):
        return self.jp_response(
            s_code='HTTP_200_OK',
            data={
                'data': data,
                'links': {
                   'next': self.get_next_link(),
                   'previous': self.get_previous_link()
                }, 'count': self.count,
            }
        )


class ProjectSearchPagination(LimitOffsetPagination, ResponseViewMixin):
    default_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 1000

    def get_paginated_response(self, data):
        return self.jp_response(
            s_code='HTTP_200_OK',
            data={
                'data': data,
                'draw': self.request.GET.get('draw', ''),
                'links': {
                   'next': self.get_next_link(),
                   'previous': self.get_previous_link()
                }, 'count': self.count,
            }
        )
