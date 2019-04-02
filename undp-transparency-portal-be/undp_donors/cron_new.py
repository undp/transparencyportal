"""
Uses report_donors_new.csv which contains the updated data having donor category for 2017,
for donor fund split up.
"""


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

from utilities.config import LOG_UPLOAD_DIR
from utilities.utils import get_donor_category_value


fund_split_errors = []
fund_modality_errors = []


class CronJob:

    def do(self):
        try:
            print('Cron Started')
            start_time = datetime.datetime.now()
            self.donor_fund_split_up()
            print('Completed Importing Donors Fund Split Up')
            self.donor_fund_modality()
            print('Completed Importing Donors Fund Modality')
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
                donor_category = get_donor_category_value(row[11])
                if organisation and project and output:
                    try:
                        DonorFundSplitUp.objects.update_or_create(
                            organisation=organisation,
                            donor_category=donor_category,
                            project=project,
                            output=output,
                            year=row[12].encode('utf-8'),
                            defaults={
                                'budget': float(row[13].encode('utf-8')),
                                'expense': float(row[14].encode('utf-8')),
                            }
                        )
                    except Exception as e:
                        row_ids.append(i)
                        print(e)
                else:
                    if organisation is None:
                        fund_split_errors.append({
                            'object_type': 'organisation',
                            'ref_id': self.process_org_id(row[2]),
                            'project_id': row[0],
                            'output_id': row[1],
                            'year': row[12]
                        })
                    if project is None:
                        fund_split_errors.append({
                            'object_type': 'project',
                            'ref_id': self.process_org_id(row[2]),
                            'project_id': row[0],
                            'output_id': row[1],
                            'year': row[12]
                        })
                    if project is None:
                        fund_split_errors.append({
                            'object_type': 'output',
                            'ref_id': self.process_org_id(row[2]),
                            'project_id': row[0],
                            'output_id': row[1],
                            'year': row[12]
                        })

            i = i + 1
        print("Total records: %s" % str(i - 1))
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
                    if organisation is None:
                        fund_modality_errors.append({
                            'object_type': 'organisation',
                            'ref_id': ref_id,
                            'year': year,
                            'fund_type': fund_type,
                            'contribution': contribution,
                        })

            row_iter = row_iter + 1

        if len(org_ids) > 0:
            self.write_file(("Modality Organisations not found: %s" % org_ids))
        print("Total records: %s" % str(row_iter))

    def write_file(self, content):
        file_path = settings.LOG_UPLOAD_DIR + "/donors_fin_split_up.txt"
        f = open(file_path, "a")
        f.write(content)
        f.write("\r\n")
        f.close()


def write_to_csv(input_json, object_type, current_year):
    import csv

    if object_type == 'fund_split':
        file_name = 'fund_split.csv'
    else:
        file_name = 'fund_modality.csv'
    file_path = LOG_UPLOAD_DIR + "/" + file_name
    print(input_json)
    with open(file_path, 'a', newline="") as csvfile:
        csv_writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
        header = [key for key, value in input_json[0].items()]
        csv_writer.writerow(header)
        for item in input_json[1:]:
            row = [v for k, v in item.items()]
            csv_writer.writerow(row)
