from django.core.management.base import BaseCommand, CommandError

from undp_projects.cron_new import UploadCountryDocuments


class Command(BaseCommand):
    help = 'Runs script to upload projects and outputs'

    def handle(self, *args, **options):
        UploadCountryDocuments().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
