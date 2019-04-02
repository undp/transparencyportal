from django.db import models
from undp_projects.models import Project
from master_tables.models import Organisation, Sector, OperatingUnit, Sdg, SdgTargets, SignatureSolution
from utilities.konstants import Konstants, K


MARKER_TYPE_CHOICES = Konstants(
    K(hows_marker=1, label='Hows'),
    K(humanitarian_marker=2, label='Humanitarian'),
    K(ssc_marker=3, label='South-South and Triangular Cooperation'),
    K(jointprogramme_marker=4, label='Joint Programme'),
    K(partner_marker=5, label='Partner'),
    K(whos_marker=6, label='Whos'),
)

MARKER_PARENT_CHOICES = Konstants(
    K(default=0, label=''),
    K(geography=1, label='Geographic'),
    K(shocks_and_fragility=2, label='Shocks and Fragility'),
    K(socio_economic=3, label='Socio-Economic'),
    K(status=4, label='Status'),
    K(un_agency=5, label='UN Agency'),
    K(ifi=6, label='International Financial Institution (IFI)'),
)


class Output(models.Model):
    output_id = models.CharField(max_length=20, db_index=True, primary_key=True)
    project = models.ForeignKey(Project)
    organisation = models.ForeignKey(Organisation, related_name='reporting_org', blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    activity_status = models.IntegerField(blank=True, null=True)
    activity_scope = models.IntegerField(null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_website = models.CharField(max_length=225, null=True, blank=True)
    operating_unit = models.ForeignKey(OperatingUnit, default=None, blank=True, null=True,
                                       related_name='recipient_country', db_index=True)
    policy_marker_vocabulary = models.IntegerField(blank=True, null=True)
    policy_marker_code = models.IntegerField(blank=True, null=True)
    policy_marker_significance = models.IntegerField(blank=True, null=True)
    collaboration_type = models.IntegerField(blank=True, null=True)
    default_flow_type = models.IntegerField(blank=True, null=True)
    default_finance_type = models.IntegerField(blank=True, null=True)
    default_aid_type = models.CharField(max_length=5, blank=True, null=True,)
    default_tied_status = models.IntegerField(blank=True, null=True)
    capital_spend = models.FloatField(null=True, blank=True)
    conditions_attached = models.IntegerField(blank=True, null=True)
    crs_code = models.CharField(max_length=15, blank=True, null=True)
    signature_solution = models.ForeignKey(SignatureSolution, blank=True, null=True, default=0)

    def __str__(self):
        return "Output: %s :: Project: %s" % (self.output_id, self.project)


class ActivityDate(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project)
    iso_date = models.DateField(db_index=True)
    activity_type = models.IntegerField()

    def __str__(self):
        return "%s" % self.output


class OutputSector(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project)
    sector = models.ForeignKey(Sector, db_index=True)

    def __str__(self):
        return "%s" % self.output


class OutputSdg(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project)
    sdg = models.ForeignKey(Sdg, db_index=True)

    def __str__(self):
        return "%s" % self.output


class CountryBudget(models.Model):
    output = models.ForeignKey(Output)
    project = models.ForeignKey(Project)
    vocabulary = models.IntegerField()

    def __str__(self):
        return "%s" % self.output


class CountryBudgetItem(models.Model):
    country_budget = models.ForeignKey(CountryBudget)
    code = models.CharField(max_length=10)
    percentage = models.FloatField()
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return "%s" % self.country_budget


class Budget(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project, db_index=True)
    amount = models.FloatField(blank=True, null=True, db_index=True)
    amount_date = models.DateField(db_index=True)
    period_start = models.DateField(db_index=True)
    period_end = models.DateField(db_index=True)
    budget_type = models.IntegerField()
    status = models.IntegerField()

    def __str__(self):
        return "Id: %s :: Output: %s :: Project: %s" % (self.id, self.output, self.project)


class OutputParticipatingOrganisation(models.Model):
    output = models.ForeignKey(Output)
    project = models.ForeignKey(Project)
    # organisation = models.ForeignKey(Organisation)
    organisation_id = models.CharField(max_length=20, blank=True, null=True)
    organisation_name = models.CharField(max_length=255, blank=True, null=True)
    organisation_role = models.IntegerField(blank=True, null=True)
    organisation_type = models.IntegerField(blank=True, null=True)
    org_name = models.TextField(null=True, blank=True)

    def __str__(self):
        return "Output: %s :: Organisation: %s" % (self.output, self.organisation_name)


class OutputTransaction(models.Model):
    output = models.ForeignKey(Output)
    project = models.ForeignKey(Project)
    provider = models.ForeignKey(Organisation, related_name='provider_org', blank=True, null=True)
    receiver = models.ForeignKey(Organisation, related_name='receiver_org', blank=True, null=True)
    transaction_type = models.CharField(max_length=10)
    transaction_date = models.DateField()
    amount = models.FloatField(blank=True, null=True, db_index=True)
    amount_date = models.DateField(blank=True, null=True)
    disbursement_channel = models.CharField(max_length=5, blank=True, null=True)

    def __str__(self):
        return "Id: %s :: Output: %s :: Amount date: %s" % (self.id, self.output, self.amount_date)


class Expense(models.Model):
    output = models.ForeignKey(Output)
    project = models.ForeignKey(Project)
    provider = models.ForeignKey(Organisation, related_name='expense_provider_org', blank=True, null=True)
    transaction_type = models.CharField(max_length=10)
    transaction_date = models.DateField()
    amount = models.FloatField(blank=True, null=True, db_index=True)
    amount_date = models.DateField(blank=True, null=True)
    disbursement_channel = models.CharField(max_length=5, blank=True, null=True)

    def __str__(self):
        return "Id: %s :: Output: %s :: Amount date: %s" % (self.id, self.output, self.amount_date)


class OutputLocation(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project, db_index=True)
    operating_unit = models.ForeignKey(OperatingUnit, null=True, blank=True)
    location_reach = models.IntegerField()
    location_vocabulary = models.CharField(max_length=4)
    location_code = models.IntegerField()
    name = models.CharField(max_length=100)
    description = models.TextField()
    activity_description = models.TextField(null=True, blank=True)
    administrative_level = models.IntegerField()
    administrative_code = models.IntegerField()
    administrative_vocabulary = models.CharField(max_length=15)
    srs_name = models.CharField(max_length=600)
    latitude = models.CharField(max_length=20)
    longitude = models.CharField(max_length=20)
    exactness = models.IntegerField()
    location_class = models.IntegerField()
    feature_designation = models.CharField(max_length=10)

    def __str__(self):
        return "Output: %s :: Operating unit: %s" % (self.output, self.operating_unit)


class OutputResult(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project)
    result_type = models.IntegerField()
    aggregation_status = models.IntegerField()
    indicator_title = models.CharField(max_length=225)
    indicator_description = models.TextField(null=True, blank=True)
    indicator_measure = models.IntegerField()
    indicator_ascending = models.IntegerField()
    baseline_year = models.CharField(max_length=4)
    baseline_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return "Output: %s :: Baseline year: %s" % (self.output, self.baseline_year)


class OutputResultPeriod(models.Model):
    result = models.ForeignKey(OutputResult, db_index=True)
    period_start = models.DateField()
    period_end = models.DateField()
    target = models.TextField(null=True, blank=True)
    actual = models.TextField(null=True, blank=True)

    def __str__(self):
        return "Id: %s :: Result: %s" % (self.id, self.result)


class OutputActiveYear(models.Model):
    output = models.ForeignKey(Output, related_name='output_active')
    year = models.IntegerField()

    def __str__(self):
        return "%s :: %s" % (self.output, self.year)


class OutputTarget(models.Model):
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project)
    target_id = models.ForeignKey(SdgTargets, db_index=True)
    percentage = models.DecimalField(max_digits=11, decimal_places=8)
    year = models.IntegerField()

    def __str__(self):
        return "%s" % self.output


class ProjectMarker(models.Model):
    output = models.ForeignKey(Output, related_name='marker_output', null=False)

    type = models.IntegerField(choices=MARKER_TYPE_CHOICES.choices(), db_index=True)
    parent_type = models.IntegerField(choices=MARKER_PARENT_CHOICES.choices(), db_index=True)
    parent_marker_desc = models.CharField(max_length=750, null=True, blank=True)

    marker_id = models.IntegerField()
    marker_title = models.CharField(max_length=500)
    marker_desc = models.CharField(max_length=750, null=True, blank=True)

    level_two_marker_id = models.IntegerField()
    level_two_marker_title = models.CharField(max_length=500)
    level_two_marker_description = models.CharField(max_length=500)


class SDGChartColor(models.Model):
    sdg_code = models.IntegerField()
    count = models.IntegerField()
    color = models.CharField(max_length=20, null=False, blank=False)
