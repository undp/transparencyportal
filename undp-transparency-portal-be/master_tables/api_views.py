from django.db.models.aggregates import Count
from django.db.models.fields import BooleanField
from rest_framework import filters
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from master_tables.models import Region, Sector, ProjectTimeLine, DocumentCategory, Sdg
from master_tables.serializers import RegionSerializer, CountrySerializer, OrganisationSerializer, \
    SectorSerializer, OperatingUnitSerializer, BudgetSourceSerializer, DocumentCategorySerializer, \
    BureauLevelSerializer, CountryLevelSerializer, SdgSerializer, BureauSerializer
from undp_donors.models import DONOR_CATEGORY_CHOICES, FUND_STREAM_CHOICES
from undp_projects.models import ProjectSearch
from utilities.mixins import ResponseViewMixin
from utilities.pagination import CustomOffsetPagination
from utilities.config import NULL_SECTOR_COLOR_CODE, NULL_SDG_COLOR_CODE, FUND_STREAM_PRIORITY, \
    SDG_START_YEAR, SP_START_YEAR, NEW_SECTOR_CODES, SP_END_YEAR, OLD_SECTOR_CODES
from rest_framework.views import APIView
from master_tables.utils import *
from rest_framework import status
from itertools import chain

from utilities.utils import get_valid_sectors, get_valid_sdgs, process_query_params, \
    get_project_full_text_search_query


class RegionListView(ListAPIView):
    serializer_class = RegionSerializer
    queryset = Region.objects.all()
    paginate_by = 100
    filter_backends = (filters.SearchFilter,)
    search_fields = ('bureau', 'name', 'region_code')


class BureauListView(ListAPIView):
    serializer_class = BureauSerializer
    queryset = Bureau.objects.all()
    paginate_by = 100
    # filter_backends = (filters.SearchFilter,)
    # search_fields = ('bureau', 'name', 'region_code')

class CountryListViewModified(ListAPIView, ResponseViewMixin):
    # serializer_class = CountrySerializer
    queryset = OperatingUnit.objects.filter(area_type='country')
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'iso2', 'iso3')
    # paginate_by = 100
    pagination_class = CustomOffsetPagination

    def get(self, request, *args, **kwargs):
        countries = OperatingUnit.objects.filter(area_type='country')

        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            serializer = CountrySerializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)

        serializer = CountrySerializer(countries, many=True)
        return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)


class CountryListView(ListAPIView, ResponseViewMixin):
    serializer_class = CountrySerializer
    # queryset = OperatingUnit.objects.filter(area_type='country')
    queryset = OperatingUnit.objects.filter(is_recipient=True)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'iso2', 'iso3')

    def get(self, request, *args, **kwargs):
        try:
            search = request.GET.get('search', '')
            donor = request.GET.get('donor', '')
            year = request.GET.get('year', '')
            sector = request.GET.get('sector', '')
            sdg = request.GET.get('sdg', '')
            queryset = self.get_queryset()
            if search:
                queryset = queryset.filter(Q(name__icontains=search) |
                                           Q(iso2__iexact=search) |
                                           Q(iso3__iexact=search))
            if donor:
                donor_query = Q(project__donorfundsplitup__organisation=donor) | \
                    Q(project__donorfundsplitup__organisation__type_level_3=donor)
                if year:
                    donor_query.add(Q(project__donorfundsplitup__year=year), Q.AND)
                queryset = queryset.filter(donor_query)
            if sector:
                if sector == '0':
                    EXCLUDED_SECTOR_CODES.append('8')
                    sector_query = Q(project__output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                        Q(project__output__outputsector__isnull=True)
                else:
                    sector_query = Q(Q(project__output__outputsector__sector=sector))
                queryset = queryset.filter(sector_query)
            if sdg:
                if sdg == '0':
                    # sdg_query = Q(project__output__outputsdg__isnull=True)
                    sdg_query = Q(project__output__outputtarget__isnull=True)
                else:
                    # sdg_query = Q(project__output__outputsdg__sdg=sdg)
                    sdg_query = Q(project__output__outputtarget__target_id__sdg=sdg)
                queryset = queryset.filter(sdg_query)

            if year:
                year_query = Q(Q(project__project_active__year=year) &
                               Q(project__donorfundsplitup__year=year)) | \
                    Q(Q(project__project_active__year=year) & Q(~Q(project__donorfundsplitup__year=year) |
                                                                Q(project__donorfundsplitup__isnull=True)))

                queryset = queryset.filter(year_query)

            queryset = queryset.annotate(budget=Sum('project__donorfundsplitup__budget'))\
                .annotate(total_budget=Case(When(budget__isnull=True, then=0),
                                            default=F('budget')))\
                .annotate(priority=Case(When(unit_type='HQ', then=Value(0, output_field=IntegerField())),
                                        When(unit_type='CO', then=Value(1, output_field=IntegerField()))))\
                .order_by('-priority', '-total_budget')
            serializer = CountrySerializer(queryset, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganisationListView(ListAPIView):
    serializer_class = OrganisationSerializer
    queryset = Organisation.objects.all()
    paginate_by = 100
    filter_backends = (filters.SearchFilter,)
    search_fields = ('short_name', 'org_name')


class SectorListView(ListAPIView):
    serializer_class = SectorSerializer
    EXCLUDED_SECTOR_CODES.append('8')
    queryset = Sector.objects.filter(~Q(code__in=EXCLUDED_SECTOR_CODES))

    def get_queryset(self):
        search = self.request.GET.get('search', '')
        year = self.request.GET.get('year', '')
        operating_unit = self.request.GET.get('operating_unit', '')
        donor = self.request.GET.get('donor', '')
        append_others = self.request.GET.get('append_others', '')
        valid_sectors = get_valid_sectors(year, operating_unit, donor)

        if not year:
            queryset = Sector.objects.all().filter(~Q(code__in=EXCLUDED_SECTOR_CODES)).values()
            if search:
                queryset = queryset.filter(Q(code__icontains=search) | Q(sector__icontains=search))
            queryset = list(queryset)
            if search == '' or search.lower() == 'others' or search == '0':
                other_valid_sectors = get_valid_sectors(year, operating_unit, donor, sector='0')
                if other_valid_sectors:
                    queryset.append({'code': "0", 'sector': "Others", 'color': NULL_SECTOR_COLOR_CODE})
        elif SP_START_YEAR <= int(year) <= SP_END_YEAR:
            queryset = Sector.objects.filter(Q(code__in=NEW_SECTOR_CODES), Q(code__in=valid_sectors)).values()
            queryset = list(queryset)
            other_valid_sectors = get_valid_sectors(year, operating_unit, donor, sector='0')
            if other_valid_sectors and append_others:
                queryset.append({'code': "0", 'sector': "Others", 'color': NULL_SECTOR_COLOR_CODE})
        else:
            queryset = Sector.objects.filter(Q(code__in=OLD_SECTOR_CODES), Q(code__in=valid_sectors)).values()
            if search:
                queryset = queryset.filter(Q(code__icontains=search) | Q(sector__icontains=search))
            queryset = list(queryset)
            if search == '' or search.lower() == 'others' or search == '0':
                other_valid_sectors = get_valid_sectors(year, operating_unit, donor, sector='0')
                if other_valid_sectors:
                    queryset.append({'code': "0", 'sector': "Others", 'color': NULL_SECTOR_COLOR_CODE})
        return queryset


class SdgListView(ListAPIView):
    serializer_class = SdgSerializer
    queryset = Sdg.objects.all()

    def get_queryset(self):
        search = self.request.GET.get('search', '')
        year = self.request.GET.get('year', '')
        operating_unit = self.request.GET.get('operating_unit', '')
        donor = self.request.GET.get('donor', '')
        queryset = []
        if not year or (year and int(year) >= SDG_START_YEAR):
            valid_sdgs = get_valid_sdgs(year, operating_unit, donor)
            queryset = self.queryset.filter(code__in=valid_sdgs).values()
            if search:
                queryset = queryset.filter(Q(code__icontains=search) | Q(name__icontains=search))
            queryset = list(queryset)
            if search == '' or search.lower() == 'others' or search == '0':
                other_valid_sdgs = get_valid_sdgs(year, operating_unit, donor, sdg='0')
                if other_valid_sdgs:
                    queryset.append({'code': "0", 'name': "Others", 'color': NULL_SDG_COLOR_CODE})
        return queryset


class OperatingUnitView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            search = request.GET.get('search', '')
            operating_units = get_operating_units(search)
            if search:
                organisations = get_organisations(search)
                result_list = list(chain(operating_units, organisations))
            else:
                result_list = operating_units

            donors = OperatingUnitSerializer(result_list, many=True)
            data = {
                'donors': donors.data,
                'draw': search
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BudgetSourceView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            search = request.GET.get('search', '')
            country = request.GET.get('country', '')
            year = request.GET.get('year', '')
            sector = request.GET.get('sector', '')
            sdg = request.GET.get('sdg', '')
            ss_id = request.GET.get('ss_id', '')

            operating_units = get_budget_sources(search, year, country=country, sector=sector,
                                                 sdg=sdg, ss_id=ss_id)
            donors = BudgetSourceSerializer(operating_units, many=True,
                                            context={'search': search,
                                                     'sector': sector,
                                                     'sdg': sdg,
                                                     'ss_id': ss_id,
                                                     'year': year,
                                                     'country': country})
            data = {
                'donors': donors.data,
                'draw': search
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DonorsView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            donors_level_3 = Organisation.objects.filter(type_level_3__isnull=False)\
                .values('type_level_3')\
                .annotate(count=Count('ref_id'),
                          code=F('type_level_3'),
                          name=F('level_3_name'),
                          is_donor=Value(True, output_field=BooleanField()),
                          is_recipient=Case(When(operating_unit__is_recipient__isnull=True,
                                                 then=Value(False, output_field=BooleanField())),
                                            default=F('operating_unit__is_recipient'))
                          )\
                .values('code', 'name', 'is_donor', 'is_recipient')
            donors_level_4 = Organisation.objects.values('ref_id')\
                .annotate(code=F('ref_id'), name=F('org_name'),
                          is_donor=Value(True, output_field=BooleanField()),
                          is_recipient=Value(False, output_field=BooleanField())
                          ) \
                .values('code', 'name', 'is_donor', 'is_recipient')
            donors = list(donors_level_3) + list(donors_level_4)
            data = {
                'donors': donors,
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectTimeLineListView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):

        try:
            tab = request.GET.get('tab', '')
            queryset = ProjectTimeLine.objects.filter(is_active=True)
            if tab == 'sdg':
                queryset = queryset.filter(year__gte=2016)
            queryset = queryset.order_by('-year')\
                .values_list('year', flat=True)
            return Response(queryset)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DonorTypesView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            EXCLUDED_DONOR_TYPES = [2, 5, 7, 8, 12, 13, 14, 15]
            donor_types = DONOR_CATEGORY_CHOICES.choices()
            result = []
            for (k, v) in dict(donor_types).items():
                if k not in EXCLUDED_DONOR_TYPES:
                    result.append({
                        'code': k,
                        'value': v
                    })
            result = sorted(result, key=lambda k: k['value'])
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FundStreamsView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            fund_streams = FUND_STREAM_CHOICES.choices()
            result = []
            for (k, v) in dict(fund_streams).items():
                if k != FUND_STREAM_CHOICES.core:
                    result.append({
                        'code': k,
                        'value': v,
                        'priority': FUND_STREAM_PRIORITY.get(v, '')
                    })
            result = sorted(result, key=lambda item: item['priority'])
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentCategoryView(ListAPIView):
    serializer_class = DocumentCategorySerializer
    filter_backends = (filters.SearchFilter,)
    search_fields = ('category', 'title')

    def get_queryset(self):
        show_all = self.request.GET.get('show_all', None)
        queryset = DocumentCategory.objects.filter()
        if show_all is None:
            queryset = queryset.filter(priority__lte=6)
        return queryset.order_by('priority')


class CountryRegionsView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            search = request.GET.get('search', '')
            year = process_query_params(request.GET.get('year', ''))
            sector = process_query_params(request.GET.get('sector', ''))
            sdg = process_query_params(request.GET.get('sdg', ''))
            donor = process_query_params(request.GET.get('donor', ''))
            ss_id = request.GET.get('ss_id', '')
            marker_type = request.GET.get('marker_type', '')
            marker_id = request.GET.get('marker_id', '')
            level_two_marker = request.GET.get('level_two_marker', '')
            search_query = Q(is_recipient=True)
            if search:
                search_query &= Q(iso3__icontains=search) | Q(name__icontains=search) | \
                    Q(bureau__code__icontains=search) | Q(bureau__bureau__icontains=search)

            projects_query = get_project_full_text_search_query(year, [], donor,
                                                                sector, '', budget_type='direct',
                                                                category='', sdgs=sdg, signature_solution=ss_id,
                                                                marker_type=marker_type, marker_id=marker_id,
                                                                level_two_marker=level_two_marker)
            project_ids = ProjectSearch.objects.filter(projects_query).distinct('project_id') \
                .values_list('project_id', flat=True)

            search_query.add(Q(project__in=project_ids), Q.AND)
            queryset = OperatingUnit.objects.filter(search_query).select_related('bureau')
            queryset1 = queryset \
                .filter(bureau__isnull=False) \
                .values('bureau__code').annotate(Count('iso3')) \
                .values('bureau__code', 'bureau__bureau').order_by('bureau__bureau')
            serializer1 = BureauLevelSerializer(queryset1, many=True, context={'request': request})
            queryset2 = queryset.filter(bureau__isnull=True).values('iso3', 'name', 'iso2')
            serializer2 = CountryLevelSerializer(queryset2, many=True, context={'request': request})
            data = serializer1.data + serializer2.data
            ordered_data = sorted(data, key=lambda item: item['name'])
            result = {
                'draw': search,
                'data': ordered_data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            print(e)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
