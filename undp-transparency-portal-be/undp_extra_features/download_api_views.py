import json

from django.core.exceptions import ObjectDoesNotExist
from django.db.models.aggregates import Sum, Count
from django.db.models.expressions import F, Value, Case, When
from django.db.models.fields import IntegerField, CharField
from django.db.models.functions.base import Coalesce
from django.db.models.query_utils import Q
from django.http.response import HttpResponse
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from master_tables.models import ProjectTimeLine, OperatingUnit, Bureau, Organisation, Sector, Sdg
from undp_extra_features.models import ProjectYearSummary
from undp_extra_features.serializers import DownloadProjectDetailSerializer, \
    OperatingUnitProjectSerializer, OperatingUnitIndexSerializer, BureauIndexSerializer, \
    DonorIndexSerializer, DonorCountryIndexSerializer, FocusAreaIndexSerializer, SdgIndexSerializer, OutputSerializer
from undp_projects.models import Project
from undp_outputs.models import Output
from utilities.config import EXCLUDED_SECTOR_CODES, CSV_UPLOAD_DIR, UPLOAD_DIR
from utilities.mixins import ResponseViewMixin


class ProjectDetailsView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])

        serializer = DownloadProjectDetailSerializer(project)
        return Response(serializer.data)


class ProjectYearSummaryView(GenericAPIView, ResponseViewMixin):
    queryset = ProjectTimeLine.objects.filter(is_active=True)
    lookup_field = 'year'

    def get(self, request, *args, **kwargs):
        try:
            year = self.get_object().year
        except Exception as e:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a valid year'])

        try:
            summary = ProjectYearSummary.objects.get(year=year).summary
            return Response(summary)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Details not found'])


class OperatingUnitDataView(GenericAPIView, ResponseViewMixin):
    queryset = OperatingUnit.objects.filter(is_recipient=True)

    def get(self, request, *args, **kwargs):
        try:
            operating_unit = self.get_object()
        except Exception as e:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Operating unit not found'])

        try:
            projects = Project.objects.filter(operating_unit=operating_unit)
            serializer = OperatingUnitProjectSerializer(projects, many=True)
            result = {
                'op_unit': operating_unit.iso3,
                'iso_num': operating_unit.iso_num,
                'projects': serializer.data
            }
            return Response(result)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Details not found'])


class OperatingUnitIndexView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):

        try:
            operating_units = OperatingUnit.objects.filter(is_recipient=True, area_type='country')\
                .annotate(project_count=Count('project', distinct=True),
                          funding_sources_count=Count('project__donorfundsplitup__organisation', distinct=True),
                          budget_sum=Sum('project__donorfundsplitup__budget'),
                          expenditure_sum=Sum('project__donorfundsplitup__expense'))
            serializer = OperatingUnitIndexSerializer(operating_units, many=True)

            return Response(serializer.data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Details not found'])


class RegionIndexView(ListAPIView, ResponseViewMixin):
    serializer_class = BureauIndexSerializer
    queryset = Bureau.objects.all()


class DonorIndexView(ListAPIView, ResponseViewMixin):
    serializer_class = DonorIndexSerializer
    queryset = Organisation.objects.all()


class DonorCountryIndexView(ListAPIView, ResponseViewMixin):
    serializer_class = DonorCountryIndexSerializer
    queryset = Organisation.objects.filter(Q(type_level_3__isnull=False) & ~Q(type_level_3=''))\
        .values('type_level_3', 'level_3_name').annotate(Count('ref_id'))


class sdgIndexView(ListAPIView, ResponseViewMixin):
    serializer_class = SdgIndexSerializer
    queryset = Sdg.objects.all()


class FocusAreaIndexView(APIView, ResponseViewMixin):
    serializer_class = FocusAreaIndexSerializer

    def get(self, request, *args, **kwargs):
        file_path = CSV_UPLOAD_DIR + '/static/focus-area-index.json'
        data = json.load(open(file_path))
        return Response(data)


class CrsIndexView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        file_path = CSV_UPLOAD_DIR + '/static/crs-index.json'
        data = json.load(open(file_path))
        return Response(data)


class SubLocationIndexView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        file_path = CSV_UPLOAD_DIR + '/static/sublocation-national-index.json'
        data = json.load(open(file_path))
        return Response(data)


class ZipFileDownloadView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        file_path = UPLOAD_DIR + '/undp-project-data.zip'
        zip_file = open(file_path, 'rb')
        response = HttpResponse(zip_file, content_type='application/force-download')
        # response = HttpResponse(zip_file, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="%s"' % 'undp-project-data.zip'
        return response


class OutputDetailsView(GenericAPIView, ResponseViewMixin):
    queryset = Output.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            output = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])

        serializer = OutputSerializer(output)
        return Response(serializer.data)

