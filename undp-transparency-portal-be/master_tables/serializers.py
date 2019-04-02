from django.db.models.aggregates import Sum
from django.db.models.expressions import F, Value, When, Case
from django.db.models.fields import CharField, IntegerField
from django.db.models.query_utils import Q
from rest_framework import serializers

from master_tables.models import Region, Organisation, Sector, OperatingUnit, DocumentCategory, Bureau, Sdg
from undp_projects.models import ProjectSearch
from utilities.config import LEVEL_3_NAMES_MAPPING, EXCLUDED_SECTOR_CODES
from utilities.utils import process_query_params, get_project_full_text_search_query


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('region_code', 'bureau', 'name')


class CountrySerializer(serializers.ModelSerializer):
    total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)

    class Meta:
        model = OperatingUnit
        fields = ('name', 'iso2', 'iso3', 'web', 'email', 'total_budget',
                  'unit_type', 'is_donor', 'is_recipient')


class OrganisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organisation
        fields = ('ref_id', 'short_name', 'org_name',)


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ('code', 'sector', 'color')


class OperatingUnitOrganisationSerializer(serializers.Serializer):
    type = serializers.CharField()
    code = serializers.CharField()
    name = serializers.SerializerMethodField()
    short_name = serializers.CharField(required=False)

    class Meta:
        fields = ('type', 'name', 'code', 'short_name')

    def get_name(self, obj):
        return obj.get('name', '').title()


class OperatingUnitSerializer(OperatingUnitOrganisationSerializer):
    organisations = serializers.SerializerMethodField()

    def get_organisations(self, obj):
        organisations = Organisation.objects.filter(operating_unit__iso3=obj.get('code'))\
            .values('short_name')\
            .annotate(code=F('ref_id'), name=F('org_name'), type=Value('2', output_field=CharField()))

        return OperatingUnitOrganisationSerializer(organisations, many=True).data

    class Meta:
        model = OperatingUnit
        fields = ('code', 'name', 'organisations', 'type')


class DonorSerializer(serializers.ModelSerializer):
    type = serializers.CharField(default=2)
    code = serializers.CharField(source='ref_id')
    name = serializers.SerializerMethodField()
    is_donor = serializers.BooleanField(default=True)
    is_recipient = serializers.BooleanField(default=False)
    total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    donor_lvl = serializers.SerializerMethodField()
    level_3_code = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.org_name.title()

    def get_donor_lvl(self, obj):
        return obj.type_level_1

    def get_level_3_code(self, obj):
        return obj.type_level_3

    class Meta:
        model = Organisation
        fields = ('type', 'code', 'name', 'total_budget', 'is_donor', 'is_recipient', 'donor_lvl', 'level_3_code')


class BudgetSourceSerializer(serializers.ModelSerializer):
    organisations = serializers.SerializerMethodField(required=False)
    total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    code = serializers.CharField()
    # name = serializers.CharField(source='donor_name')
    name = serializers.SerializerMethodField()
    type = serializers.CharField(default='1')
    is_recipient = serializers.SerializerMethodField()
    is_donor = serializers.BooleanField(default=True)

    def get_name(self, obj):
        if obj['donor_name'] in LEVEL_3_NAMES_MAPPING.keys():
            return LEVEL_3_NAMES_MAPPING.get(obj['donor_name'], 'N/A')

        return obj['donor_name']

    def get_is_recipient(self, obj):
        try:
            OperatingUnit.objects.get(iso3=obj['code'], is_recipient=True)

            return True
        except:
            return False

    def get_organisations(self, obj):
        search = self.context.get('search')
        country = self.context.get('country')
        year = self.context.get('year')
        sector = self.context.get('sector')
        sdg = self.context.get('sdg')
        ss_id = self.context.get('ss_id')
        query = Q(ref_id=search) | Q(type_level_3=search) | \
            Q(org_name__icontains=search) | Q(level_3_name__icontains=search)
        query.add(Q(type_level_3=obj['code']), Q.AND)
        if year:
            query.add(Q(donorfundsplitup__year=year), Q.AND)
            query.add(Q(donorfundsplitup__project__project_active__year=year), Q.AND)
        if country:
            query.add(Q(donorfundsplitup__project__operating_unit=country), Q.AND)
        if sector:
            if sector == '0':
                EXCLUDED_SECTOR_CODES.append('8')
                sector_query = Q(donorfundsplitup__project__output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                    Q(donorfundsplitup__project__output__outputsector__isnull=True)
            else:
                sector_query = Q(Q(donorfundsplitup__project__output__outputsector__sector=sector))
            query.add(sector_query, Q.AND)
        if sdg:
            if sdg == '0':
                # sdg_query = Q(donorfundsplitup__project__output__outputsdg__isnull=True)
                sdg_query = Q(donorfundsplitup__project__output__outputtarget__isnull=True)
            else:
                # sdg_query = Q(donorfundsplitup__project__output__outputsdg__sdg=sdg)
                sdg_query = Q(donorfundsplitup__project__output__outputtarget__target_id__sdg=sdg)
            query.add(sdg_query, Q.AND)
        if ss_id:
            ss_query = Q(donorfundsplitup__project__output__signature_solution__ss_id=ss_id)
            query.add(ss_query, Q.AND)
        organisations = Organisation.objects.filter(query) \
            .annotate(type=Value(2, output_field=IntegerField()),
                      budget=Sum('donorfundsplitup__budget')) \
            .annotate(total_budget=Case(When(budget__isnull=True, then=0),
                                        default=(F('budget')))) \
            .filter(total_budget__gt=0)\
            .order_by('-total_budget')
        return DonorSerializer(organisations, many=True).data

    class Meta:
        model = OperatingUnit
        fields = ('code', 'name', 'organisations', 'total_budget', 'type', 'is_recipient', 'is_donor')


class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = '__all__'


class CountryLevelSerializer(serializers.ModelSerializer):
    code = serializers.CharField(source='iso3')
    iso2 = serializers.CharField(required=False)
    type = serializers.IntegerField(default=2)
    donor_lvl = serializers.SerializerMethodField()
    level_3_code = serializers.CharField(source='iso3')

    class Meta:
        model = OperatingUnit
        fields = ('name', 'code', 'iso2', 'type', 'unit_type', 'donor_lvl', 'level_3_code')

    def get_donor_lvl(self, obj):
        try:
            donor_lvl = Organisation.objects.filter(type_level_3=obj.iso3)[0].type_level_1
            return donor_lvl
        except IndexError:
            return "OTH"


class BureauLevelSerializer(serializers.ModelSerializer):
    countries = serializers.SerializerMethodField()
    code = serializers.CharField(source='bureau__code')
    name = serializers.CharField(source='bureau__bureau')
    type = serializers.IntegerField(default=1)
    is_donor = serializers.SerializerMethodField()
    is_recipient = serializers.SerializerMethodField()

    class Meta:
        model = Bureau
        fields = ('name', 'code', 'type', 'is_donor', 'is_recipient', 'countries')

    def get_countries(self, obj):
        request = self.context.get('request')
        search = request.GET.get('search', '')
        year = process_query_params(request.GET.get('year', ''))
        sector = process_query_params(request.GET.get('sector', ''))
        sdg = process_query_params(request.GET.get('sdg', ''))
        donor = process_query_params(request.GET.get('donor', ''))
        ss_id = request.GET.get('ss_id', '')
        marker_type = request.GET.get('marker_type', '')
        marker_id = request.GET.get('marker_id', '')
        level_two_marker = request.GET.get('level_two_marker', '')
        search_query = Q(is_recipient=True) & Q(bureau__code=obj['bureau__code'])
        if search:
            search_query &= Q(name__icontains=search) | Q(iso3__icontains=search) | \
                Q(bureau__code__icontains=search) | Q(bureau__bureau__icontains=search)
        projects_query = get_project_full_text_search_query(year, [], donor,
                                                            sector, '', budget_type='direct',
                                                            category='', sdgs=sdg, signature_solution=ss_id,
                                                            marker_type=marker_type, marker_id=marker_id,
                                                            level_two_marker=level_two_marker)
        project_ids = ProjectSearch.objects.filter(projects_query).distinct('project_id') \
            .values_list('project_id', flat=True)
        search_query.add(Q(project__in=project_ids), Q.AND)
        queryset = OperatingUnit.objects.filter(search_query)
        countries = queryset.distinct().order_by('name')
        return CountryLevelSerializer(countries, many=True).data

    def get_is_donor(self, obj):
        return False

    def get_is_recipient(self, obj):
        return True


class SdgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sdg
        fields = '__all__'
