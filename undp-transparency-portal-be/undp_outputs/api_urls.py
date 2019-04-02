from undp_outputs.api_views import OutputDetailView, OutputViewSet, OutputResultsView, MarkersDetailView, \
    MarkersAggregateView, OutputMarkerView, MarkersGraphView, MarkerProjectViewSet, MarkerFlagsView, FlightMapView, \
    MarkerLevelOneView, PartnerMarkerView, PartnerMarkerDescriptionView, LevelTwoMarkerView

from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
# router.register(r'details', OutputViewSet)
output_list = OutputViewSet.as_view({'get': 'list'})
output_detail = OutputViewSet.as_view({'get': 'retrieve'})
marker_project_list = MarkerProjectViewSet.as_view({'get': 'list'})

urlpatterns = [
    url(r'^list', output_list, name='output-list'),
    url(r'^details/(?P<pk>\w+)', output_detail, name='output-details'),
    url(r'^marker_details/', MarkersDetailView.as_view(), name='marker-type-details'),
    url(r'^marker_aggregate/(?P<pk>\w+)', MarkersAggregateView.as_view(), name='marker_aggregate'),
    url(r'^(?P<pk>\w+)/results', OutputResultsView.as_view(), name='output-results'),
    url(r'^markers/(?P<pk>\w+)', OutputMarkerView.as_view()),
    url(r'^marker/details', MarkersGraphView.as_view()),
    url(r'^project_list', marker_project_list, name='marker-project-list'),
    url(r'^marker_description', MarkerFlagsView.as_view()),
    url(r'^flight_map', FlightMapView.as_view()),
    url(r'^marker_dropdown/(?P<pk>\w+)', MarkerLevelOneView.as_view()),
    url(r'^partner_marker', PartnerMarkerView.as_view()),
    url(r'^partner_description', PartnerMarkerDescriptionView.as_view()),
    url(r'^level_two_dropdown', LevelTwoMarkerView.as_view())
]
