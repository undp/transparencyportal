import json
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.aggregates import Sum, Count
from django.db.models.expressions import F, When, Case, Value
from django.db.models.fields import IntegerField, FloatField, DecimalField

from django.db.models.functions.base import Substr, Coalesce
from django.db.models.functions.datetime import ExtractYear
from django.db.models.query_utils import Q
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from master_tables.models import Sector, OperatingUnit, ProjectTimeLine, Sdg, SignatureSolution, SdgTargets
from undp_donors.models import DonorFundSplitUp
from undp_outputs.models import OutputLocation, ActivityDate, OutputTarget, SDGChartColor, OutputSector, Output, \
    ProjectMarker
from undp_projects.models import Project, CountryResultPeriod, \
    ProjectDocument, CountryDocument, ProjectSearch, ProjectActivityDate, SDGSunburst, SDGMap
from master_tables.serializers import SectorSerializer
from undp_projects.serializers import SectorAggregateSerializer, ProjectAggregateSerializer, ProjectDetailSerializer, \
    ProjectSearchSerializer, MapDetailsSerializer, CountryResultPeriodSerializer, \
    ProjectDocumentSerializer, RecipientThemeBudgetSerializer, \
    RecipientThemeBudgetvsExpenseSerializer, ProjectBudgetSourceSerializer, SectorBudgetSourcesSerializer, \
    SectorOperatingUnitSerializer, CountryDocumentSerializer, ProjectListSerializer, SdgAggregateSerializer, \
    RecipientSdgBudgetvsExpenseSerializer, RecipientSdgBudgetSerializer, SdgOperatingUnitSerializer, \
    SdgBudgetSourcesSerializer, SignatureSolutionsAggregateSerializer, SignatureSolutionOperatingUnitSerializer, \
    SignatureSolutionOutcomeSerializer, SectorSignatureSolutionSerializer, SdgTargetSerializer, MapDetailsSdgSerializer

from utilities.config import EXCLUDED_SECTOR_CODES, DEFAULT_SECTOR_CODE, UNDP_DONOR_ID, NULL_SECTOR_COLOR_CODE, \
    SDG_START_YEAR, SP_START_YEAR, SP_END_YEAR, NEW_SECTOR_CODES, OLD_SECTOR_CODES, SDG_TARGET_COLORS,  \
    TRUE_VALUES, SDG_TARGET_SUB_COLORS
from utilities.mixins import ResponseViewMixin
from utilities.pagination import CustomOffsetPagination, ProjectSearchPagination
from utilities.utils import get_active_projects_for_year, get_recipient_theme_details, process_query_params, \
    get_sector_aggregate, get_project_aggregate, get_recipient_theme_budget_vs_expense, \
    get_project_search_query, get_global_theme_details, get_sdg_aggregate, get_recipient_sdg_budget_vs_expense, \
    get_recipient_sdg_details, get_project_full_text_search_query, get_fund_split_query, get_fund_split_many_query, \
    check_sdg_year, get_signature_solutions_aggregate, get_project_query, get_sdg_target_aggregate, get_valid_sectors, \
    get_target_aggregate, get_target_aggregate_new, get_sdg_sunburst
from django.core.cache import cache
from utilities import config as settings


class SectorAggregateView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        """
            Sector aggregate details get
        """
        try:
            year = request.GET.get('year', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])

            active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                           budget_source=budget_source)
            sector_mapping = []
            EXCLUDED_SECTOR_CODES.append('8')
            if SP_START_YEAR <= int(year) <= SP_END_YEAR:
                other_sector_query = Q(code__in=EXCLUDED_SECTOR_CODES) | Q(code__isnull=True) | \
                                     Q(code__in=OLD_SECTOR_CODES)
            else:
                other_sector_query = Q(code__in=EXCLUDED_SECTOR_CODES) | Q(code__isnull=True) | \
                                     Q(code__in=NEW_SECTOR_CODES)

            for sector in Sector.objects.exclude(other_sector_query):
                aggregate = get_sector_aggregate(year, active_projects,
                                                 sector=sector, operating_unit=operating_unit,
                                                 budget_source=budget_source)
                if aggregate['percentage']:
                    sector_mapping.append(aggregate)

            sector_mapping = sorted(sector_mapping, key=lambda sector: sector['percentage'], reverse=True)
            other_aggregate = get_sector_aggregate(year, active_projects,
                                                   sector=None, operating_unit=operating_unit,
                                                   budget_source=budget_source)
            project_mapping = get_project_aggregate(year, active_projects,
                                                    operating_unit=operating_unit,
                                                    budget_source=budget_source)
            project_serializer = ProjectAggregateSerializer(project_mapping)

            total_percentage = sum(sector['percentage'] for sector in sector_mapping)
            total_budget = sum(sector['budget'] for sector in sector_mapping)
            total_expense = sum(sector['expense'] for sector in sector_mapping)
            other_aggregate['percentage'] = 100 - total_percentage
            other_aggregate['budget'] = project_serializer.data['budget'] - total_budget
            other_aggregate['expense'] = project_serializer.data['expense'] - total_expense
            if other_aggregate['percentage'] != 0:
                sector_mapping.append(other_aggregate)

            sector_serializer = SectorAggregateSerializer(sector_mapping, many=True)
            data = {
                'project': project_serializer.data,


                'sector': sector_serializer.data,
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class ProjectAggregateView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        """
            Sector aggregate details get
        """
        try:
            year = request.GET.get('year', '')
            operating_unit = request.GET.get('operating_unit', '')
            sector = request.GET.get('sector', '')
            sdg = request.GET.get('sdg', '')
            budget_source = request.GET.get('budget_source', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])

            active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                           budget_source=budget_source)

            project_mapping = get_project_aggregate(year, active_projects,
                                                    operating_unit=operating_unit,
                                                    budget_source=budget_source,
                                                    sector=sector, sdg=sdg)
            project_serializer = ProjectAggregateSerializer(project_mapping)
            return self.jp_response(s_code='HTTP_200_OK', data=project_serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class ProjectViewSet(GenericViewSet, ResponseViewMixin):
    queryset = Project.objects.all()
    pagination_class = CustomOffsetPagination
    serializer_class = ProjectDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """
        Project details
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])

        else:
            year = request.GET.get('year', '')
            project_details = self.get_serializer(project, context={'request': request, 'year': year})

        return self.jp_response(s_code='HTTP_200_OK', data=project_details.data)

    def list(self, request, *args, **kwargs):
        year = process_query_params(request.GET.get('year', None))
        operating_units = process_query_params(request.GET.get('operating_units', None))
        budget_type = request.GET.get('budget_type', None)
        budget_sources = process_query_params(request.GET.get('budget_sources', None))
        sectors = process_query_params(request.GET.get('sectors', None))
        sdgs = process_query_params(request.GET.get('sdgs', None))
        sdg_targets = process_query_params(request.GET.get('sdg_targets', None))
        signature_solution = request.GET.get('signature_solution', '')
        category = request.GET.get('category')
        keyword = request.GET.get('keyword')
        draw = request.GET.get('draw')
        if not sdgs or (sdgs and check_sdg_year(year)) or (sdgs and not year):

            search_query = get_project_full_text_search_query(year, operating_units, budget_sources,
                                                              sectors, keyword, sdg_targets=sdg_targets,
                                                              category=category, sdgs=sdgs, budget_type=budget_type,
                                                              signature_solution=signature_solution)
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
            serializer = ProjectListSerializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = ProjectListSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data, 'draw': draw})


class ProjectBudgetUtilizationView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])
        else:
            budget = DonorFundSplitUp.objects.filter(project=project)\
                .values('year').annotate(budget=Sum('budget')).order_by('year')
            expense = DonorFundSplitUp.objects.filter(project=project)\
                .values('year').annotate(expense=Sum('expense')).order_by('year')
            budget_utilization = {
                'budget_data': budget,
                'expense_data': expense
            }
            return self.jp_response(s_code='HTTP_200_OK', data=budget_utilization)


class ProjectBudgetSourcesView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])

        else:
            budget_sources = DonorFundSplitUp.objects.filter(project=project)\
                .values('organisation')\
                .annotate(budget=Sum('budget'), expense=Sum('expense'),
                          organisation_name=F('organisation__org_name')).order_by('-budget')
            serializer = ProjectBudgetSourceSerializer(budget_sources, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class ProjectTimeLineView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])
        activity_date = ProjectActivityDate.objects.filter(project=project).order_by('iso_date')
        start_date = end_date = ''
        if activity_date.filter(activity_type=1):
            start_date = activity_date.filter(activity_type=1).values('iso_date')[0].get('iso_date', '')
        if activity_date.filter(activity_type=3):
            end_date = activity_date.filter(activity_type=3).values('iso_date')[0].get('iso_date', '')

        result = {
            "year_array": activity_date.annotate(year=ExtractYear('iso_date')).values_list('year',
                                                                                           flat=True).distinct(),
            "start_date": start_date,
            "end_date": end_date,
        }
        return self.jp_response(s_code='HTTP_200_OK', data=result)


class ProjectDocumentsView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])
        else:
            search = request.GET.get('search', '')
            category = request.GET.get('category', '')
            documents = ProjectDocument.objects.filter(project=project, category__priority__lte=6)
            if category:
                documents = documents.filter(category=category)
            if search:
                documents = documents.filter(title__icontains=search)

            documents = documents.order_by('category__priority')\
                .values('category', 'project', 'title', 'format', 'document_url',
                        'category__title', 'id')

            serializer = ProjectDocumentSerializer(documents, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data={'data': serializer.data})


class ProjectPicturesView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            project = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project not found'])
        else:
            search = request.GET.get('search', '')
            documents = ProjectDocument.objects.filter(project=project, category='A03')
            if search:
                documents = documents.filter(title__icontains=search)

            documents = documents\
                .values('category', 'project', 'title', 'format', 'document_url',
                        'category__title', 'id')
            serializer = ProjectDocumentSerializer(documents, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data={'data': serializer.data})


class RecipientProfileView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        """

        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        year = request.GET.get('year', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        try:
            operating_unit = kwargs.get('pk')
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Recipient not found'])

        op_query = Q(project__operating_unit=operating_unit) | \
            Q(project__operating_unit__bureau__code=operating_unit)
        active_projects = get_active_projects_for_year(year, operating_unit=operating_unit, flat=True)
        # projects_count = active_projects.filter(project__operating_unit=operating_unit).values('project')\
        #     .distinct().count()
        # budget = DonorFundSplitUp.objects.filter(output__operating_unit=operating_unit, year=year)\
        #     .aggregate(amount=Sum('budget'))['amount']
        # expense = DonorFundSplitUp.objects.filter(output__operating_unit=operating_unit, year=year)\
        #     .aggregate(amount=Sum('expense'))['amount']
        # budget_sources = DonorFundSplitUp.objects\
        #     .filter(output__operating_unit=operating_unit, year=year)\
        #     .aggregate(budget_sources_count=Count('organisation', distinct=True))['budget_sources_count']

        aggregate = DonorFundSplitUp.objects\
            .filter(year=year, project_id__in=active_projects)\
            .filter(op_query)\
            .aggregate(budget_sources_count=Count('organisation', distinct=True),
                       project_count=Count('project', distinct=True),
                       output_count=Count('output', distinct=True),
                       expense_amount=Sum('expense'),
                       budget_amount=Sum('budget'))
        # temp = DonorFundSplitUp.objects\
        #     .filter(output__operating_unit=operating_unit, year=year, project_id__in=active_projects)\
        #     .distinct('organisation')\
        #     .values_list('project_id', 'organisation__ref_id')
        # print(temp)
        try:
            op_unit = OperatingUnit.objects.get(iso3=operating_unit)
            unit_type = op_unit.unit_type
        except:
            unit_type = ''
        recipient_details = {
            'projects_count': active_projects.count(),
            'outputs_count': aggregate['output_count'],
            'budget': aggregate['budget_amount'],
            'expense': aggregate['expense_amount'],
            'budget_sources': aggregate['budget_sources_count'],
            'unit_type': unit_type
        }
        return self.jp_response(s_code='HTTP_200_OK', data=recipient_details)


# class MapLocationsView(APIView, ResponseViewMixin):
#     queryset = OutputLocation.objects.all()
#     pagination_class = CustomOffsetPagination
#
#     def get(self, request, *args, **kwargs):
#         year = request.GET.get('year', '')
#         sector = request.GET.get('sector', '')
#         recipient_country = request.GET.get('operating_unit', '')
#         budget_source = request.GET.get('budget_source', '')
#         project_id = request.GET.get('project_id', '')
#         budget_type = request.GET.get('budget_type', '')
#         sdg = request.GET.get('sdg', '')
#         provide_output = request.GET.get('provide_output', 0)
#
#         # query = Q(project__operating_unit__isnull=False)
#         query = Q()
#         if year:
#             active_projects = get_active_projects_for_year(year, flat=True)
#             query.add(Q(year=year), Q.AND)
#             query.add(Q(Q(project__in=active_projects)), Q.AND)
#         if recipient_country:
#             op_query = Q(project__operating_unit__iso3=recipient_country) | \
#                        Q(project__operating_unit__bureau__code=recipient_country)
#             query.add(op_query, Q.AND)
#         if budget_source:
#             if budget_type != 'regular':
#                 budget_source_query = Q(organisation__type_level_3=budget_source) |\
#                                       Q(organisation__ref_id=budget_source)
#                 query.add(budget_source_query, Q.AND)
#         if budget_type:
#             if budget_type == 'regular':
#                 query.add(Q(organisation=settings.UNDP_DONOR_ID), Q.AND)
#             # elif budget_type == 'direct':
#             #     query.add(~Q(organisation=settings.UNDP_DONOR_ID), Q.AND)
#         if sector:
#             if sector == '0':
#                 EXCLUDED_SECTOR_CODES.append('8')
#                 other_sector_query = Q(output__outputsector__isnull=True) | \
#                                      Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
#                 query.add(other_sector_query, Q.AND)
#             else:
#                 query.add(Q(output__outputsector__sector=sector), Q.AND)
#         if sdg:
#             if sdg == '0':
#                 query.add(Q(output__outputsdg__isnull=True), Q.AND)
#             else:
#                 query.add(Q(output__outputsdg__sdg=sdg), Q.AND)
#         if project_id:
#             query.add(Q(project=project_id), Q.AND)
#         countries = DonorFundSplitUp.objects.filter(query)
#
#         countries = countries.values('project__operating_unit') \
#             .annotate(project_count=Count('project', distinct=True),
#                       output_count=Count('output', distinct=True),
#                       donor_count=Count('organisation', distinct=True),
#                       total_budget=Sum('budget'),
#                       total_expense=Sum('expense'),
#                       operating_unit_name=F('project__operating_unit__name'),
#                       operating_unit_iso3=F('project__operating_unit__iso3'),
#                       operating_unit_iso2=F('project__operating_unit__iso2'),
#                       operating_unit_latitude=F('project__operating_unit__latitude'),
#                       operating_unit_longitude=F('project__operating_unit__longitude'),
#                       )
#         serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
#                                                                          'query': query,
#                                                                          'provide_output': provide_output
#                                                                          })
#         return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class MapLocationsView(APIView, ResponseViewMixin):
    queryset = OutputLocation.objects.all()
    pagination_class = CustomOffsetPagination

    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        tab = request.GET.get('tab', '')
        sector = request.GET.get('sector', '')
        recipient_country = request.GET.get('operating_unit', '')
        budget_source = request.GET.get('budget_source', '')
        project_id = request.GET.get('project_id', '')
        budget_type = request.GET.get('budget_type', '')
        sdg = request.GET.get('sdg', '')
        provide_output = request.GET.get('provide_output', 0)
        sdg_target = request.GET.get('sdg_target', '')
        marker_type = request.GET.get('marker_type', '')
        marker_id = request.GET.get('marker_id', '')
        signature_solution = request.GET.get('signature_solution', '')

        query = Q()
        countries = []

        if not sdg_target or (sdg_target and year and int(year) >= SP_START_YEAR) or (sdg_target and not year):
            if not sdg or (sdg and year and int(year) >= SDG_START_YEAR) or (sdg and not year):
                if (tab == 'sdg' and year and int(year) >= SDG_START_YEAR) or (tab != 'sdg'):
                    if year:
                        year_query = Q(Q(project__project_active__year=year) &
                                       Q(project__donorfundsplitup__year=year)) | \
                            Q(Q(project__project_active__year=year) & Q(~Q(project__donorfundsplitup__year=year) |
                              Q(project__donorfundsplitup__isnull=True)))

                        query.add(year_query, Q.AND)
                    if recipient_country:
                        op_query = Q(iso3=recipient_country) | \
                            Q(bureau__code=recipient_country)
                        query.add(op_query, Q.AND)
                    if budget_source:
                        if budget_type != 'regular':
                            budget_source_query = Q(project__donorfundsplitup__organisation__type_level_3=budget_source) |\
                                Q(project__donorfundsplitup__organisation__ref_id=budget_source)
                            if year:
                                budget_source_query &= Q(project__donorfundsplitup__year=year)
                            query.add(budget_source_query, Q.AND)
                    if budget_type:
                        if budget_type == 'regular':
                            query.add(Q(project__donorfundsplitup__organisation=settings.UNDP_DONOR_ID), Q.AND)
                    if sector:
                        if sector == '0':
                            EXCLUDED_SECTOR_CODES.append('8')
                            other_sector_query = Q(project__output__outputsector__isnull=True) | \
                                Q(project__output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
                            query.add(other_sector_query, Q.AND)
                        else:
                            query.add(Q(project__output__outputsector__sector=sector), Q.AND)
                        if year:
                            query.add(Q(project__output__donorfundsplitup__year=year), Q.AND)
                    if sdg:
                        if sdg == '0':
                            # query.add(Q(project__output__outputsdg__isnull=True), Q.AND)
                            query.add(Q(project__output__outputtarget__isnull=True), Q.AND)
                        else:
                            # query.add(Q(project__output__outputsdg__sdg=sdg), Q.AND)
                            query.add(Q(project__output__outputtarget__target_id__sdg=sdg), Q.AND)
                        if year:
                            query.add(Q(project__output__donorfundsplitup__year=year), Q.AND)
                    if sdg_target:
                        query.add(Q(project__output__outputtarget__target_id=sdg_target), Q.AND)
                        if year:
                            query.add(Q(project__output__donorfundsplitup__year=year), Q.AND)
                    if marker_type:
                        query.add(Q(project__output__projectmarker__type=marker_type), Q.AND)
                        if marker_id:
                            query.add(Q(project__output__projectmarker__marker_id=marker_id), Q.AND)
                    if signature_solution:
                        query.add(Q(project__output__signature_solution__ss_id=signature_solution), Q.AND)
                        if year:
                            query.add(Q(project__output__donorfundsplitup__year=year), Q.AND)
                    if project_id:
                        query.add(Q(project=project_id), Q.AND)
                    countries = OperatingUnit.objects.filter(query).distinct().prefetch_related('project')

                    if year:
                        countries = countries.values('iso3') \
                            .annotate(project_count=Count('project', distinct=True),
                                      output_count=Count('project__donorfundsplitup__output', distinct=True),
                                      donor_count=Count('project__donorfundsplitup__organisation', distinct=True),
                                      total_budget=Coalesce(Sum(Case(When(~Q(project__donorfundsplitup__year=year),
                                                                          then=Value(0)),
                                                            default=F('project__donorfundsplitup__budget'))), 0),
                                      total_expense=Coalesce(Sum(Case(When(~Q(project__donorfundsplitup__year=year),
                                                                           then=Value(0)),
                                                             default=F('project__donorfundsplitup__expense'))), 0),
                                      operating_unit_name=F('name'),
                                      operating_unit_iso3=F('iso3'),
                                      operating_unit_iso2=F('iso2'),
                                      operating_unit_unit_type=F('unit_type'),
                                      operating_unit_latitude=F('latitude'),
                                      operating_unit_longitude=F('longitude'),
                                      )
                    else:
                        countries = countries.values('iso3') \
                            .annotate(project_count=Count('project', distinct=True),
                                      output_count=Count('project__donorfundsplitup__output', distinct=True),
                                      donor_count=Count('project__donorfundsplitup__organisation', distinct=True),
                                      total_budget=Coalesce(Sum('project__donorfundsplitup__budget'), 0),
                                      total_expense=Coalesce(Sum('project__donorfundsplitup__expense'), 0),
                                      operating_unit_name=F('name'),
                                      operating_unit_iso3=F('iso3'),
                                      operating_unit_iso2=F('iso2'),
                                      operating_unit_unit_type=F('unit_type'),
                                      operating_unit_latitude=F('latitude'),
                                      operating_unit_longitude=F('longitude'),
                                      )
        else:
            countries = []
        serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
                                                                         'query': query,
                                                                         'request': request,
                                                                         'provide_output': provide_output
                                                                         })
        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class MapLocationsNewView(APIView, ResponseViewMixin):
    queryset = OutputLocation.objects.all()
    pagination_class = CustomOffsetPagination

    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        tab = request.GET.get('tab', '')
        sector = request.GET.get('sector', '')
        recipient_country = request.GET.get('operating_unit', '')
        budget_source = request.GET.get('budget_source', '')
        project_id = request.GET.get('project_id', '')
        budget_type = request.GET.get('budget_type', '')
        sdg = request.GET.get('sdg', '')
        provide_output = request.GET.get('provide_output', 0)
        sdg_target = request.GET.get('sdg_target', '')
        marker_type = request.GET.get('marker_type', '')
        marker_id = request.GET.get('marker_id', '')
        signature_solution = request.GET.get('signature_solution', '')

        query = Q()
        countries = []
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        if not sdg_target or (sdg_target and year and int(year) >= SDG_START_YEAR) or (sdg_target and not year):
            if not sdg or (sdg and year and int(year) >= SDG_START_YEAR) or (sdg and not year):
                if provide_output or recipient_country or budget_source:
                    countries = get_map_data(year=year, sdg=sdg, budget_source=budget_source,
                                             recipient_country=recipient_country, sector=sector, project_id=project_id,
                                             budget_type=budget_type, signature_solution=signature_solution,
                                             sdg_target=sdg_target, marker_type=marker_type, marker_id=marker_id,
                                             provide_output=provide_output)
                else:
                    if tab == 'sdg'and int(year) >= SDG_START_YEAR and sdg or int(year) >= SDG_START_YEAR and sdg:
                        try:
                            response = SDGMap.objects.get(year=year, sdg=sdg).response
                        except Exception as e:
                            response = get_map_data(year=year, sdg=sdg, budget_source=budget_source,
                                                    recipient_country=recipient_country, sector=sector,
                                                    project_id=project_id, budget_type=budget_type,
                                                    signature_solution=signature_solution, sdg_target=sdg_target,
                                                    marker_type=marker_type, marker_id=marker_id,
                                                    provide_output=provide_output)
                            return self.jp_response(s_code='HTTP_200_OK', data=response)
                        return self.jp_response(s_code='HTTP_200_OK', data=json.loads(response))
                    elif int(year) >= SDG_START_YEAR and sdg_target:
                        try:
                            response = SDGMap.objects.get(year=year, sdg=sdg_target).response
                        except Exception as e:
                            response = get_map_data(year=year, sdg=sdg, budget_source=budget_source,
                                                    recipient_country=recipient_country, sector=sector,
                                                    project_id=project_id, budget_type=budget_type,
                                                    signature_solution=signature_solution, sdg_target=sdg_target,
                                                    marker_type=marker_type, marker_id=marker_id,
                                                    provide_output=provide_output)
                            return self.jp_response(s_code='HTTP_200_OK', data=response)
                        return self.jp_response(s_code='HTTP_200_OK', data=json.loads(response))
                    else:
                        countries = get_map_data(year=year, sdg=sdg, budget_source=budget_source,
                                                 recipient_country=recipient_country, sector=sector,
                                                 project_id=project_id,
                                                 budget_type=budget_type, signature_solution=signature_solution,
                                                 sdg_target=sdg_target, marker_type=marker_type, marker_id=marker_id,
                                                 provide_output=provide_output)
        if tab == 'sdg' and int(year) >= SDG_START_YEAR and sdg or int(year) >= SDG_START_YEAR and sdg_target \
                or int(year) >= SDG_START_YEAR and sdg:
            serializer = MapDetailsSdgSerializer(countries, many=True, context={'year': year,
                                                                                'query': query,
                                                                                'request': request,
                                                                                'sdg': sdg,
                                                                                'sdg_target': sdg_target,
                                                                                'provide_output': provide_output
                                                                                })
        else:
            serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
                                                                             'query': query,
                                                                             'request': request,
                                                                             'provide_output': provide_output
                                                                             })

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class RecipientThemeDetailsView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        try:
            operating_unit = kwargs.get('pk')
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Recipient not found'])

        recipient_budget_details = get_recipient_theme_details(operating_unit, year)
        serializer = RecipientThemeBudgetSerializer(recipient_budget_details, many=True)

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class RecipientSdgDetailsView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        try:
            operating_unit = kwargs.get('pk')
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Recipient not found'])
        if year and int(year) >=  SDG_START_YEAR:
            recipient_budget_details = get_recipient_sdg_details(operating_unit, year)
        else:
            recipient_budget_details = []
        serializer = RecipientSdgBudgetSerializer(recipient_budget_details, many=True)

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class RecipientThemeBudgetVsExpenseView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        try:
            operating_unit = kwargs.get('pk')
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Recipient not found'])

        recipient_theme_budget_vs_expense = get_recipient_theme_budget_vs_expense(operating_unit, year)
        serializer = RecipientThemeBudgetvsExpenseSerializer(recipient_theme_budget_vs_expense, many=True)

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class RecipientSdgBudgetVsExpenseView(GenericAPIView, ResponseViewMixin):
    queryset = OperatingUnit.objects.all()

    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        try:
            operating_unit = kwargs.get('pk')
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Recipient not found'])
        if year and int(year) >= SDG_START_YEAR:
            recipient_sdg_budget_vs_expense = get_recipient_sdg_budget_vs_expense(operating_unit, year)
        else:
            recipient_sdg_budget_vs_expense = []
        serializer = RecipientSdgBudgetvsExpenseSerializer(recipient_sdg_budget_vs_expense, many=True)

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class ProjectSearchView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()
    pagination_class = ProjectSearchPagination
    serializer_class = ProjectListSerializer

    def get(self, request, *args, **kwargs):
        year = process_query_params(request.GET.get('year', None))
        operating_units = process_query_params(request.GET.get('operating_units', None))
        budget_sources = process_query_params(request.GET.get('budget_sources', None))
        sectors = process_query_params(request.GET.get('sectors', None))
        sdgs = process_query_params(request.GET.get('sdgs', None))
        category = request.GET.get('category')
        keyword = request.GET.get('keyword')
        draw = request.GET.get('draw')
        year = [int(y) for y in year] if year else []
        search_query = get_project_search_query(year, operating_units, budget_sources,
                                                sectors, keyword, category=category, sdgs=sdgs)
        if year:
            queryset = self.get_queryset().filter(search_query) \
                .values('project_id') \
                .annotate(budget=Sum(Case(When(donorfundsplitup__year__in=year, then=F('donorfundsplitup__budget')),
                                     default=Value(0))),
                          expense=Sum(Case(When(donorfundsplitup__year__in=year, then=F('donorfundsplitup__expense')),
                                      default=Value(0)))

                          )\
                .values('title', 'description', 'budget', 'expense', 'operating_unit__name', 'project_id') \
                .order_by('-budget')
        else:
            queryset = self.get_queryset().filter(search_query) \
                .values('project_id') \
                .annotate(budget=Sum(Case(When(donorfundsplitup__isnull=False, then=F('donorfundsplitup__budget')),
                                     default=Value(0))),
                          expense=Sum(Case(When(donorfundsplitup__isnull=False, then=F('donorfundsplitup__expense')),
                                      default=Value(0)))
                          ) \
                .values('title', 'description', 'budget', 'expense', 'operating_unit__name', 'project_id') \
                .order_by('-budget')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data, 'draw': draw})


class ProjectSearchFullTextView(GenericAPIView, ResponseViewMixin):
    queryset = ProjectSearch.objects.all()
    pagination_class = ProjectSearchPagination
    serializer_class = ProjectListSerializer

    def get(self, request, *args, **kwargs):
        year = process_query_params(request.GET.get('year', None))
        operating_units = process_query_params(request.GET.get('operating_units', None))
        budget_type = request.GET.get('budget_type', None)
        budget_sources = process_query_params(request.GET.get('budget_sources', None))
        sectors = process_query_params(request.GET.get('sectors', None))
        sdgs = process_query_params(request.GET.get('sdgs', None))
        category = request.GET.get('category')
        keyword = request.GET.get('keyword')
        draw = request.GET.get('draw')
        search_query = get_project_full_text_search_query(year, operating_units, budget_sources,
                                                          sectors, keyword, budget_type=budget_type,
                                                          category=category, sdgs=sdgs)
        project_ids = self.get_queryset().filter(search_query).distinct('project_id')\
            .values_list('project_id', flat=True)

        funds_query = get_fund_split_many_query(years=year, budget_sources=budget_sources, budget_type=budget_type,
                                                operating_units=operating_units)
        funds_mapping = DonorFundSplitUp.objects.filter(funds_query).values_list('id', flat=True)

        queryset = Project.objects.filter(project_id__in=project_ids) \
            .distinct()\
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
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data, 'draw': draw})


class CountryResultsView(APIView, ResponseViewMixin):
    def get(self, request, *agrs, **kwargs):
        year = request.GET.get('year', '')
        sector = request.GET.get('sector', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])

        operating_unit = request.GET.get('operating_unit', None)
        if not operating_unit:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a recipient'])
        op_query = Q(operating_unit=operating_unit) | Q(operating_unit__bureau__code=operating_unit)
        actual_year = year
        try:
            latest_time_line_year = ProjectTimeLine.objects.filter(is_active=True).order_by('-year')[0].year
            if str(year) >= str(latest_time_line_year):
                actual_year = latest_time_line_year - 1
                year = latest_time_line_year
        except Exception as e:
            print(e)
            pass
        country_results = CountryResultPeriod.objects.filter(op_query)\
            .filter(period_start__year=year)
        if not country_results:
            year = actual_year
            country_results = CountryResultPeriod.objects.filter(op_query)\
                .filter(period_start__year=year)
        if sector:
            sector_code = sector
            country_results = country_results.filter(component_id__startswith=sector)
        else:
            sector_with_max_results = country_results.annotate(sector_code=Substr('component_id', 1, 1))\
                .values('sector_code').annotate(count=Count('id')).order_by('-count')
            try:
                if sector_with_max_results:
                    sector_code = sector_with_max_results[0]['sector_code']
                else:
                    sector_code = DEFAULT_SECTOR_CODE
                country_results = country_results.filter(component_id__startswith=sector_code)
            except Exception as e:
                sector_code = ''
        sector_color = NULL_SECTOR_COLOR_CODE

        try:
            if sector_code not in EXCLUDED_SECTOR_CODES:
                sector = Sector.objects.get(code=sector_code)
                sector_color = sector.color if sector.color else NULL_SECTOR_COLOR_CODE
        except:
            pass
        results_serializer = CountryResultPeriodSerializer(country_results,
                                                           many=True,
                                                           context={'year': year, 'actual_year': actual_year})
        data = {
            'consolidate': results_serializer.data,
            'sector': sector_code,
            'sector_color': sector_color,
            'year': year
        }
        return self.jp_response(s_code='HTTP_200_OK', data=data)


class RecipientDocumentsView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            country = kwargs.get('pk')
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Recipient not found'])

        op_query = Q(operating_unit=country) | Q(operating_unit__bureau__code=country)
        recipient_documents = CountryDocument.objects\
            .filter(op_query)

        document_category = request.GET.get('category', '')
        if document_category:
            recipient_documents = recipient_documents.filter(category=document_category)

        recipient_documents = recipient_documents.distinct()\
            .order_by('category__priority')\
            .values('category', 'title', 'format', 'document_url', 'category__title')

        serializer = CountryDocumentSerializer(recipient_documents, many=True)
        return self.jp_response(s_code='HTTP_200_OK', data={'data': serializer.data})

#
# class SectorDetailsView(APIView, ResponseViewMixin):
#
#     def get(self, request, *args, **kwargs):
#         try:
#             year = request.GET.get('year', '')
#             sector = request.GET.get('sector', '')
#             if not year:
#                 return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
#                                               ['Please provide a year'])
#
#             active_projects = get_active_projects_for_year(year)
#             query = Q(project__in=active_projects) & Q(year=year)
#
#             EXCLUDED_SECTOR_CODES.append('8')
#             if sector in EXCLUDED_SECTOR_CODES or not sector:
#                 other_sector_query = Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
#                                      Q(output__outputsector__sector__isnull=True)
#                 query.add(other_sector_query, Q.AND)
#             else:
#                 query.add(Q(output__outputsector__sector=sector), Q. AND)
#             if year:
#                 query.add(Q(year=year), Q.AND)
#             try:
#                 if sector and int(sector) < 8:
#                     sector_name = Sector.objects.get(code=sector).sector
#                 else:
#                     sector_name = 'Others'
#             except:
#                 sector_name = 'Others'
#
#             aggregate = DonorFundSplitUp.objects.filter(query)\
#                 .aggregate(expense_amount=Sum('expense'),
#                            budget_amount=Sum('budget'),
#                            projects=Count('project', distinct=True),
#                            countries=Count('project__operating_unit', distinct=True),
#                            budget_sources=Count('organisation', distinct=True))
#             aggregate['year'] = year
#             aggregate['sector'] = sector
#             aggregate['sector_name'] = sector_name
#             budget_sources = DonorFundSplitUp.objects.filter(query).values('organisation')\
#                 .annotate(total_expense=Sum('expense'),
#                           total_budget=Sum('budget'),
#                           short_name=F('organisation__short_name'),
#                           organisation_name=F('organisation__org_name')).order_by('-total_budget')[0:10]
#             budget_sources_serializer = SectorBudgetSourcesSerializer(budget_sources, many=True)
#             top_recipient_offices = DonorFundSplitUp.objects.filter(query & Q(project__operating_unit__isnull=False))\
#                 .values('project__operating_unit')\
#                 .annotate(total_expense=Sum('expense'),
#                           total_budget=Sum('budget'),
#                           name=F('project__operating_unit__name'),
#                           iso3=F('project__operating_unit__iso3')).order_by('-total_budget')[0:10]
#             recipient_offices_serializer = SectorOperatingUnitSerializer(top_recipient_offices, many=True)
#             data = {
#                 'aggregate': aggregate,
#                 'budget_sources': budget_sources_serializer.data,
#                 'top_recipient_offices': recipient_offices_serializer.data
#             }
#             return self.jp_response(s_code='HTTP_200_OK', data=data)
#         except Exception as e:
#             print(e)
#             return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])
#


class SectorDetailsView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            sector = request.GET.get('sector', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])

            active_projects = get_active_projects_for_year(year)
            donor_query = Q(project__in=active_projects) & Q(year=year) & \
                Q(project__project_active__year=year)
            query = Q(project_id__in=active_projects) & Q(donorfundsplitup__year=year) & \
                Q(project_active__year=year)
            total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                                    sector=None)
            EXCLUDED_SECTOR_CODES.append('8')
            if sector in EXCLUDED_SECTOR_CODES or sector == '0':
                other_sector_query = Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                    Q(output__outputsector__sector__isnull=True)

                query.add(other_sector_query, Q.AND)
                donor_query.add(other_sector_query, Q.AND)
            else:
                query.add(Q(output__outputsector__sector=sector), Q. AND)
                donor_query.add(Q(output__outputsector__sector=sector), Q. AND)
            if operating_unit:
                query.add(Q(operating_unit=operating_unit) |
                          Q(operating_unit__bureau__code=operating_unit), Q.AND)
                donor_query.add(Q(project__operating_unit=operating_unit) |
                                Q(project__operating_unit__bureau__code=operating_unit), Q.AND)
            if budget_source:
                budget_query = Q(donorfundsplitup__organisation__ref_id=budget_source) | \
                    Q(donorfundsplitup__organisation__type_level_3=budget_source)
                donor_budget_query = Q(organisation__ref_id=budget_source) | \
                    Q(organisation__type_level_3=budget_source)
                query.add(budget_query, Q.AND)
                donor_query.add(donor_budget_query, Q.AND)
            sector_obj = None
            try:
                if sector and int(sector) < 8 or int(sector) > 16:
                    sector_obj = Sector.objects.get(code=sector)
                    sector_name = sector_obj.sector
                else:
                    sector_name = 'Others'
            except:
                sector_name = 'Others'
            aggregate_results1 = Project.objects.filter(query)\
                .aggregate(projects=Count('project_id', distinct=True),
                           budget_sources=Count('donorfundsplitup__organisation', distinct=True))
            aggregate_result = get_sector_aggregate(year, active_projects, sector=sector_obj,
                                                    operating_unit=operating_unit, budget_source=budget_source)
            sector_mapping = []
            other_sector_query = Q(code__in=EXCLUDED_SECTOR_CODES) | Q(code__isnull=True)
            sector_year_query = Q(start_year__lte=year) & \
                                Q(end_year__gte=year)
            sectors = Sector.objects.filter(sector_year_query).exclude(other_sector_query)
            if sector_obj is None:
                for sector_ob in sectors:
                    result = get_sector_aggregate(year, active_projects, sector=sector_ob,
                                                  operating_unit=operating_unit, budget_source=budget_source)
                    if result:
                        sector_mapping.append(result)
                budget = sum(sector['budget'] for sector in sector_mapping)
                expense = sum(sector['expense'] for sector in sector_mapping)
                total_aggregate = DonorFundSplitUp.objects.filter(total_fund_query) \
                    .aggregate(budget_amount=Sum('budget'),
                               expense_amount=Sum('expense'))
                total_budget = total_aggregate.get('budget_amount', 0)
                total_expense = total_aggregate.get('expense_amount', 0)
                aggregate_result['budget'] = total_budget - budget
                aggregate_result['expense'] = total_expense - expense

            aggregate = dict({
                'expense_amount': aggregate_result['expense'],
                'budget_amount': aggregate_result['budget'],
                'projects': aggregate_result['total_projects'],
                'outputs': aggregate_result['total_outputs'],
                'countries': aggregate_result['countries_count'],
                'budget_sources': aggregate_results1['budget_sources'],
                'percentage': aggregate_result['percentage'],
                'start_year': aggregate_result['start_year'],
                'end_year': aggregate_result['end_year']
            })

            aggregate['year'] = year
            aggregate['sector'] = sector
            aggregate['sector_name'] = sector_name
            budget_sources = DonorFundSplitUp.objects.filter(donor_query).values('organisation') \
                .annotate(total_expense=Coalesce(Sum('expense'), 0),
                          total_budget=Coalesce(Sum('budget'), 0),
                          short_name=F('organisation__short_name'),
                          organisation_name=F('organisation__org_name'))\
                .order_by('-total_budget')[0:10]
            budget_sources_serializer = SectorBudgetSourcesSerializer(budget_sources, many=True,
                                                                      context={'request': request})
            top_recipient_offices = DonorFundSplitUp.objects.filter(donor_query &
                                                                    Q(project__operating_unit__isnull=False))\
                .values('project__operating_unit')\
                .annotate(total_expense=Coalesce(Sum('expense'), 0),
                          total_budget=Coalesce(Sum('budget'), 0),
                          name=F('project__operating_unit__name'),
                          iso3=F('project__operating_unit__iso3')).order_by('-total_budget')[0:10]

            recipient_offices_serializer = SectorOperatingUnitSerializer(top_recipient_offices, many=True)
            data = {
                'aggregate': aggregate,
                'budget_sources': budget_sources_serializer.data,
                'top_recipient_offices': recipient_offices_serializer.data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SdgDetailsView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            sdg = request.GET.get('sdg', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])

            if year and int(year) >= SDG_START_YEAR:
                active_projects = get_active_projects_for_year(year)
                donor_query = Q(project__in=active_projects) & Q(year=year) & \
                    Q(project__project_active__year=year)
                query = Q(project_id__in=active_projects) & Q(donorfundsplitup__year=year) & \
                    Q(project_active__year=year)
                # if sdg and sdg != '0':
                #     query.add(Q(outputsdg__sdg=sdg), Q. AND)
                #     donor_query.add(Q(output__outputsdg__sdg=sdg), Q. AND)
                # if sdg == '0':
                #     query.add(Q(outputsdg__isnull=True), Q.AND)
                #     donor_query.add(Q(output__outputsdg__isnull=True), Q.AND)
                if sdg and sdg != '0':
                    query.add(Q(outputtarget__target_id__sdg=sdg) & Q(outputtarget__year=year), Q.AND)
                    donor_query.add(Q(output__outputtarget__target_id__sdg=sdg), Q.AND)
                if sdg == '0':
                    query.add(Q(outputtarget__isnull=True), Q.AND)
                    donor_query.add(Q(output__outputtarget__isnull=True), Q.AND)
                if operating_unit:
                    query.add(Q(operating_unit=operating_unit) |
                              Q(operating_unit__bureau__code=operating_unit), Q.AND)
                    donor_query.add(Q(project__operating_unit=operating_unit) |
                                    Q(project__operating_unit__bureau__code=operating_unit), Q.AND)
                if budget_source:
                    budget_query = Q(donorfundsplitup__organisation__ref_id=budget_source) | \
                        Q(donorfundsplitup__organisation__type_level_3=budget_source)
                    donor_budget_query = Q(organisation__ref_id=budget_source) | \
                        Q(organisation__type_level_3=budget_source)
                    query.add(budget_query, Q.AND)
                    donor_query.add(donor_budget_query, Q.AND)
                sdg_obj = None
                try:
                    sdg_obj = Sdg.objects.get(code=sdg)
                except:
                    pass
                aggregate_results1 = Project.objects.filter(query)\
                    .aggregate(projects=Count('project_id', distinct=True),
                               budget_sources=Count('donorfundsplitup__organisation', distinct=True))
                countries_count = Project.objects.filter(query & Q(operating_unit__area_type='country'))\
                    .aggregate(countries=Count('operating_unit', distinct=True))['countries']
                # if int(year) < SP_START_YEAR:
                #     aggregate_result = get_sdg_aggregate(year, sdg=sdg_obj, operating_unit=operating_unit,
                #                                          budget_source=budget_source)
                #     countries = aggregate_result['countries_count']
                aggregate_result = get_sdg_target_aggregate(year, sdg=sdg_obj, operating_unit=operating_unit,
                                                            budget_source=budget_source,
                                                            active_projects=active_projects)
                total_fund_query = get_fund_split_query(year, budget_source=budget_source,
                                                        operating_unit=operating_unit,
                                                        sdg=None)
                sdg_mapping = []
                if sdg_obj is None:
                    for sdg_ob in Sdg.objects.filter().exclude(Q(code__isnull=True)):
                        result = get_sdg_target_aggregate(year, active_projects=active_projects, sdg=sdg_ob,
                                                          operating_unit=operating_unit, budget_source=budget_source)
                        if result:
                            sdg_mapping.append(result)
                    budget = sum(sdgs['total_budget'] for sdgs in sdg_mapping)
                    expense = sum(sdgs['total_expense'] for sdgs in sdg_mapping)
                    total_aggregate = DonorFundSplitUp.objects.filter(total_fund_query) \
                        .aggregate(budget_amount=Sum('budget'),
                                   expense_amount=Sum('expense'))
                    total_budget = total_aggregate.get('budget_amount', 0)
                    total_expense = total_aggregate.get('expense_amount', 0)
                    aggregate_result['total_budget'] = total_budget - budget
                    aggregate_result['total_expense'] = total_expense - expense
                if aggregate_result:
                    countries = aggregate_result['countries_count']
                    aggregate = {
                        'total_expense': aggregate_result['total_expense'],
                        'total_budget': aggregate_result['total_budget'],
                        'total_projects': aggregate_result['total_projects'],
                        'countries': countries,
                        'budget_sources': aggregate_results1['budget_sources'],
                        'percentage': round(aggregate_result['percentage'], 2)
                    }
                else:
                    aggregate = {
                        'total_expense': 0,
                        'total_budget': 0,
                        'total_projects': 0,
                        'countries': 0,
                        'budget_sources': 0,
                        'percentage': 0
                    }
                aggregate['year'] = year
                aggregate['sdg'] = sdg
                aggregate['sdg_name'] = sdg_obj.name if sdg_obj else 'Others'

                budget_sources = DonorFundSplitUp.objects.filter(donor_query).values('organisation') \
                    .annotate(total_expense=Coalesce(Sum('expense'), 0),
                              total_budget=Coalesce(Sum('budget'), 0),
                              short_name=F('organisation__short_name'),
                              organisation_name=F('organisation__org_name'))\
                    .order_by('-total_budget')[0:10]
                budget_sources_data = []
                for source in budget_sources:
                    budget_data = get_sdg_target_aggregate(year, sdg=sdg_obj,
                                                           budget_source=source['organisation'],
                                                           active_projects=active_projects)
                    if budget_data:
                        top_budget_source = {'total_expense': budget_data['total_expense'],
                                             'total_budget': budget_data['total_budget'],
                                             'short_name': source['short_name'],
                                             'organisation_name': source['organisation_name']
                                             }
                        budget_sources_data.append(top_budget_source)
                top_budget_sources = sorted(budget_sources_data, key=lambda  k: k['total_budget'], reverse=True)

                budget_sources_serializer = SdgBudgetSourcesSerializer(top_budget_sources, many=True,
                                                                       context={'request': request})

                top_recipient_offices = DonorFundSplitUp.objects.filter(donor_query &
                                                                        Q(project__operating_unit__isnull=False))\
                    .values('project__operating_unit')\
                    .annotate(total_expense=Coalesce(Sum('expense'), 0),
                              total_budget=Coalesce(Sum('budget'), 0),
                              name=F('project__operating_unit__name'),
                              iso3=F('project__operating_unit__iso3')).order_by('-total_budget')[0:10]
                top_recipient_offices_data = []
                for recipient in top_recipient_offices:
                    recipient_data = get_sdg_target_aggregate(year, sdg=sdg_obj,
                                                              operating_unit=recipient['project__operating_unit'],
                                                              active_projects=active_projects)
                    if recipient_data:
                        top_recipient = {'total_expense': recipient_data['total_expense'],
                                         'total_budget': recipient_data['total_budget'],
                                         'name': recipient['name'],
                                         'iso3': recipient['iso3'],
                                         }
                        top_recipient_offices_data.append(top_recipient)
                recipient_offices = sorted(top_recipient_offices_data, key=lambda k: k['total_budget'], reverse=True)
                recipient_offices_serializer = SdgOperatingUnitSerializer(recipient_offices, many=True)
                data = {
                    'aggregate': aggregate,
                    'budget_sources': budget_sources_serializer.data,
                    'top_recipient_offices': recipient_offices_serializer.data
                }
            else:
                data = {
                    'aggregate': {},
                    'budget_sources': [],
                    'top_recipient_offices': []
                }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class GlobalThemesView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        operating_unit = request.GET.get('operating_unit', '')
        budget_source = request.GET.get('budget_source', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])

        sector_mapping = []
        EXCLUDED_SECTOR_CODES.append('8')
        other_sector_query = Q(code__in=EXCLUDED_SECTOR_CODES) | Q(code__isnull=True)
        sector_year_query = Q(start_year__lte=year) & \
                            Q(end_year__gte=year)
        sectors = Sector.objects.filter(sector_year_query).exclude(other_sector_query)
        for sector in sectors:
            result1 = get_global_theme_details(year, sector=sector, operating_unit=operating_unit,
                                              budget_source=budget_source)
            if result1:
                gross_budget = result1['total_budget']
                gross_expense = result1['total_expense']
                sector_mapping.append(result1)
        sector_mapping = sorted(sector_mapping, key=lambda sector: sector['percentage'], reverse=True)
        result = get_global_theme_details(year, sector=None, operating_unit=operating_unit,
                                          budget_source=budget_source)

        total_percentage = sum(sector['percentage'] for sector in sector_mapping)
        total_budget = sum(sector['theme_budget'] for sector in sector_mapping)
        total_expense = sum(sector['theme_expense'] for sector in sector_mapping)

        result['percentage'] = 100 - total_percentage
        result['theme_budget'] = gross_budget - total_budget
        result['theme_expense'] = gross_expense - total_expense
        result['output__outputsector__sector__color'] = NULL_SECTOR_COLOR_CODE
        result['output__outputsector__sector__sector'] = 'Others'
        result['output__outputsector__sector__code'] = 0
        result['output__outputsector__sector'] = 'Others'

        if result['percentage'] != 0:
            sector_mapping.append(result)

        serializer = RecipientThemeBudgetSerializer(sector_mapping, many=True)

        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class SdgAggregateView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        year = request.GET.get('year', '')
        operating_unit = request.GET.get('operating_unit', '')
        budget_source = request.GET.get('budget_source', '')
        if not year:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a year'])
        active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                       budget_source=budget_source)

        sdg_aggregate = []
        sdg_list = []
        if year and int(year) >= SDG_START_YEAR:
            # if int(year) < SP_START_YEAR:
            #     for sdg in Sdg.objects.all():
            #         aggregate = get_sdg_aggregate(year, sdg=sdg, operating_unit=operating_unit,
            #                                       budget_source=budget_source)
            #         if aggregate:
            #             sdg_aggregate.append(aggregate)
            #     other_sdg_aggregate = get_sdg_aggregate(year, sdg=None, operating_unit=operating_unit,
            #                                             budget_source=budget_source)

            for sdgtargets in SdgTargets.objects.all():
                if sdgtargets.sdg.code not in sdg_list:
                    sdg_list.append(sdgtargets.sdg.code)
                    aggregate = get_sdg_target_aggregate(year, sdg=sdgtargets.sdg, operating_unit=operating_unit,
                                                         budget_source=budget_source, active_projects=active_projects)
                    if aggregate:
                        sdg_aggregate.append(aggregate)

            other_sdg_aggregate = get_sdg_target_aggregate(year, sdg=None, operating_unit=operating_unit,
                                                           budget_source=budget_source, active_projects=active_projects)
            sdg_aggregate = sorted(sdg_aggregate, key=lambda item: item['total_budget'], reverse=True)
            # if other_sdg_aggregate:
            #     sdg_aggregate.append(other_sdg_aggregate)
            sdg_serializer = SdgAggregateSerializer(sdg_aggregate, many=True)
            project_mapping = get_project_aggregate(year, active_projects,
                                                    operating_unit=operating_unit,
                                                    budget_source=budget_source)
            project_serializer = ProjectAggregateSerializer(project_mapping)
            total_percentage = sum(sdg['percentage'] for sdg in sdg_aggregate)
            total_budget = sum(sdg['total_budget'] for sdg in sdg_aggregate)
            total_expense = sum(sdg['total_expense'] for sdg in sdg_aggregate)
            if other_sdg_aggregate:
                other_sdg_aggregate['percentage'] = 100 - total_percentage
                other_sdg_aggregate['total_budget'] = project_serializer.data['budget'] - total_budget
                other_sdg_aggregate['total_expense'] = project_serializer.data['expense'] - total_expense
                if other_sdg_aggregate['percentage'] != 0:
                    sdg_aggregate.append(other_sdg_aggregate)
            else:
                other_aggregate = dict()
                other_aggregate['percentage'] = 0
                other_aggregate['total_budget'] = 0
                other_aggregate['total_expense'] = 0
                other_aggregate['sdg_code'] = 0
                other_aggregate['sdg_name'] = 'Others'
                other_aggregate['color'] = NULL_SECTOR_COLOR_CODE
                other_aggregate['percentage'] = 100 - total_percentage
                other_aggregate['total_budget'] = project_serializer.data['budget'] - total_budget
                other_aggregate['total_expense'] = project_serializer.data['expense'] - total_expense
                if other_aggregate['percentage'] != 0:
                    sdg_aggregate.append(other_aggregate)
            data = {
                'project': project_serializer.data,
                'sdg': sdg_serializer.data,
            }
        else:
            data = {
                'project': [],
                'sdg': []
            }
        return self.jp_response(s_code='HTTP_200_OK', data=data)


class SignatureSolutionsAggregateView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        """
            Signature Solutions aggregate details get
        """
        try:
            year = request.GET.get('year', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])

            active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                           budget_source=budget_source)
            signature_solutions_aggregate = []
            signature_list = []
            ss_list = []
            signature_aggregate = []
            if year and int(year) >= SP_START_YEAR:
                for signature_solutions in SignatureSolution.objects.all():
                    ss_id = signature_solutions.ss_id
                    if ss_id not in ss_list:
                        ss_list.append(ss_id)
                        aggregate = get_signature_solutions_aggregate(year, active_projects,
                                                                      signature_solution=signature_solutions,
                                                                      operating_unit=operating_unit,
                                                                      budget_source=budget_source)
                        if aggregate['name'] != "Others":
                            signature_solutions_aggregate.append(aggregate)
                        elif aggregate['name'] == "Others":
                            others = aggregate
                    signature_solutions_aggregate = sorted(signature_solutions_aggregate,
                                                           key=lambda signature: signature['percentage'], reverse=True)
                for signature in signature_solutions_aggregate:
                    if signature['ss_id'] not in signature_list and signature['percentage'] != 0:
                        signature_list.append(signature['ss_id'])
                        signature_aggregate.append(signature)
                if others['percentage'] != 0:
                    signature_aggregate.append(others)
            project_mapping = get_project_aggregate(year, active_projects,
                                                    operating_unit=operating_unit,
                                                    budget_source=budget_source)
            project_serializer = ProjectAggregateSerializer(project_mapping)
            signature_serializer = SignatureSolutionsAggregateSerializer(signature_aggregate, many=True)
            data = {
                'project': project_serializer.data,
                'signature_solutions': signature_serializer.data,
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SignatureSolutionsDetailsView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            ss_id = request.GET.get('ss_id', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            active_projects = get_active_projects_for_year(year)
            donor_query = Q(project__in=active_projects) & Q(year=year) & \
                Q(project__project_active__year=year)

            top_recipient_offices = DonorFundSplitUp.objects.filter(donor_query &
                                                                    Q(project__operating_unit__isnull=False) &
                                                                    Q(output__signature_solution__ss_id=ss_id))\
                                                    .values('project__operating_unit').annotate(
                total_expense=Coalesce(Sum('expense'), 0), total_budget=Coalesce(Sum('budget'), 0),
                                                        name=F('project__operating_unit__name'),
                                                        iso3=F('project__operating_unit__iso3')) \
                .order_by('-total_budget')[0:10]

            recipient_offices_serializer = SignatureSolutionOperatingUnitSerializer(top_recipient_offices, many=True)

            budget_sources = DonorFundSplitUp.objects.filter(donor_query &
                                                             Q(output__signature_solution__ss_id=ss_id)) \
                .values('organisation') \
                .annotate(total_expense=Coalesce(Sum('expense'), 0),
                          total_budget=Coalesce(Sum('budget'), 0),
                          short_name=F('organisation__short_name'),
                          organisation_name=F('organisation__org_name'))\
                .order_by('-total_budget')[0:10]

            budget_sources_serializer = SectorBudgetSourcesSerializer(budget_sources, many=True,
                                                                      context={'request': request})
            signature_aggregate = []
            signature_solutions_aggregate = []
            signature_list = []
            for signature_solutions in SignatureSolution.objects.filter(ss_id=ss_id):
                aggregate = get_signature_solutions_aggregate(year, active_projects,
                                                              signature_solution=signature_solutions)
                if aggregate:
                    signature_solutions_aggregate.append(aggregate)

                signature_solutions_aggregate = sorted(signature_solutions_aggregate,
                                                       key=lambda signature: signature['percentage'], reverse=True)
            for signature in signature_solutions_aggregate:
                if signature['ss_id'] not in signature_list:
                    signature_list.append(signature['ss_id'])
                    signature_aggregate.append(signature)

            signature_serializer = SignatureSolutionsAggregateSerializer(signature_aggregate, many=True)
            data = {
                'top_recipient_offices': recipient_offices_serializer.data,
                'budget_sources': budget_sources_serializer.data,
                'aggregate': signature_serializer.data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)

        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SignatureSolutionsOutcomeView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            ss_id = request.GET.get('ss_id', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            active_projects = get_active_projects_for_year(year)
            sign = []
            signature_solution = SignatureSolution.objects.values('sp_id').filter(ss_id=ss_id)
            num_signature_solution = len(signature_solution)
            percent_signature_solution = {sp_id['sp_id']: sp_id['sp_id__count'] * 100/num_signature_solution
                                          for sp_id in signature_solution.annotate(Count('sp_id'))}

            for k, v in percent_signature_solution.items():
                sector_name = Sector.objects.get(code=k)
                aggregate = get_sector_aggregate(year, active_projects=active_projects, sector=sector_name)
                sector_budget = aggregate['budget']
                sector_color = sector_name.color
                sign.append({'sector_id': k, 'sector_name': sector_name, 'percent': v, 'sector_color': sector_color,
                             'budget': sector_budget})

            signature_outcome_serializer = SignatureSolutionOutcomeSerializer(sign, many=True,
                                                                              context={'request': request})
            data = {
                 'percentage': signature_outcome_serializer.data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SectorSignatureSolutionView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            code = request.GET.get('code', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            active_projects = get_active_projects_for_year(year)
            sectors = []
            sector = Sector.objects.values('signaturesolution__ss_id').filter(code=code)
            num_sector = len(sector)
            percent_sector = {ss_id['signaturesolution__ss_id']: ss_id['signaturesolution__ss_id__count'] * 100/num_sector
                              for ss_id in sector.annotate(Count('signaturesolution__ss_id'))}

            for k, v in percent_sector.items():
                signature_solution = SignatureSolution.objects.values('name').filter(ss_id=k).distinct()
                signature_solution_name = signature_solution[0]['name']
                for signature in SignatureSolution.objects.filter(ss_id=k):
                    aggregate = get_signature_solutions_aggregate(year, active_projects=active_projects,
                                                                  signature_solution=signature)
                ss_budget = aggregate['budget']
                sectors.append({'signature_solution_id': k, 'percent': v,
                                'signature_solution_name': signature_solution_name, 'budget': ss_budget})
                sector_sort = sorted(sectors, key=lambda k: k['signature_solution_id'])

                sector_signature_solution_serializer = SectorSignatureSolutionSerializer(sector_sort, many=True,
                                                                                         context={'request': request})
            data = {
                'percentage': sector_signature_solution_serializer.data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


# class SdgTargetDetailView(APIView, ResponseViewMixin):
#     def get(self, request, *args, **kwargs):
#         try:
#             year = request.GET.get('year', '')
#             sdg_target = request.GET.get('sdg_target', '')
#             operating_unit = request.GET.get('operating_unit', '')
#             budget_source = request.GET.get('budget_source', '')
#             if not year:
#                 return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
#                                               ['Please provide a year'])
#             if year and int(year) >= SP_START_YEAR:
#                 active_projects = get_active_projects_for_year(year)
#                 donor_query = Q(project__in=active_projects) & Q(year=year) & \
#                               Q(project__project_active__year=year)
#                 query = Q(project_id__in=active_projects) & Q(donorfundsplitup__year=year) & \
#                         Q(project_active__year=year)
#
#                 if sdg_target and sdg_target != '0':
#                     query.add(Q(outputtarget__target_id=sdg_target), Q. AND)
#                     donor_query.add(Q(output__outputtarget__target_id=sdg_target), Q. AND)
#                 if operating_unit:
#                     query.add(Q(operating_unit=operating_unit) |
#                               Q(operating_unit__bureau__code=operating_unit), Q.AND)
#                     donor_query.add(Q(project__operating_unit=operating_unit) |
#                                     Q(project__operating_unit__bureau__code=operating_unit), Q.AND)
#                 if budget_source:
#                     budget_query = Q(donorfundsplitup__organisation__ref_id=budget_source) | \
#                         Q(donorfundsplitup__organisation__type_level_3=budget_source)
#                     donor_budget_query = Q(organisation__ref_id=budget_source) | \
#                         Q(organisation__type_level_3=budget_source)
#                     query.add(budget_query, Q.AND)
#                     donor_query.add(donor_budget_query, Q.AND)
#                 target_percent = []
#                 sdg_obj = SdgTargets.objects.values('sdg', 'description').get(target_id=sdg_target)
#                 target_agg = get_target_aggregate(year, target=sdg_target, operating_unit=operating_unit,
#                                                   budget_source=budget_source)
#                 aggregate_results1 = Project.objects.filter(query)\
#                     .aggregate(projects=Count('project_id', distinct=True),
#                                budget_sources=Count('donorfundsplitup__organisation', distinct=True))
#
#                 target_percent.append({'total_budget': target_agg['target_budget'],
#                                        'total_expense': target_agg['target_expense'],
#                                        'total_projects': aggregate_results1['projects'],
#                                        'budget_sources': aggregate_results1['budget_sources'],
#                                        'target_desc': sdg_obj['description'],
#                                        'target_id': sdg_target,
#                                        'sdg': sdg_obj['sdg']
#                                        })
#                 budget_sources = DonorFundSplitUp.objects.filter(donor_query).values('organisation') \
#                     .annotate(total_expense=Coalesce(Sum('expense'), 0),
#                               total_budget=Coalesce(Sum('budget'), 0),
#                               short_name=F('organisation__short_name'),
#                               organisation_name=F('organisation__org_name')) \
#                     .order_by('-total_budget')[0:10]
#                 budget_sources_serializer = SdgBudgetSourcesSerializer(budget_sources, many=True,
#                                                                        context={'request': request})
#                 top_recipient_offices = DonorFundSplitUp.objects.filter(donor_query &
#                                                                         Q(project__operating_unit__isnull=False)) \
#                     .values('project__operating_unit') \
#                     .annotate(total_expense=Coalesce(Sum('expense'), 0),
#                               total_budget=Coalesce(Sum('budget'), 0),
#                               name=F('project__operating_unit__name'),
#                               iso3=F('project__operating_unit__iso3')).order_by(
#                     '-total_budget')[0:10]
#                 recipient_offices_serializer = SdgOperatingUnitSerializer(top_recipient_offices, many=True)
#
#                 data = {
#                     'aggregate': target_percent,
#                     'budget_sources': budget_sources_serializer.data,
#                     'top_recipient_offices': recipient_offices_serializer.data
#                 }
#             return self.jp_response(s_code='HTTP_200_OK', data=data)
#         except Exception as e:
#             return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SdgTargetDetailView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            sdg_target = request.GET.get('sdg_target', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            data = dict()
            if year and int(year) >= SDG_START_YEAR:
                active_projects = get_active_projects_for_year(year)
                donor_query = Q(project__in=active_projects) & Q(year=year) & \
                              Q(project__project_active__year=year)
                query = Q(project_id__in=active_projects) & Q(donorfundsplitup__year=year) & \
                        Q(project_active__year=year)

                if sdg_target and sdg_target != '0':
                    query.add(Q(outputtarget__target_id=sdg_target) & Q(outputtarget__year=year), Q. AND)
                    donor_query.add(Q(output__outputtarget__target_id=sdg_target)
                                    & Q(output__outputtarget__year=year), Q. AND)
                if operating_unit:
                    query.add(Q(operating_unit=operating_unit) |
                              Q(operating_unit__bureau__code=operating_unit), Q.AND)
                    donor_query.add(Q(project__operating_unit=operating_unit) |
                                    Q(project__operating_unit__bureau__code=operating_unit), Q.AND)
                if budget_source:
                    budget_query = Q(donorfundsplitup__organisation__ref_id=budget_source) | \
                        Q(donorfundsplitup__organisation__type_level_3=budget_source)
                    donor_budget_query = Q(organisation__ref_id=budget_source) | \
                        Q(organisation__type_level_3=budget_source)
                    query.add(budget_query, Q.AND)
                    donor_query.add(donor_budget_query, Q.AND)
                target_percent = []
                sdg_obj = SdgTargets.objects.values('sdg', 'description', 'sdg__name').get(target_id=sdg_target)
                target_agg = get_target_aggregate_new(year, sdg_target, sdg_obj['sdg'], operating_unit=operating_unit,
                                                  budget_source=budget_source, active_projects=active_projects)
                aggregate_results1 = Project.objects.filter(query)\
                    .aggregate(projects=Count('project_id', distinct=True),
                               budget_sources=Count('donorfundsplitup__organisation', distinct=True))

                target_percent.append({'total_budget': target_agg['target_budget'],
                                       'total_expense': target_agg['target_expense'],
                                       'total_projects': aggregate_results1['projects'],
                                       'budget_sources': aggregate_results1['budget_sources'],
                                       'target_desc': sdg_obj['description'],
                                       'target_id': sdg_target,
                                       'sdg': sdg_obj['sdg'],
                                       'sdg_name': sdg_obj['sdg__name'],
                                       })
                budget_sources = DonorFundSplitUp.objects.filter(donor_query).values('organisation') \
                    .annotate(total_expense=Coalesce(Sum('expense'), 0),
                              total_budget=Coalesce(Sum('budget'), 0),
                              short_name=F('organisation__short_name'),
                              organisation_name=F('organisation__org_name')) \
                    .order_by('-total_budget')[0:10]

                budget_sources_data = []
                for source in budget_sources:
                    budget_data = get_target_aggregate_new(year, target=sdg_target, sdg=sdg_obj['sdg'],
                                                           budget_source=source['organisation'],
                                                           active_projects=active_projects)
                    if budget_data:
                        top_budget_source = {'total_expense': budget_data['target_expense'],
                                             'total_budget': budget_data['target_budget'],
                                             'short_name': source['short_name'],
                                             'organisation_name': source['organisation_name']
                                             }
                        budget_sources_data.append(top_budget_source)
                top_budget_sources = sorted(budget_sources_data, key=lambda k: k['total_budget'], reverse=True)
                budget_sources_serializer = SdgBudgetSourcesSerializer(top_budget_sources, many=True,
                                                                       context={'request': request})
                top_recipient_offices = DonorFundSplitUp.objects.filter(donor_query &
                                                                        Q(project__operating_unit__isnull=False)) \
                    .values('project__operating_unit') \
                    .annotate(total_expense=Coalesce(Sum('expense'), 0),
                              total_budget=Coalesce(Sum('budget'), 0),
                              name=F('project__operating_unit__name'),
                              iso3=F('project__operating_unit__iso3')).order_by(
                    '-total_budget')[0:10]

                top_recipient_offices_data = []
                for recipient in top_recipient_offices:
                    recipient_data = get_target_aggregate_new(year, target=sdg_target, sdg=sdg_obj['sdg'],
                                                              operating_unit=recipient['project__operating_unit'],
                                                              active_projects=active_projects)
                    if recipient_data:
                        top_recipient = {'total_expense': recipient_data['target_expense'],
                                         'total_budget': recipient_data['target_budget'],
                                         'name': recipient['name'],
                                         'iso3': recipient['iso3'],
                                         }
                        top_recipient_offices_data.append(top_recipient)
                recipient_offices = sorted(top_recipient_offices_data, key=lambda k: k['total_budget'], reverse=True)
                recipient_offices_serializer = SdgOperatingUnitSerializer(recipient_offices, many=True)

                data = {
                    'aggregate': target_percent,
                    'budget_sources': budget_sources_serializer.data,
                    'top_recipient_offices': recipient_offices_serializer.data
                }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SdgTargetView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            budget_source = request.GET.get('budget_source', '')
            operating_unit = request.GET.get('operating_unit', '')
            sdg = request.GET.get('sdg', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            target_percent = []
            active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                           budget_source=budget_source)
            if year and int(year) >= SDG_START_YEAR:
                targets = SdgTargets.objects.filter(sdg=sdg).values('target_id', 'description')
                for target in targets:
                    target_id = target['target_id']
                    target_agg = get_target_aggregate_new(year, target_id, sdg, operating_unit=operating_unit,
                                                          budget_source=budget_source, active_projects=active_projects)
                    if target_agg['budget_percentage'] > 0:
                        target_percent.append({'target_budget': target_agg['target_budget'],
                                               'target_expense': target_agg['target_expense'],
                                               'target_percentage': target_agg['budget_percentage'],
                                               'target_id': target_id,
                                               'target_description': target['description']})

                result = []
                result_str = []
                for target_val in target_percent:
                    if target_val['target_id'].split('.')[1][0:2].isdigit():
                        result.append(int(target_val['target_id'].split('.')[1][0:2]))
                    else:
                        result_str.append(target_val['target_id'].split('.')[1][0:2])
                outputs = sorted(result) + sorted(result_str)
                target_data = []
                for output in outputs:
                    for target_per in target_percent:
                        if target_per['target_id'].split('.')[1][0:2] == str(output) :
                            target_data.append(target_per)
                sdg_target_serializer = SdgTargetSerializer(target_data, many=True, context={'request': request})
                data = {
                    'percentage': sdg_target_serializer.data
                }
                return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SdgView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            import json
            year = request.GET.get('year', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source')
            sdg_code = request.GET.get('sdg', None)
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            try:
                sdg = SDGSunburst.objects.get(sdg_year=year).response
            except Exception as e:
                sdg = get_sdg_sunburst(year, operating_unit, budget_source, sdg_code)
            return self.jp_response(s_code='HTTP_200_OK', data=json.loads(sdg))
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SectorView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            search = self.request.GET.get('search', '')
            year = process_query_params(request.GET.get('year', ''))
            operating_unit = request.GET.get('operating_unit', '')
            donor = process_query_params(request.GET.get('donor', ''))
            new_sector = Sector.objects.filter(Q(code__in=NEW_SECTOR_CODES)).values()
            old_sector = Sector.objects.filter(Q(code__in=OLD_SECTOR_CODES)).values()
            if search:
                old_sector = old_sector.filter(Q(code__icontains=search) | Q(sector__icontains=search))
            old_sector = list(old_sector)
            new_sector = list(new_sector)
            if search == '' or search.lower() == 'others' or search == '0':
                other_valid_sectors = get_valid_sectors(year, operating_unit, donor, sector='0')
                if other_valid_sectors:
                    old_sector.append({'code': "0", 'sector': "Others", 'color': NULL_SECTOR_COLOR_CODE,
                                       'start_year': '2015', 'end_year': '2017'})
                    new_sector.append({'code': "0", 'sector': "Others", 'color': NULL_SECTOR_COLOR_CODE,
                                       'start_year': '2018', 'end_year': '2021'})
            sector = {
                'new_focus': new_sector,
                '2015-2017': old_sector
            }
            data = {
                'sector': sector
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


def get_map_data(year, sdg='', budget_source='', recipient_country='', sector='', project_id='', budget_type='',
                 signature_solution='', sdg_target='', marker_type='', marker_id='', provide_output=''):

    active_projects = get_active_projects_for_year(year, operating_unit=recipient_country,
                                                   budget_source=budget_source)
    projects_query = get_project_query(year, operating_unit=recipient_country, budget_source=budget_source,
                                       sdg=sdg, sector=sector)

    projects = Project.objects.filter(projects_query & Q(project_id__in=active_projects)).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=recipient_country,
                                      sdg=sdg, sector=sector, project_id=project_id, budget_type=budget_type,
                                      signature_solution=signature_solution, sdg_target=sdg_target,
                                      marker_type=marker_type, marker_id=marker_id)
    donor_query = fund_query & Q(project__in=projects)

    countries = DonorFundSplitUp.objects.filter(donor_query).distinct().prefetch_related('project', 'output')
    countries = countries.values('output__operating_unit') \
        .annotate(project_count=Count('project', distinct=True),
                  output_count=Count('output', distinct=True),
                  donor_count=Count('organisation', distinct=True),
                  total_budget=Coalesce(Sum('budget'), 0),
                  total_expense=Coalesce(Sum('expense'), 0),
                  operating_unit_name=F('output__operating_unit__name'),
                  operating_unit_iso3=F('output__operating_unit__iso3'),
                  operating_unit_iso2=F('output__operating_unit__iso2'),
                  operating_unit_unit_type=F('output__operating_unit__unit_type'),
                  operating_unit_latitude=F('output__operating_unit__latitude'),
                  operating_unit_longitude=F('output__operating_unit__longitude'),
                  )

    if year and int(year) >= SDG_START_YEAR and sdg or int(year) >= SDG_START_YEAR and sdg_target:
        serializer = MapDetailsSdgSerializer(countries, many=True, context={'year': year,
                                                                            'sdg': sdg,
                                                                            'sdg_target': sdg_target,
                                                                            'provide_output': provide_output
                                                                            })
        if provide_output or recipient_country or budget_source:
            return countries
        else:
            return serializer.data
    return countries
