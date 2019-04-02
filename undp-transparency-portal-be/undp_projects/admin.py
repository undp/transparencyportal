from django.contrib import admin

from undp_projects.models import ProjectAggregate, SectorAggregate, Project, ProjectActiveYear, ProjectDocument, \
    CountryResultPeriod, CountryResult, Log, DownloadLog, CountryDocument, ProjectParticipatingOrganisations, \
    ProjectSdg, ProjectActivityDate, ProjectSearch


class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'operating_unit')
    search_fields = ('project_id', 'operating_unit__iso3')
    list_filter = ('project_active__year', 'operating_unit')


class ProjectParticipatingOrganisationsAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'org_name', 'organisation_id', 'org_role')
    search_fields = ('project__project_id', 'organisation_id', 'org_name')
    list_filter = ('org_role',)


class SectorAggregateAdmin(admin.ModelAdmin):
    list_display = ('id', 'sector_id',)
    search_fields = ('sector_id__code',)


class ProjectAggregateAdmin(admin.ModelAdmin):
    list_display = ('id', 'year',)
    search_fields = ('year',)


class ProjectActiveYearAdmin(admin.ModelAdmin):
    list_display = ('id', 'year', 'project_id')
    search_fields = ('year', 'project_id__project_id')
    list_filter = ('year',)


class ProjectActivityDateAdmin(admin.ModelAdmin):
    list_display = ('id', 'iso_date', 'project_id', 'activity_type')
    search_fields = ('project_id__project_id',)
    # list_filter = ('year',)


class ProjectDocumentsAdmin(admin.ModelAdmin):
    list_display = ('id', 'project_id', 'document_url')
    search_fields = ('project_id__project_id',)
    list_filter = ('category__category',)


class CountryResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'baseline_year', 'component_id', 'operating_unit')
    search_fields = ('component_id', 'operating_unit__iso3', 'operating_unit__name')


class CountryResultPeriodAdmin(admin.ModelAdmin):
    list_display = ('country_result', 'dimension_value', 'period_start', 'actual', 'target')
    search_fields = ('dimension_value', 'country_result__operating_unit__name')
    list_filter = ('period_start',)


class LogAdmin(admin.ModelAdmin):
    list_display = ('id', 'cron_type', 'cron_key')
    search_fields = ('cron_key',)
    list_filter = ('cron_type', 'cron_key')


class DownloadLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'cron_date', 'file_name')
    search_fields = ('file_name',)
    list_filter = ('cron_date',)


class CountryDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'format', 'operating_unit')
    search_fields = ('title',)


class ProjectSdgAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'sdg')
    search_fields = ('project__project_id', 'sdg__code')


class ProjectSearchAdmin(admin.ModelAdmin):
    list_display = ('project_id', 'year',)
    search_fields = ('project_id__project_id',)
    list_filter = ('year',)


admin.site.register(Project, ProjectAdmin)
admin.site.register(SectorAggregate, SectorAggregateAdmin)
admin.site.register(ProjectAggregate, ProjectAggregateAdmin)
admin.site.register(ProjectActiveYear, ProjectActiveYearAdmin)
admin.site.register(ProjectDocument, ProjectDocumentsAdmin)
admin.site.register(CountryResult, CountryResultAdmin)
admin.site.register(CountryResultPeriod, CountryResultPeriodAdmin)
admin.site.register(Log, LogAdmin)
admin.site.register(DownloadLog, DownloadLogAdmin)
admin.site.register(CountryDocument, CountryDocumentAdmin)
admin.site.register(ProjectParticipatingOrganisations, ProjectParticipatingOrganisationsAdmin)
admin.site.register(ProjectSdg, ProjectSdgAdmin)
admin.site.register(ProjectActivityDate, ProjectActivityDateAdmin)
admin.site.register(ProjectSearch, ProjectSearchAdmin)
