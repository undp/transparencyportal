from django.contrib import admin

from undp_outputs.models import Output, OutputParticipatingOrganisation, OutputLocation, OutputSector, Budget, \
    OutputTransaction, OutputResultPeriod, OutputResult, CountryBudget, CountryBudgetItem, Expense, \
    ActivityDate, OutputSdg, OutputActiveYear, OutputTarget


class OutputAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'project_id', 'operating_unit')
    search_fields = ('output_id', 'project_id__project_id')
    list_filter = ('operating_unit',)


class ActivityDateAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'iso_date')
    search_fields = ('project_id__project_id',)


class OutputParticipatingOrganisationAdmin(admin.ModelAdmin):
    list_display = ('output_id',)
    search_fields = ('output__output_id',)


class OutputLocationAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'operating_unit')
    search_fields = ('output_id__output_id', 'operating_unit__iso3')
    list_filter = ('output__output_active__year', 'output__project__project_active__year',)


class OutputSectorAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'sector_id', 'project_id')
    search_fields = ('project_id__project_id',)
    list_filter = ('sector__code', 'output_id__operating_unit')


class CountryBudgetAdmin(admin.ModelAdmin):
    list_display = ('output_id',)
    search_fields = ('output_id__output_id',)


class CountryBudgetItemAdmin(admin.ModelAdmin):
    list_display = ('country_budget_id',)
    search_fields = ('country_budget_id__id',)


class BudgetAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'amount', 'amount_date', 'project_id')
    search_fields = ('output_id__output_id',)


class OutputTransactionAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'amount', 'amount_date', 'project_id', 'provider_id')
    # search_fields = ('output_id__project_id__project_id', 'provider__ref_id')
    search_fields = ('output_id__output_id',)


class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'amount', 'amount_date', 'project_id', )
    search_fields = ('project_id__project_id',)


class OutputResultAdmin(admin.ModelAdmin):
    list_display = ('output_id',)
    search_fields = ('output_id__output_id',)


class OutputResultPeriodAdmin(admin.ModelAdmin):
    list_display = ('result_id', )
    search_fields = ('result_id__id',)


class OutputSdgAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'sdg')
    search_fields = ('output__output_id', 'sdg__code')


class OutputTargetAdmin(admin.ModelAdmin):
    list_display = ('output_id', 'target_id', 'percentage')
    search_fields = ('output__output_id', 'target_id__sdg__code')


class OutputActiveYearAdmin(admin.ModelAdmin):
    list_display = ('id', 'year', 'output_id')
    search_fields = ('year', 'output_id__output_id')
    list_filter = ('year',)


admin.site.register(Output, OutputAdmin)
admin.site.register(ActivityDate, ActivityDateAdmin)
admin.site.register(OutputParticipatingOrganisation, OutputParticipatingOrganisationAdmin)
admin.site.register(OutputLocation, OutputLocationAdmin)
admin.site.register(OutputSector, OutputSectorAdmin)
admin.site.register(CountryBudget, CountryBudgetAdmin)
admin.site.register(CountryBudgetItem, CountryBudgetItemAdmin)
admin.site.register(Budget, BudgetAdmin)
admin.site.register(OutputTransaction, OutputTransactionAdmin)
admin.site.register(Expense, ExpenseAdmin)
admin.site.register(OutputResult, OutputResultAdmin)
admin.site.register(OutputResultPeriod, OutputResultPeriodAdmin)
admin.site.register(OutputSdg, OutputSdgAdmin)
admin.site.register(OutputTarget, OutputTargetAdmin)
admin.site.register(OutputActiveYear, OutputActiveYearAdmin)
