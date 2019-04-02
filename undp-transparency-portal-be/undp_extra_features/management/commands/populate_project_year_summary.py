from django.core.management.base import BaseCommand, CommandError

from undp_extra_features.cron import ProjectYearSummaryCron


class Command(BaseCommand):
    help = 'Runs script to upload projects and outputs'

    def handle(self, *args, **options):
        ProjectYearSummaryCron().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
