from django.core.management.base import BaseCommand

from undp_donors.cron_new import CronJob


class Command(BaseCommand):
    help = 'Runs script to upload report donors and donor contribution(fund modality)'

    def handle(self, *args, **options):
        CronJob().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
