from django.db.models.aggregates import Sum
from django.db.models.expressions import F
from django.db.models.functions.datetime import ExtractYear
from rest_framework import serializers
from master_tables.models import OperatingUnit, Organisation
from master_tables.serializers import SectorSerializer
from undp_projects.models import Project
from undp_donors.models import DonorFundSplitUp
from undp_outputs.models import Output, OutputSector, OutputResult, OutputLocation,\
    OutputResultPeriod, ProjectMarker, MARKER_TYPE_CHOICES, MARKER_PARENT_CHOICES
from utilities.config import POLICY_MARKER_CODES, AID_TYPE_CODES, POLICY_SIGNIFICANCE_CODES, HUMANITARIAN_PLUS
from utilities.utils import Round
from django.db.models.query_utils import Q


class OutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Output
        fields = ('output_id', 'title', 'description', 'project',)


class ResultPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutputResultPeriod
        fields = '__all__'


class ResultSerializer(serializers.ModelSerializer):
    sector = serializers.SerializerMethodField()
    result_period_span = serializers.SerializerMethodField()
    result_periods = serializers.SerializerMethodField()

    def get_sector(self, obj):
        sector = obj.output.outputsector_set.all()
        if sector:
            return sector[0].sector.sector
        return ''

    def get_result_period_span(self, obj):
        result_period = OutputResultPeriod.objects.filter(result=obj)\
            .annotate(year=ExtractYear('period_start'))\
            .values_list('year', flat=True)\
            .order_by('-year')
        return result_period

    def get_result_periods(self, obj):
        result_periods = obj.outputresultperiod_set.all().order_by('-period_start')
        return ResultPeriodSerializer(result_periods, many=True).data

    class Meta:
        model = OutputResult
        fields = '__all__'


class OutputSectorSerializer(serializers.ModelSerializer):
    sector = SectorSerializer()

    class Meta:
        model = OutputSector
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutputLocation
        fields = '__all__'


class OutputListSerializer(serializers.ModelSerializer):
    has_result = serializers.SerializerMethodField()
    sector = serializers.SerializerMethodField()
    policy_significance = serializers.SerializerMethodField()
    markers = serializers.SerializerMethodField()
    sdg = serializers.SerializerMethodField()
    signature_solution = serializers.SerializerMethodField()

    @staticmethod
    def get_sector(obj):
        sector = obj.outputsector_set.all()
        if sector:
            return sector[0].sector.sector
        return ''

    @staticmethod
    def get_has_result(obj):
        result = obj.outputresult_set.all()
        if result:
            return True
        return False

    @staticmethod
    def get_policy_significance(obj):
        policy_significance_code = obj.policy_marker_significance
        return POLICY_SIGNIFICANCE_CODES.get(policy_significance_code, '')

    @staticmethod
    def get_markers(obj):
        markers = list(obj.marker_output.values_list('type', flat=True).distinct('type'))
        return markers

    @staticmethod
    def get_sdg(obj):
        sdgs = list(obj.outputtarget_set.values_list('target_id__sdg_id', flat=True).distinct('target_id__sdg_id'))
        list_sdg = []
        for sdg in sdgs:
            code = "SDG-"+sdg
            list_sdg.append(code)
        return list_sdg

    @staticmethod
    def get_signature_solution(obj):
        return obj.signature_solution.name

    class Meta:
        model = Output
        fields = ('output_id', 'project_id', 'sector', 'title', 'description',
                  'has_result', 'policy_significance', 'markers', 'sdg', 'signature_solution')


class OutputDetailSerializer(serializers.ModelSerializer):
    budget_sources = serializers.SerializerMethodField()
    budget_utilization = serializers.SerializerMethodField()
    sector = serializers.SerializerMethodField()
    policy_marker = serializers.SerializerMethodField()
    aid_type = serializers.SerializerMethodField()
    policy_significance = serializers.SerializerMethodField()

    @staticmethod
    def get_policy_marker(obj):
        policy_marker_code = obj.policy_marker_code
        return POLICY_MARKER_CODES.get(policy_marker_code, '')

    @staticmethod
    def get_policy_significance(obj):
        policy_significance_code = obj.policy_marker_significance
        return POLICY_SIGNIFICANCE_CODES.get(policy_significance_code, '')

    @staticmethod
    def get_aid_type(obj):
        aid_type = obj.default_aid_type
        return AID_TYPE_CODES.get(aid_type, '')

    @staticmethod
    def get_sector(obj):
        sector = obj.outputsector_set.all()
        if sector:
            return sector[0].sector.sector
        return ''

    @staticmethod
    def get_budget_sources(obj):
        budget_sources = DonorFundSplitUp.objects.filter(output=obj) \
            .distinct('organisation') \
            .annotate(organisation_name=F('organisation__org_name'))\
            .values_list('organisation_name', flat=True)

        budget_sources = [x.title() for x in budget_sources]
        return budget_sources

    @staticmethod
    def get_budget_utilization(obj):

        budget_utilization = DonorFundSplitUp.objects.filter(output=obj).values('year')\
            .annotate(total_budget=Round(Sum('budget')), total_expense=Round(Sum('expense')))\
            .values('year', 'total_budget', 'total_expense')

        return budget_utilization

    class Meta:
        model = Output
        fields = ('output_id', 'project', 'sector', 'budget_sources', 'policy_marker',
                  'budget_utilization', 'aid_type', 'policy_significance')


class OutputCsvSerializer(serializers.ModelSerializer):
    sector = serializers.SerializerMethodField()
    policy_marker = serializers.SerializerMethodField()
    has_result = serializers.SerializerMethodField()
    policy_significance = serializers.SerializerMethodField()
    total_budget = serializers.IntegerField(required=False)
    total_expense = serializers.IntegerField(required=False)

    class Meta:
        model = Output
        fields = ('output_id', 'project_id', 'title', 'description', 'sector',
                  'has_result', 'policy_significance', 'policy_marker', 'total_budget',
                  'total_expense')

    @staticmethod
    def get_policy_marker(obj):
        policy_marker_code = obj.policy_marker_code
        return POLICY_MARKER_CODES.get(policy_marker_code, '')

    @staticmethod
    def get_policy_significance(obj):
        policy_significance_code = obj.policy_marker_significance
        return POLICY_SIGNIFICANCE_CODES.get(policy_significance_code, '')

    @staticmethod
    def get_has_result(obj):
        result = obj.outputresult_set.all()
        if result:
            return True
        return False

    @staticmethod
    def get_sector(obj):
        sector = obj.outputsector_set.all()
        if sector:
            return sector[0].sector.sector
        return ''


class ProjectMarkerSerializer(serializers.ModelSerializer):
    type_title = serializers.SerializerMethodField()
    type_details = serializers.SerializerMethodField()
    description_title = serializers.SerializerMethodField()
    description_details = serializers.SerializerMethodField()

    @staticmethod
    def get_type_title(obj):
        if obj.type == MARKER_TYPE_CHOICES.hows_marker or obj.type == MARKER_TYPE_CHOICES.humanitarian_marker or \
                obj.type == MARKER_TYPE_CHOICES.jointprogramme_marker or \
                obj.type == MARKER_TYPE_CHOICES.covid_marker:
            return obj.marker_title
        if obj.parent_type == MARKER_PARENT_CHOICES.default:
            return obj.marker_title
        return MARKER_PARENT_CHOICES.get_label(obj.parent_type)

    @staticmethod
    def get_type_details(obj):
        if obj.type == MARKER_TYPE_CHOICES.humanitarian_marker and obj.marker_id != HUMANITARIAN_PLUS:
            return obj.marker_desc
        return ''

    @staticmethod
    def get_description_title(obj):
        if obj.type == MARKER_TYPE_CHOICES.humanitarian_marker and obj.marker_id != HUMANITARIAN_PLUS:
            level_two_marker = ProjectMarker.objects.values('level_two_marker_title', 'level_two_marker_description')\
                .filter(type=obj.type, marker_title=obj.marker_title).distinct('level_two_marker_title')
            return level_two_marker
        elif obj.type == MARKER_TYPE_CHOICES.whos_marker:
            marker_title = ProjectMarker.objects.values_list('marker_title', flat=True) \
                .filter(type=obj.type, parent_type=obj.parent_type).distinct('marker_title')
            return marker_title
        return ''

    @staticmethod
    def get_description_details(obj):
        if obj.type == MARKER_TYPE_CHOICES.hows_marker:
            return obj.marker_desc
        elif obj.type == MARKER_TYPE_CHOICES.partner_marker:
            if obj.parent_type == MARKER_PARENT_CHOICES.default:
                return obj.parent_marker_desc
            else:
                parent_marker_desc = ProjectMarker.objects.values_list('parent_marker_desc', flat=True)\
                    .filter(type=obj.type, parent_type=obj.parent_type).distinct('parent_marker_desc')
                return parent_marker_desc
        elif obj.type == MARKER_TYPE_CHOICES.covid_marker:
            return obj.marker_desc
        elif obj.type == MARKER_TYPE_CHOICES.jointprogramme_marker or \
                (obj.type == MARKER_TYPE_CHOICES.humanitarian_marker and obj.marker_id == HUMANITARIAN_PLUS) \
                or obj.type == MARKER_TYPE_CHOICES.covid_marker:
            level_two_desc = ProjectMarker.objects.values_list('level_two_marker_description', flat=True) \
                .filter(type=obj.type, marker_title=obj.marker_title).distinct('level_two_marker_description')
            return level_two_desc
        return ''

    class Meta:
        model = ProjectMarker
        fields = ('type_title', 'description_details', 'type_details', 'description_title')


class MarkerSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    sublevel = serializers.SerializerMethodField()

    @staticmethod
    def get_title(obj):
        marker_title = obj['type']
        return MARKER_TYPE_CHOICES.get_label(marker_title)

    @staticmethod
    def get_sublevel(obj):
        marker_sub = []
        marker_title = []
        level_two = []
        for marker in ProjectMarker.objects.values('type', 'marker_title', 'level_two_marker_title')\
                .order_by('type').filter(type=obj['type'], output=obj['output']):
            if marker['marker_title'] not in marker_title:
                marker_title.append(marker['marker_title'])
        for m in ProjectMarker.objects.values('type', 'marker_title', 'level_two_marker_title') \
                .order_by('type').filter(marker_title=obj['marker_title'], output=obj['output']):
            if m['level_two_marker_title'] != "":
                level_two.append({'title': m['level_two_marker_title']})
        for title in marker_title:
            marker_sub.append({'title': title,
                               'sublevel': level_two})
        return marker_sub

    class Meta:
        model = ProjectMarker
        fields = ('title', 'sublevel')


class MarkerBudgetSourcesSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    short_name = serializers.CharField()
    organisation_name = serializers.CharField()

    class Meta:
        fields = ('total_budget', 'total_expense', 'short_name', 'organisation_name')


class MarkerOperatingUnitSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    iso3 = serializers.CharField()
    name = serializers.CharField()

    class Meta:
        fields = ('total_budget', 'total_expense', 'iso3', 'name')


class MarkerFlagSerializer(serializers.Serializer):
    type = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    countries = serializers.SerializerMethodField()

    @staticmethod
    def get_type(obj):
        marker_type = obj['marker_id']
        return marker_type

    @staticmethod
    def get_title(obj):
        title = obj['marker_title']
        return title

    @staticmethod
    def get_description(obj):
        marker_desc = obj['marker_desc']
        return marker_desc

    def get_countries(self, obj):
        request = self.context.get('request')
        operating_unit = request.GET.get('operating_unit', '')
        level_two_marker = request.GET.get('level_two_marker', '')
        project_markers = ProjectMarker.objects.filter(marker_id=obj['marker_id'],
                                                       type=MARKER_TYPE_CHOICES.ssc_marker) \
            .distinct('level_two_marker_title')
        op_query = Q(output_id__operating_unit=operating_unit) | \
                   Q(output_id__operating_unit__bureau__code=operating_unit) | \
                   Q(output_id__project__operating_unit=operating_unit)
        if operating_unit:
            project_markers = project_markers.filter(op_query)
        if level_two_marker:
            project_markers = project_markers.filter(Q(output_id__marker_output__level_two_marker_title=level_two_marker))
        countries = []
        for project_marker in project_markers:
            try:
                unit = OperatingUnit.objects.get(name=project_marker.level_two_marker_title)
            except Exception:
                continue
            country_data = {
                'country_iso3': unit.iso3,
                'country_iso2': unit.iso2,
                'country_name': unit.name
            }
            countries.append(country_data)
        return countries

    class Meta:
        model = ProjectMarker
        fields = ('marker_type', 'title', 'countries')


class FlightMapSerializer(serializers.ModelSerializer):
    country_iso3 = serializers.CharField(source='iso3')
    country_iso2 = serializers.CharField(source='iso2')
    country_name = serializers.CharField(source='name')
    lat = serializers.DecimalField(source='latitude', required=False, max_digits=30, decimal_places=2)
    lng = serializers.DecimalField(source='longitude', required=False, max_digits=30, decimal_places=2)
    projects = serializers.SerializerMethodField()
    reverse_projects = serializers.SerializerMethodField()

    @staticmethod
    def get_projects(obj):
        ProjectMarkers = ProjectMarker.objects.filter(output__operating_unit=obj,
                                                      type=MARKER_TYPE_CHOICES.ssc_marker)
        data1 = []
        data2 = []
        data3 = []
        for projectmarker in ProjectMarkers:
            try:

                unit = OperatingUnit.objects.get(name=projectmarker.level_two_marker_title)
            except Exception:
                break
            if projectmarker.marker_id == 1:
                type = {
                    'lat': unit.latitude,
                    'lng': unit.longitude
                }
                data1.append(type)
            elif projectmarker.marker_id == 2:
                type = {
                    'lat': unit.latitude,
                    'lng': unit.longitude
                }
                data2.append(type)

            elif projectmarker.marker_id == 3:
                type = {
                    'lat': unit.latitude,
                    'lng': unit.longitude
                }
                data3.append(type)
        data = {
            'type1': data1,
            'type2': data2,
            'type3': data3
        }
        return data

    @staticmethod
    def get_reverse_projects(obj):
        ProjectMarkers = ProjectMarker.objects.filter(level_two_marker_title=obj.name,
                                                      type=MARKER_TYPE_CHOICES.ssc_marker)
        data1 = []
        data2 = []
        data3 = []
        for projectmarker in ProjectMarkers:
            try:
                unit = projectmarker.output.operating_unit
            except Exception:
                break
            if unit:
                if projectmarker.marker_id == 1:
                    type = {
                        'lat': unit.latitude,
                        'lng': unit.longitude
                    }
                    data1.append(type)
                elif projectmarker.marker_id == 2:
                    type = {
                        'lat': unit.latitude,
                        'lng': unit.longitude
                    }
                    data2.append(type)

                elif projectmarker.marker_id == 3:
                    type = {
                        'lat': unit.latitude,
                        'lng': unit.longitude
                    }
                    data3.append(type)
        data = {
            'type1': data1,
            'type2': data2,
            'type3': data3
        }
        return data

    class Meta:
        model = OperatingUnit
        fields = ('country_iso3', 'country_iso2', 'country_name', 'lat', 'lng', 'projects', 'reverse_projects')


class MarkerLevelOneSerializer(serializers.Serializer):
    marker_type = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()

    @staticmethod
    def get_marker_type(obj):
        if obj.type == MARKER_TYPE_CHOICES.partner_marker or obj.type == MARKER_TYPE_CHOICES.whos_marker:
            return obj.parent_type
        return obj.marker_id

    @staticmethod
    def get_title(obj):
        if obj.type == MARKER_TYPE_CHOICES.whos_marker:
            return obj.marker_title
        if obj.type == MARKER_TYPE_CHOICES.partner_marker:
            return obj.parent_marker_desc
        if obj.type == MARKER_TYPE_CHOICES.jointprogramme_marker:
            return obj.level_two_marker_description
        marker_title = obj.marker_title
        return marker_title

    class Meta:
        model = ProjectMarker
        fields = ('marker_id', 'marker_title')


class ProjectListSSCSerializer(serializers.ModelSerializer):
    budget = serializers.IntegerField(default=0)
    expense = serializers.IntegerField(default=0)
    country = serializers.CharField(source='operating_unit__name', required=False)
    country_involved = serializers.SerializerMethodField()

    @staticmethod
    def get_country_involved(obj):
        outputs = Output.objects.filter(project_id=obj['project_id'],
                                        marker_output__type=MARKER_TYPE_CHOICES.ssc_marker)\
            .distinct('output_id')
        for output in outputs:
            country = ProjectMarker.objects.filter(output__project_id=obj['project_id'], output=output.output_id,
                                                   type=MARKER_TYPE_CHOICES.ssc_marker)\
                .values_list('level_two_marker_title', flat=True).distinct()
        return country

    class Meta:
        model = Project
        fields = ('project_id', 'title', 'description', 'expense', 'budget', 'country', 'country_involved')


class LevelTwoMarkerSerializer(serializers.ModelSerializer):
    level_two_marker_id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    level_3_code = serializers.SerializerMethodField()
    iso2 = serializers.SerializerMethodField()
    donor_lvl = serializers.SerializerMethodField()
    code = serializers.SerializerMethodField()
    unit_type = serializers.SerializerMethodField()

    @staticmethod
    def get_level_two_marker_id(obj):
        return obj['level_two_marker_id']

    @staticmethod
    def get_name(obj):
        return obj['level_two_marker_title']

    @staticmethod
    def get_level_3_code(obj):
        level_two_marker = obj['level_two_marker_title']
        try:
            unit = OperatingUnit.objects.get(name=level_two_marker)
        except Exception:
            return None
        return unit.iso3

    @staticmethod
    def get_iso2(obj):
        level_two_marker = obj['level_two_marker_title']
        try:
            unit = OperatingUnit.objects.get(name=level_two_marker)
        except Exception:
            return None
        return unit.iso2

    def get_donor_lvl(self, obj):
        try:
            donor_lvl = Organisation.objects.filter(level_3_name=obj['level_two_marker_title'])[0].type_level_1
            return donor_lvl
        except IndexError:
            return "OTH"

    @staticmethod
    def get_code(obj):
        level_two_marker = obj['level_two_marker_title']
        try:
            unit = OperatingUnit.objects.get(name=level_two_marker)
        except Exception:
            return None
        return unit.iso3

    @staticmethod
    def get_unit_type(obj):
        level_two_marker = obj['level_two_marker_title']
        try:
            unit = OperatingUnit.objects.get(name=level_two_marker)
        except Exception:
            return None
        return unit.unit_type

    class Meta:
        model = ProjectMarker
        fields = ('level_two_marker_id', 'name', 'code', 'iso2', 'donor_lvl', 'level_3_code', 'unit_type')
