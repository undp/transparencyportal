from datetime import datetime
from django.conf import settings as main_settings
from master_tables.models import ProjectTimeLine
from undp_admin.models import JOBS, LOG_STATUSES
from undp_admin.utils import add_admin_log, update_admin_log
from undp_extra_features.models import ProjectYearSummary
from undp_extra_features.serializers import ProjectSummarySerializer
from undp_projects.models import Project

db = main_settings.DB_FOR_WRITE


class ProjectYearSummaryCron:

    def do(self):
        start_time = datetime.now()
        add_admin_log(JOBS.populate_project_year_summary, start_time=start_time)
        print('Cron Started')
        timelines = ProjectTimeLine.objects.using(db).filter(is_active=True)
        for timeline in timelines:
            year = timeline.year
            queryset = Project.objects.using(db).filter(project_active__year=year).select_related('operating_unit')
            serializer = ProjectSummarySerializer(queryset, many=True, context={'year': year})
            defaults = {
                'summary': serializer.data
            }
            try:
                ProjectYearSummary.objects.update_or_create(year=year, defaults=defaults)
            except Exception as e:
                print(e)
                pass
        end_time = datetime.now()
        run_time = end_time - start_time
        update_admin_log(JOBS.populate_project_year_summary, start_time,
                         end_time=end_time,
                         status=LOG_STATUSES.successful)
        print('Runtime : ' + str(run_time))
        print('Cron Ended')
