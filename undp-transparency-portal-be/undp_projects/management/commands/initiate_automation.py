from django.core.management.base import BaseCommand, CommandError

from undp_projects.automation import Automation


class Command(BaseCommand):
    help = 'Runs script to upload projects and outputs'

    def handle(self, *args, **options):
        Automation().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
