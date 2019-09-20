from django.conf.urls import url, include

from undp_extra_features.download_api_views import ProjectDetailsView, ProjectYearSummaryView, OperatingUnitDataView, \
    OperatingUnitIndexView, RegionIndexView, DonorIndexView, DonorCountryIndexView, \
    FocusAreaIndexView, CrsIndexView, SubLocationIndexView, ZipFileDownloadView, sdgIndexView, OutputDetailsView, \
    TargetIndexView, MarkersIndexView, SignatureSolutionsIndexView, ProjectView
urlpatterns = [
    url(r'^projects/(?P<pk>\w+).json', ProjectDetailsView.as_view(), name='download-project-details'),
    url(r'^project_summary_(?P<year>\w+).json', ProjectYearSummaryView.as_view(), name='download-project-year-summary'),
    url(r'^units/(?P<pk>\w+).json', OperatingUnitDataView.as_view(), name='download-operating-unit-data'),
    url(r'^units/operating-unit-index.json', OperatingUnitIndexView.as_view(), name='download-operating-unit-index'),
    url(r'^region-index.json', RegionIndexView.as_view(), name='region-index'),
    url(r'^donor-index.json', DonorIndexView.as_view(), name='donor-index'),
    url(r'^donor-country-index.json', DonorCountryIndexView.as_view(), name='donor-country-index'),
    url(r'^focus-area-index.json', FocusAreaIndexView.as_view(), name='focus-area-index'),
    url(r'^sdg-index.json', sdgIndexView.as_view(), name='sdg-index'),
    url(r'^crs-index.json', CrsIndexView.as_view(), name='crs-index'),
    url(r'^sub-location-index.json', SubLocationIndexView.as_view(), name='sub-location-index'),
    url(r'^download/undp-project-data.zip', ZipFileDownloadView.as_view(), name='zip-file-dowload'),
    url(r'^outputs/(?P<pk>\w+).json', OutputDetailsView.as_view(), name='download-output-details'),
    url(r'^target-index/(?P<pk>\w+).json', TargetIndexView.as_view(), name='target-index'),
    url(r'^target-index.json', TargetIndexView.as_view(), name='target-index'),
    url(r'^our-approaches-index.json', MarkersIndexView.as_view(), name='our-approaches-index'),
    url(r'^signature-solutions-index.json', SignatureSolutionsIndexView.as_view(), name='signature-solutions-index'),
    url(r'^project_list/', ProjectView.as_view(), name='download-project-list')
]
