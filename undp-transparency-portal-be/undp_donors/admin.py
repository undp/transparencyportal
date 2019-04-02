from django.contrib import admin

from master_tables.models import Region, Organisation, Sector
from undp_donors.models import DonorFundSplitUp, DonorFundModality


class DonorFundSplitUpAdmin(admin.ModelAdmin):
    list_display = ('id', 'output_id', 'year', 'organisation', 'project_id', 'budget', 'expense', 'donor_category')
    # search_fields = ('year', 'organisation__ref_id', 'project_id__project_id')
    search_fields = ('project_id__project_id', 'organisation__type_level_3', 'organisation__org_name')
    list_filter = ('year', 'organisation__type_level_3', 'organisation__ref_id')


class DonorFundModalityAdmin(admin.ModelAdmin):
    list_display = ('fund_type', 'organisation', 'contribution', 'year', 'donor_category')
    list_filter = ('fund_type', 'year', 'fund_stream', 'donor_category', 'organisation__type_level_3', )
    search_fields = ('organisation__operating_unit__iso3', 'id', 'project_id')


# class OperatingUnitFundAggregateAdmin(admin.ModelAdmin):
#     list_display = ('operating_unit', 'year', 'total_budget', 'total_expense')
#     search_fields = ('operating_unit__iso3',)
#     list_filter = ('year',)
#     ordering = ('-total_budget',)


admin.site.register(DonorFundSplitUp, DonorFundSplitUpAdmin)
admin.site.register(DonorFundModality, DonorFundModalityAdmin)
# admin.site.register(OperatingUnitFundAggregate, OperatingUnitFundAggregateAdmin)
