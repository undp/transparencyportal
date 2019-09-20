from master_tables.api_views import RegionListView, OrganisationListView, SectorListView, CountryListView, \
    OperatingUnitView, ProjectTimeLineListView, BudgetSourceView, DonorTypesView, FundStreamsView, \
    DocumentCategoryView, CountryRegionsView, SdgListView, DonorsView, BureauListView
from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^region', RegionListView.as_view(), name='region-list'),
    url(r'^bureau', BureauListView.as_view(), name='bureau-list'),
    url(r'^country_regions', CountryRegionsView.as_view(), name='country-region-list'),
    url(r'^country', CountryListView.as_view(), name='country-list'),
    url(r'^organisation', OrganisationListView.as_view(), name='organisation-list'),
    url(r'^sector', SectorListView.as_view(), name='sector-list'),
    url(r'^sdg', SdgListView.as_view(), name='sdg-list'),
    url(r'^operating_units', OperatingUnitView.as_view(), name='operating-unit'),
    url(r'^budget_sources', BudgetSourceView.as_view(), name='budget-sources'),
    url(r'^donors', DonorsView.as_view(), name='donors'),
    url(r'^project_time_line', ProjectTimeLineListView.as_view(), name='project-time-line'),
    url(r'^donor_types', DonorTypesView.as_view(), name='donor-types'),
    url(r'^fund_streams', FundStreamsView.as_view(), name='fund-streams'),
    url(r'^document_categories', DocumentCategoryView.as_view(), name='document-category'),
]
