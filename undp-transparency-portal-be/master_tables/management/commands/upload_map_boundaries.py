from django.core.management.base import BaseCommand
from master_tables.cron import MapBoundaryCron


class Command(BaseCommand):
    help = 'Runs script to upload master data from csv'

    def handle(self, *args, **options):
        MapBoundaryCron().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
