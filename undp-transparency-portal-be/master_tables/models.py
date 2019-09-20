from django.db import models
from django.contrib.postgres.fields import JSONField


class Bureau(models.Model):
    bureau = models.CharField(max_length=30)
    code = models.CharField(max_length=30)

    def __str__(self):
        return "%s" % self.bureau


class Region(models.Model):
    name = models.CharField(max_length=50)
    region_code = models.CharField(max_length=30, primary_key=True)
    bureau = models.ForeignKey(Bureau)

    def __str__(self):
        return "%s" % self.name


class OperatingUnit(models.Model):
    unit_type = models.CharField(max_length=3, blank=True, null=True)
    iso_num = models.CharField(max_length=5, blank=True, null=True)
    bureau = models.ForeignKey(Bureau, blank=True, null=True)
    bureau_local = models.CharField(max_length=10, default=None, blank=True, null=True)
    iso3 = models.CharField(max_length=6, primary_key=True, db_index=True)
    name = models.CharField(max_length=150, blank=True, null=True, db_index=True)
    language = models.CharField(max_length=6, blank=True, null=True)
    region = models.ForeignKey(Region, blank=True, null=True)
    iso2 = models.CharField(max_length=6, default=None, blank=True, null=True)
    web = models.CharField(max_length=100, default=None, blank=True, null=True)
    email = models.CharField(max_length=100, default=None, blank=True, null=True)
    area_type = models.CharField(max_length=10, default=None, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    is_recipient = models.BooleanField(default=False)
    is_donor = models.BooleanField(default=False)

    def __str__(self):
        return "%s" % self.iso3


class Organisation(models.Model):
    ref_id = models.CharField(max_length=25, db_index=True, primary_key=True)
    org_name = models.CharField(max_length=255, db_index=True)
    short_name = models.CharField(max_length=20, default=None, blank=True, null=True)
    type_level_1 = models.CharField(max_length=50, null=True, blank=True, default=None)
    type_level_2 = models.CharField(max_length=50, null=True, blank=True, default=None)
    type_level_3 = models.CharField(max_length=50, null=True, blank=True, default=None, db_index=True)
    level_3_name = models.CharField(max_length=255, null=True, blank=True, default=None, db_index=True)
    operating_unit = models.ForeignKey(OperatingUnit, null=True, blank=True)

    def __str__(self):
        return "%s" % self.ref_id


class Sector(models.Model):
    code = models.CharField(max_length=2, db_index=True, primary_key=True)
    sector = models.CharField(max_length=150, default=None, blank=True, null=True, db_index=True)
    color = models.CharField(max_length=7, default=None, blank=True, null=True)
    start_year = models.IntegerField()
    end_year = models.IntegerField()

    def __str__(self):
        return "%s" % self.sector


class DocumentCategory(models.Model):
    category = models.CharField(max_length=20, db_index=True, primary_key=True)
    title = models.CharField(max_length=250)
    priority = models.IntegerField()

    def __str__(self):
        return "%s" % self.category


class ProjectTimeLine(models.Model):
    year = models.IntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return "%s :: %s" % (self.year, self.is_active)


class MapBoundary(models.Model):
    code = models.CharField(primary_key=True, max_length=100)
    geometry = JSONField()

    def __str__(self):
        return "%s" % self.code


class Sdg(models.Model):
    code = models.CharField(primary_key=True, max_length=10, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    color = models.CharField(max_length=7, blank=True, null=True)

    def __str__(self):
        return "%s" % self.code


class SdgTargets(models.Model):
    target_id = models.CharField(max_length=10, db_index=True, primary_key=True)
    sdg = models.ForeignKey(Sdg, null=False)
    description = models.CharField(max_length=1000, db_index=True)


class SignatureSolution(models.Model):
    sp_output = models.CharField(max_length=10, primary_key=True)
    sp_id = models.ForeignKey(Sector, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True)
    sp_output_description = models.TextField(max_length=1024)
    ss_id = models.CharField(max_length=10, null=False, blank=False)

    def __str__(self):
        return "%s" % self.name

