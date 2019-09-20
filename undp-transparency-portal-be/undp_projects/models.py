from django.db import models
from master_tables.models import Organisation, Sector, DocumentCategory, OperatingUnit, Sdg, SdgTargets
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex


class Project(models.Model):
    project_id = models.CharField(max_length=100, db_index=True, primary_key=True)
    title = models.TextField(blank=True, null=True)
    organisation = models.ForeignKey(Organisation, blank=True, null=True)
    description = models.CharField(max_length=600, blank=True, null=True)
    contact_email = models.CharField(max_length=100, default=None, blank=True, null=True)
    contact_website = models.CharField(max_length=100, default=None, blank=True, null=True)
    operating_unit = models.ForeignKey(OperatingUnit, default=None, blank=True, null=True, db_index=True)
    activity_status = models.IntegerField(blank=True, null=True)
    collaboration_type = models.IntegerField(blank=True, null=True)
    default_flow_type = models.IntegerField(blank=True, null=True)
    default_finance_type = models.IntegerField(blank=True, null=True)
    default_aid_type = models.CharField(max_length=5, blank=True, null=True, )
    default_tied_status = models.IntegerField(blank=True, null=True)
    capital_spend = models.FloatField(null=True, blank=True)
    conditions_attached = models.IntegerField(blank=True, null=True)
    crs_code = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return "%s" % self.project_id


class ProjectParticipatingOrganisations(models.Model):
    project = models.ForeignKey(Project)
    # organisation = models.ForeignKey(Organisation)
    org_type = models.IntegerField(default=None, blank=True, null=True)
    org_role = models.IntegerField(default=None, blank=True, null=True)
    organisation_name = models.CharField(max_length=255, blank=True, null=True)
    organisation_id = models.CharField(max_length=20, blank=True, null=True)
    org_name = models.TextField(null=True, blank=True)

    def __str__(self):
        return "Project: %s :: Organisation :%s  :: Role: %s" % \
               (self.project, self.organisation_id, self.org_role)


class ProjectDocument(models.Model):
    project = models.ForeignKey(Project)
    document_url = models.CharField(max_length=500)
    title = models.CharField(max_length=500)
    format = models.CharField(max_length=100, default=None, blank=True, null=True)
    category = models.ForeignKey(DocumentCategory, blank=True, null=True)

    def __str__(self):
        return "%s :: %s" % (self.project, self.title)


class ProjectActiveYear(models.Model):
    project = models.ForeignKey(Project, related_name='project_active')
    year = models.IntegerField()

    def __str__(self):
        return "%s :: %s" % (self.project, self.year)


class ProjectActivityDate(models.Model):
    project = models.ForeignKey(Project)
    iso_date = models.DateField(db_index=True)
    activity_type = models.IntegerField()

    def __str__(self):
        return "%s" % self.project


class SectorAggregate(models.Model):
    sector = models.ForeignKey(Sector)
    sector_name = models.CharField(max_length=125)
    budget = models.DecimalField(max_digits=30, decimal_places=2)
    expense = models.DecimalField(max_digits=30, decimal_places=2)
    total_projects = models.IntegerField(default=0)
    percentage = models.DecimalField(max_digits=30, decimal_places=2)
    year = models.IntegerField()

    def __str__(self):
        return "%s" % self.sector


class ProjectAggregate(models.Model):
    year = models.IntegerField()
    budget = models.DecimalField(max_digits=30, decimal_places=2)
    expense = models.DecimalField(max_digits=30, decimal_places=2)
    operating_units = models.IntegerField(default=0)
    projects = models.IntegerField(default=0)
    donors = models.IntegerField(default=0)

    def __str__(self):
        return "%s" % self.id


class CountryResult(models.Model):
    component_id = models.CharField(max_length=35)
    operating_unit = models.ForeignKey(OperatingUnit, blank=True, null=True, default=None)
    description = models.TextField()
    baseline_year = models.IntegerField()
    baseline_value = models.CharField(max_length=50, blank=True, null=True, default=0)

    def __str__(self):
        return "%s" % self.id


class CountryResultPeriod(models.Model):
    country_result = models.ForeignKey(CountryResult)
    component_id = models.CharField(max_length=35)
    operating_unit = models.ForeignKey(OperatingUnit, blank=True, null=True, default=None)
    period_start = models.DateField()
    period_end = models.DateField()
    actual = models.CharField(max_length=75, blank=True, null=True, default=0)
    target = models.CharField(max_length=75, blank=True, null=True, default=0)
    dimension_name = models.CharField(max_length=50, blank=True, null=True, default=0)
    dimension_value = models.CharField(max_length=50, blank=True, null=True, default=0)

    def __str__(self):
        return "%s" % self.id


class Log(models.Model):
    cron_date = models.DateField(auto_now_add=True, blank=True, null=True)
    cron_type = models.CharField(max_length=20, default=None, blank=True, null=True)
    cron_key = models.CharField(max_length=250, default=None, blank=True, null=True)
    cron_message = models.CharField(max_length=500, default=None, blank=True, null=True)

    def __str__(self):
        return "%s :: %s" % (self.cron_date, self.cron_key)


class DownloadLog(models.Model):
    cron_date = models.DateField(auto_now_add=True)
    file_name = models.CharField(max_length=600, blank=True, null=True)
    download_url = models.CharField(max_length=600, blank=True, null=True)
    cron_message = models.TextField(blank=True, null=True)

    def __str__(self):
        return "%s :: %s" % (self.cron_date, self.id)


class CountryDocument(models.Model):
    operating_unit = models.ForeignKey(OperatingUnit)
    document_url = models.CharField(max_length=500)
    title = models.CharField(max_length=500, blank=True, null=True)
    format = models.CharField(max_length=100, default=None, blank=True, null=True)
    category = models.ForeignKey(DocumentCategory, blank=True, null=True)
    language = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return "%s :: %s" % (self.operating_unit, self.title)


class ProjectSdg(models.Model):
    project = models.ForeignKey(Project)
    sdg = models.ForeignKey(Sdg, db_index=True)


class ProjectTarget(models.Model):
    project = models.ForeignKey(Project)
    target = models.ForeignKey(SdgTargets, db_index=True)
    percentage = models.DecimalField(max_digits=30, decimal_places=2)
    sdg = models.CharField(max_length=20)
    year = models.IntegerField()

    def get_sdg(self):
        string = (self.target.target_id)
        result = string[:string.index(".")]
        sdg = Sdg.objects.get(code=result)
        return result

    def save(self, *args, **kwargs):
        self.sdg = self.get_sdg()
        super(ProjectTarget, self).save(*args, **kwargs)


class ProjectSearch(models.Model):
    project_id = models.ForeignKey(Project)
    year = models.IntegerField()
    body_text = models.TextField(null=True)
    search_vector = SearchVectorField(null=True)

    class Meta:
        indexes = [GinIndex(fields=['search_vector'])]


class SDGSunburst(models.Model):
    sdg_year = models.IntegerField(primary_key=True, db_index=True)
    response = models.TextField()


class SDGMap(models.Model):
    year = models.IntegerField(db_index=True)
    sdg = models.CharField(max_length=20)
    response = models.TextField()

    class Meta:
        unique_together = ("year", "sdg")
