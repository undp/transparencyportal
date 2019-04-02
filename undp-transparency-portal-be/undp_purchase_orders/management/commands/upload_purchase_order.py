from django.core.management.base import BaseCommand, CommandError

from undp_purchase_orders.cron import PurchaseOrderCron


class Command(BaseCommand):
    help = 'Runs script to upload projects and outputs'

    def handle(self, *args, **options):
        PurchaseOrderCron().do()
        self.stdout.write(self.style.SUCCESS('Successfully run cron'))
