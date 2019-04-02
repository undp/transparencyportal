from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from undp_projects.api_views import SectorAggregateView, ProjectViewSet, \
    RecipientProfileView, MapLocationsView, RecipientThemeDetailsView, \
    ProjectSearchView, CountryResultsView, ProjectAggregateView, \
    RecipientDocumentsView, ProjectBudgetUtilizationView, ProjectBudgetSourcesView, ProjectDocumentsView, \
    RecipientThemeBudgetVsExpenseView, ProjectTimeLineView, SectorDetailsView, GlobalThemesView, \
    SdgAggregateView, RecipientSdgBudgetVsExpenseView, RecipientSdgDetailsView, SdgDetailsView, ProjectPicturesView, \
    ProjectSearchFullTextView, SignatureSolutionsAggregateView, SignatureSolutionsDetailsView, \
    SignatureSolutionsOutcomeView, SectorSignatureSolutionView, SdgTargetDetailView, SdgTargetView, SdgView, \
    SectorView, MapLocationsNewView

router = DefaultRouter()
# router.register(r'', ProjectViewSet)
project_list = ProjectViewSet.as_view({'get': 'list'})
project_detail = ProjectViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    url(r'^list', project_list, name='project-list'),
    url(r'^details/(?P<pk>\w+)', project_detail, name='project-details'),
    url(r'^sector_aggregate', SectorAggregateView.as_view()),
    url(r'^sdg_aggregate', SdgAggregateView.as_view()),
    url(r'^project_aggregate', ProjectAggregateView.as_view()),
    url(r'^recipient_profile/(?P<pk>\w+)/theme/budget_vs_expense', RecipientThemeBudgetVsExpenseView.as_view()),
    url(r'^recipient_profile/(?P<pk>\w+)/sdg/budget_vs_expense', RecipientSdgBudgetVsExpenseView.as_view()),
    url(r'^recipient_profile/(?P<pk>\w+)/theme', RecipientThemeDetailsView.as_view()),
    url(r'^recipient_profile/(?P<pk>\w+)/sdg', RecipientSdgDetailsView.as_view()),
    url(r'^recipient_profile/(?P<pk>\w+)/documents', RecipientDocumentsView.as_view()),
    url(r'^recipient_profile/(?P<pk>\w+)/$', RecipientProfileView.as_view()),
    url(r'^map_old$', MapLocationsView.as_view()),
    url(r'^map$', MapLocationsNewView.as_view()),
    url(r'^search/$', ProjectSearchView.as_view()),
    url(r'^search_full_text/$', ProjectSearchFullTextView.as_view()),
    url(r'^country_result/$', CountryResultsView.as_view()),

    url(r'^(?P<pk>\w+)/budget_utilization', ProjectBudgetUtilizationView.as_view()),
    url(r'^(?P<pk>\w+)/budget_sources', ProjectBudgetSourcesView.as_view()),
    url(r'^(?P<pk>\w+)/documents', ProjectDocumentsView.as_view()),
    url(r'^(?P<pk>\w+)/pictures', ProjectPicturesView.as_view()),
    url(r'^(?P<pk>\w+)/timeline', ProjectTimeLineView.as_view()),
    # url(r'^', include(router.urls)),

    url(r'^details', SectorDetailsView.as_view()),
    url(r'^sdg/details', SdgDetailsView.as_view()),
    url(r'^themes', GlobalThemesView.as_view()),

    url(r'^signature_solutions_aggregate', SignatureSolutionsAggregateView.as_view()),
    url(r'^signature_solutions/(?P<pk>\w+)/details', SignatureSolutionsDetailsView.as_view()),
    url(r'^signature_solutions/(?P<pk>\w+)/outcomes', SignatureSolutionsOutcomeView.as_view()),
    url(r'^sector/(?P<pk>\w+)/signature_solution', SectorSignatureSolutionView.as_view()),
    url(r'^sdg_target/details', SdgTargetDetailView.as_view()),
    url(r'^sdg_target', SdgTargetView.as_view()),
    url(r'^sdg', SdgView.as_view()),
    url(r'^sector_list', SectorView.as_view())
]
