from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from undp_admin.api_views import AboutUsViewSet, LastUpdatedView

router = DefaultRouter()
# router.register(r'details', OutputViewSet)
about_us_list = AboutUsViewSet.as_view({'get': 'list'})
about_us_detail = AboutUsViewSet.as_view({'get': 'retrieve'})


urlpatterns = [
    url(r'^last_modified', LastUpdatedView.as_view()),
    url(r'^list', about_us_list, name='about-us-list'),
    url(r'^details/(?P<pk>\w+)', about_us_detail, name='about-us-details'),

]
