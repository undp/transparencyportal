import calendar
import datetime
import time

from django.conf import settings
from django.db.models.aggregates import Count, Sum
from django.db.models.expressions import F, Case, When, Value
from django.db.models.functions.base import Coalesce
from django.db.models.query_utils import Q
from django.shortcuts import render
from django.template.context import Context
from django.template.loader import get_template
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import View
from rest_framework.generics import GenericAPIView

from rest_framework.views import APIView

from master_tables.models import ProjectTimeLine, Sector
from undp_donors.models import DonorFundSplitUp, DonorFundModality
from undp_donors.serializers import DonorContributionSerializer, DonorContributionCsvSerializer
from undp_extra_features.dump_data import context_data_dump
from undp_extra_features.serializers import ProjectListSerializer, GlobalBudgetSourceSerializer
from undp_outputs.models import Output
from undp_outputs.serializers import OutputListSerializer, OutputCsvSerializer
from undp_projects.models import Project, ProjectDocument, ProjectSearch
from undp_projects.serializers import MapDetailsSerializer, ProjectAggregateSerializer, SectorAggregateSerializer, \
    ProjectBudgetSourceSerializer, ProjectDocumentSerializer
from undp_purchase_orders.models import PurchaseOrder
from undp_purchase_orders.serializers import PurchaseOrderSerializer
from utilities.config import EXCLUDED_SECTOR_CODES, EXPORT_DIR, BASE_DIR, EXPORT_TEMPLATES_MAPPING, EXPORT_PDF_DIR
from utilities.konstants import PROJECT_CSV_ITEMS
from utilities.mixins import ResponseViewMixin
from utilities.utils import get_active_projects_for_year, get_project_aggregate, get_sector_aggregate, \
    process_query_params, get_project_full_text_search_query, get_fund_split_many_query, export_to_csv, \
    get_media_path, convert_to_ordered_dict, get_last_updated_date

EXPORT_TEMPLATE_DIR_PATH = BASE_DIR + '/undp_extra_features/templates/'


class EmbedGlobalView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = ProjectTimeLine.objects.filter(is_active=True).order_by('-year')[0].year
            map = request.GET.get('map', None)
            stat = request.GET.get('stat', None)
            charts = request.GET.get('charts', None)
            projects = request.GET.get('projects', None)
            query = Q(year=year)
            active_projects = get_active_projects_for_year(year)
            result = dict()

            if map is not None:
                countries = DonorFundSplitUp.objects.filter(query)

                countries = countries.values('project__operating_unit') \
                    .annotate(project_count=Count('project', distinct=True),
                              output_count=Count('output', distinct=True),
                              donor_count=Count('organisation', distinct=True),
                              total_budget=Sum('budget'),
                              total_expense=Sum('expense'),
                              operating_unit_name=F('project__operating_unit__name'),
                              operating_unit_iso3=F('project__operating_unit__iso3'),
                              operating_unit_iso2=F('project__operating_unit__iso2'),
                              operating_unit_latitude=F('project__operating_unit__latitude'),
                              operating_unit_longitude=F('project__operating_unit__longitude'),
                              )
                map_serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
                                                                                     'query': query})

                result['map'] = map_serializer.data
            if stat is not None:
                project_mapping = get_project_aggregate(year, active_projects)
                stat_serializer = ProjectAggregateSerializer(project_mapping)
                result['stat'] = stat_serializer.data
            if charts is not None:
                sector_mapping = []
                EXCLUDED_SECTOR_CODES.append('8')
                for sector in Sector.objects.filter(~Q(code__in=EXCLUDED_SECTOR_CODES)):
                    sector_mapping.append(get_sector_aggregate(year, active_projects, sector=sector))
                sector_mapping = sorted(sector_mapping, key=lambda sector: sector['percentage'], reverse=True)
                sector_mapping.append(get_sector_aggregate(year, active_projects))

                sector_serializer = SectorAggregateSerializer(sector_mapping, many=True)
                recipient_offices = DonorFundSplitUp.objects.filter(year=year) \
                    .values('project__operating_unit')\
                    .annotate(total_budget=Sum('budget'),
                              total_expense=Sum('expense'),
                              operating_unit=F('project__operating_unit__name')) \
                    .filter(total_budget__gt=0) \
                    .values('total_budget', 'total_expense', 'operating_unit')\
                    .order_by('-total_budget')[0:20]
                budget_sources = DonorFundSplitUp.objects.filter(year=year) \
                    .values('organisation__level_3_name',
                            'organisation__type_level_3') \
                    .annotate(total_budget=Sum('budget'),
                              total_expense=Sum('expense'),
                              level_3_name=F('organisation__level_3_name')) \
                    .filter(total_budget__gt=0) \
                    .values('total_budget', 'total_expense', 'level_3_name') \
                    .order_by('-total_budget')[0:20]
                budget_sources_serializer = GlobalBudgetSourceSerializer(budget_sources, many=True)
                charts_data = {
                    'themes': sector_serializer.data,
                    'top_recipient_offices': recipient_offices,
                    'top_budget_sources': budget_sources_serializer.data
                }
                result['charts'] = charts_data
            if projects is not None:
                projects = Project.objects.filter(Q(project_active__year=year))\
                    .annotate(total_budget=Sum('donorfundsplitup__budget'),
                              total_expense=Sum('donorfundsplitup__expense'))
                project_serializer = ProjectListSerializer(projects, many=True)
                result['projects'] = project_serializer.data
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class EmbedProjectView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        try:
            year = ProjectTimeLine.objects.filter(is_active=True).order_by('-year')[0].year
            map = request.GET.get('map', None)
            list = request.GET.get('list', None)

            query = Q(year=year)
            result = dict()

            if map is not None:

                countries = DonorFundSplitUp.objects.filter(query)

                countries = countries.values('project__operating_unit') \
                    .annotate(project_count=Count('project', distinct=True),
                              output_count=Count('output', distinct=True),
                              donor_count=Count('organisation', distinct=True),
                              total_budget=Sum('budget'),
                              total_expense=Sum('expense'),
                              operating_unit_name=F('project__operating_unit__name'),
                              operating_unit_iso3=F('project__operating_unit__iso3'),
                              operating_unit_iso2=F('project__operating_unit__iso2'),
                              operating_unit_latitude=F('project__operating_unit__latitude'),
                              operating_unit_longitude=F('project__operating_unit__longitude'),
                              )
                map_serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
                                                                                     'query': query})

                result['map'] = map_serializer.data
            if list is not None:
                projects = Project.objects.filter(Q(project_active__year=year))\
                    .annotate(total_budget=Sum('donorfundsplitup__budget'),
                              total_expense=Sum('donorfundsplitup__expense'))
                project_serializer = ProjectListSerializer(projects, many=True)
                result['list'] = project_serializer.data
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class EmbedProjectDetailsView(GenericAPIView, ResponseViewMixin):
    queryset = Project.objects.all()

    def get(self, request, *args, **kwargs):
        try:
            year = ProjectTimeLine.objects.filter(is_active=True).order_by('-year')[0].year
            map = request.GET.get('map', None)
            stat = request.GET.get('stat', None)

            title = request.GET.get('title', None)
            description = request.GET.get('description', None)
            charts = request.GET.get('charts', None)
            outputs = request.GET.get('outputs', None)
            budget_sources = request.GET.get('budget_sources', None)
            documents = request.GET.get('documents', None)
            purchase_orders = request.GET.get('purchase_orders', None)

            try:
                project = self.get_object()
            except:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Project not found'])

            query = Q(year=year)
            active_projects = get_active_projects_for_year(year)
            result = dict()
            query.add(Q(project=project), Q.AND)

            if map is not None:
                countries = DonorFundSplitUp.objects.filter(query)

                countries = countries.values('project__operating_unit') \
                    .annotate(project_count=Count('project', distinct=True),
                              output_count=Count('output', distinct=True),
                              donor_count=Count('organisation', distinct=True),
                              total_budget=Sum('budget'),
                              total_expense=Sum('expense'),
                              operating_unit_name=F('project__operating_unit__name'),
                              operating_unit_iso3=F('project__operating_unit__iso3'),
                              operating_unit_iso2=F('project__operating_unit__iso2'),
                              operating_unit_latitude=F('project__operating_unit__latitude'),
                              operating_unit_longitude=F('project__operating_unit__longitude'),
                              )
                map_serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
                                                                                     'query': query})
                result['map'] = map_serializer.data
            if title is not None:
                result['title'] = project.title
            if description is not None:
                result['description'] = project.description
            if stat is not None:
                stat = DonorFundSplitUp.objects.filter(query) \
                    .values('year')\
                    .annotate(total_budget=Sum('budget'),
                              total_expense=Sum('expense')) \
                    .values('total_budget', 'total_expense', 'year') \
                    .order_by('-year')
                result['stat'] = stat
            if budget_sources is not None:
                budget_sources = DonorFundSplitUp.objects.filter(query)\
                    .values('organisation')\
                    .annotate(budget=Sum('budget'), organisation_name=F('organisation__org_name'))

                budget_sources_serializer = ProjectBudgetSourceSerializer(budget_sources, many=True)
                result['budget_sources'] = budget_sources_serializer.data
            if documents is not None:
                documents = ProjectDocument.objects.filter(project=project)

                documents = documents.values('category', 'project', 'title', 'format', 'document_url',
                                             'category__title', 'id')
                documents_serializer = ProjectDocumentSerializer(documents, many=True)
                result['documents'] = documents_serializer.data
            if purchase_orders is not None:
                purchase_orders = PurchaseOrder.objects.filter(order_date__year=year, project=project) \
                    .values('vendor__name', 'project_id', 'description', 'order_id', 'order_date', 'amount')
                purchase_orders_serializer = PurchaseOrderSerializer(purchase_orders, many=True)
                result['purchase_orders'] = purchase_orders_serializer.data
            if outputs is not None:
                projects = Output.objects.filter(Q(project__project_active__year=year) & Q(project=project))\
                    .annotate(total_budget=Sum('donorfundsplitup__budget'),
                              total_expense=Sum('donorfundsplitup__expense'))
                output_serializer = OutputListSerializer(projects, many=True)
                result['outputs'] = output_serializer.data
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class ExportAsPDFView(APIView, ResponseViewMixin):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(ExportAsPDFView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        import pdfkit

        try:
            template_name = request.data.get('template_name', '')
            context_data = request.data.get('context_data', {})
            last_updated_date = get_last_updated_date()
            ord_dict = convert_to_ordered_dict(context_data)
            ord_dict['last_updated_date'] = last_updated_date
            options = {
                'encoding': "UTF-8",
                'enable-javascript': "",
                'javascript-delay': 2000,
                'enable-plugins': "",
                'debug-javascript': "",
                'enable-external-links': "",
                'keep-relative-links': "",
            }
            template = EXPORT_TEMPLATES_MAPPING.get(template_name, 'test2.html')
            template_path = EXPORT_TEMPLATE_DIR_PATH + template
            template = get_template(template_path)
            context = {"data": ord_dict}  # data is the context data that is sent to the html file to render the output.
            html = template.render(context)  # Renders the template with the context data.
            now_time = str(calendar.timegm(time.gmtime()))
            file = 'out_' + now_time + '.pdf'
            file_name = 'export_pdf/' + file
            pdf_path = settings.MEDIA_ROOT + file_name
            pdfkit.from_string(html, pdf_path, options=options)
            pdf_file = get_media_path(file_name)
            result = {'file_path': pdf_file, 'file_name': file}
            return self.jp_response(s_code='HTTP_200_OK', data=result)
        except Exception as e:
            print(e)
            return self.jp_error_response('HTTP_500_INTERNAL_SERVER_ERROR', 'EXCEPTION', [str(e), ])


class ExportAsTemplateView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(ExportAsTemplateView, self).dispatch(*args, **kwargs)

    def get(self, request, *args, **kwargs):

        from django.http import HttpResponse
        from django.shortcuts import render

        try:
            template_name = context_data_dump['template_name']
            context_data = context_data_dump['context_data']
            last_updated_date = get_last_updated_date()
            ord_dict = convert_to_ordered_dict(context_data)
            # ord_dict = convert_json_to_ordered_dict(context_data)
            ord_dict['last_updated_date'] = last_updated_date
            template = EXPORT_TEMPLATES_MAPPING.get(template_name, 'test2.html')
            print(template)
            template_path = EXPORT_TEMPLATE_DIR_PATH + template
            context = {"data": ord_dict}  # data is the context data that is sent to the html file to render the output.
            response = render(request, template_path, context)
            return response
        except Exception as e:
            print(e)
            return HttpResponse('No result')


class ExportAsCSVView(View):

    def get(self, request, *args, **kwargs):
        from django.http import HttpResponse

        try:
            now_time = str(calendar.timegm(time.gmtime()))
            file_name = 'projects_' + now_time + ".csv"
            file_path = EXPORT_DIR + '/' + file_name
            year = process_query_params(request.GET.get('year', None))
            operating_units = process_query_params(request.GET.get('operating_units', None))
            budget_type = request.GET.get('budget_type', None)
            budget_sources = process_query_params(request.GET.get('budget_sources', None))
            sectors = process_query_params(request.GET.get('sectors', None))
            sdgs = process_query_params(request.GET.get('sdgs', None))
            category = request.GET.get('category')
            keyword = request.GET.get('keyword')
            search_query = get_project_full_text_search_query(year, operating_units, budget_sources,
                                                              sectors, keyword, budget_type=budget_type,
                                                              category=category, sdgs=sdgs)
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
                          operating_unit=F('operating_unit__name')) \
                .values('project_id', 'title', 'description', 'budget', 'expense', 'operating_unit',) \
                .order_by('-budget')
            header = ['project_id', 'title', 'description', 'operating_unit', 'budget', 'expense']

            export_to_csv(file_path, queryset, header)
            zip_file = open(file_path, 'rb')
            response = HttpResponse(zip_file, content_type='application/force-download')
            response['Content-Disposition'] = 'attachment; filename="%s"' % file_name
            return response
        except Exception as e:
            print(e)
            return HttpResponse([e])


class ExportAsDonorsCSVView(View):

    def get(self, request, *args, **kwargs):
        from django.http import HttpResponse

        try:
            now_time = str(calendar.timegm(time.gmtime()))
            file_name = 'donors_' + now_time + ".csv"
            file_path = EXPORT_DIR + '/' + file_name
            year = request.GET.get('year', '')
            donor_category = request.GET.get('donor_type', '')
            fund_type = request.GET.get('fund_type', '')
            fund_stream = request.GET.get('fund_stream', '')

            query = Q()
            if year:
                query.add(Q(year=year), Q.AND)
            if fund_type:
                query.add(Q(fund_type=fund_type), Q.AND)
            if fund_stream:
                query.add(Q(fund_stream=fund_stream), Q.AND)
            if donor_category:
                query.add(Q(donor_category=donor_category), Q.AND)

            contributions = DonorFundModality.objects.filter(query) \
                .annotate(donor_name=F('organisation__org_name'),
                          ref_id=F('organisation__ref_id'), level_3_code=F('organisation__type_level_3'),
                          level_3_name=F('organisation__level_3_name'))\
                .values('donor_name', 'ref_id', 'level_3_code', 'level_3_name',
                        'donor_category', 'fund_type', 'fund_stream', 'contribution',)\
                .order_by('-contribution')

            serializer = DonorContributionCsvSerializer(contributions, many=True,)
            header = ['donor_name', 'ref_id', 'level_3_code', 'level_3_name',
                      'donor_category', 'fund_type', 'fund_stream', 'contribution', ]

            export_to_csv(file_path, serializer.data, header)
            zip_file = open(file_path, 'rb')
            response = HttpResponse(zip_file, content_type='application/force-download')
            response['Content-Disposition'] = 'attachment; filename="%s"' % file_name
            return response
        except Exception as e:
            print(e)
            return HttpResponse([e])


class ExportProjectAsCSVView(APIView, ResponseViewMixin):

    def get(self, request, *args, **kwargs):
        from django.http import HttpResponse

        try:
            now_time = str(calendar.timegm(time.gmtime()))
            project_id = request.GET.get('project_id', None)
            item = request.GET.get('item')
            search = request.GET.get('search', '')
            category = request.GET.get('category', '')

            if not project_id:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a project ID'])
            if not item:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide an item'])
            try:
                project = Project.objects.get(project_id=project_id)
            except:
                return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                              ['Please provide a valid project ID'])
            file_name = PROJECT_CSV_ITEMS.get_label(int(item)) + '_' + project_id + '_' + now_time + ".csv"
            file_path = EXPORT_DIR + '/' + file_name
            queryset, header = self.get_queryset(project, item, search, category)

            export_to_csv(file_path, queryset, header)
            zip_file = open(file_path, 'rb')
            response = HttpResponse(zip_file, content_type='application/force-download')
            response['Content-Disposition'] = 'attachment; filename="%s"' % file_name
            return response
        except Exception as e:
            print(e)
            return HttpResponse([e])

    def get_queryset(self, project, item, search='', category=''):
        data = []
        header = []
        if int(item) == PROJECT_CSV_ITEMS.outputs:

            queryset = Output.objects.filter(project=project)\
                .annotate(total_budget=Sum('donorfundsplitup__budget'),
                          total_expense=Sum('donorfundsplitup__expense'))
            data = OutputCsvSerializer(queryset, many=True).data
            header = ['output_id', 'project_id', 'sector', 'title', 'description',
                      'has_result', 'policy_significance', 'total_budget', 'total_expense']
        elif int(item) == PROJECT_CSV_ITEMS.documents:
            queryset = ProjectDocument.objects.filter(project=project, category__priority__lte=6)
            if category:
                queryset = queryset.filter(category=category)
            if search:
                queryset = queryset.filter(title__icontains=search)
            queryset = queryset.order_by('category__priority') \
                .values('category', 'project', 'title', 'format', 'document_url',
                        'category__title', 'id')
            data = ProjectDocumentSerializer(queryset, many=True).data
            header = ['id', 'category', 'project', 'title', 'format', 'document_url', 'category_name']
        elif int(item) == PROJECT_CSV_ITEMS.purchase_orders:
            queryset = PurchaseOrder.objects.filter(project=project).values('ref', 'operating_unit') \
                .annotate(order_amount=Sum('amount'), order_ref=F('ref')) \
                .values('vendor__name', 'project_id', 'order_id', 'order_date',
                        'order_amount', 'order_ref') \
                .order_by('-order_date')
            data = PurchaseOrderSerializer(queryset, many=True).data
            header = ['project_id', 'order_id', 'description',
                      'amount', 'order_date', 'vendor_name']
        return data, header


class ExportDownloadPDFView(APIView, ResponseViewMixin):
    def get(self, request, *args, **kwargs):
        from django.http import HttpResponse
        file_name = request.GET.get('file', '')
        print(file_name)
        file_path = EXPORT_PDF_DIR + file_name
        if not file_name:
            return self.jp_error_response('HTTP_400_BAD_REQUEST', 'UNKNOWN_QUERY',
                                          ['Please provide a file name'])
        file_blob = open(file_path, 'rb')
        response = HttpResponse(file_blob, content_type='application/force-download')
        response['Content-Disposition'] = 'attachment; filename="%s"' % file_name
        return response
