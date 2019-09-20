from django.core.exceptions import ObjectDoesNotExist
from django.db.models.query_utils import Q
from django.db.models.aggregates import Sum, Count
from django.db.models.expressions import F, When, Case, Value
from django.db.models.functions.base import Coalesce
from rest_framework.generics import GenericAPIView
from rest_framework.viewsets import GenericViewSet
from rest_framework.views import APIView
from django.db.models.expressions import F
from utilities.utils import get_active_projects_for_year
from undp_donors.models import DonorFundSplitUp
from undp_outputs.models import Output, OutputResult, ProjectMarker, MARKER_TYPE_CHOICES, MARKER_PARENT_CHOICES
from undp_projects.models import ProjectSearch, Project
from undp_projects.serializers import ProjectListSerializer, ProjectDetailSerializer
from undp_outputs.serializers import OutputSerializer, OutputDetailSerializer, ResultSerializer, OutputListSerializer, \
    ProjectMarkerSerializer, MarkerSerializer, MarkerBudgetSourcesSerializer, MarkerOperatingUnitSerializer, \
    MarkerFlagSerializer, FlightMapSerializer, MarkerLevelOneSerializer, ProjectListSSCSerializer, \
    LevelTwoMarkerSerializer
from master_tables.models import OperatingUnit
from utilities.mixins import ResponseViewMixin
from utilities.pagination import CustomOffsetPagination
from utilities.utils import process_query_params, get_fund_split_many_query


class OutputDetailView(GenericAPIView, ResponseViewMixin):
    queryset = Output.objects.all()

    def get(self, request, *args, **kwargs):
        """
            Output details get
        """
        try:
            try:
                output_object = self.get_object()
            except ObjectDoesNotExist:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Project output not found'])
            serializer = OutputSerializer(output_object)
            return self.jp_response(s_code='HTTP_200_OK', data={'output': serializer.data})
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class OutputViewSet(GenericViewSet, ResponseViewMixin):
    queryset = Output.objects.all()
    pagination_class = CustomOffsetPagination
    serializer_class = OutputDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """
        Project details
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        try:
            output = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project output not found'])

        else:
            year = request.GET.get('year', '')
            serializer = self.get_serializer(output, context={'request': request, 'year': year})
        return self.jp_response(s_code='HTTP_200_OK', data=[serializer.data])

    def list(self, request, *args, **kwargs):
        """
        List Projects.
        :param request:
        :param args:
        :param kwargs:
        :return:
        """

        year = request.GET.get('year', '')
        project = request.GET.get('project')
        if not project:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a project ID'])
        queryset = self.filter_queryset(self.get_queryset().filter(project=project))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = OutputListSerializer(page, many=True, context={'request': request, 'year': year})
            data = serializer.data
            return self.get_paginated_response(data)
        serializer = OutputListSerializer(queryset, many=True, context={'request': request, 'year': year})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data})


class OutputResultsView(GenericAPIView, ResponseViewMixin):
    queryset = Output.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            output = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project output not found'])

        results = OutputResult.objects.filter(output=output)
        outputs_data = ResultSerializer(results, many=True)
        return self.jp_response(s_code='HTTP_200_OK', data=outputs_data.data)


class MarkersDetailView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            marker_type = request.GET.get('type', '')
            country = request.GET.get('operating_unit', '')
            marker_id = request.GET.get('marker_id', '')
            op_query = Q(output_id__operating_unit=country) | Q(output_id__operating_unit__bureau__code=country) \
                       | Q(output_id__project_id__operating_unit=country)
            if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                project_default = ProjectMarker.objects.filter(type=marker_type,
                                                               parent_type=MARKER_PARENT_CHOICES.default)\
                    .distinct('parent_type', 'parent_marker_desc')
                project_others = ProjectMarker.objects.exclude(parent_type=MARKER_PARENT_CHOICES.default)\
                    .filter(type=marker_type)\
                    .distinct('parent_type')
                if country:
                    project_default = project_default.filter(op_query)
                    project_others = project_others.filter(op_query)
                project_object = project_default.union(project_others, all=True)
            elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
                project_object = ProjectMarker.objects.filter(type=marker_type).distinct('parent_type')
            else:
                project_object = ProjectMarker.objects.filter(type=marker_type).distinct('marker_id', 'marker_title')\
                    .order_by('marker_title')
            if country:
                project_object = project_object.filter(op_query)
            if marker_id:
                if int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
                    marker_query = Q(marker_title=str(marker_id))
                elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
                    marker_query = Q(level_two_marker_description=str(marker_id))
                else:
                    marker_query = Q(marker_id=marker_id)
                project_object = project_object.filter(marker_query)
            serializer = ProjectMarkerSerializer(project_object, many=True)

            return self.jp_response(s_code='HTTP_200_OK', data={'type': serializer.data})
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])

        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project output not found'])


class MarkersAggregateView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            operating_unit = kwargs.get('pk')
            marker_type = request.GET.get('type', '')
            marker_id = request.GET.get('marker_id', '')
            level_two_marker = request.GET.get('level_two_marker', '')
            query = Q()
            if marker_id:
                if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                    marker_query = Q(output__marker_output__parent_marker_desc=str(marker_id)) \
                                   & Q(output__marker_output__type=marker_type)
                elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
                    marker_query = Q(output__marker_output__marker_title=str(marker_id)) \
                                   & Q(output__marker_output__type=marker_type)
                elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
                    marker_query = Q(output__marker_output__level_two_marker_description=str(marker_id)) \
                                   & Q(output__marker_output__type=marker_type)
                else:
                    marker_query = Q(output__marker_output__marker_id=marker_id) \
                                   & Q(output__marker_output__type=marker_type)
                query.add(marker_query, Q.AND)
            if int(marker_type) == MARKER_TYPE_CHOICES.ssc_marker and level_two_marker:
                level_two_query = Q(output__marker_output__level_two_marker_title=level_two_marker)
                query.add(level_two_query, Q.AND)
            if operating_unit != 'all':
                op_query = Q(project__operating_unit=operating_unit) | Q(project__operating_unit__bureau__code=
                                                                         operating_unit)
                query.add(op_query, Q.AND)
                active_projects = get_active_projects_for_year(year, operating_unit=operating_unit, flat=True)
                aggregate = DonorFundSplitUp.objects \
                    .filter(year=year, project_id__in=active_projects, output__in=ProjectMarker.objects.filter(type=
                            marker_type).values_list('output')).filter(query).distinct() \
                    .aggregate(budget_sources_count=Count('organisation', distinct=True),
                               project_count=Count('project', distinct=True),
                               output_count=Count('output', distinct=True),
                               expense_amount=Coalesce(Sum('expense'), 0),
                               budget_amount=Coalesce(Sum('budget'), 0))
            else:
                active_projects = get_active_projects_for_year(year, flat=True)

                aggregate = DonorFundSplitUp.objects \
                    .filter(year=year, project_id__in=active_projects, output__in=ProjectMarker.objects.filter(
                        type=marker_type).values_list('output')).filter(query).distinct()\
                    .aggregate(budget_sources_count=Count('organisation', distinct=True),
                               project_count=Count('project', distinct=True),
                               output_count=Count('output', distinct=True),
                               expense_amount=Coalesce(Sum('expense'), 0),
                               budget_amount=Coalesce(Sum('budget'), 0))

            recipient_details = {
                'projects_count': aggregate['project_count'],
                'outputs_count': aggregate['output_count'],
                'budget': aggregate['budget_amount'],
                'expense': aggregate['expense_amount'],
                'budget_sources': aggregate['budget_sources_count'],
            }
            return self.jp_response(s_code='HTTP_200_OK', data=recipient_details)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class OutputMarkerView(GenericAPIView, ResponseViewMixin):
    queryset = Output.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            output = self.get_object()
        except ObjectDoesNotExist:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Project output not found'])
        markers = ProjectMarker.objects.filter(output=output).values('output', 'marker_title', 'type').distinct('type')
        marker_serializer = MarkerSerializer(markers, many=True)
        return self.jp_response(s_code='HTTP_200_OK', data=marker_serializer.data)


class MarkersGraphView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            marker_type = request.GET.get('marker_type', '')
            marker_id = request.GET.get('marker_id', '')
            operating_unit = request.GET.get('operating_unit', '')
            budget_source = request.GET.get('budget_source', '')
            level_two_marker = request.GET.get('level_two_marker', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            active_projects = get_active_projects_for_year(year)
            donor_query = Q(project__in=active_projects) & Q(year=year) & \
                          Q(project__project_active__year=year)
            if marker_type:
                # donor_query.add(Q(output__projectmarker__type=marker_type), Q.AND)
                outputs = ProjectMarker.objects.filter(Q(type=marker_type) & Q(
                    output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                donor_query.add(Q(output__in=outputs), Q.AND)
            if marker_id:
                # if int(marker_type) == MARKER_TYPE_CHOICES.whos_marker or \
                #         int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                #     # donor_query.add(Q(output__projectmarker__parent_type=marker_id), Q.AND)
                #     outputs = outputs.filter(Q(parent_type=marker_id) & Q(
                #         output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                #     donor_query.add(Q(output__in=outputs), Q.AND)
                # else:
                #     # donor_query.add(Q(output__projectmarker__marker_id=marker_id), Q.AND)
                #     outputs = outputs.filter(Q(marker_id=marker_id) & Q(
                #         output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                #     donor_query.add(Q(output__in=outputs), Q.AND)
                if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                    outputs = outputs.filter(Q(parent_marker_desc=str(marker_id)) & Q(
                            output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
                    outputs = outputs.filter(Q(marker_title=str(marker_id)) & Q(
                        output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
                    outputs = outputs.filter(Q(level_two_marker_description=str(marker_id)) & Q(
                        output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                else:
                    outputs = outputs.filter(Q(marker_id=marker_id) & Q(
                            output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                donor_query.add(Q(output__in=outputs), Q.AND)
            if level_two_marker:
                # donor_query.add(Q(output__projectmarker__level_two_marker_title=level_two_marker), Q.AND)
                outputs = outputs.filter(Q(output__marker_output__level_two_marker_title=level_two_marker) & Q(
                    output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                donor_query.add(Q(output__in=outputs), Q.AND)
            if operating_unit:
                donor_query.add(Q(project__operating_unit=operating_unit) |
                                Q(project__operating_unit__bureau__code=operating_unit), Q.AND)
            if budget_source:
                donor_budget_query = Q(organisation__ref_id=budget_source) | \
                                     Q(organisation__type_level_3=budget_source)
                donor_query.add(donor_budget_query, Q.AND)
            budget_sources = DonorFundSplitUp.objects.filter(donor_query).values('organisation')\
                             .annotate(total_expense=Coalesce(Sum('expense'), 0),
                                       total_budget=Coalesce(Sum('budget'), 0),
                                       short_name=F('organisation__short_name'),
                                       organisation_name=F('organisation__org_name')) \
                             .order_by('-total_budget')[0:10]
            budget_sources_serializer = MarkerBudgetSourcesSerializer(budget_sources, many=True,
                                                                      context={'request': request})
            top_recipient_offices = DonorFundSplitUp.objects.filter(donor_query &
                                                                    Q(project__operating_unit__isnull=False)) \
                                        .values('project__operating_unit') \
                                        .annotate(total_expense=Coalesce(Sum('expense'), 0),
                                                  total_budget=Coalesce(Sum('budget'), 0),
                                                  name=F('project__operating_unit__name'),
                                                  iso3=F('project__operating_unit__iso3')).order_by('-total_budget')[
                                         0:10]

            recipient_offices_serializer = MarkerOperatingUnitSerializer(top_recipient_offices, many=True)
            data = {
                'budget_sources': budget_sources_serializer.data,
                'top_recipient_offices': recipient_offices_serializer.data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class MarkerProjectViewSet(GenericViewSet, ResponseViewMixin):
    queryset = Project.objects.all()
    pagination_class = CustomOffsetPagination
    serializer_class = ProjectDetailSerializer

    def list(self, request, *args, **kwargs):
        year = process_query_params(request.GET.get('year', None))
        operating_unit = request.GET.get('operating_unit', None)
        budget_type = request.GET.get('budget_type', None)
        budget_sources = process_query_params(request.GET.get('budget_sources', None))
        marker_type = request.GET.get('marker_type', None)
        marker_id = request.GET.get('marker_id', None)
        draw = request.GET.get('draw')
        level_two = request.GET.get('level_two_marker', None)
        op_query = Q(project_id__operating_unit=operating_unit) | Q(project_id__operating_unit__bureau__code=
                                                                    operating_unit)
        if marker_type:
            project_ids = ProjectSearch.objects.filter(project_id__output__marker_output__type=marker_type,
                                                       year__in=year)\
                .distinct('project_id') \
                .values_list('project_id', flat=True)
            if marker_id:
                if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                    project_ids = ProjectSearch.objects\
                        .filter(project_id__output__marker_output__parent_marker_desc=str(marker_id),
                                project_id__output__marker_output__type=marker_type,
                                year__in=year) \
                        .distinct('project_id').values_list('project_id', flat=True)
                elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
                    project_ids = ProjectSearch.objects\
                        .filter(project_id__output__marker_output__marker_title=str(marker_id),
                                project_id__output__marker_output__type=marker_type,
                                year__in=year) \
                        .distinct('project_id').values_list('project_id', flat=True)
                elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
                    project_ids = ProjectSearch.objects\
                        .filter(project_id__output__marker_output__level_two_marker_description=str(marker_id),
                                project_id__output__marker_output__type=marker_type,
                                year__in=year) \
                        .distinct('project_id').values_list('project_id', flat=True)
                else:
                    project_ids = ProjectSearch.objects.filter(project_id__output__marker_output__type=marker_type,
                                                               project_id__output__marker_output__marker_id=marker_id,
                                                               year__in=year) \
                        .distinct('project_id') \
                        .values_list('project_id', flat=True)
            if operating_unit:
                project_ids = project_ids.filter(op_query)\
                    .distinct('project_id').values_list('project_id', flat=True)
            # if marker_id and operating_unit:
            #     if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker \
            #             or int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
            #         project_ids = ProjectSearch.objects.filter(op_query,
            #                                                    project_id__output__marker_output__parent_type=marker_id,
            #                                                    project_id__output__marker_output__type=marker_type,
            #                                                    year__in=year) \
            #             .distinct('project_id').values_list('project_id', flat=True)
            #     else:
            #         project_ids = ProjectSearch.objects.filter(op_query,
            #                                                    project_id__output__marker_output__marker_id=marker_id,
            #                                                    project_id__output__marker_output__type=marker_type,
            #                                                    year__in=year) \
            #             .distinct('project_id').values_list('project_id', flat=True)
            if int(marker_type) == MARKER_TYPE_CHOICES.ssc_marker and level_two:
                project_ids = project_ids.filter(project_id__output__marker_output__level_two_marker_title=level_two)

            funds_query = get_fund_split_many_query(years=year, budget_sources=budget_sources, budget_type=budget_type,
                                                    operating_units=operating_unit)
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
            if int(marker_type) == MARKER_TYPE_CHOICES.ssc_marker:
                serializer = ProjectListSSCSerializer(page, many=True, context={'request': request})
            else:
                serializer = ProjectListSerializer(page, many=True, context={'request': request})
            data = serializer.data
            return self.get_paginated_response(data)
        if int(marker_type) == MARKER_TYPE_CHOICES.ssc_marker:
            serializer = ProjectListSSCSerializer(queryset, many=True, context={'request': request})
        else:
            serializer = ProjectListSerializer(queryset, many=True, context={'request': request})
        data = serializer.data
        return self.jp_response(s_code='HTTP_200_OK', data={'data': data, 'draw': draw})


class MarkerFlagsView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        operating_unit = request.GET.get('operating_unit', '')
        marker_id = request.GET.get('marker_id', '')
        level_two_marker = request.GET.get('level_two_marker', '')
        op_query = Q(output_id__operating_unit=operating_unit) | \
                   Q(output_id__operating_unit__bureau__code=operating_unit) | \
                   Q(output_id__project__operating_unit=operating_unit)
        if operating_unit:
            markers = ProjectMarker.objects.filter(op_query, type=MARKER_TYPE_CHOICES.ssc_marker)\
                .values('marker_id', 'marker_title', 'marker_desc') \
                .distinct('marker_id')

        else:
            markers = ProjectMarker.objects.filter(type=MARKER_TYPE_CHOICES.ssc_marker).values('marker_id',
                                                                                               'marker_title',
                                                                                               'marker_desc') \
                .distinct('marker_id')
        if marker_id:
            markers = markers.filter(marker_id=marker_id)
        if level_two_marker:
            markers = markers.filter(Q(output_id__marker_output__level_two_marker_title=level_two_marker))
        marker_serializer = MarkerFlagSerializer(markers, many=True, context={'request': request})
        return self.jp_response(s_code='HTTP_200_OK', data=marker_serializer.data)


class FlightMapView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        queryset = OperatingUnit.objects.all()
        flight_serializer = FlightMapSerializer(queryset, many=True)
        return self.jp_response(s_code='HTTP_200_OK', data=flight_serializer.data)


# class MarkerLevelOneView(GenericAPIView, ResponseViewMixin):
#
#     def get(self, request, *args, **kwargs):
#         marker_type = kwargs.get('pk')
#         country = request.GET.get('operating_unit', '')
#         op_query = Q(output_id__operating_unit=country) | Q(output_id__operating_unit__bureau__code=country) \
#                    | Q(output_id__project__operating_unit=country)
#         if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
#             marker_default = ProjectMarker.objects.filter(type=marker_type,
#                                                           parent_type=MARKER_PARENT_CHOICES.default) \
#                 .distinct('parent_type', 'parent_marker_desc')
#             marker_others = ProjectMarker.objects.exclude(parent_type=MARKER_PARENT_CHOICES.default) \
#                 .filter(type=marker_type) \
#                 .distinct('parent_type')
#             if country:
#                 marker_default = marker_default.filter(op_query)
#                 marker_others = marker_others.filter(op_query)
#             markers1 = marker_default.union(marker_others, all=True)
#             markers = markers1.order_by('parent_marker_desc')
#         elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
#             markers = ProjectMarker.objects.filter(type=marker_type).distinct('parent_type')
#         else:
#             markers = ProjectMarker.objects.filter(type=marker_type).distinct('marker_id', 'marker_title')\
#                 .order_by('marker_title')
#         if country:
#             markers = markers.filter(op_query)
#         marker_serializer = MarkerLevelOneSerializer(markers, many=True)
#         return self.jp_response(s_code='HTTP_200_OK', data=marker_serializer.data)
#

class PartnerMarkerView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        country = request.GET.get('operating_unit', '')
        partner_marker = []
        marker_default = ProjectMarker.objects.filter(type=MARKER_TYPE_CHOICES.partner_marker,
                                                      parent_type=MARKER_PARENT_CHOICES.default) \
            .distinct('parent_type', 'parent_marker_desc')
        if country:
            marker_default = marker_default.filter(Q(output_id__operating_unit=country))
        for marker in marker_default:
            data = {
                "marker_type": marker.parent_type,
                "title": marker.parent_marker_desc
            }
            partner_marker.append(data)
        marker_others = ProjectMarker.objects.exclude(parent_type=MARKER_PARENT_CHOICES.default) \
            .filter(type=MARKER_TYPE_CHOICES.partner_marker) \
            .distinct('parent_type')
        if country:
            marker_others = marker_others.filter(Q(output_id__operating_unit=country))
        for marker in marker_others:
            data = {
                "marker_type": marker.parent_type,
                "title": MARKER_PARENT_CHOICES.get_label(marker.parent_type)
            }
            partner_marker.append(data)
        marker_sort = sorted(partner_marker, key=lambda k: k['title'])
        return self.jp_response(s_code='HTTP_200_OK', data=marker_sort)


class PartnerMarkerDescriptionView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        country = request.GET.get('operating_unit', '')
        description = request.GET.get('description', '')
        partner_marker = []
        marker_default = ProjectMarker.objects.filter(type=MARKER_TYPE_CHOICES.partner_marker,
                                                      parent_type=MARKER_PARENT_CHOICES.default)\
            .distinct('parent_marker_desc', 'parent_type')
        if country:
            marker_default = marker_default.filter(Q(output_id__operating_unit=country))
        if description:
            marker_default = marker_default.filter(Q(parent_marker_desc=str(description)))
        for marker in marker_default:
            data = {
                "type_title": marker.parent_marker_desc,
                "description_details": marker.parent_marker_desc,
                "type_details": "",
                "description_title": ""
                 }
            partner_marker.append(data)
        marker_others = ProjectMarker.objects.exclude(parent_type=MARKER_PARENT_CHOICES.default) \
            .filter(type=MARKER_TYPE_CHOICES.partner_marker) \
            .distinct('parent_type')
        if country:
            marker_others = marker_others.filter(Q(output_id__operating_unit=country))
        if description:
            marker_others = marker_others.filter(Q(parent_marker_desc=str(description)))
        for marker in marker_others:
            parent_marker_desc = ProjectMarker.objects.values_list('parent_marker_desc', flat=True) \
                .filter(type=marker.type, parent_type=marker.parent_type).distinct('parent_marker_desc')
            data = {
                "type_title": MARKER_PARENT_CHOICES.get_label(marker.parent_type),
                "description_details": parent_marker_desc,
                "type_details": "",
                "description_title": ""
            }
            partner_marker.append(data)
        marker_sort = sorted(partner_marker, key=lambda k: k['type_title'])
        return self.jp_response(s_code='HTTP_200_OK', data={'type': marker_sort})


class MarkerLevelOneView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        marker_type = kwargs.get('pk')
        country = request.GET.get('operating_unit', '')
        op_query = Q(output_id__operating_unit=country) | Q(output_id__operating_unit__bureau__code=country) \
                   | Q(output_id__project__operating_unit=country)
        if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
            markers = ProjectMarker.objects.filter(type=marker_type).distinct('parent_marker_desc')
        elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
            markers = ProjectMarker.objects.filter(type=marker_type).distinct('marker_title')
        elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
            markers = ProjectMarker.objects.filter(type=marker_type).distinct('level_two_marker_description')
        else:
            markers = ProjectMarker.objects.filter(type=marker_type).distinct('marker_id', 'marker_title') \
                .order_by('marker_title')
        if country:
            markers = markers.filter(op_query)
        marker_serializer = MarkerLevelOneSerializer(markers, many=True)
        return self.jp_response(s_code='HTTP_200_OK', data=marker_serializer.data)


class LevelTwoMarkerView(GenericAPIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        operating_unit = request.GET.get('operating_unit', '')
        marker_id = request.GET.get('marker_id', '')
        op_query = Q(output_id__operating_unit=operating_unit) | \
                   Q(output_id__operating_unit__bureau__code=operating_unit) | \
                   Q(output_id__project__operating_unit=operating_unit)
        if operating_unit:
            markers = ProjectMarker.objects.filter(op_query, type=MARKER_TYPE_CHOICES.ssc_marker)\
                .values('level_two_marker_id', 'level_two_marker_title') \
                .distinct('level_two_marker_id')

        else:
            markers = ProjectMarker.objects.filter(type=MARKER_TYPE_CHOICES.ssc_marker)\
                .values('level_two_marker_id', 'level_two_marker_title') \
                .distinct('level_two_marker_id')
        if marker_id:
            markers = markers.filter(marker_id=marker_id)
        marker_serializer = LevelTwoMarkerSerializer(markers, many=True, context={'request': request})
        return self.jp_response(s_code='HTTP_200_OK', data=marker_serializer.data)
