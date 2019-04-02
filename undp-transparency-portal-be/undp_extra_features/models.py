from django.contrib.postgres.fields.jsonb import JSONField
from django.db import models

# Create your models here.


class ProjectYearSummary(models.Model):
    year = models.IntegerField()
    summary = JSONField()
