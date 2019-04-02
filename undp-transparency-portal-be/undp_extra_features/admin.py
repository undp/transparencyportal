from django.contrib import admin

from undp_extra_features.models import ProjectYearSummary


class ProjectYearSummaryAdmin(admin.ModelAdmin):
    list_display = ('id', 'year',)
    search_fields = ('year',)


admin.site.register(ProjectYearSummary, ProjectYearSummaryAdmin)
