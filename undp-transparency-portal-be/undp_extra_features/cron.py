from datetime import datetime

from master_tables.models import ProjectTimeLine
from undp_extra_features.models import ProjectYearSummary
from undp_extra_features.serializers import ProjectSummarySerializer
from undp_projects.models import Project


class ProjectYearSummaryCron:

    def do(self):
        start_time = datetime.now()
        print('Cron Started')
        timelines = ProjectTimeLine.objects.filter(is_active=True)
        for timeline in timelines:
            year = timeline.year
            queryset = Project.objects.filter(project_active__year=year)
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
        print('Runtime : ' + str(run_time))
        print('Cron Ended')
