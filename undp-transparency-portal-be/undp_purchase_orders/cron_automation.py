from django.conf import settings as main_settings
from django_cron import CronJobBase, Schedule

from undp_admin.models import JOBS, LOG_STATUSES
from undp_admin.utils import add_admin_log, update_admin_log
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

from utilities.config import BULK_INSERT_LIMIT

db = main_settings.DB_FOR_WRITE


class PurchaseOrderCron:

        def do(self):

            start_time = datetime.datetime.now()
            print('Cron Started')

            self.purchase_orders()
            self.purchase_orders_history()
            print('Completed Purchase orders upload')
            end_time = datetime.datetime.now()
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
            print('Cron Ended')

        def purchase_orders(self):
            start_time = datetime.datetime.now()
            try:
                add_admin_log(JOBS.upload_purchase_order, file_name="report_po.xlsx",
                              start_time=start_time)
                file_path = settings.CSV_UPLOAD_DIR + "/report_po.xlsx"
                workbook = xlrd.open_workbook(file_path)
                sheet = workbook.sheet_by_index(0)
                row_iter = 0
                error_rows = []
                error_vendors = []
                purchase_orders = []
                outputs = Output.objects.all().values_list(flat=True)
                projects = Project.objects.all().values_list(flat=True)
                operating_units = OperatingUnit.objects.all().values_list(flat=True)
                n = 0
                total_records_inserted = 0
                for row in range(sheet.nrows):
                    if row_iter != 0:
                        operating_unit_iso3 = sheet.cell_value(row, 0)
                        project_id = sheet.cell_value(row, 2)
                        output_id = sheet.cell_value(row, 5)
                        business_unit = sheet.cell_value(row, 6)
                        partner = sheet.cell_value(row, 7)
                        vendor_id = sheet.cell_value(row, 8)
                        vendor_name = sheet.cell_value(row, 9)
                        vendor_classification = sheet.cell_value(row, 10)
                        order_id = sheet.cell_value(row, 11)
                        line_nbr = sheet.cell_value(row, 12)
                        description = sheet.cell_value(row, 13)
                        order_date = sheet.cell_value(row, 14)
                        order_amount = sheet.cell_value(row, 15)
                        try:
                            order_ref = sheet.cell_value(row, 16).encode('ascii', 'ignore')
                        except:
                            order_ref = str(sheet.cell_value(row, 16))

                        order_date_as_datetime = self.process_order_date(order_date, workbook.datemode)

                        try:
                            vendor_obj, created = Vendor.objects \
                                .update_or_create(vendor_id=vendor_id,
                                                  defaults={'name': vendor_name,
                                                            'classification_type': vendor_classification})
                        except Exception as e:
                            vendor_obj = None
                            error_vendors.append(vendor_id)
                        if output_id in outputs:
                            output = output_id
                        else:
                            output = None

                        if project_id in projects:
                            project = project_id
                        else:
                            project = None
                        if output and project:
                            n += 1
                            if operating_unit_iso3 in operating_units:
                                operating_unit = operating_unit_iso3
                            else:
                                operating_unit = None
                            data_dict = {
                                'order_id': order_id,
                                'line_nbr': line_nbr,
                                'project_id': project,
                                'output_id': output,
                                'operating_unit_id': operating_unit,
                                'vendor': vendor_obj,
                                'vendor_name': vendor_name,
                                'order_date': order_date_as_datetime,
                                'ref': order_ref,
                                'business_unit': business_unit,
                                'partner': partner,
                                'description': description,
                                'amount': order_amount
                            }

                            try:

                                purchase_order = PurchaseOrder(**data_dict)
                                purchase_orders.append(purchase_order)
                                if n == BULK_INSERT_LIMIT:
                                    print("Inserting %s records..." % str(n))
                                    total_records_inserted += n
                                    PurchaseOrder.objects.bulk_create(purchase_orders)
                                    purchase_orders = []
                                    n = 0
                            except Exception as e:
                                error_rows.append(e)

                    row_iter += 1
                total_records_inserted += n
                print("Inserting %s records..." % str(n))
                PurchaseOrder.objects.bulk_create(purchase_orders)
                print("Total records inserted: ", total_records_inserted)
                update_admin_log(JOBS.upload_purchase_order, start_time,
                                 file_name="report_po.xlsx",
                                 end_time=datetime.datetime.now(),
                                 status=LOG_STATUSES.successful)
                print("Total records: " + str(row_iter))
                write_file(("Total rows:   %s" % row_iter))
                write_file(("Error rows:   %s" % error_rows))
                write_file(("\nError error_vendors: %s" % error_vendors))
            except Exception as e:
                update_admin_log(JOBS.upload_master_data, start_time,
                                 file_name="report_po.xlsx",
                                 end_time=datetime.datetime.now(),
                                 status=LOG_STATUSES.failed,
                                 message=str(e))

        def purchase_orders_history(self):
            start_time = datetime.datetime.now()
            try:
                add_admin_log(JOBS.upload_purchase_order, file_name="report_po_history.xlsx",
                              start_time=start_time)
                file_path = settings.CSV_UPLOAD_DIR + "/report_po_history.xlsx"
                workbook = xlrd.open_workbook(file_path)
                sheet = workbook.sheet_by_index(0)
                row_iter = 0
                error_rows = []
                error_vendors = []
                purchase_orders = []
                outputs = Output.objects.all().values_list(flat=True)
                projects = Project.objects.all().values_list(flat=True)
                operating_units = OperatingUnit.objects.all().values_list(flat=True)
                n = 0
                total_records_inserted = 0
                for row in range(sheet.nrows):
                    if row_iter != 0:
                        operating_unit_iso3 = sheet.cell_value(row, 0)
                        project_id = sheet.cell_value(row, 2)
                        output_id = sheet.cell_value(row, 5)
                        business_unit = sheet.cell_value(row, 6)
                        partner = sheet.cell_value(row, 7)
                        vendor_id = sheet.cell_value(row, 8)
                        vendor_name = sheet.cell_value(row, 9)
                        vendor_classification = sheet.cell_value(row, 10)
                        order_id = sheet.cell_value(row, 11)
                        line_nbr = sheet.cell_value(row, 12)
                        description = sheet.cell_value(row, 13)
                        order_date = sheet.cell_value(row, 14)
                        order_amount = sheet.cell_value(row, 15)
                        try:
                            order_ref = sheet.cell_value(row, 16).encode('ascii', 'ignore')
                        except:
                            order_ref = str(sheet.cell_value(row, 16))

                        order_date_as_datetime = self.process_order_date(order_date, workbook.datemode)

                        try:
                            vendor_obj, created = Vendor.objects \
                                .update_or_create(vendor_id=vendor_id,
                                                  defaults={'name': vendor_name,
                                                            'classification_type': vendor_classification})
                        except Exception as e:
                            vendor_obj = None
                            error_vendors.append(vendor_id)
                        if output_id in outputs:
                            output = output_id
                        else:
                            output = None

                        if project_id in projects:
                            project = project_id
                        else:
                            project = None
                        if output and project:
                            n += 1
                            if operating_unit_iso3 in operating_units:
                                operating_unit = operating_unit_iso3
                            else:
                                operating_unit = None
                            data_dict = {
                                'order_id': order_id,
                                'line_nbr': line_nbr,
                                'project_id': project,
                                'output_id': output,
                                'operating_unit_id': operating_unit,
                                'vendor': vendor_obj,
                                'vendor_name': vendor_name,
                                'order_date': order_date_as_datetime,
                                'ref': order_ref,
                                'business_unit': business_unit,
                                'partner': partner,
                                'description': description,
                                'amount': order_amount
                            }

                            try:

                                purchase_order = PurchaseOrder(**data_dict)
                                purchase_orders.append(purchase_order)
                                if n == BULK_INSERT_LIMIT:
                                    print("Inserting %s records..." % str(n))
                                    total_records_inserted += n
                                    PurchaseOrder.objects.bulk_create(purchase_orders)
                                    purchase_orders = []
                                    n = 0
                            except Exception as e:
                                error_rows.append(e)

                    row_iter += 1
                total_records_inserted += n
                print("Inserting %s records..." % str(n))
                PurchaseOrder.objects.bulk_create(purchase_orders)
                print("Total records inserted: ", total_records_inserted)
                update_admin_log(JOBS.upload_purchase_order, start_time,
                                 file_name="report_po.xlsx",
                                 end_time=datetime.datetime.now(),
                                 status=LOG_STATUSES.successful)
                print("Total records: " + str(row_iter))
                write_file(("Total rows:   %s" % row_iter))
                write_file(("Error rows:   %s" % error_rows))
                write_file(("\nError error_vendors: %s" % error_vendors))
            except Exception as e:
                update_admin_log(JOBS.upload_master_data, start_time,
                                 file_name="report_po_history.xlsx",
                                 end_time=datetime.datetime.now(),
                                 status=LOG_STATUSES.failed,
                                 message=str(e))

        def purchase_orders_old(self):
            import time
            start_time = datetime.datetime.now()
            try:
                add_admin_log(JOBS.upload_purchase_order, file_name="report_po.xlsx",
                              start_time=start_time)
                file_path = settings.CSV_UPLOAD_DIR + "/report_po.xlsx"
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
                        vendor_classification = sheet.cell_value(row, 10)
                        order_id = sheet.cell_value(row, 11)
                        line_nbr = sheet.cell_value(row, 12)
                        description = sheet.cell_value(row, 13)
                        order_date = sheet.cell_value(row, 14)
                        order_amount = sheet.cell_value(row, 15)
                        try:
                            order_ref = sheet.cell_value(row, 16).encode('ascii', 'ignore')
                        except:
                            order_ref = str(sheet.cell_value(row, 16))

                        order_date_as_datetime = self.process_order_date(order_date, workbook.datemode)

                        try:
                            vendor_obj, created = Vendor.objects\
                                .update_or_create(vendor_id=vendor_id,
                                                  defaults={'name': vendor_name,
                                                            'classification_type': vendor_classification})
                        except Exception as e:
                            print(e)
                            vendor_obj = None
                            error_vendors.append(vendor_id)
                        try:
                            output = Output.objects.using(db).get(output_id=output_id)
                        except:
                            output = None
                        try:
                            project = Project.objects.using(db).get(project_id=project_id)
                        except:
                            project = None

                        if output and project:
                            try:
                                operating_unit = OperatingUnit.objects.using(db).get(iso3=operating_unit_iso3)
                            except:
                                operating_unit = None
                            data_dict = {
                                'order_id': order_id,
                                'line_nbr': line_nbr,
                                'project': project,
                                'output': output,
                                'operating_unit': operating_unit,
                                'vendor': vendor_obj,
                                'vendor_name': vendor_name,
                                'order_date': order_date_as_datetime,
                                'ref': order_ref,
                                'business_unit': business_unit,
                                'partner': partner,
                                'description': description,
                                'amount': order_amount
                            }

                            try:
                                purchase_order = PurchaseOrder(**data_dict)
                                purchase_orders.append(purchase_order)
                            except Exception as e:
                                error_rows.append(iter)
                                print(e)

                    row_iter += 1
                total_length = len(purchase_orders)
                n = total_length / BULK_INSERT_LIMIT
                print("total_length: ", total_length)
                print("n: ", n, )
                if n > 1:
                    offset = 0
                    n = int(n) + 1
                    print(" : ", n)
                    for i in range(n):
                        print(i)
                        limit = offset + BULK_INSERT_LIMIT
                        PurchaseOrder.objects.bulk_create(purchase_orders[offset: limit])
                        time.sleep(2)
                        offset = limit
                else:
                    PurchaseOrder.objects.bulk_create(purchase_orders)
                update_admin_log(JOBS.upload_purchase_order, start_time,
                                 file_name="report_po.xlsx",
                                 end_time=datetime.datetime.now(),
                                 status=LOG_STATUSES.successful)
                print("Total records: " + str(row_iter))
                write_file(("Total rows:   %s" % row_iter))
                write_file(("Error rows:   %s" % error_rows))
                write_file(("\nError error_vendors: %s" % error_vendors))
            except Exception as e:
                update_admin_log(JOBS.upload_master_data, start_time,
                                 file_name="report_po.xlsx",
                                 end_time=datetime.datetime.now(),
                                 status=LOG_STATUSES.failed,
                                 message=str(e))

        @staticmethod
        def process_order_date(order_date, workbook_datemode):
            try:
                order_date_as_datetime = datetime.datetime(*xlrd.xldate_as_tuple(order_date, workbook_datemode))
            except:
                try:
                    order_date_as_datetime = datetime.datetime(*xlrd.xldate_as_tuple(float(order_date),
                                                                                     workbook_datemode))
                except:
                    try:
                        order_date_as_datetime = datetime.datetime.strptime(order_date.lower(), "%d-%b-%y")
                    except Exception as e:
                        try:
                            order_date_as_datetime = datetime.datetime.strptime(order_date.lower(), "%Y-%m-%d %H:%M:%S")
                        except:
                            order_date_as_datetime = order_date
            return order_date_as_datetime
