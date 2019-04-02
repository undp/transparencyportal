from django.db import models

from master_tables.models import Organisation, OperatingUnit
from undp_outputs.models import Output
from undp_projects.models import Project
from utilities.konstants import Konstants, K

DONOR_CATEGORY_CHOICES = Konstants(
    K(pooled_funding=1, label='Pooled Funding'),
    K(private_sector=2, label='Private Sector'),
    K(vertical_funding=3, label='Vertical Funding'),
    K(multilaterals=4, label='Other Multilaterals'),
    K(ngos=5, label='NGOs'),
    K(dac_donors=6, label='DAC Donors'),
    K(programme_countries=7, label='Programme Countries'),
    K(others=8, label='Others Unidentified'),
    K(financing=9, label='Financing Institutions'),
    K(un_agencies=10, label='UN Agencies'),
    K(european_union=11, label='European Union'),
    K(non_dac_non_pgm=12, label='Non-DAC and non-programme country'),
    K(non_dac=13, label='Non-DAC Donors'),
    K(foundations=14, label='Foundations'),
    K(undp_regular=15, label='UNDP Regular Resources'),
    K(new_mapping_1=16, label='Non-DAC and programme governments'),
    K(new_mapping_2=17, label='Private Sector/Foundations/NGOs'),
)

FUND_TYPE_CHOICES = Konstants(
    K(regular=1, label='Regular Resources'),
    K(other=2, label='Other Resources')
)

FUND_STREAM_CHOICES = Konstants(
    K(core=1, label='Core'),
    K(cost_sharing=2, label='Cost Sharing'),
    K(others=4, label='Others'),
    K(vertical_funds=5, label='Vertical Funds'),
    K(thematic_funds=6, label='Thematic Funds'),
    K(trust_funds=3, label='Trust Funds'),
)


class DonorFundSplitUp(models.Model):
    organisation = models.ForeignKey(Organisation, db_index=True)
    project = models.ForeignKey(Project, db_index=True)
    output = models.ForeignKey(Output, db_index=True)
    donor_category = models.IntegerField('Donor Category', choices=DONOR_CATEGORY_CHOICES.choices(),
                                         default=DONOR_CATEGORY_CHOICES.others, db_index=True, null=True, blank=True)
    budget = models.DecimalField(max_digits=30, decimal_places=2)
    expense = models.DecimalField(max_digits=30, decimal_places=2)
    year = models.IntegerField(db_index=True)

    def __str__(self):
        return "ID: %s :: Project: %s" % (self.id, self.project)


class DonorFundModality(models.Model):
    organisation = models.ForeignKey(Organisation, db_index=True)
    donor_category = models.IntegerField('Donor Category', choices=DONOR_CATEGORY_CHOICES.choices(),
                                         default=DONOR_CATEGORY_CHOICES.others, db_index=True, null=True, blank=True)
    fund_type = models.CharField(max_length=30)
    fund_stream = models.CharField(max_length=30)
    year = models.IntegerField()
    contribution = models.DecimalField(max_digits=30, decimal_places=2)

#
# class OperatingUnitFundAggregate(models.Model):
#     operating_unit = models.ForeignKey(OperatingUnit)
#     year = models.IntegerField()
#     total_budget = models.DecimalField(max_digits=30, decimal_places=2)
#     total_expense = models.DecimalField(max_digits=30, decimal_places=2)
