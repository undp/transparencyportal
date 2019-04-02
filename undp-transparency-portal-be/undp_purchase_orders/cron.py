from django_cron import CronJobBase, Schedule

from undp_projects.utils import save_log, write_file
from undp_purchase_orders.models import Vendor, PurchaseOrder
from utilities import config as settings
from master_tables.models import Bureau, Organisation, Sector, DocumentCategory,\
    Region, OperatingUnit
from undp_outputs.models import Expense, Output
from undp_projects.models import Project, ProjectActiveYear
from lxml import etree

import os
import re
import sys
import csv
import xlrd
import datetime

from utilities.utils import get_vendor_classification_value


class PurchaseOrderCron:

        def do(self):

            start_time = datetime.datetime.now()
            print('Cron Started')

            self.purchase_orders()
            print('Completed Purchase orders upload')
            end_time = datetime.datetime.now()
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
            print('Cron Ended')

        def purchase_orders(self):
            file_path = settings.CSV_UPLOAD_DIR + "/PO_DETAILS.xlsx"
            workbook = xlrd.open_workbook(file_path)
            sheet = workbook.sheet_by_index(0)
            row_iter = 0
            error_rows = []
            error_vendors = []
            purchase_orders = []
            for row in range(sheet.nrows):
                if row_iter != 0:
                    operating_unit_iso3 = sheet.cell_value(row, 0)
                    project_id = sheet.cell_value(row, 2)
                    output_id = sheet.cell_value(row, 5)
                    business_unit = sheet.cell_value(row, 6)
                    partner = sheet.cell_value(row, 7)
                    vendor_id = sheet.cell_value(row, 8)
                    vendor_name = sheet.cell_value(row, 9)
                    vendor_classification = get_vendor_classification_value(sheet.cell_value(row, 10))
                    order_id = sheet.cell_value(row, 11)
                    line_nbr = sheet.cell_value(row, 12)
                    description = sheet.cell_value(row, 13)
                    order_date = sheet.cell_value(row, 14)
                    order_amount = sheet.cell_value(row, 15)
                    try:
                        order_ref = sheet.cell_value(row, 16).encode('ascii', 'ignore')
                    except:
                        order_ref = str(sheet.cell_value(row, 16))

                    order_date_as_datetime = datetime.datetime(*xlrd.xldate_as_tuple(order_date, workbook.datemode))
                    try:
                        vendor_obj, created = Vendor.objects\
                            .update_or_create(vendor_id=vendor_id,
                                              defaults={'name': vendor_name,
                                                        'classification': vendor_classification})
                    except Exception as e:
                        print(e)
                        vendor_obj = None
                        error_vendors.append(vendor_id)
                    try:
                        output = Output.objects.get(output_id=output_id)
                    except:
                        output = None
                    try:
                        project = Project.objects.get(project_id=project_id)
                    except:
                        project = None

                    if output and project:
                        print(order_ref)

                        defaults = {
                            # 'output': output,
                            # 'business_unit': business_unit,
                            # 'partner': partner,
                            # 'description': description,
                            # 'order_date': order_date_as_datetime,
                            # 'amount': order_amount,
                            # 'ref': order_ref
                        }
                        try:
                            operating_unit = OperatingUnit.objects.get(iso3=operating_unit_iso3)
                        except:
                            operating_unit = None
                        try:
                            purchase_orders.append(PurchaseOrder(
                                order_id=order_id, line_nbr=line_nbr, project=project, output=output,
                                operating_unit=operating_unit, vendor=vendor_obj, order_date=order_date_as_datetime,
                                ref=order_ref, business_unit=business_unit, partner=partner, description=description,
                                amount=order_amount
                            ))
                        except Exception as e:
                            error_rows.append(iter)

                            print(e)

                row_iter = row_iter + 1
            PurchaseOrder.objects.all().delete()
            PurchaseOrder.objects.bulk_create(purchase_orders)
            print("Total records: " + str(row_iter))
            write_file(("Total rows:   %s" % row_iter))
            write_file(("Error rows:   %s" % error_rows))
            write_file(("\nError error_vendors: %s" % error_vendors))
