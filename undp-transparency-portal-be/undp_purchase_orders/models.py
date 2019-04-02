from django.db import models

from master_tables.models import OperatingUnit
from undp_outputs.models import Output
from undp_projects.models import Project
from utilities.konstants import Konstants, K

VENDOR_CLASSIFICATION_TYPES = Konstants(
    K(unknown=0, label='Unknown'),
    K(fellow=1, label='Fellow'),
    K(meeting_participant=2, label='Meeting Participant'),
    K(ngo_micro_grantee=3, label='NGO - Micro Grantee'),
    K(ngo_rp_partner=4, label='NGO - RP / Partner'),
    K(outside_party=5, label='Outside Party'),
    K(service_contract=6, label='Service Contract'),
    K(ssa_ic_rla=7, label='SSA / IC / RLA'),
    K(staff=8, label='Staff'),
    K(sup_univ_research=9, label="Sup - Univ/Int'I Research Inst"),
    K(supplier_govt_sector=10, label='Supplier - Govt Ent/Pub Sector'),
    K(supplier_inter_govt_org=11, label='Supplier - Inter-govt Org'),
    K(supplier_ngo=12, label='Supplier - NGO'),
    K(supplier_private_sector=13, label='Supplier - Private Sector Co'),
    K(unv=14, label='UNV'),
)


class Vendor(models.Model):
    vendor_id = models.CharField(max_length=100, db_index=True, primary_key=True)
    name = models.CharField(max_length=255)
    # classification = models.IntegerField('Status', choices=VENDOR_CLASSIFICATION_TYPES.choices(),
    #                                      default=VENDOR_CLASSIFICATION_TYPES.unknown,
    #                                      db_index=True)
    classification_type = models.CharField(null=True, blank=True, max_length=255)

    def __str__(self):
        return "%s" % self.vendor_id


class PurchaseOrder(models.Model):
    order_id = models.CharField(max_length=100, db_index=True)
    vendor = models.ForeignKey(Vendor)
    vendor_name = models.CharField(max_length=255, null=True, blank=True)
    output = models.ForeignKey(Output, db_index=True)
    project = models.ForeignKey(Project, db_index=True)
    operating_unit = models.ForeignKey(OperatingUnit, null=True, blank=True, db_index=True)
    description = models.TextField(null=True, blank=True)
    order_date = models.DateTimeField(db_index=True)
    ref = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=30, decimal_places=2)
    line_nbr = models.FloatField(null=True, blank=True)
    partner = models.CharField(max_length=15, null=True, blank=True)
    business_unit = models.CharField(max_length=15, null=True, blank=True)
