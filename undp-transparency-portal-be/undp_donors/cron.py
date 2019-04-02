from django.core.exceptions import ObjectDoesNotExist
from django.db.models.aggregates import Sum
from django_cron import CronJobBase, Schedule

from master_tables.models import Organisation, OperatingUnit
from undp_donors.models import DonorFundSplitUp, DonorFundModality, DONOR_CATEGORY_CHOICES
from undp_outputs.models import Output
from undp_projects.models import Project
from utilities import config as settings
import csv
import xlrd
import datetime

from utilities.utils import get_donor_category_value


class CronJob:

    def do(self):
        try:
            print('Cron Started')
            start_time = datetime.datetime.now()
            self.donor_fund_split_up()
            print('Completed Importing Donors Fin Split Up')
            self.donor_fund_modality()
            end_time = datetime.datetime.now()
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
            print('Cron Ended')
        except Exception as e:
            print(e)

    def donor_fund_split_up(self):
        organisation_file_path = settings.CSV_UPLOAD_DIR + "/report_donors.csv"
        csv_object = csv.reader(open(organisation_file_path, 'r', encoding="utf-8"),
                                dialect='excel', delimiter=',', quotechar='"')
        i = 1
        pjt_ids = []
        op_ids = []
        org_ids = []
        row_ids = []
        for row in csv_object:
            if i != 1:
                organisation = None
                project = None
                output = None
                if row[2]:
                    org_id = self.process_org_id(row[2])

                    try:
                        organisation = Organisation.objects.get(ref_id=org_id)
                    except ObjectDoesNotExist:
                        if row[2] not in org_ids:
                            org_ids.append(row[2])
                if row[0]:
                    try:
                        project = Project.objects.get(project_id=row[0])
                    except ObjectDoesNotExist:
                        if row[0] not in pjt_ids:
                            pjt_ids.append(row[0])
                if row[1]:
                    try:
                        output = Output.objects.get(output_id=row[1])
                    except ObjectDoesNotExist:
                        if row[1] not in op_ids:
                            op_ids.append(row[1])
                if organisation and project and output:
                    try:
                        DonorFundSplitUp.objects.update_or_create(
                            organisation=organisation,
                            project=project,
                            output=output,
                            year=row[9].encode('utf-8'),
                            defaults={
                                'budget': float(row[10].encode('utf-8')),
                                'expense': float(row[11].encode('utf-8')),
                            }
                        )
                    except Exception as e:
                        row_ids.append(i)
                        print(e)
            i = i + 1

        self.write_file(("Organisations not found: %s" % org_ids))
        self.write_file(("Projects not found: %s" % pjt_ids))
        self.write_file(("Outputs not found: %s" % op_ids))

    def process_org_id(self, process_org_id):
        length = len(process_org_id)
        if length < 5:
            padding = ''
            for i in range(5 - length):
                padding += '0'
            process_org_id = padding + process_org_id
        return process_org_id

    def donor_fund_modality(self):
        file_path = settings.CSV_UPLOAD_DIR + "/donor_contributions.xls"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        org_ids = []
        for row in range(sheet.nrows):
            if row_iter != 0:
                ref_id = sheet.cell_value(row, 4)
                donor_category = sheet.cell_value(row, 0)
                fund_type = sheet.cell_value(row, 1)
                fund_stream = sheet.cell_value(row, 3)
                year = sheet.cell_value(row, 2)
                contribution = sheet.cell_value(row, 13)
                try:
                    organisation = Organisation.objects.get(ref_id=ref_id)
                except Exception as e:
                    organisation = None

                if organisation is not None:
                    defaults = {
                        'fund_type': fund_type,
                        'contribution': contribution,
                        'donor_category': get_donor_category_value(donor_category),
                    }
                    try:
                        DonorFundModality.objects.update_or_create(organisation=organisation, year=year,
                                                                   fund_stream=fund_stream, defaults=defaults)
                    except Exception as e:
                        print(e)
                else:
                    org_ids.append(ref_id)

            row_iter = row_iter + 1

        if len(org_ids) > 0:
            self.write_file(("Modality Organisations not found: %s" % org_ids))

    def write_file(self, content):
        file_path = settings.LOG_UPLOAD_DIR + "/donors_fin_split_up.txt"
        f = open(file_path, "a+")
        f.write(content)
        f.write("\r\n")
        f.close()

#
# class UpdateDonorBudget:
#     def do(self):
#         try:
#             operating_units = OperatingUnit.objects.all()
#             for op_unit in operating_units:
#                 fund_details = DonorFundSplitUp.objects.filter(organisation__type_level_3=op_unit.iso3)\
#                     .values('year')\
#                     .annotate(total_budget=Sum('budget'), total_expense=Sum('expense'))
#                 for item in fund_details:
#                     OperatingUnitFundAggregate.objects.create(operating_unit=op_unit,
#                                                               year=item['year'],
#                                                               total_budget=item['total_budget'] if
#                                                               item['total_budget'] else 0,
#                                                               total_expense=item['total_expense'] if
#                                                               item['total_expense'] else 0)
#
#         except Exception as e:
#             print(e)
