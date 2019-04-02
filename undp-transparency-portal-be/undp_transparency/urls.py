"""undp_transparency URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from rest_framework_swagger.views import get_swagger_view
from undp_transparency.admin import undp_admin
from django.conf.urls.static import static

schema_view = get_swagger_view(title='Pastebin API')


urlpatterns = [
    url(r'^undp-admin/', undp_admin.urls),
    url(r'^admin/', admin.site.urls),
    url(r'^api/v1/project/', include('undp_projects.api_urls')),
    url(r'^api/v1/sector/', include('undp_projects.api_urls')),
    url(r'^api/v1/global/', include('undp_projects.api_urls')),
    url(r'^api/v1/output/', include('undp_outputs.api_urls')),
    url(r'^api/v1/donor/', include('undp_donors.api_urls')),
    url(r'^api/v1/master/', include('master_tables.api_urls')),
    # url(r'^sw$', schema_view),
    url(r'^api/v1/purchase_order/', include('undp_purchase_orders.api_urls')),
    url(r'^api/v1/undp/', include('undp_extra_features.api_urls')),
    url(r'^api/v1/about_us/', include('undp_admin.api_urls')),
    url(r'^api/v1/admin_log/', include('undp_admin.api_urls')),
    url(r'^api/', include('undp_extra_features.download_api_urls')),
]

if settings.DEBUG is True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
