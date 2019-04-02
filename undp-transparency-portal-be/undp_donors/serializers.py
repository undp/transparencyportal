from django.db.models.aggregates import Sum
from django.db.models.query_utils import Q
from rest_framework import serializers

from master_tables.models import Organisation
from undp_donors.models import DonorFundSplitUp, DonorFundModality, DONOR_CATEGORY_CHOICES, FUND_STREAM_CHOICES, FUND_TYPE_CHOICES
from utilities.config import FUND_TYPE_COLORS, FUND_STREAM_COLORS, EXCLUDED_SECTOR_CODES, LEVEL_3_NAMES_MAPPING
from utilities.utils import get_donor_category_label, in_dictlist


class DonorFundSplitUpSerializer(serializers.Serializer):
    # total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    # total_expense = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_budget = serializers.IntegerField(required=False)
    total_expense = serializers.IntegerField(required=False)
    # organisation = serializers.CharField()
    year = serializers.IntegerField()

    class Meta:
        fields = ('total_budget', 'total_expense', 'year')


class RecipientBudgetSourcesSerializer(serializers.Serializer):
    # org_name = serializers.CharField(source='organisation__org_name')
    # short_name = serializers.CharField(source='organisation__short_name')
    # level_3_name = serializers.CharField(source='organisation__level_3_name')
    level_3_name = serializers.SerializerMethodField()
    type_level_3 = serializers.CharField(source='organisation__type_level_3')
    # ref_id = serializers.CharField(source='organisation__ref_id')
    # total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    # total_expense = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_budget = serializers.IntegerField(required=False)
    total_expense = serializers.IntegerField(required=False)

    class Meta:
        # fields = ('ref_id', 'org_name', 'short_name', 'total_budget', 'type_level_3', 'total_expense')
        fields = ('level_3_name', 'total_budget', 'type_level_3', 'total_expense')

    def get_level_3_name(self, obj):
        if obj['organisation__level_3_name'] in LEVEL_3_NAMES_MAPPING.keys():
            return LEVEL_3_NAMES_MAPPING.get(obj['organisation__level_3_name'], 'N/A')
        return obj['organisation__level_3_name']


class FundModalitySerializer(serializers.Serializer):
    # total_contribution = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_contribution = serializers.IntegerField(required=False)
    fund_type = serializers.CharField()
    percentage = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    color = serializers.SerializerMethodField()

    class Meta:
        fields = ('total_contribution', 'fund_type', 'percentage',)

    def get_color(self, obj):
        return FUND_TYPE_COLORS.get(obj['fund_type'], '')


class FundModalitySourcesSerializer(serializers.Serializer):
    # total_contribution = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_contribution = serializers.IntegerField(required=False)
    fund_stream = serializers.SerializerMethodField()
    percentage = serializers.DecimalField(required=False, max_digits=30, decimal_places=5)
    color = serializers.SerializerMethodField()
    priority = serializers.CharField(required=False)
    country_contribution = serializers.SerializerMethodField()
    country_percentage = serializers.SerializerMethodField()

    class Meta:
        fields = ('total_contribution', 'fund_stream', 'country_contribution',
                  'country_percentage', 'percentage', 'priority')

    def get_fund_stream(self, obj):
        if obj['fund_stream'] == FUND_STREAM_CHOICES.get_label(1):
            return FUND_TYPE_CHOICES.get_label(1)
        return obj['fund_stream']

    def get_color(self, obj):
        if obj['fund_stream'] == FUND_STREAM_CHOICES.get_label(1):
            return FUND_TYPE_COLORS.get(FUND_TYPE_CHOICES.get_label(1), '')
        return FUND_STREAM_COLORS.get(obj['fund_stream'], '')

    def get_country_contribution(self, obj):
        year = self.context.get('year', '')
        donor = self.context.get('donor', '')
        fund_stream = obj['fund_stream']
        query = Q()
        if fund_stream:
            query.add(Q(fund_stream=fund_stream), Q.AND)
        if donor:
            donor_query = Q(organisation__type_level_3=donor) | Q(organisation__ref_id=donor)
            query.add(donor_query, Q.AND)
        if year:
            query.add(Q(year=year), Q.AND)
        result = DonorFundModality.objects.filter(query)
        if result:
            return int(round(result.aggregate(amount=Sum('contribution'))['amount']))
        return 0

    def get_country_percentage(self, obj):
        year = self.context.get('year', '')
        donor = self.context.get('donor', '')
        fund_stream = obj['fund_stream']
        percentage = 0
        query = Q()
        if fund_stream:
            query.add(Q(fund_stream=fund_stream), Q.AND)
        if donor:
            donor_query = Q(organisation__type_level_3=donor) | Q(organisation__ref_id=donor)
            query.add(donor_query, Q.AND)
        if year:
            query.add(Q(year=year), Q.AND)
        result = DonorFundModality.objects.filter(query)
        if result:
            amount = result.aggregate(amount=Sum('contribution'))['amount']
            try:
                percentage = amount / obj['total_contribution'] * 100
            except:
                pass
        return percentage


class DonorfundAggregateSerializer(serializers.Serializer):
    # total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    # total_expense = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_budget = serializers.IntegerField(required=False)
    total_expense = serializers.IntegerField(required=False)
    level_3_code = serializers.CharField(source='organisation__type_level_3', required=False)
    level_3_name = serializers.SerializerMethodField()
    donor_lvl = serializers.SerializerMethodField()
    ref_id = serializers.CharField(source='organisation_id', required=False)
    org_name = serializers.CharField(required=False)
    # level_3_name = serializers.CharField(source='organisation__level_3_name')
    total_projects = serializers.CharField()
    # percentage = serializers.SerializerMethodField()
    #
    # def get_percentage(self, obj):
    #     total_budget_amount = self.context.get('total_budget')
    #     percentage = 0
    #     if total_budget_amount > 0:
    #         percentage = obj['total_budget'] / total_budget_amount * 100
    #     return percentage

    class Meta:
        fields = ('total_budget', 'total_expense', 'operating_unit', 'ref_id', 'org_name', 'donor_lvl'
                  'operating_unit_name', 'total_projects', 'percentage', 'level_3_code', 'level_3_name')

    def get_level_3_name(self, obj):
        if obj.get('organisation__level_3_name', '') in LEVEL_3_NAMES_MAPPING.keys():
            return LEVEL_3_NAMES_MAPPING.get(obj['organisation__level_3_name'], 'N/A')
        return obj.get('organisation__level_3_name', '')

    def get_donor_lvl(self, obj):
        return Organisation.objects.filter(level_3_name=obj['organisation__level_3_name'])[0].type_level_1


class TopRecieversSerializer(serializers.Serializer):
    # total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    # total_expense = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_projects = serializers.IntegerField(required=False)
    total_budget = serializers.IntegerField(required=False)
    total_expense = serializers.IntegerField(required=False)
    recipient = serializers.CharField(source='project__operating_unit__name')
    iso3 = serializers.CharField(source='project__operating_unit')

    class Meta:
        fields = ('total_budget', 'total_expense', 'recipient', 'total_projects', 'iso3')


class DonorsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organisation
        fields = '__all__'


class BudgetSourcesSerializer(serializers.Serializer):
    org_name = serializers.SerializerMethodField()
    # org_name = serializers.CharField(source='organisation__org_name')
    ref_id = serializers.CharField(source='organisation__ref_id')
    short_name = serializers.CharField(source='organisation__short_name')
    type_level_3 = serializers.CharField(source='organisation__type_level_3')
    # total_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    total_budget = serializers.IntegerField(required=False)

    class Meta:
        fields = ('ref_id', 'org_name', 'short_name', 'total_budget', 'type_level_3',)

    @staticmethod
    def get_org_name(obj):
        return obj['organisation__org_name'].title()


class DonorContributionSerializer(serializers.Serializer):
    regular_contribution = serializers.SerializerMethodField()
    other_contribution = serializers.SerializerMethodField()
    # country = serializers.CharField(source='organisation__level_3_name')
    country = serializers.SerializerMethodField()
    country_iso3 = serializers.CharField(source='organisation__type_level_3')
    total_contribution = serializers.SerializerMethodField()

    class Meta:
        fields = ('country', 'country_iso3', 'total_contribution',
                  'regular_contribution', 'other_contribution')

    def get_country(self, obj):
        if obj['organisation__level_3_name'] in LEVEL_3_NAMES_MAPPING.keys():
            return LEVEL_3_NAMES_MAPPING.get(obj['organisation__level_3_name'], 'N/A')
        return obj['organisation__level_3_name']

    def get_total_contribution(self, obj):
        return self._total_contribution(obj)

    def get_regular_contribution(self, obj):
        year = self.context.get('year')
        fund_stream = self.context.get('fund_stream', '')
        total_contribution = self._total_contribution(obj)
        query = Q(year=year) & \
            Q(organisation__type_level_3=obj['organisation__type_level_3']) & \
            Q(fund_type='Regular Resources')
        if fund_stream:
            query.add(Q(fund_stream=fund_stream), Q. AND)

        regular_contribution = DonorFundModality.objects\
            .filter(query).aggregate(amount=Sum('contribution'))['amount']
        try:
            percentage = regular_contribution / total_contribution * 100
        except:
            percentage = 0
        try:
            regular_contribution = int(round(regular_contribution))
        except:
            regular_contribution = 0
        return {
            'amount': regular_contribution,
            'percentage': round(percentage, 2)
        }

    def get_other_contribution(self, obj):
        year = self.context.get('year')
        fund_stream = self.context.get('fund_stream', '')
        total_contribution = self._total_contribution(obj)
        query = Q(year=year) & \
            Q(organisation__type_level_3=obj['organisation__type_level_3']) & \
            Q(fund_type='Other Resources')
        if fund_stream:
            query.add(Q(fund_stream=fund_stream), Q. AND)

        other_contribution = DonorFundModality.objects\
            .filter(query).aggregate(amount=Sum('contribution'))['amount']
        try:
            percentage = other_contribution / total_contribution * 100
        except:
            percentage = 0
        try:
            other_contribution = int(round(other_contribution))
        except:
            other_contribution = 0
        return {
            'amount': other_contribution,
            'percentage': round(percentage, 2)
        }

    def _total_contribution(self, obj):
        year = self.context.get('year')
        fund_stream = self.context.get('fund_stream', '')
        query = Q(year=year) & \
            Q(organisation__type_level_3=obj['organisation__type_level_3'])
        if fund_stream:
            query.add(Q(fund_stream=fund_stream), Q.AND)
        total_contribution = DonorFundModality.objects\
            .filter(query)\
            .aggregate(amount=Sum('contribution'))['amount']
        try:
            return int(round(total_contribution))
        except:
            return 0


class DonorContributionCsvSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(required=False)
    ref_id = serializers.CharField(required=False)
    level_3_code = serializers.CharField(required=False)
    level_3_name = serializers.CharField(required=False)
    donor_category = serializers.SerializerMethodField()

    class Meta:
        model = DonorFundModality
        fields = ('donor_name', 'ref_id', 'level_3_code', 'level_3_name', 'donor_category',
                  'fund_type', 'fund_stream', 'contribution', )

    def get_donor_category(self, obj):
        return DONOR_CATEGORY_CHOICES.get_label(obj['donor_category'])


class TopBudgetSourcesSerializer(serializers.ModelSerializer):
    total_budget = serializers.IntegerField(required=False)
    total_expense = serializers.IntegerField(required=False)
    # level_3_name = serializers.CharField(required=False, source='organisation__level_3_name')
    level_3_name = serializers.SerializerMethodField()
    type_level_3 = serializers.CharField(required=False, source='organisation__type_level_3')

    class Meta:
        model = Organisation
        fields = ('level_3_name', 'total_budget', 'total_expense', 'type_level_3',)

    @staticmethod
    def get_level_3_name(obj):
        if obj['organisation__level_3_name'] in LEVEL_3_NAMES_MAPPING.keys():
            return LEVEL_3_NAMES_MAPPING.get(obj['organisation__level_3_name'], 'N/A')
        return obj['organisation__level_3_name']


class DonorSankeySerializer(serializers.Serializer):
    source_name = serializers.SerializerMethodField()
    target_name = serializers.CharField(source='recipient_bureau')
    value = serializers.IntegerField(required=False)
    source = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    def get_source(self, obj):
        nodes = self.context.get('nodes')
        donor_category_name = get_donor_category_label(obj['new_donor_category'])
        values = ('name', donor_category_name)
        donor_code = in_dictlist(nodes, *values).get('code', '')
        return donor_code

    def get_target(self, obj):
        nodes = self.context.get('nodes')
        values = ('name', obj['recipient_bureau'])
        recipient_code = in_dictlist(nodes, *values).get('code', '')
        return recipient_code

    def get_source_name(self, obj):
        donor_category_name = get_donor_category_label(obj['new_donor_category'])
        return donor_category_name

    class Meta:
        fields = ('source_name', 'target_name', 'value', 'target', 'source')


class SectorSankeySerializer(serializers.Serializer):
    source_name = serializers.CharField(source='recipient_bureau')
    target_name = serializers.SerializerMethodField()
    value = serializers.IntegerField(required=False)
    source = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    class Meta:
        fields = ('source_name', 'target_name', 'source', 'target', 'value')

    def get_target_name(self, obj):
        EXCLUDED_SECTOR_CODES.append('8')
        if obj['sector_code'] in EXCLUDED_SECTOR_CODES or obj['sector_code'] is None:
            sector_name = 'Others'
        else:
            sector_name = obj['sector_name']
        return sector_name

    def get_source(self, obj):
        nodes = self.context.get('nodes')
        recipient_bureau = obj['recipient_bureau']
        values = ('name', recipient_bureau)
        recipient_code = in_dictlist(nodes, *values).get('code', '')
        return recipient_code

    def get_target(self, obj):
        nodes = self.context.get('nodes')
        EXCLUDED_SECTOR_CODES.append('8')
        if obj['sector_code'] in EXCLUDED_SECTOR_CODES or obj['sector_code'] is None:
            sector_name = 'Others'
        else:
            sector_name = obj['sector_name']
        values = ('name', sector_name)
        sector_code = in_dictlist(nodes, *values).get('code', '')
        return sector_code


class SsSankeySerializer(serializers.Serializer):
    source_name = serializers.SerializerMethodField()
    target_name = serializers.SerializerMethodField(source='name')
    value = serializers.IntegerField(required=False)
    source = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    class Meta:
        fields = ('source_name', 'target_name', 'source', 'target', 'value')

    def get_source_name(self, obj):
        EXCLUDED_SECTOR_CODES.append('8')
        if obj['sector_code'] in EXCLUDED_SECTOR_CODES or obj['sector_code'] is None:
            sector_name = 'Others'
        else:
            sector_name = obj['sector_name']
        return sector_name

    def get_source(self, obj):
        nodes = self.context.get('nodes')
        EXCLUDED_SECTOR_CODES.append('8')
        if obj['sector_code'] in EXCLUDED_SECTOR_CODES or obj['sector_code'] is None:
            sector_name = 'Others'
        else:
            sector_name = obj['sector_name']
        values = ('name', sector_name)
        sector_code = in_dictlist(nodes, *values).get('code', '')
        return sector_code

    def get_target(self, obj):
        nodes = self.context.get('nodes')
        if obj['name'] is None or obj['name'] == 'Others':
            recipient_bureau = ' Others'
        else:
            recipient_bureau = obj['name']
        values = ('name', recipient_bureau)
        recipient_code = in_dictlist(nodes, *values).get('code', '')
        return recipient_code

    def get_target_name(self, obj):
        EXCLUDED_SECTOR_CODES.append('8')
        if obj['name'] is None or obj['name'] == 'Others':
            target_name = 'Other Signature Solutions'
        else:
            target_name = obj['name']
        return target_name
