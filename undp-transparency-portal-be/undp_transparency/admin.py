from django.contrib.admin.sites import AdminSite


class UndpAdminSite(AdminSite):
    pass


undp_admin = UndpAdminSite(name="undpadmin")
