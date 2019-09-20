from django.core.exceptions import ObjectDoesNotExist
from django.db.models.aggregates import Sum, Count
from django.db.models.expressions import Value, F, Case, When
from django.db.models.fields import CharField, DecimalField
from django.db.models.functions.base import Coalesce
from django.db.models.query_utils import Q
from rest_framework import serializers

from master_tables.models import Sector, MapBoundary, OperatingUnit, SignatureSolution, SdgTargets
from master_tables.serializers import OrganisationSerializer, CountrySerializer
from undp_donors.models import DonorFundSplitUp
from undp_outputs.models import Budget, Expense, OutputLocation, Output, ProjectMarker, MARKER_TYPE_CHOICES, StoryMap
from undp_projects.models import SectorAggregate, Project, CountryResultPeriod, CountryResult, \
    ProjectDocument, CountryDocument, ProjectParticipatingOrganisations
from utilities.config import NULL_SECTOR_COLOR_CODE, TRUE_VALUES, EXCLUDED_SECTOR_CODES, UNDP_DONOR_ID, SP_START_YEAR, \
    SIGNATURE_SOLUTION_COLORS, OLD_SECTOR_CODES, NEW_SECTOR_CODES
from utilities.konstants import LOCATION_CLASSES, LOCATION_EXACTNESS
from utilities.utils import process_query_params, get_country_results_with_target_data, \
    get_country_results_with_actual_data, get_actual_year_data, get_project_query, get_fund_split_query, \
    get_active_projects_for_year, get_sdg_target_aggregate, get_sdg_target_based_fund_aggregate
from utilities import config as settings


class SectorAggregateSerializer(serializers.ModelSerializer):
    color = serializers.SerializerMethodField()
    sector = serializers.SerializerMethodField()
    total_outputs = serializers.IntegerField(required=False)
    countries = serializers.IntegerField(required=False, source='countries_count')

    def get_color(self, obj):

        color = obj.get('sector').color if obj.get('sector', '0') != '0' else NULL_SECTOR_COLOR_CODE

        return color

    def get_sector(self, obj):
        return obj.get('sector').code if obj.get('sector', '0') != '0' else '0'

    class Meta:
        model = SectorAggregate
        fields = ('sector_name', 'budget', 'expense', 'total_projects', 'total_outputs', 'percentage',
                  'year', 'sector', 'color', 'countries')


class ProjectAggregateSerializer(serializers.Serializer):
    donors = serializers.IntegerField(default=0)
    countries = serializers.IntegerField(default=0)
    budget = serializers.IntegerField(default=0)
    expense = serializers.IntegerField(default=0)
    year = serializers.IntegerField(default=0)
    projects = serializers.IntegerField(default=0)
    outputs = serializers.IntegerField(default=0)

    class Meta:
        fields = ('year', 'countries', 'budget', 'expense', 'donors', 'projects', 'outputs')


class ProjectDetailSerializer(serializers.ModelSerializer):
    operating_unit = CountrySerializer()
    organisation = serializers.SerializerMethodField()
    total_budget = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()
    storyMap = serializers.SerializerMethodField()

    def get_organisation(self, obj):
        try:
            implementing_org = ProjectParticipatingOrganisations.objects.get(project__project_id=obj, org_role=4)
            return {
                'ref_id': implementing_org.organisation_id,
                'org_name': implementing_org.org_name
            }
        except Exception as e:
            print(e)
            return ''

    def get_total_budget(self, obj):
        request = self.context.get('request', '')
        year = request.GET.get('year', '')

        project_budget_mapping = DonorFundSplitUp.objects.filter(project=obj)
        if year:
            project_budget_mapping = project_budget_mapping.filter(year=year)
        project_budget = project_budget_mapping.aggregate(total_budget=Sum('budget')).get('total_budget', 0)
        return int(round(project_budget)) if project_budget else 0

    def get_total_expense(self, obj):
        request = self.context.get('request', '')
        year = request.GET.get('year', '')
        project_budget_mapping = DonorFundSplitUp.objects.filter(project=obj)
        if year:
            project_budget_mapping = project_budget_mapping.filter(year=year)
        project_expense = project_budget_mapping.aggregate(total_expense=Sum('expense')).get('total_expense', 0)
        return int(round(project_expense)) if project_expense else 0

    def get_storyMap(self, obj):
        story_map = StoryMap.objects.filter(project_id=obj)
        story_map_data = []
        for story in story_map:
            story_data = {
                            'location': story.location,
                            'source': story.link
                        }
            story_map_data.append(story_data)
        return story_map_data

    class Meta:
        model = Project
        fields = '__all__'


class MapLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutputLocation
        fields = ('latitude', 'longitude', 'exactness', 'location_class')


class MapBoundarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MapBoundary
        fields = '__all__'


class MapDetailsSerializer(serializers.ModelSerializer):
    latitude = serializers.CharField(source='operating_unit_latitude', required=False)
    longitude = serializers.CharField(source='operating_unit_longitude', required=False)
    unit_type = serializers.CharField(source='operating_unit_unit_type', required=False)
    country_iso3 = serializers.CharField(source='operating_unit_iso3', required=False)
    country_iso2 = serializers.CharField(source='operating_unit_iso2', required=False)
    country_name = serializers.CharField(source='operating_unit_name', required=False)
    project_count = serializers.CharField(required=False)
    donor_count = serializers.CharField(required=False)
    output_count = serializers.CharField(required=False)
    funds_count = serializers.CharField(required=False)
    total_budget = serializers.CharField(required=False)
    total_expense = serializers.CharField(required=False)
    outputs = serializers.SerializerMethodField()
    boundaries = serializers.SerializerMethodField()

    def get_outputs(self, obj):

        year = self.context.get('year')
        provide_output = self.context.get('provide_output')
        if provide_output in TRUE_VALUES:
            query = self._get_output_query(obj)
            if year and int(year) >= SP_START_YEAR:
                outputs = OutputLocation.objects.filter(query)\
                    .distinct()\
                    .annotate(output_latitude=F('latitude'),
                              output_longitude=F('longitude'),
                              output_signature_solution=F('output__signature_solution__name'),
                              signature_solution=F('output__signature_solution__sp_output'),
                              ss_id=F('output__signature_solution__ss_id'),
                              project_title=F('project__title'),
                              output_location_name=F('name'),
                              output_id=F('output'),
                              project_id=F('project'),
                              )\
                    .annotate(output_location_class=Case(
                        When(location_class=LOCATION_CLASSES.admin, then=Value('Administrative Region')),
                        When(location_class=LOCATION_CLASSES.populated, then=Value('Populated Place')),
                        When(location_class=LOCATION_CLASSES.structure, then=Value('Structure')),
                        When(location_class=LOCATION_CLASSES.topo, then=Value('Other Topographical Feature')),
                        default=Value(''),
                        output_field=CharField(),
                    ))\
                    .values('output_id', 'project_id', 'project_title', 'output_signature_solution', 'ss_id',
                            'signature_solution', 'output_latitude', 'output_longitude',
                            'output_location_class', 'output_location_name',)
            else:
                outputs = OutputLocation.objects.filter(query) \
                    .distinct() \
                    .annotate(output_latitude=F('latitude'),
                              output_longitude=F('longitude'),
                              output_sector=F('output__outputsector__sector__sector'),
                              sector_color=F('output__outputsector__sector__color'),
                              sector_code=F('output__outputsector__sector__code'),
                              project_title=F('project__title'),
                              # exactness=F('exactness'),
                              # location_class=F('location_class'),
                              output_location_name=F('name'),
                              output_id=F('output'),
                              project_id=F('project'),
                              ) \
                    .annotate(output_location_class=Case(
                        When(location_class=LOCATION_CLASSES.admin, then=Value('Administrative Region')),
                        When(location_class=LOCATION_CLASSES.populated, then=Value('Populated Place')),
                        When(location_class=LOCATION_CLASSES.structure, then=Value('Structure')),
                        When(location_class=LOCATION_CLASSES.topo, then=Value('Other Topographical Feature')),
                        default=Value(''),
                        output_field=CharField(),
                    )) \
                    .values('output_id', 'project_id', 'project_title', 'output_sector', 'sector_color',
                            'sector_code', 'output_latitude', 'output_longitude',
                            'output_location_class', 'output_location_name', )
        else:
            outputs = []
        return list(outputs)

    # def _get_output_query(self, obj):
    #     request = self.context.get('request', None)
    #     year = request.GET.get('year', '')
    #     sector = request.GET.get('sector', '')
    #     recipient_country = request.GET.get('operating_unit', '')
    #     budget_source = request.GET.get('budget_source', '')
    #     project_id = request.GET.get('project_id', '')
    #     budget_type = request.GET.get('budget_type', '')
    #     sdg = request.GET.get('sdg', '')
    #     signature_solution = request.GET.get('signature_solution', '')
    #     sdg_target = request.GET.get('sdg_target', '')
    #     marker_type = request.GET.get('marker_type', '')
    #     marker_id = request.GET.get('marker_id', '')
    #     query = Q(operating_unit__iso3=obj['operating_unit_iso3'])
    #     if year:
    #         year_query = Q(Q(project__project_active__year=year) &
    #                        Q(project__donorfundsplitup__year=year)) | \
    #             Q(Q(project__project_active__year=year) & Q(~Q(project__donorfundsplitup__year=year) |
    #               Q(project__donorfundsplitup__isnull=True)))
    #
    #         query.add(year_query, Q.AND)
    #     if recipient_country:
    #         op_query = Q(operating_unit__iso3=recipient_country) | \
    #             Q(operating_unit__bureau__code=recipient_country)
    #         query.add(op_query, Q.AND)
    #     if budget_source:
    #         if budget_type != 'regular':
    #             budget_source_query = Q(output__donorfundsplitup__organisation__type_level_3=budget_source) | \
    #                 Q(output__donorfundsplitup__organisation__ref_id=budget_source)
    #             if year:
    #                 budget_source_query &= Q(output__donorfundsplitup__year=year)
    #             query.add(budget_source_query, Q.AND)
    #     if budget_type:
    #         if budget_type == 'regular':
    #             query.add(Q(output__donorfundsplitup__organisation=settings.UNDP_DONOR_ID), Q.AND)
    #     if sector:
    #         if sector == '0':
    #             EXCLUDED_SECTOR_CODES.append('8')
    #             other_sector_query = Q(output__outputsector__isnull=True) | \
    #                 Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
    #             query.add(other_sector_query, Q.AND)
    #         else:
    #             query.add(Q(output__outputsector__sector=sector), Q.AND)
    #         if year:
    #             query.add(Q(output__donorfundsplitup__year=year), Q.AND)
    #     if sdg:
    #         if sdg == '0':
    #             query.add(Q(output__outputsdg__isnull=True), Q.AND)
    #         else:
    #             query.add(Q(output__outputsdg__sdg=sdg), Q.AND)
    #         if year:
    #             query.add(Q(output__donorfundsplitup__year=year), Q.AND)
    #     if project_id:
    #         query.add(Q(project=project_id), Q.AND)
    #     if signature_solution:
    #         query.add(Q(output__signature_solution=signature_solution), Q.AND)
    #     if sdg_target:
    #         query.add(Q(output__outputtarget__target_id=sdg_target), Q.AND)
    #     if marker_type:
    #         query.add(Q(output__projectmarker__type=marker_type), Q.AND)
    #         if marker_id:
    #             query.add(Q(output__projectmarker__marker_id=marker_id), Q.AND)
    #     return query

    def _get_output_query(self, obj):
        request = self.context.get('request', None)
        year = request.GET.get('year', '')
        sector = request.GET.get('sector', '')
        recipient_country = request.GET.get('operating_unit', '')
        budget_source = request.GET.get('budget_source', '')
        project_id = request.GET.get('project_id', '')
        budget_type = request.GET.get('budget_type', '')
        sdg = request.GET.get('sdg', '')
        signature_solution = request.GET.get('signature_solution', '')
        sdg_target = request.GET.get('sdg_target', '')
        marker_type = request.GET.get('marker_type', '')
        marker_id = request.GET.get('marker_id', '')
        query = Q(operating_unit__iso3=obj['operating_unit_iso3'])
        if year:
            year_query = Q(Q(project__project_active__year=year) &
                           Q(project__donorfundsplitup__year=year)) | \
                Q(Q(project__project_active__year=year) & Q(~Q(project__donorfundsplitup__year=year) |
                  Q(project__donorfundsplitup__isnull=True)))
            # year_query &= Q(output_active__year=year)
            if sector == '0':
                year_query &= Q(Q(output__outputsector__isnull=True) and
                                Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES))
            else:
                if int(year) < SP_START_YEAR:
                    year_query &= Q(Q(output__outputsector__sector__in=OLD_SECTOR_CODES))
                else:
                    year_query &= Q(Q(output__outputsector__sector__in=NEW_SECTOR_CODES))
            query.add(year_query, Q.AND)
        if recipient_country:
            op_query = Q(operating_unit__iso3=recipient_country) | \
                Q(operating_unit__bureau__code=recipient_country)
            query.add(op_query, Q.AND)
        if budget_source:
            if budget_type != 'regular':
                budget_source_query = Q(output__donorfundsplitup__organisation__type_level_3=budget_source) | \
                    Q(output__donorfundsplitup__organisation__ref_id=budget_source)
                if year:
                    budget_source_query &= Q(output__donorfundsplitup__year=year)
                query.add(budget_source_query, Q.AND)
        if budget_type:
            if budget_type == 'regular':
                query.add(Q(output__donorfundsplitup__organisation=settings.UNDP_DONOR_ID), Q.AND)
        if sector:
            if year and int(year) < SP_START_YEAR:
                if sector == '0':
                    EXCLUDED_SECTOR_CODES.append('8')
                    other_sector_query = Q(outputsector__isnull=True) | \
                                         Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES)

                    outputs = Output.objects.filter(other_sector_query).distinct()\
                        .values_list('output_id', flat=True).exclude(Q(outputsector__sector__in=NEW_SECTOR_CODES)
                                                                     & ~Q(output_active__year=year))
                else:
                    outputs = Output.objects.filter(outputsector__sector=sector)\
                        .distinct().values_list('output_id', flat=True)\
                        .exclude(Q(outputsector__sector__in=NEW_SECTOR_CODES) & ~Q(output_active__year=year))
            else:
                if sector == '0':
                    EXCLUDED_SECTOR_CODES.append('8')
                    other_sector_query = Q(outputsector__isnull=True) | \
                                         Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES)
                    outputs = Output.objects.filter(other_sector_query).distinct()\
                        .values_list('output_id', flat=True).exclude(Q(outputsector__sector__in=OLD_SECTOR_CODES)
                                                                     & ~Q(output_active__year=year))
                else:
                    outputs = Output.objects.filter(outputsector__sector=sector)\
                        .distinct().values_list('output_id', flat=True)\
                        .exclude(Q(outputsector__sector__in=OLD_SECTOR_CODES) & ~Q(output_active__year=year))

            query.add(Q(output__in=outputs), Q.AND)
        if sdg:
            # if year and int(year) < SP_START_YEAR:
            #     if sdg == '0':
            #         outputs = Output.objects.filter(Q(outputsdg__isnull=True)).distinct().values_list('output_id',
            #                                                                                           flat=True)
            #     else:
            #         outputs = Output.objects.filter(Q(outputsdg__sdg=sdg)).distinct().values_list('output_id',
            #                                                                                       flat=True)

            if sdg == '0':
                outputs = Output.objects.filter(Q(outputtarget__isnull=True)).distinct().values_list('output_id',
                                                                                                     flat=True)

            else:
                outputs = Output.objects.filter(Q(outputtarget__target_id__sdg=sdg) & Q(
                        output_active__year=year)).distinct().values_list('output_id', flat=True)
            query.add(Q(output__in=outputs), Q.AND)
        if project_id:
            query.add(Q(project=project_id), Q.AND)
        if signature_solution:
            query.add(Q(output__signature_solution__ss_id=signature_solution), Q.AND)
        if sdg_target:
            outputs = Output.objects.filter(Q(outputtarget__target_id=sdg_target) & Q(
                output_active__year=year)).distinct().values_list('output_id', flat=True)
            query.add(Q(output__in=outputs), Q.AND)
        if marker_type:
            outputs = ProjectMarker.objects.filter(Q(type=marker_type) & Q(
                output__output_active__year=year)).distinct().values_list('output_id', flat=True)
            if marker_id:
                # if int(marker_type) == MARKER_TYPE_CHOICES.whos_marker or \
                #         int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                #     outputs = outputs.filter(Q(parent_type=marker_id) & Q(
                #         output__output_active__year=year)).distinct().values_list('output_id', flat=True)
                # else:
                #     outputs = outputs.filter(Q(marker_id=marker_id) & Q(
                #         output__output_active__year=year)).distinct().values_list('output_id', flat=True)

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
            query.add(Q(output__in=outputs), Q.AND)
        return query

    def get_boundaries(self, obj):
        provide_output = self.context.get('provide_output')
        if provide_output in TRUE_VALUES:
            try:
                boundaries = MapBoundary.objects.get(code=obj['operating_unit_iso3'])
                if obj['operating_unit_iso3'] == 'CHN':
                    twn_boundaries = MapBoundary.objects.get(code='TWN')
                    coordinates = twn_boundaries.geometry['coordinates']
                    boundaries.geometry['coordinates'] += coordinates
                return MapBoundarySerializer(boundaries).data
            except Exception as e:
                print(e)
                pass
        else:
            return []

    class Meta:
        model = OutputLocation
        fields = ('latitude', 'longitude', 'country_name', 'country_iso3', 'funds_count', 'unit_type',
                  'country_iso2', 'project_count', 'output_count', 'donor_count',
                  'total_budget', 'total_expense', 'outputs', 'boundaries')


class MapDetailsSdgSerializer(MapDetailsSerializer):
    # aggregate = serializers.SerializerMethodField()
    total_budget = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()

    def get_total_budget(self, obj):
        aggregate = self._get_fund(obj)
        total_budget = aggregate.get('total_budget', 0) if aggregate else 0
        return total_budget

    def get_total_expense(self, obj):
        aggregate = self._get_fund(obj)
        total_expense = aggregate.get('total_expense', 0) if aggregate else 0

        return total_expense

    def _get_fund(self, obj):
        year = self.context.get('year', '')
        budget_source = self.context.get('budget_source', '')
        project_id = self.context.get('project_id', '')
        budget_type = self.context.get('budget_type', '')
        sdg = self.context.get('sdg', '')
        signature_solution = self.context.get('signature_solution', '')
        sdg_target = self.context.get('sdg_target', '')
        marker_type = self.context.get('marker_type', '')
        marker_id = self.context.get('marker_id', '')

        # request = self.context.get('request', None)
        # year = request.GET.get('year', '')
        # budget_source = request.GET.get('budget_source', '')
        # project_id = request.GET.get('project_id', '')
        # budget_type = request.GET.get('budget_type', '')
        # sdg = request.GET.get('sdg', '')
        # signature_solution = request.GET.get('signature_solution', '')
        # sdg_target = request.GET.get('sdg_target', '')
        # marker_type = request.GET.get('marker_type', '')
        # marker_id = request.GET.get('marker_id', '')
        active_projects = get_active_projects_for_year(year, operating_unit=obj['operating_unit_iso3'],
                                                       budget_source=budget_source)
        aggregate = get_sdg_target_based_fund_aggregate(year, sdg=sdg, operating_unit=obj['operating_unit_iso3'],
                                                        budget_source=budget_source, active_projects=active_projects,
                                                        project_id=project_id, budget_type=budget_type,
                                                        signature_solution=signature_solution, sdg_target=sdg_target,
                                                        marker_type=marker_type, marker_id=marker_id)
        return aggregate

    class Meta:
        model = OutputLocation
        fields = ('latitude', 'longitude', 'country_name', 'country_iso3', 'funds_count', 'unit_type',
                  'country_iso2', 'project_count', 'output_count', 'donor_count',
                  'total_budget', 'total_expense', 'outputs', 'boundaries',)


class ProjectSearchSerializer(serializers.ModelSerializer):
    budget = serializers.SerializerMethodField()
    expense = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()

    def get_budget(self, obj):
        budget = 0
        query = self._fetch_query(obj)
        mapping = DonorFundSplitUp.objects.filter(query)
        if mapping:
            budget = mapping.aggregate(total_budget=Sum('budget')).get('total_budget', '')
        return int(round(budget)) if budget else 0

    def get_expense(self, obj):
        expense = 0
        query = self._fetch_query(obj)
        mapping = DonorFundSplitUp.objects.filter(query)
        if mapping:
            expense = mapping.aggregate(total_expense=Sum('expense')).get('total_expense', '')
        return int(round(expense)) if expense else 0

    @staticmethod
    def get_country(obj):
        return obj.get('operating_unit__name', '')

    def _fetch_query(self, obj):
        request = self.context.get('request')
        year = process_query_params(request.GET.get('year'))
        budget_type = request.GET.get('budget_type')
        budget_sources = process_query_params(request.GET.get('budget_sources'))
        themes = process_query_params(request.GET.get('sectors'))
        sdgs = process_query_params(request.GET.get('sdgs'))
        query = Q(project=obj)
        if year:
            year = [int(y) for y in year]
            query.add(Q(year__in=year), Q.AND)
        if budget_type:
            budget_type_query = Q()
            if budget_type == 'regular':
                budget_type_query.add(Q(organisation=UNDP_DONOR_ID), Q.AND)
            query.add(budget_type_query, Q.AND)
        if budget_sources:
            if budget_type != 'regular':
                budget_sources = [item.upper() for item in budget_sources]
                budget_sources_query = Q(organisation__in=budget_sources) | \
                    Q(organisation__type_level_3__in=budget_sources)
                query.add(budget_sources_query, Q.AND)
        if themes:
            theme_query = Q()
            EXCLUDED_SECTOR_CODES.append('8')
            themes_temp = themes
            if '0' in themes or list(set(themes_temp).intersection(EXCLUDED_SECTOR_CODES)):
                if '0' in themes:
                    themes.remove('0')

                other_sector_query = Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                    Q(output__outputsector__sector__isnull=True)
                theme_query |= other_sector_query
            if themes:
                theme_query |= Q(output__outputsector__sector__in=themes)

            query.add(theme_query, Q.AND)
        if sdgs:
            sdgs_query = Q()
            if '0' in sdgs:
                sdgs.remove('0')
                # sdgs_query |= Q(output__outputsdg__sdg__isnull=True)
                sdgs_query |= Q(output__outputtarget__target_id__sdg__isnull=True)
            if sdgs:
                # sdgs_query |= Q(output__outputsdg__sdg__in=sdgs)
                sdgs_query |= Q(output__outputtarget__target_id__sdg__in=sdgs)
            query.add(sdgs_query, Q.AND)
        return query

    class Meta:
        model = Project
        fields = ('project_id', 'title', 'description', 'expense', 'budget', 'country')


class ProjectListSerializer(serializers.ModelSerializer):
    budget = serializers.IntegerField(default=0)
    expense = serializers.IntegerField(default=0)
    country = serializers.CharField(source='operating_unit__name', required=False)

    class Meta:
        model = Project
        fields = ('project_id', 'title', 'description', 'expense', 'budget', 'country')


class CountryResultSerializer(serializers.ModelSerializer):
    sector = serializers.SerializerMethodField()

    @staticmethod
    def get_sector(obj):
        component_id = obj.component_id
        sector_code = component_id[0]
        try:
            sector = Sector.objects.get(code=sector_code)
            return sector.sector
        except ObjectDoesNotExist:
            return ''

    class Meta:
        model = CountryResult
        fields = '__all__'


class CountryResultPeriodSerializer(serializers.ModelSerializer):
    country = CountrySerializer(source='operating_unit')
    country_result = CountryResultSerializer(required=False)
    actual = serializers.SerializerMethodField()

    class Meta:
        model = CountryResultPeriod
        fields = '__all__'

    def get_actual(self, obj):
        year = self.context.get('year', '')
        try:
            actual = get_actual_year_data(int(year), obj.operating_unit, obj.component_id)
            return actual
        except Exception as e:
            pass
        return obj.actual


class ProjectDocumentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    category = serializers.CharField()
    project = serializers.CharField()
    title = serializers.CharField()
    format = serializers.CharField()
    document_url = serializers.CharField()
    category_name = serializers.CharField(source='category__title')

    class Meta:
        model = ProjectDocument
        fields = ('id', 'category', 'project', 'title', 'format', 'document_url', 'category_name')


class DocumentsSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectDocument
        fields = '__all__'


class RecipientThemeBudgetSerializer(serializers.Serializer):
    sector = serializers.CharField(required=False, source='output__outputsector__sector')
    sector_color = serializers.CharField(source='output__outputsector__sector__color')
    sector_name = serializers.CharField(required=False, source='output__outputsector__sector__sector')
    theme_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    percentage = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    theme_expense = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)

    class Meta:
        fields = ('sector', 'sector_name', 'theme_budget', 'percentage', 'sector_color', 'theme_expense ')


class RecipientSdgBudgetSerializer(serializers.Serializer):
    # sdg_code = serializers.CharField(required=False, source='project__projectsdg__sdg__code')
    sdg_code = serializers.SerializerMethodField()
    sdg_color = serializers.CharField()
    sdg_name = serializers.CharField()
    sdg_budget = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    sdg_expense = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)
    percentage = serializers.DecimalField(required=False, max_digits=30, decimal_places=2)

    class Meta:
        fields = ('sdg_code', 'sdg_name', 'sdg_budget', 'percentage', 'sdg_color', 'sdg_expense')

    def get_sdg_code(self, obj):
        # return obj['output__outputsdg__sdg__code'] if obj['output__outputsdg__sdg__code'] else '0'
        return obj['output__outputtarget__target_id__sdg__code'] if obj['output__outputtarget__target_id__sdg__code'] \
            else '0'


class RecipientThemeBudgetvsExpenseSerializer(serializers.Serializer):
    sector = serializers.CharField(source='output__outputsector__sector')
    sector_name = serializers.CharField(required=False, source='output__outputsector__sector__sector')
    sector_color = serializers.CharField(required=False, source='output__outputsector__sector__color')
    theme_budget = serializers.DecimalField(max_digits=30, decimal_places=2)
    theme_expense = serializers.DecimalField(max_digits=30, decimal_places=2)

    class Meta:
        fields = ('sector', 'sector_name', 'theme_budget', 'theme_expense', 'sector_color')


class RecipientSdgBudgetvsExpenseSerializer(serializers.Serializer):
    # sdg_code = serializers.CharField(source='output__outputsdg__sdg__code')
    sdg_code = serializers.CharField(source='output__outputtarget__target_id__sdg__code')
    sdg_name = serializers.CharField()
    color = serializers.CharField()
    sdg_budget = serializers.CharField()
    sdg_expense = serializers.CharField()

    class Meta:
        fields = ('sdg_code', 'sdg_name', 'sdg_budget', 'sdg_expense', 'color')


class ProjectBudgetSourceSerializer(serializers.Serializer):
    organisation = serializers.CharField()
    organisation_name = serializers.SerializerMethodField()
    budget = serializers.DecimalField(max_digits=30, decimal_places=2)
    expense = serializers.DecimalField(max_digits=30, decimal_places=2)

    class Meta:
        fields = ('organisation', 'organisation_name', 'budget', 'expense')

    def get_organisation_name(self, obj):
        return obj['organisation_name'].title()


class SectorBudgetSourcesSerializer(serializers.Serializer):
    organisation = serializers.CharField()
    short_name = serializers.CharField(required=False)
    organisation_name = serializers.SerializerMethodField()
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)

    class Meta:
        fields = ('organisation', 'organisation_name', 'short_name', 'total_budget', 'total_expense')

    def get_organisation_name(self, obj):
        return obj['organisation_name'].title() if obj['organisation_name'] else ''


class SectorOperatingUnitSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    iso3 = serializers.CharField()
    name = serializers.CharField()

    class Meta:
        fields = ('iso3', 'name', 'total_budget', 'total_expense')


class CountryDocumentSerializer(serializers.Serializer):
    title = serializers.CharField()
    category = serializers.CharField()
    document_url = serializers.CharField(required=False)
    format = serializers.CharField(required=False)
    category_name = serializers.CharField(source='category__title')

    class Meta:
        fields = ('title', 'category', 'category_name', 'document_url', 'format')


class SdgAggregateSerializer(serializers.Serializer):
    sdg_code = serializers.CharField()
    sdg_name = serializers.CharField()
    color = serializers.CharField()
    year = serializers.IntegerField(default=0)
    total_projects = serializers.IntegerField(default=0)
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    countries = serializers.IntegerField(default=0, source='countries_count')
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        fields = ('sdg_code', 'sdg_name', 'color', 'total_projects', 'total_budget',
                  'total_expense', 'percentage', 'year', 'countries')


class SdgBudgetSourcesSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    short_name = serializers.CharField()
    organisation_name = serializers.CharField()

    class Meta:
        fields = ('total_budget', 'total_expense', 'short_name', 'organisation_name')


class SdgOperatingUnitSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    iso3 = serializers.CharField()
    name = serializers.CharField()

    class Meta:
        fields = ('total_budget', 'total_expense', 'iso3', 'name')


class SignatureSolutionsAggregateSerializer(serializers.Serializer):
    signature_solution = serializers.SerializerMethodField()
    year = serializers.IntegerField()
    budget = serializers.DecimalField(max_digits=30, decimal_places=2)
    expense = serializers.DecimalField(max_digits=30, decimal_places=2)
    operating_units = serializers.IntegerField(default=0)
    projects = serializers.IntegerField(default=0)
    donors = serializers.IntegerField(default=0)
    percentage = serializers.DecimalField(max_digits=30, decimal_places=2)
    total_outputs = serializers.IntegerField()
    ss_id = serializers.CharField()
    color = serializers.SerializerMethodField()

    def get_signature_solution(self, obj):
        return obj.get('name')

    def get_color(self, obj):
        return SIGNATURE_SOLUTION_COLORS.get(obj['name'], '')

    class Meta:
        model = SignatureSolution
        fields = ('signature_solution', 'year', 'budget', 'expense', 'operating_units', 'projects', 'donors',
                  'percentage', 'total_outputs', 'ss_id')


class SignatureSolutionOperatingUnitSerializer(serializers.Serializer):
    total_budget = serializers.IntegerField(default=0)
    total_expense = serializers.IntegerField(default=0)
    iso3 = serializers.CharField()
    name = serializers.CharField()

    class Meta:
        fields = ('total_budget', 'total_expense', 'iso3', 'name')


class SignatureSolutionOutcomeSerializer(serializers.Serializer):
    sector_name = serializers.CharField()
    sector_id = serializers.IntegerField()
    percent = serializers.DecimalField(max_digits=30, decimal_places=2)
    sector_color = serializers.CharField()
    budget = serializers.IntegerField()

    class Meta:
        fields = ('sector_name', 'sector_id', 'percent', 'sector_color', 'budget')


class SectorSignatureSolutionSerializer(serializers.Serializer):
    signature_solution_id = serializers.IntegerField()
    signature_solution_name = serializers.CharField()
    percent = serializers.DecimalField(max_digits=30, decimal_places=2)
    color = serializers.SerializerMethodField()
    budget = serializers.IntegerField()

    class Meta:
        fields = {'signature_solution_id', 'signature_solution_name', 'percent', 'color', 'budget'}

    def get_color(self, obj):
        return SIGNATURE_SOLUTION_COLORS.get(obj['signature_solution_name'], '')


class SdgTargetSerializer(serializers.Serializer):
    target_budget = serializers.IntegerField(default=0)
    target_expense = serializers.IntegerField(default=0)
    target_percentage = serializers.DecimalField(max_digits=30, decimal_places=2)
    target_id = serializers.CharField()
    target_description = serializers.CharField()

    class Meta:
        fields = ('target_budget', 'target_expense', 'target_percentage', 'target_id', 'target_description')

