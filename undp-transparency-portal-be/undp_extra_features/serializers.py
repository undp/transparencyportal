from datetime import datetime

from django.db.models.aggregates import Sum
from django.db.models.functions.base import Coalesce
from django.conf import settings as main_settings
from django.db.models.expressions import F, Case, When

from master_tables.models import OperatingUnit, Bureau, Organisation, Sector, Sdg, SignatureSolution
from undp_donors.models import DonorFundSplitUp
from undp_outputs.models import Output, OutputSector, OutputLocation, OutputTransaction, ActivityDate, \
    OutputActiveYear, ProjectMarker, MARKER_TYPE_CHOICES, OutputTarget
from undp_projects.models import Project, ProjectDocument, ProjectActiveYear, ProjectActivityDate, \
    ProjectParticipatingOrganisations
from rest_framework import serializers

from undp_projects.utils import TRANSACTION_TYPES
from utilities.config import LEVEL_3_NAMES_MAPPING, POLICY_MARKER_CODES, CRS_INDEXES, LOCAL_COUNTRIES, UNDP_DONOR_ID
from utilities.konstants import PROJECT_ACTIVITY_TYPES, ORGANISATION_ROLES


db = main_settings.DB_FOR_WRITE


class ProjectListSerializer(serializers.ModelSerializer):
    total_budget = serializers.IntegerField()
    total_expense = serializers.IntegerField()

    class Meta:
        model = Project
        fields = ('project_id', 'title', 'description', 'total_expense', 'total_budget',)


class GlobalBudgetSourceSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField()
    total_expense = serializers.IntegerField()
    level_3_name = serializers.SerializerMethodField()

    class Meta:
        fields = ('level_3_name', 'total_expense', 'total_budget',)

    def get_level_3_name(self, obj):
        if obj['level_3_name'] in LEVEL_3_NAMES_MAPPING.keys():
            return LEVEL_3_NAMES_MAPPING.get(obj['level_3_name'], 'N/A')
        return obj['level_3_name']


class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = '__all__'


class OutputSerializer(serializers.Serializer):
    crs = serializers.CharField(source='crs_code', required=False)
    output_descr = serializers.CharField(source='description', required=False)
    output_id = serializers.CharField(required=False)
    award_id = serializers.CharField(source='project_id', required=False)
    output_title = serializers.CharField(source='title', required=False)
    crs_descr = serializers.SerializerMethodField()
    donor_id = serializers.SerializerMethodField()
    disbursement = serializers.SerializerMethodField()
    focus_area = serializers.SerializerMethodField()
    gender_descr = serializers.SerializerMethodField()
    budget = serializers.SerializerMethodField()
    fiscal_year = serializers.SerializerMethodField()
    gender_id = serializers.SerializerMethodField()
    expenditure = serializers.SerializerMethodField()
    donor_short = serializers.SerializerMethodField()
    donor_name = serializers.SerializerMethodField()
    focus_area_descr = serializers.SerializerMethodField()
    markers = serializers.SerializerMethodField()
    sdg = serializers.SerializerMethodField()
    signature_solution = serializers.CharField(required=False)

    class Meta:
        fields = ('output_id', 'crs', 'donor_id', 'disbursement', 'focus_area', 'gender_descr',
                  'output_title', 'budget', 'fiscal_year', 'gender_id', 'expenditure', 'award_id',
                  'output_descr', 'donor_short', 'donor_name', 'crs_descr', 'focus_area_descr', 'markers')

    def get_crs_descr(self, obj):
        return CRS_INDEXES.get(obj.crs_code, '')

    def get_donor_id(self, obj):
        donors = DonorFundSplitUp.objects.filter(output=obj).distinct('organisation')\
            .values_list('organisation__ref_id', flat=True)

        return donors

    def get_disbursement(self, obj):
        disbursement = OutputTransaction.objects\
            .filter(output=obj, transaction_type=TRANSACTION_TYPES.expenditure) \
            .values_list('amount', flat=True)
        return disbursement

    def get_focus_area(self, obj):
        op_sectors = OutputSector.objects.filter(output=obj)
        if op_sectors:
            focus_area_mapping = op_sectors[0]
            return focus_area_mapping.sector.code
        return ''

    def get_gender_descr(self, obj):
        policy_marker_code = obj.policy_marker_code
        return POLICY_MARKER_CODES.get(policy_marker_code, '')

    def get_budget(self, obj):
        budgets = DonorFundSplitUp.objects.filter(output=obj)\
            .values('year').annotate(budget_amount=Sum('budget')).order_by('-year').values_list('budget_amount', flat=True)
        return budgets

    def get_fiscal_year(self, obj):
        active_years = OutputActiveYear.objects.filter(output=obj).order_by('-year').values_list('year', flat=True)
        return active_years

    def get_gender_id(self, obj):
        return obj.policy_marker_code

    def get_expenditure(self, obj):
        expenses = DonorFundSplitUp.objects.filter(output=obj) \
            .values('year').annotate(expense_amount=Sum('expense')).order_by('-year').values_list('expense_amount', flat=True)
        return expenses

    def get_donor_short(self, obj):
        donors = DonorFundSplitUp.objects.filter(output=obj).distinct('organisation') \
            .values_list('organisation__short_name', flat=True)
        return donors

    def get_donor_name(self, obj):
        donors = DonorFundSplitUp.objects.filter(output=obj).distinct('organisation') \
            .values_list('organisation__org_name', flat=True)
        return donors

    def get_focus_area_descr(self, obj):
        op_sectors = OutputSector.objects.filter(output=obj)
        if op_sectors:
            focus_area_mapping = op_sectors[0]
            return focus_area_mapping.sector.sector
        return ''

    def get_markers(self, obj):
        marker_types = ProjectMarker.objects.filter(output=obj).distinct('type').values_list('type', flat=True)
        markers = []
        for marker_type in marker_types:
            marker = MARKER_TYPE_CHOICES.get_label(marker_type)
            marker_title = ProjectMarker.objects.filter(type=marker_type, output=obj)\
                .values_list('marker_title', flat=True).distinct()
            data = {
                "marker": marker,
                "marker_type": list(marker_title)
            }
            markers.append(data)
        return markers

    def get_sdg(self, obj):
        sdg = OutputTarget.objects.filter(output=obj).values('target_id__sdg__name', 'target_id__sdg').distinct()
        sdgs = []
        for sdg_name in sdg:
            sdg_data = OutputTarget.objects.filter(output=obj, target_id__sdg__name=sdg_name['target_id__sdg__name'])\
                .values('year', 'percentage', 'target_id__sdg__name').distinct()
            budget_amount = []
            expense_amount = []
            year = []
            for data in sdg_data:
                budget = DonorFundSplitUp.objects\
                    .filter(output=obj, output__outputtarget__target_id__sdg__name=data['target_id__sdg__name'],
                            year=data['year']).values('year')\
                    .annotate(budget_amount=Sum(Case(When(output__outputtarget__target_id__sdg__name=data['target_id__sdg__name'],
                                                          output__outputtarget__year=data['year'],
                                                          then=(F('budget') * data['percentage']/100)))))\
                    .values_list('budget_amount', flat=True).order_by('-year').distinct()
                budget_amount.append(budget[0])
                expense = DonorFundSplitUp.objects \
                    .filter(output=obj, output__outputtarget__target_id__sdg__name=data['target_id__sdg__name'],
                            year=data['year']).values('year') \
                    .annotate(expense_amount=Sum(Case(When(output__outputtarget__target_id__sdg__name=data['target_id__sdg__name'],
                                                           output__outputtarget__year=data['year'],
                                                           then=(F('expense') * data['percentage'] / 100))))) \
                    .values_list('expense_amount', flat=True).order_by('-year').distinct()
                expense_amount.append(expense[0])
                year.append(data['year'])
            sdg_values = {
                            "id": sdg_name['target_id__sdg'],
                            "name": sdg_name['target_id__sdg__name'],
                            "budget": budget_amount,
                            "expenditure": expense_amount,
                            "year": year
                        }
            sdgs.append(sdg_values)
        return sdgs


class OperatingUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperatingUnit
        fields = '__all__'


class DownloadProjectDetailSerializer(serializers.ModelSerializer):
    fiscal_year = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    project_title = serializers.CharField(source='title', required=False)
    project_descr = serializers.CharField(source='description', required=False)
    region_id = serializers.SerializerMethodField()
    iati_op_id = serializers.SerializerMethodField()
    budget = serializers.SerializerMethodField()
    operating_unit_id = serializers.SerializerMethodField()
    operating_unit = serializers.SerializerMethodField()
    operating_unit_email = serializers.SerializerMethodField()
    operating_unit_website = serializers.SerializerMethodField()
    expenditure = serializers.SerializerMethodField()
    inst_id = serializers.SerializerMethodField()
    inst_descr = serializers.SerializerMethodField()
    inst_type_id = serializers.SerializerMethodField()
    document_name = serializers.SerializerMethodField()
    outputs = OutputSerializer(source='output_set', many=True, required=False)
    subnational = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('project_descr', 'fiscal_year', 'end', 'region_id', 'operating_unit_id', 'operating_unit_email',
                  'budget', 'expenditure', 'start', 'document_name', 'project_id', 'project_title', 'outputs',
                  'operating_unit_website', 'inst_id', 'inst_descr', 'inst_type_id', 'iati_op_id', 'operating_unit',
                  'subnational')

    def get_start(self, obj):
        try:
            activity = ProjectActivityDate.objects.get(project=obj, activity_type=PROJECT_ACTIVITY_TYPES.planned_start)
            start = activity.iso_date
        except:
            try:
                activity = ProjectActivityDate.objects.get(project=obj,
                                                           activity_type=PROJECT_ACTIVITY_TYPES.actual_start)
                start = activity.iso_date
            except:
                start = ''
        return start

    def get_end(self, obj):
        try:
            activity = ProjectActivityDate.objects.get(project=obj, activity_type=PROJECT_ACTIVITY_TYPES.planned_end)
            end = activity.iso_date
        except:
            try:
                activity = ProjectActivityDate.objects.get(project=obj, activity_type=PROJECT_ACTIVITY_TYPES.actual_end)
                end = activity.iso_date
            except:
                end = ''
        return end

    def get_fiscal_year(self, obj):
        active_years = obj.project_active.all().values_list('year', flat=True)

        return active_years

    def get_budget(self, obj):
        budget = DonorFundSplitUp.objects.filter(project=obj).aggregate(total_budget=Sum('budget'))['total_budget']
        return budget

    def get_expenditure(self, obj):
        expense = DonorFundSplitUp.objects.filter(project=obj).aggregate(total_expense=Sum('expense'))['total_expense']
        return expense

    def get_inst_id(self, obj):
        try:
            organisation = ProjectParticipatingOrganisations.objects.get(project=obj,
                                                                         org_role=ORGANISATION_ROLES.implementing)
            return organisation.organisation_id
        except:
            return ''

    def get_inst_descr(self, obj):
        try:
            organisation = ProjectParticipatingOrganisations.objects.get(project=obj,
                                                                         org_role=ORGANISATION_ROLES.implementing)
            return organisation.org_name
        except:
            return ''

    def get_inst_type_id(self, obj):
        try:
            organisation = ProjectParticipatingOrganisations.objects.get(project=obj,
                                                                         org_role=ORGANISATION_ROLES.implementing)
            return organisation.org_type
        except:
            return ''

    def get_document_name(self, obj):
        try:
            documents = ProjectDocument.objects.filter(project=obj)
            names = documents.values_list('title', flat=True)
            links = documents.values_list('document_url', flat=True)
            formats = [ft.split('/')[1] for ft in documents.values_list('format', flat=True)]
            doc_details = [names, links, formats]
        except Exception as e:
            doc_details = []
        return doc_details

    def get_subnational(self, obj):
        op_locations = OutputLocation.objects.filter(project=obj)
        subnational = []
        i = 0
        for location in op_locations:
            i += 1
            op_sectors = OutputSector.objects.filter(output=location.output)
            focus_area_mapping = ''
            if op_sectors:
                focus_area_mapping = op_sectors[0]
            subnational.append({
                'outputID': location.output.output_id,
                'output_locID': location.output.output_id + "-" + str(i),
                'name': location.name,
                'focus_area': focus_area_mapping.sector.code if focus_area_mapping else '',
                'lat': location.latitude,
                'type': location.feature_designation,
                'lon': location.longitude,
                'awardID': location.project_id,
                'precision': location.location_class,
                'focus_area_descr': focus_area_mapping.sector.sector if focus_area_mapping else '',
            })
        return subnational

    def get_operating_unit_id(self, obj):
        try:
            return obj.operating_unit.iso3
        except:
            return ''

    def get_operating_unit(self, obj):
        try:
            return obj.operating_unit.name
        except:
            return ''

    def get_operating_unit_email(self, obj):
        try:
            return obj.operating_unit.email
        except:
            return ''

    def get_operating_unit_website(self, obj):
        try:
            return obj.operating_unit.web
        except:
            return ''

    def get_region_id(self, obj):
        try:
            return obj.operating_unit.bureau.code
        except:
            return ''

    def get_iati_op_id(self, obj):
        try:
            return obj.operating_unit.iso2
        except:
            return ''


class StringListField(serializers.ListField):
    child = serializers.CharField()


class ProjectSummarySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='project_id')
    name = serializers.CharField(source='title')
    crs = serializers.CharField(source='crs_code')
    core = serializers.SerializerMethodField()
    operating_unit = serializers.CharField(required=False)
    region = serializers.SerializerMethodField()
    budget = serializers.SerializerMethodField()
    expenditure = serializers.SerializerMethodField()
    fiscal_year = serializers.SerializerMethodField()
    focus_area = serializers.SerializerMethodField()
    donors = serializers.SerializerMethodField()
    donor_countries = serializers.SerializerMethodField()
    donor_types = serializers.SerializerMethodField()
    donor_budget = serializers.SerializerMethodField()
    donor_expend = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('fiscal_year', 'budget', 'expenditure', 'donor_countries',
                  'donor_types', 'donors', 'region', 'operating_unit', 'donor_budget',
                  'donor_expend', 'name', 'focus_area', 'id', 'crs', 'core')

    def get_fiscal_year(self, obj):
        return self.context.get('year')

    def get_focus_area(self, obj):
        sectors = OutputSector.objects.using(db).filter(project=obj).values_list('sector', flat=True).distinct()
        return list(sectors)

    def get_region(self, obj):
        try:
            return obj.operating_unit.bureau.code if obj.operating_unit else ''
        except Exception as e:
            return ''

    def get_donors(self, obj):
        year = self.context.get('year', datetime.now().year)
        donors = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year)\
            .values_list('organisation', flat=True).distinct()
        return list(donors)

    def get_donor_countries(self, obj):
        year = self.context.get('year', datetime.now().year)
        donor_countries = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year) \
            .values('organisation', 'organisation__type_level_3').distinct()
        donor_country = []
        for country in donor_countries:
            donor_country.append(country['organisation__type_level_3'])
        return list(donor_country)

    def get_donor_types(self, obj):
        year = self.context.get('year', datetime.now().year)
        donor_types = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year) \
            .values('organisation', 'organisation__type_level_1').distinct()
        donors_type = []
        for i in donor_types:
            donors_type.append(i['organisation__type_level_1'])
        return list(donors_type)

    def get_budget(self, obj):
        year = self.context.get('year', datetime.now().year)
        budget = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year) \
            .aggregate(total_budget=Coalesce(Sum('budget'), 0))
        return str(budget['total_budget'])

    def get_expenditure(self, obj):
        year = self.context.get('year', datetime.now().year)
        expense = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year) \
            .aggregate(total_expense=Coalesce(Sum('expense'), 0))
        return str(expense['total_expense'])

    def get_donor_budget(self, obj):
        year = self.context.get('year', datetime.now().year)
        donor_budget = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year) \
            .values('organisation')\
            .annotate(donor_budget=Coalesce(Sum('budget'), 0))\
            .values_list('donor_budget', flat=True)
        return [str(item) for item in donor_budget]

    def get_donor_expend(self, obj):
        year = self.context.get('year', datetime.now().year)
        donor_expend = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year) \
            .values('organisation') \
            .annotate(donor_expend=Coalesce(Sum('expense'), 0)) \
            .values_list('donor_expend', flat=True)
        return [str(item) for item in donor_expend]

    def get_core(self, obj):
        year = self.context.get('year', datetime.now().year)
        undp_funds = DonorFundSplitUp.objects.using(db).filter(project=obj, year=year,
                                                     organisation__ref_id=UNDP_DONOR_ID)
        if undp_funds.exists():
            return True
        return False


class OperatingUnitProjectSerializer(serializers.ModelSerializer):
    subnational = serializers.SerializerMethodField()
    id = serializers.CharField(source="project_id")

    class Meta:
        model = Project
        fields = ('id', 'title', 'subnational')

    def get_subnational(self, obj):
        subnationals = []
        i = 0
        for location in OutputLocation.objects.filter(project=obj):
            i += 1
            op_sectors = OutputSector.objects.filter(output=location.output)
            focus_area_mapping = ''
            if op_sectors:
                focus_area_mapping = op_sectors[0]
                print(focus_area_mapping.sector)
            subnationals.append({
                'outputID': location.output_id,
                'output_locID': location.output_id + str(i),
                'name': location.name,
                'focus_area': focus_area_mapping.sector.code if focus_area_mapping else '',
                'lat': location.latitude,
                'type': location.feature_designation,
                'awardID': location.project_id,
                'lon': location.longitude,
                'precision': location.location_class,
                'focus_area_descr': focus_area_mapping.sector.sector if focus_area_mapping else ''
            })
        return subnationals


class OperatingUnitIndexSerializer(serializers.ModelSerializer):
    budget_sum = serializers.IntegerField(required=False)
    expenditure_sum = serializers.IntegerField(required=False)
    project_count = serializers.IntegerField(required=False)
    funding_sources_count = serializers.IntegerField(required=False)
    fund_type = serializers.SerializerMethodField()
    iso_num = serializers.CharField(default="", required=False)
    id = serializers.CharField(source="iso3", required=False)
    email = serializers.CharField(required=False)
    web = serializers.CharField(required=False)
    lat = serializers.CharField(source="latitude", required=False)
    lon = serializers.CharField(source="longitude", required=False)

    class Meta:
        model = OperatingUnit
        fields = ('id', 'name', 'web', 'email', 'lat', 'lon', 'iso_num', 'budget_sum',
                  'expenditure_sum', 'project_count', 'funding_sources_count', 'fund_type')

    @staticmethod
    def get_fund_type(obj):
        if obj.name in LOCAL_COUNTRIES:
            return "Local"
        return "Other"


class BureauIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')
    name = serializers.CharField(source='bureau')

    class Meta:
        model = Bureau
        fields = ('id', 'name')


class DonorIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='ref_id')
    name = serializers.CharField(source='org_name')
    country = serializers.SerializerMethodField()

    class Meta:
        model = Organisation
        fields = ('id', 'name', 'country')

    def get_country(self, obj):
        return obj.operating_unit.iso3 if obj.operating_unit else 'OTH'


class DonorCountryIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='type_level_3')
    name = serializers.CharField(source='level_3_name')

    class Meta:
        model = Organisation
        fields = ('id', 'name',)


class FocusAreaIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')
    name = serializers.CharField(source='sector')

    class Meta:
        model = Sector
        fields = ('color', 'id', 'name')


class SdgIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='code')
    name = serializers.CharField()

    class Meta:
        model = Sdg
        fields = ('color', 'id', 'name')


class MarkerIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='type')
    name = serializers.SerializerMethodField()

    @staticmethod
    def get_name(obj):
        marker_title = obj.type
        return MARKER_TYPE_CHOICES.get_label(marker_title)

    class Meta:
        model = ProjectMarker
        fields = ('id', 'name')


class SignatureSolutionsIndexSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='ss_id')
    name = serializers.CharField()

    class Meta:
        model = SignatureSolution
        fields = ('id', 'name')


class ExportCSVSerializer(serializers.ModelSerializer):
    project_id = serializers.CharField()
    budget = serializers.CharField()
    expense = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    operating_unit = serializers.CharField()
    our_focus = serializers.SerializerMethodField()
    signature_solutions = serializers.SerializerMethodField()
    sdg = serializers.SerializerMethodField()

    def get_our_focus(self, obj):
        sector = OutputSector.objects.filter(project_id=obj['project_id']).values_list('sector', flat=True).distinct()
        sectors = ", ".join(list(sector))
        return sectors

    def get_signature_solutions(self, obj):
        signature_solution = SignatureSolution.objects.filter(output__project_id=obj['project_id'])\
            .values_list('ss_id', flat=True).distinct()
        signature_solutions = ", ".join(list(signature_solution))
        return signature_solutions

    def get_sdg(self, obj):
        sdg = OutputTarget.objects.filter(project_id=obj['project_id'])\
            .values_list('target_id__sdg', flat=True).distinct()
        sdgs = ", ".join(list(sdg))
        return sdgs

    class Meta:
        model = Project
        fields = ('project_id', 'budget', 'expense', 'title', 'description', 'operating_unit', 'our_focus',
                  'signature_solutions', 'sdg')


class ProjectDetailListSerializer(serializers.ModelSerializer):
    budget = serializers.IntegerField(default=0)
    expense = serializers.IntegerField(default=0)
    country = serializers.CharField(source='operating_unit__name', required=False)
    sector = serializers.SerializerMethodField()
    sdg = serializers.SerializerMethodField()
    signature_solution = serializers.SerializerMethodField()
    donor = serializers.SerializerMethodField()
    marker = serializers.SerializerMethodField()

    def get_sector(self, obj):
        request = self.context.get('request', '')
        sectors = request.GET.get('sector', '')
        sector_data = []
        sector = OutputSector.objects.values('sector', 'sector__sector').filter(project_id=obj['project_id']).distinct()
        if sectors:
            sector = sector.filter(sector=sectors)
        for sector_val in sector:
            data = {
                "code": sector_val['sector'],
                "name": sector_val['sector__sector']
            }
            sector_data.append(data)
        return sector_data

    def get_sdg(self, obj):
        request = self.context.get('request', '')
        sdgs = request.GET.get('sdg', '')
        sdg_data = []
        sdg = OutputTarget.objects.values('target_id__sdg', 'target_id__sdg__name')\
            .filter(project_id=obj['project_id']).distinct()
        if sdgs:
            sdg = sdg.filter(target_id__sdg=sdgs)
        for sdg_val in sdg:
            data = {
                "id": sdg_val['target_id__sdg'],
                "name": sdg_val['target_id__sdg__name']
            }
            sdg_data.append(data)
        return sdg_data

    def get_signature_solution(self, obj):
        request = self.context.get('request', '')
        ss_id = request.GET.get('signature_solution', '')
        signature_solution = Output.objects.values('signature_solution_id__ss_id', 'signature_solution_id__name')\
            .filter(project_id=obj['project_id']).distinct()
        ss_data = []
        if ss_id:
            signature_solution = signature_solution.filter(signature_solution_id__ss_id=ss_id)
        for ss_val in signature_solution:
            data = {
                "id": ss_val['signature_solution_id__ss_id'],
                "name": ss_val['signature_solution_id__name']
            }
            ss_data.append(data)
        return ss_data

    def get_donor(self, obj):
        request = self.context.get('request', '')
        budget_sources = request.GET.get('budget_source', '')
        donors = DonorFundSplitUp.objects.values_list('organisation__org_name', flat=True)\
            .filter(project_id=obj['project_id']).distinct()
        if budget_sources:
            donors = donors.filter(organisation=budget_sources)
        return donors

    def get_marker(self, obj):
        request = self.context.get('request', '')
        marker_type = request.GET.get('marker_type', '')
        marker = []
        markers = ProjectMarker.objects.values_list('type', flat=True).filter(output__project_id=obj['project_id'])\
            .distinct()
        if marker_type:
            markers = markers.filter(type=marker_type)
        for marker_type in markers:
            marker_title = MARKER_TYPE_CHOICES.get_label(marker_type)
            marker.append(marker_title)
        return marker

    class Meta:
        model = Project
        fields = ('project_id', 'title', 'description', 'expense', 'budget', 'country', 'sector', 'sdg',
                  'signature_solution', 'donor', 'marker')
