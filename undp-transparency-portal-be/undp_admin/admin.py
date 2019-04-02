from django.contrib import admin
from undp_admin.models import AdminLog, AboutUs
from undp_transparency.admin import undp_admin


class AdminLogAdmin(admin.ModelAdmin):
    list_display = ('job', 'file_name', 'executed_date', 'status')
    search_fields = ('job',)
    list_filter = ('executed_date', 'status')
    ordering = ('-executed_date',)


class AboutUsAdmin(admin.ModelAdmin):
    list_display = ('id', 'tab', 'created_date', 'modified_date')
    search_fields = ('plain_text', 'html_content')
    list_filter = ('created_date', 'modified_date')
    ordering = ('-modified_date',)


undp_admin.register(AdminLog, AdminLogAdmin)
undp_admin.register(AboutUs, AboutUsAdmin)
