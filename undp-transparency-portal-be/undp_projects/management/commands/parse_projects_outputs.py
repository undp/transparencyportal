from django.core.management.base import BaseCommand, CommandError

from undp_projects.cron_new import CronJob


class Command(BaseCommand):
    help = 'Runs script to upload projects and outputs'

    def handle(self, *args, **options):
        CronJob().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
