from django.conf.urls import url

from undp_extra_features.api_views import EmbedGlobalView, EmbedProjectDetailsView, EmbedProjectView, ExportAsPDFView, \
    ExportAsCSVView, ExportAsTemplateView, ExportProjectAsCSVView, ExportDownloadPDFView, ExportAsDonorsCSVView

urlpatterns = [
    url(r'^embed/global', EmbedGlobalView.as_view(), name='embed-global'),
    url(r'^embed/projectdetails/(?P<pk>\w+)/$', EmbedProjectDetailsView.as_view(), name='embed-project-details'),
    url(r'^embed/projectlist', EmbedProjectView.as_view(), name='embed-project'),
    url(r'^export_html/', ExportAsTemplateView.as_view(), name='export-html'),
    url(r'^export_pdf/', ExportAsPDFView.as_view(), name='export-pdf'),
    url(r'^export_csv/projectdetails/', ExportProjectAsCSVView.as_view(), name='export-project-csv'),
    url(r'^export_csv/', ExportAsCSVView.as_view(), name='export-csv'),
    url(r'^export_donors_csv/', ExportAsDonorsCSVView.as_view(), name='export-donors-csv'),
    url(r'^export_download_pdf/', ExportDownloadPDFView.as_view(), name='export-download-pdf'),

    # url(r'^embed/recipient/(?P<pk>\w+)/$', EmbedRecipientProfileView.as_view(), name='embed-recipient-profile'),
    # url(r'^embed/donor/(?P<pk>\w+)/$', EmbedDonorProfileView.as_view(), name='embed-donor-profile'),

]
