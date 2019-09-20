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

from master_tables.models import ProjectTimeLine, OperatingUnit, Bureau, Organisation, Sector, Sdg, SdgTargets, \
    SignatureSolution
from undp_extra_features.models import ProjectYearSummary
from undp_extra_features.serializers import DownloadProjectDetailSerializer, \
    OperatingUnitProjectSerializer, OperatingUnitIndexSerializer, BureauIndexSerializer, \
    DonorIndexSerializer, DonorCountryIndexSerializer, FocusAreaIndexSerializer, SdgIndexSerializer, OutputSerializer, \
    MarkerIndexSerializer, SignatureSolutionsIndexSerializer, ProjectDetailListSerializer
from undp_projects.models import Project, ProjectSearch
from undp_outputs.models import Output, ProjectMarker
from undp_donors.models import DonorFundSplitUp
from utilities.config import EXCLUDED_SECTOR_CODES, CSV_UPLOAD_DIR, UPLOAD_DIR
from utilities.mixins import ResponseViewMixin
from utilities.pagination import CustomOffsetPagination
from utilities.utils import process_query_params, check_sdg_year, get_project_full_text_search_query,\
    get_fund_split_many_query


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


class TargetIndexView(ListAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):

        if kwargs.get('pk'):
            sdg = kwargs.get('pk')
            targets = SdgTargets.objects.filter(sdg=sdg).values('target_id', 'description')
            return Response(targets)

        sdgs = Sdg.objects.all()
        response = []
        for sdg in sdgs:
            targets = SdgTargets.objects.filter(sdg=sdg).values('target_id', 'description')
            response.append(targets)

        return Response(response)


class MarkersIndexView(ListAPIView, ResponseViewMixin):
    serializer_class = MarkerIndexSerializer
    queryset = ProjectMarker.objects.distinct('type')


class SignatureSolutionsIndexView(ListAPIView, ResponseViewMixin):
    serializer_class = SignatureSolutionsIndexSerializer
    queryset = SignatureSolution.objects.distinct('ss_id')


class ProjectView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()
    pagination_class = CustomOffsetPagination

    def get(self, request, *args, **kwargs):
        year = process_query_params(request.GET.get('year', None))
        operating_units = process_query_params(request.GET.get('operating_unit', None))
        budget_type = request.GET.get('budget_type', None)
        budget_sources = process_query_params(request.GET.get('budget_source', None))
        sectors = process_query_params(request.GET.get('sector', None))
        sdgs = process_query_params(request.GET.get('sdg', None))
        sdg_targets = process_query_params(request.GET.get('sdg_target', None))
        signature_solution = request.GET.get('signature_solution', '')
        marker_type = request.GET.get('marker_type', '')
        marker_id = request.GET.get('marker_id', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        if not sdgs or (sdgs and check_sdg_year(year)) or (sdgs and not year):
            search_query = get_project_full_text_search_query(year, operating_units, budget_sources,
                                                              sectors, keyword='', sdg_targets=sdg_targets,
                                                              sdgs=sdgs, budget_type=budget_type,
                                                              signature_solution=signature_solution,
                                                              marker_type=marker_type, marker_id=marker_id)
            project_ids = ProjectSearch.objects.filter(search_query).distinct('project_id') \
                .values_list('project_id', flat=True)

            funds_query = get_fund_split_many_query(years=year, budget_sources=budget_sources, budget_type=budget_type,
                                                    operating_units=operating_units)

            funds_mapping = DonorFundSplitUp.objects.filter(funds_query).values_list('id', flat=True)

            queryset = Project.objects.filter(project_id__in=project_ids) \
                .distinct() \
                .values('project_id') \
                .annotate(budget=Coalesce(Sum(Case(When(Q(donorfundsplitup__in=funds_mapping),
                                                        then=F('donorfundsplitup__budget')),
                                                   default=Value(0))), 0),
                          expense=Coalesce(Sum(Case(When(Q(donorfundsplitup__in=funds_mapping),
                                                         then=F('donorfundsplitup__expense')),
                                                    default=Value(0))), 0),
                          title=F('title'), description=F('description'),
                          operating_unit__name=F('operating_unit__name')) \
                .values('title', 'description', 'budget', 'expense', 'operating_unit__name', 'project_id') \
                .order_by('-budget')
        else:
            queryset = []
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ProjectDetailListSerializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = ProjectDetailListSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data, 'draw': ''})
