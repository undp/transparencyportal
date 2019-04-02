from django.core.management.base import BaseCommand, CommandError

from undp_projects.cron_new import DownloadXmlCron


class Command(BaseCommand):
    help = 'Runs script to upload projects and outputs'

    def handle(self, *args, **options):
        DownloadXmlCron().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
