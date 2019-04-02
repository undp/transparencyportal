from django.db.models.aggregates import Sum, Count
from django.db.models.expressions import F, Case, When, Value
from django.db.models.fields import IntegerField, DecimalField
from django.db.models.functions.base import Coalesce
from django.db.models.query_utils import Q
from rest_framework.views import APIView

from master_tables.models import Organisation, Bureau, Sector
from undp_donors.models import DonorFundSplitUp, DonorFundModality, DONOR_CATEGORY_CHOICES
from undp_donors.serializers import DonorFundSplitUpSerializer, RecipientBudgetSourcesSerializer, \
    DonorfundAggregateSerializer, FundModalitySerializer, FundModalitySourcesSerializer, \
    TopRecieversSerializer, DonorsListSerializer, BudgetSourcesSerializer, DonorContributionSerializer, \
    DonorSankeySerializer, SectorSankeySerializer, TopBudgetSourcesSerializer, SsSankeySerializer
from undp_projects.serializers import ProjectAggregateSerializer
from utilities.config import EXCLUDED_SECTOR_CODES, NULL_SECTOR_COLOR_CODE, LEVEL_3_NAMES_MAPPING, UNDP_DONOR_ID, \
    SDG_START_YEAR, SP_START_YEAR
from utilities.mixins import ResponseViewMixin
from utilities.utils import get_organisation_fund_split, get_budget_sources_for_year, get_fund_modality, \
    get_fund_aggregate, process_query_params, get_top_recipients, get_donor_category_color, get_bureau_color, \
    get_sankey_nodes, get_active_projects_for_year, get_project_aggregate, get_donor_category_label, get_fund_split_query


class DonorFundSplitUpView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            organisation = request.GET.get('organisation', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            if not organisation:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide an organisation'])

            receivers = get_organisation_fund_split(year, organisation)
            serializer = DonorFundSplitUpSerializer(receivers, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class RecipientBudgetSourcesView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            operating_unit = request.GET.get('operating_unit', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            if not operating_unit:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a recipient country'])
            receivers = get_budget_sources_for_year(year, operating_unit=operating_unit)[0:10]
            serializer = RecipientBudgetSourcesSerializer(receivers, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class DonorCountryFundModalityView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            country = request.GET.get('country')
            group_by = request.GET.get('group_by', '')
            serializer_donor_vs_total = 0
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            # if not country:
            #     return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
            #                                   ['Please provide a country'])
            result_country = get_fund_modality(year, country, group_by).order_by('-percentage')
            donor_vs_total = get_fund_modality(year, country, group_by, True)
            result_total = get_fund_modality(year, None, group_by)

            if not group_by:
                serializer_country = FundModalitySerializer(result_country, many=True,
                                                            context={'year': year,
                                                                     'donor': country})
                serializer_total = FundModalitySerializer(result_total, many=True,
                                                          context={'year': year,
                                                                   'donor': country})
                serializer_donor_vs_total = FundModalitySerializer(donor_vs_total, many=True,
                                                                   context={'year': year,
                                                                            'donor': country})
            else:
                serializer_country = FundModalitySourcesSerializer(result_country, many=True,
                                                                   context={'year': year,
                                                                            'donor': country})
                serializer_total = FundModalitySourcesSerializer(result_total, many=True,
                                                                 context={'year': year,
                                                                          'donor': country})
            data = {
                'country': serializer_country.data,
                'total': serializer_total.data,
                'donor_vs_total': serializer_donor_vs_total.data if serializer_donor_vs_total is not 0 else None

            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])

#
# class DonorFundModalityView(APIView, ResponseViewMixin):
#     def get(self, request, *args, **kwargs):
#         try:
#             year = request.GET.get('year', '')
#             donor = request.GET.get('donor')
#             group_by = request.GET.get('group_by', '')
#             if not year:
#                 return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
#                                               ['Please provide a year'])
#             if not donor:
#                 return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
#                                               ['Please provide a budget source'])
#             result_country = get_fund_modality(year, donor, group_by)
#             result_total = get_fund_modality(year, None, group_by)
#
#             if not group_by:
#                 serializer_country = FundModalitySerializer(result_country, many=True,
#                                                             context={'year': year,
#                                                                      'donor': donor})
#                 serializer_total = FundModalitySerializer(result_total, many=True,
#                                                           context={'year': year,
#                                                                    'donor': donor})
#             else:
#                 serializer_country = FundModalitySourcesSerializer(result_country, many=True,
#                                                                    context={'year': year,
#                                                                             'donor': donor})
#                 serializer_total = FundModalitySourcesSerializer(result_total, many=True,
#                                                                  context={'year': year,
#                                                                           'donor': donor})
#
#             data = {
#                 'donor': serializer_country.data,
#                 'total': serializer_total.data
#             }
#             return self.jp_response(s_code='HTTP_200_OK', data=data)
#         except Exception as e:
#             print(e)
#             return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class FundAggregateView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            donor = request.GET.get('donor', '')
            recipient_countries = process_query_params(request.GET.get('recipient_countries', ''))
            operating_unit = request.GET.get('recipient_countries', '')
            sectors = request.GET.get('sectors', '')
            sdg = request.GET.get('sdg', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                           budget_source=donor)

            aggregate = DonorFundSplitUp.objects.filter(Q(year=year) &
                                                        Q(project__project_active__year=year) &
                                                        ~Q(organisation__type_level_3=''))\
                .aggregate(total_budget=Sum('budget'))
            total_budget = aggregate['total_budget']
            if year and int(year) < SDG_START_YEAR and sdg:
                result = []
            else:
                result = get_fund_aggregate(year, donor, recipient_countries, sectors, sdg)

            serializer = DonorfundAggregateSerializer(result, many=True, context={'total_budget': total_budget})
            project_mapping = get_project_aggregate(year, active_projects,
                                                    operating_unit=operating_unit,
                                                    budget_source=donor, sector=sectors,
                                                    sdg=sdg)
            project_serializer = ProjectAggregateSerializer(project_mapping)
            data = {
                'project': project_serializer.data,
                'data': serializer.data,
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class TopRecipientOfficesView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            donor = request.GET.get('donor', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            if not donor:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a donor'])

            top_recipients = get_top_recipients(year, donor)

            serializer = TopRecieversSerializer(top_recipients, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class TopBudgetSourcesView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            operating_unit = request.GET.get('operating_unit', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            receivers = get_budget_sources_for_year(year, operating_unit=operating_unit)[0:10]
            serializer = TopBudgetSourcesSerializer(receivers, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class DonorsListView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            donor = request.GET.get('donor', '')
            recipient_countries = process_query_params(request.GET.get('recipient_countries', ''))
            sectors = process_query_params(request.GET.get('sectors', ''))

            donors = Organisation.objects.all()
            if donor:
                donors = donors.filter(Q(level_3_name__icontains=donor) |
                                       Q(type_level_3__iexact=donor) |
                                       Q(org_name__icontains=donor))
            if recipient_countries:
                recipient_countries = [item.upper() for item in recipient_countries]
                donors = donors.filter(operating_unit__in=recipient_countries)
            if sectors:
                donors = donors.filter(donorfundsplitup__output__outputsector__sector__in=sectors)
            donors = donors.distinct()
            serializer = DonorsListSerializer(donors, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class DonorBudgetSourcesView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            type_level_3 = request.GET.get('donor_level_3_code', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])

            # if not type_level_3:
            #     return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
            #                                   ['Please provide a valid donor code'])
            query = Q(year=year)
            if type_level_3:
                query.add(Q(organisation__type_level_3=type_level_3), Q.AND)

            results = DonorFundSplitUp.objects.filter(query)\
                .values('organisation__org_name', 'organisation__short_name',
                        'organisation__type_level_3', 'organisation__ref_id')\
                .annotate(total_budget=Sum('budget')).filter(total_budget__gt=0).order_by('-total_budget')

            serializer = BudgetSourcesSerializer(results, many=True)
            return self.jp_response(s_code='HTTP_200_OK', data=serializer.data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class DonorCountryAggregate(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            country = request.GET.get('country', '')
            sdg = request.GET.get('sdg', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a year'])
            if not country:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a country'])

            donor_query = Q(organisation__ref_id=country) | Q(organisation__type_level_3=country)
            sdg_query = Q()
            if sdg:
                # sdg_query = Q(project__outputsdg__sdg=sdg)
                sdg_query = Q(project__outputtarget__target_id__sdg=sdg)
                aggregate = DonorFundSplitUp.objects.filter(Q(year=year) & Q(project__project_active__year=year)
                                                            & donor_query & sdg_query)\
                    .distinct().values()\
                    .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg,
                                                              then=(F('budget') * F(
                                                                  'project__projecttarget__percentage') / 100.0)),
                                                         default=Value(0, output_field=DecimalField()))),
                              expense_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg,
                                                               then=F('expense') * F(
                                                                   'project__projecttarget__percentage') / 100.0)),
                                                     default=Value(0, output_field=DecimalField())))\
                    .aggregate(budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
                                               Value(0, output_field=DecimalField())),
                               expense=Coalesce(Sum(F('expense_percentage'), output_field=DecimalField()),
                                                Value(0, output_field=DecimalField())),
                               direct_funded_projects=Count('project', distinct=True)
                               )
            else:
                aggregate = DonorFundSplitUp.objects\
                    .filter(Q(year=year) &
                            Q(project__project_active__year=year) & donor_query)\
                    .aggregate(budget=Sum('budget'),
                               expense=Sum('expense'),
                               direct_funded_projects=Count('project', distinct=True))
            country_regular_resources = DonorFundModality.objects\
                .filter(Q(year=year) & Q(fund_type='Regular Resources') & donor_query)\
                .aggregate(total_contribution=Coalesce(Sum('contribution'), 0))\

            regular_resources = DonorFundSplitUp.objects\
                .filter(organisation=UNDP_DONOR_ID, project__project_active__year=year, year=year)
            donor_id = DonorFundSplitUp.objects.values_list('donor_category', flat=True) \
                .filter(Q(year=year) &
                        Q(project__project_active__year=year) & donor_query & sdg_query).distinct()
            donor_category = get_donor_category_label(donor_id[0])
            if sdg:
                regular_resources = regular_resources.filter(sdg_query)

            regular_resources_aggregate = regular_resources.aggregate(projects_count=Count('project', distinct=True))
            show_regular_resources = 0
            if country_regular_resources.get('total_contribution', 0) > 0:
                show_regular_resources = 1
            try:
                budget = int(round(aggregate['budget']))
            except:
                budget = 0
            try:
                expense = int(round(aggregate['expense']))
            except:
                expense = 0
            try:
                organisations = Organisation.objects.filter(type_level_3=country).values('level_3_name', 'type_level_3')
                if organisations:
                    organisation = organisations[0]
                    if organisation['level_3_name'] in LEVEL_3_NAMES_MAPPING.keys():
                        donor_name = LEVEL_3_NAMES_MAPPING.get(organisation['level_3_name'], 'N/A')
                        level_3_type = organisation['type_level_3']
                    else:
                        donor_name = organisation['level_3_name']
                        level_3_type = organisation['type_level_3']
                else:
                    organisation = Organisation.objects.filter(ref_id=country).values('org_name', 'type_level_3')[0]
                    donor_name = organisation['org_name']
                    level_3_type = organisation['type_level_3']
            except Exception as e:
                donor_name = ''
                level_3_type = ''
            result = {
                'direct_funded_projects': aggregate['direct_funded_projects'],
                'budget': budget,
                'expense': expense,
                'regular_resources': regular_resources_aggregate['projects_count'],
                'donor_name': donor_name,
                'year': year,
                'code': country,
                'level_3_type': level_3_type,
                'show_regular_resources': show_regular_resources,
                'donor_type': donor_category,
                'type_code': donor_id[0]
            }
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])

#
# class DonorAggregate(APIView, ResponseViewMixin):
#     def get(self, request, *args, **kwargs):
#         try:
#             year = request.GET.get('year', '')
#             donor = request.GET.get('donor', '')
#             if not year:
#                 return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
#                                               ['Please provide a year'])
#             if not donor:
#                 return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
#                                               ['Please provide a donor'])
#
#             aggregate = DonorFundSplitUp.objects.filter(year=year, project__project_active__year=year,
#                                                         organisation__ref_id=donor)\
#                 .aggregate(budget=Sum('budget'), direct_funded_projects=Count('project', distinct=True))
#             country_regular_resources = DonorFundModality.objects\
#                 .filter(year=year,
#                         organisation__ref_id=donor,
#                         fund_type='Regular Resources')\
#                 .aggregate(total_contribution=Coalesce(Sum('contribution'), 0))\
#
#             regular_resources_aggregate = DonorFundSplitUp.objects\
#                 .filter(organisation=UNDP_DONOR_ID, project__project_active__year=year, year=year)\
#                 .aggregate(projects_count=Count('project', distinct=True))
#             show_regular_resources = 0
#             if country_regular_resources.get('total_contribution', 0) > 0:
#                 show_regular_resources = 1
#             try:
#                 budget = int(round(aggregate['budget']))
#             except:
#                 budget = 0
#             try:
#                 organisation = Organisation.objects.filter(ref_id=donor).values('org_name')[0]
#                 donor_name = organisation['org_name']
#             except Exception as e:
#                 donor_name = ''
#             result = {
#                 'direct_funded_projects': aggregate['direct_funded_projects'],
#                 'budget': budget,
#                 'regular_resources': regular_resources_aggregate['projects_count'],
#                 'donor_name': donor_name,
#                 'year': year,
#                 'show_regular_resources': show_regular_resources
#             }
#             return self.jp_response(s_code='HTTP_200_OK', data=result)
#         except Exception as e:
#             return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class DonorContribution(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            donor_category = request.GET.get('donor_type', '')
            fund_type = request.GET.get('fund_type', '')
            fund_stream = request.GET.get('fund_stream', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY', ['Please provide a year'])

            query = Q(year=year)
            if fund_type:
                query.add(Q(fund_type=fund_type), Q.AND)
            if fund_stream:
                query.add(Q(fund_stream=fund_stream), Q.AND)
            if donor_category:
                if int(donor_category) == 16:
                    query.add(Q(donor_category__in=[7, 12, 13]), Q.AND)
                elif int(donor_category) == 17:
                    query.add(Q(donor_category__in=[2, 5, 14]), Q.AND)
                else:
                    query.add(Q(donor_category=donor_category), Q.AND)

            contributions = DonorFundModality.objects.filter(query)\
                .values('organisation__type_level_3', 'organisation__level_3_name')\
                .annotate(total_amount=Sum('contribution'))\
                .filter(total_amount__gt=0)\
                .values('organisation__type_level_3', 'organisation__level_3_name', 'total_amount') \
                .order_by('-total_amount')[0:30]
            total_contributions = DonorFundModality.objects.filter(year=year)\
                .filter(contribution__gt=0)\
                .aggregate(total_amount=Sum('contribution'))['total_amount']

            regular_contributions = DonorFundModality.objects.filter(year=year, fund_type='Regular Resources') \
                .filter(contribution__gt=0) \
                .aggregate(total_amount=Sum('contribution'))['total_amount']

            other_contributions = DonorFundModality.objects.filter(year=year, fund_type='Other Resources') \
                .filter(contribution__gt=0) \
                .aggregate(total_amount=Sum('contribution'))['total_amount']

            serializer = DonorContributionSerializer(contributions, many=True, context={'year': year,
                                                                                        'fund_stream': fund_stream})
            try:
                regular_percentage = regular_contributions / total_contributions * 100
            except:
                regular_percentage = 0
            try:
                other_percentage = other_contributions / total_contributions * 100
            except:
                other_percentage = 0
            result = {
                'total_contributions': int(round(total_contributions)) if total_contributions else 0,
                'regular_contribution': int(round(regular_contributions)) if regular_contributions else 0,
                'other_contributions': int(round(other_contributions)) if other_contributions else 0,
                'regular_percentage': round(regular_percentage, 2),
                'other_percentage': round(other_percentage, 2),
                'contributions': serializer.data,
            }
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SankeyBudgetView(APIView, ResponseViewMixin):
    queryset = DonorFundSplitUp.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY', ['Please provide a year'])

            donor_query = Q(year=year) & Q(donor_category__isnull=False) & Q(project__operating_unit__isnull=False)
            donor_queryset = DonorFundSplitUp.objects.filter(donor_query)\
                .annotate(new_donor_category=Case(When(donor_category__in=[7, 12, 13],
                                                       then=Value(16, output_field=IntegerField())),
                                                  When(donor_category__in=[2, 5, 14],
                                                       then=Value(17, output_field=IntegerField())),
                                                  default=F('donor_category'))) \
                .values('new_donor_category', 'project__operating_unit__bureau') \
                .annotate(value=Sum('budget'),
                          recipient_bureau=F('project__operating_unit__bureau__bureau'))
            sector_year_query = Q(output__outputsector__sector__start_year__lte=year) & \
                                Q(output__outputsector__sector__end_year__gte=year)
            sector_year_query.add(Q(output__outputsector__isnull=True), Q.OR)

            recipient_query = Q(year=year) & Q(donor_category__isnull=False) & \
                              Q(project__operating_unit__isnull=False)
            recipient_queryset = DonorFundSplitUp.objects.filter(recipient_query & sector_year_query)\
                .values('output__outputsector__sector', 'project__operating_unit__bureau')\
                .annotate(value=Sum('budget'),
                          recipient_bureau=F('project__operating_unit__bureau__bureau'),
                          sector_name=F('output__outputsector__sector__sector'),
                          sector_code=F('output__outputsector__sector'),
                          )
            total_fund_query = get_fund_split_query(year, sector=None)
            signature_query = Q(year=year) & Q(output__signature_solution=0) & \
                              Q(output__outputsector__isnull=True) | Q(output__outputsector__isnull=False)
            signature_solution = []
            if int(year) >= SP_START_YEAR:
                ss_query = DonorFundSplitUp.objects.filter(signature_query & sector_year_query & recipient_query) \
                    .values('output__outputsector__sector', 'output__signature_solution__ss_id') \
                    .annotate(value=Sum('budget'),
                              name=F('output__signature_solution__name'),
                              sector_code=F('output__outputsector__sector'),
                              sector_name=F('output__outputsector__sector__sector')
                              )
                budget = sum(ss['value'] for ss in ss_query.exclude(Q(output__signature_solution=0) &
                                                                    Q(output__outputsector__isnull=True)))
                total_budget = DonorFundSplitUp.objects.filter(total_fund_query) \
                    .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
                for signature in ss_query:
                    if signature['output__signature_solution__ss_id'] == '0' \
                            and signature['output__outputsector__sector'] is None:
                        other_ss = {
                            'value': total_budget - budget,
                            'name': signature['name'],
                            'sector_code': signature['sector_code'],
                            'sector_name': signature['sector_name'],
                            'output__outputsector__sector': signature['output__outputsector__sector'],
                            'output__signature_solution__ss_id': signature['output__signature_solution__ss_id']
                        }
                        signature_solution.append(other_ss)
                    else:
                        signature_solution.append(signature)
            else:
                ss_query = None
            nodes = get_sankey_nodes(donor_query, recipient_query, sector_year_query, ss_query)
            donor_serializer = DonorSankeySerializer(donor_queryset, many=True,
                                                     context={'nodes': nodes})
            recipient_serializer = SectorSankeySerializer(recipient_queryset,  many=True, context={'nodes': nodes})
            ss_serializer = SsSankeySerializer(signature_solution, many=True, context={'nodes': nodes})
            queryset_data = donor_serializer.data + recipient_serializer.data + ss_serializer.data

            data = {
                'nodes': nodes,
                'links': queryset_data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class SankeyExpenseView(APIView, ResponseViewMixin):
    queryset = DonorFundSplitUp.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            year = request.GET.get('year', '')
            if not year:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY', ['Please provide a year'])

            donor_query = Q(year=year) & Q(donor_category__isnull=False) & Q(project__operating_unit__isnull=False)
            recipient_query = Q(year=year) & Q(donor_category__isnull=False) & Q(project__operating_unit__isnull=False)
            sector_year_query = Q(output__outputsector__sector__start_year__lte=year) & \
                                Q(output__outputsector__sector__end_year__gte=year)
            sector_year_query.add(Q(output__outputsector__isnull=True), Q.OR)
            donor_queryset = DonorFundSplitUp.objects.filter(donor_query) \
                .annotate(new_donor_category=Case(When(donor_category__in=[7, 12, 13],
                                                       then=Value(16, output_field=IntegerField())),
                                                  When(donor_category__in=[2, 5, 14],
                                                       then=Value(17, output_field=IntegerField())),
                                                  default=F('donor_category'))) \
                .values('new_donor_category', 'project__operating_unit__bureau') \
                .annotate(value=Sum('expense'),
                          recipient_bureau=F('project__operating_unit__bureau__bureau'))

            recipient_queryset = DonorFundSplitUp.objects.filter(recipient_query & sector_year_query) \
                .values('output__outputsector__sector', 'project__operating_unit__bureau') \
                .annotate(value=Sum('expense'),
                          recipient_bureau=F('project__operating_unit__bureau__bureau'),
                          sector_name=F('output__outputsector__sector__sector'),
                          sector_code=F('output__outputsector__sector'),
                          )
            if int(year) >= SP_START_YEAR:
                ss_query = DonorFundSplitUp.objects.filter(recipient_query & sector_year_query) \
                    .values('output__signature_solution__sp_id', 'output__signature_solution__ss_id') \
                    .annotate(value=Sum('expense'),
                              name=F('output__signature_solution__name'),
                              sector_code=F('output__signature_solution__sp_id'),
                              sector_name=F('output__signature_solution__sp_id__sector')
                              )
            else:
                ss_query = None
            nodes = get_sankey_nodes(donor_query, recipient_query, sector_year_query, ss_query)

            donor_serializer = DonorSankeySerializer(donor_queryset, many=True, context={'nodes': nodes})
            recipient_serializer = SectorSankeySerializer(recipient_queryset, many=True, context={'nodes': nodes})
            ss_serializer = SsSankeySerializer(ss_query, many=True, context={'nodes': nodes})

            queryset_data = donor_serializer.data + recipient_serializer.data + ss_serializer.data

            data = {
                'nodes': nodes,
                'links': queryset_data
            }
            return self.jp_response(s_code='HTTP_200_OK', data=data)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])
