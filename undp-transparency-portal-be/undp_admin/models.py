from django.db import models

# Create your models here.
from utilities.konstants import Konstants, K

LOG_STATUSES = Konstants(K(in_progress=1, label='In Progress'),
                         K(successful=2, label='Successful'),
                         K(failed=3, label='Failed'),
                         )

JOBS = Konstants(
    K(na=0, label='N/A'),
    K(upload_master_data=1, label='Upload Master Data'),
    K(download_xml=2, label='Download from Source Location'),
    K(parse_projects_outputs=3, label='Annual XML Parsing'),
    K(parse_donors_data=4, label='Parse Donors Data'),
    K(project_search_update=5, label='Project Search model update'),
    K(upload_purchase_order=6, label='Purchase Orders Upload'),
    K(upload_country_documents=7, label='Country documents Upload'),
    K(upload_map_boundaries=8, label='Upload Map Boundaries'),
    K(populate_project_year_summary=9, label='Populate project year summary'),
    K(difference_analysis=10, label='XML difference analysis'),
    K(initiate_automation=11, label='Initiate Automation'),
)


TABS = Konstants(
    K(about=1, label='About Open.UNDP'),
    K(faq=2, label='FAQ'),
    K(glossary=3, label='Glossary'),
    K(contact=4, label='Contact'),
    K(trainings=5, label='Online Training Courses')
)


class AdminLog(models.Model):
    executed_date = models.DateTimeField(auto_now_add=True)
    message = models.TextField(null=True, blank=True)
    duration = models.CharField(max_length=255, null=True, blank=True)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    job = models.IntegerField('Job', choices=JOBS.choices(),
                              default=JOBS.na, db_index=True)
    status = models.IntegerField('Download Status', choices=LOG_STATUSES.choices(),
                                 default=LOG_STATUSES.in_progress, db_index=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return "%s : %s" % (self.job, self.executed_date)


class AboutUs(models.Model):
    tab = models.IntegerField('Tab', choices=TABS.choices(),
                              default=TABS.about, db_index=True)
    plain_text = models.TextField(null=True, blank=True)
    html_content = models.TextField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'About Us'
        verbose_name_plural = 'About Us'
