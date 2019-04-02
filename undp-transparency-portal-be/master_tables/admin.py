from django.contrib import admin

from master_tables.models import Region, Organisation, Sector, DocumentCategory, OperatingUnit, \
    ProjectTimeLine, Bureau, MapBoundary, Sdg


class OperatingUnitAdmin(admin.ModelAdmin):
    list_display = ('iso3', 'bureau', 'name', 'iso_num', 'area_type', 'latitude', 'longitude')
    search_fields = ('iso3', 'iso2', 'name')
    list_filter = ('area_type', 'is_recipient')


class RegionAdmin(admin.ModelAdmin):
    list_display = ('region_code', 'name',)
    search_fields = ('region_code', 'name')


class BureauAdmin(admin.ModelAdmin):
    list_display = ('code', 'bureau',)
    search_fields = ('code', 'bureau')


class OrganisationAdmin(admin.ModelAdmin):
    pass
    list_display = ('ref_id', 'short_name', 'org_name', 'operating_unit', 'type_level_3')
    search_fields = ('ref_id', 'type_level_3',)


class SectorAdmin(admin.ModelAdmin):
    list_display = ('code', 'sector')
    search_fields = ('code', 'sector')


class SdgAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')
    search_fields = ('code', 'name', 'color')


class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ('category', 'title', 'priority')
    search_fields = ('category', 'title')


class ProjectTimeLineAdmin(admin.ModelAdmin):
    list_display = ('year', 'is_active')
    search_fields = ('year',)
    list_filter = ('is_active',)


class MapBoundaryAdmin(admin.ModelAdmin):
    list_display = ('code',)
    search_fields = ('code',)


admin.site.register(OperatingUnit, OperatingUnitAdmin)
admin.site.register(Region, RegionAdmin)
admin.site.register(Organisation, OrganisationAdmin)
admin.site.register(Sector, SectorAdmin)
admin.site.register(DocumentCategory, DocumentCategoryAdmin)
admin.site.register(ProjectTimeLine, ProjectTimeLineAdmin)
admin.site.register(Bureau, BureauAdmin)
admin.site.register(MapBoundary, MapBoundaryAdmin)
admin.site.register(Sdg, SdgAdmin)
