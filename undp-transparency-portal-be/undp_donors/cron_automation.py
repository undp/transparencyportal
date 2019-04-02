"""
Uses report_donors_new.csv which contains the updated data having donor category for 2017,
for donor fund split up.
"""
from django.conf import settings as main_settings
from django.core.exceptions import ObjectDoesNotExist
from django.db.models.aggregates import Sum
from django_cron import CronJobBase, Schedule

from master_tables.models import Organisation, OperatingUnit
from undp_admin.models import JOBS, LOG_STATUSES
from undp_admin.utils import add_admin_log, update_admin_log
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
db = main_settings.DB_FOR_WRITE


class CronJob:

    def do(self):
        try:
            print('Cron Started')
            start_time = datetime.datetime.now()
            self.donor_fund_split_up()
            print('Completed Importing Donors Fund Split Up')
            self.donor_fund_modality()
            print('Completed Importing Donors Fund Modality')
            write_to_csv(fund_split_errors, 'fund_split')
            write_to_csv(fund_modality_errors, 'fund_modality')
            end_time = datetime.datetime.now()
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
            print('Cron Ended')
        except Exception as e:
            print(e)

    def donor_fund_split_up(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.parse_donors_data, file_name="report_donors.csv",
                          start_time=start_time)
            print("Donor fund split up")
            organisation_file_path = settings.CSV_UPLOAD_DIR + "/report_donors.csv"
            donor_funds = []
            with open(organisation_file_path, 'r', encoding="utf-8") as outfile:
                csv_object = csv.reader(outfile, dialect='excel', delimiter=',', quotechar='"')
                i = 1
                pjt_ids = []
                op_ids = []
                org_ids = []
                row_ids = []
                for row in csv_object:
                    year = row[12]

                    if i != 1 and year not in [2011, '2011']:
                        organisation = None
                        project = None
                        output = None
                        if row[2]:
                            if row[2] == '005510' or row[2] == '05510' or row[2] == '5510':
                                print((row[2]))
                                print(type(row[2]))
                            # org_id = self.process_org_id(row[2])
                            org_id = row[2]
                            try:
                                organisation = Organisation.objects.using(db).get(ref_id=org_id)
                            except ObjectDoesNotExist:
                                if row[2] not in org_ids:
                                    org_ids.append(row[2])
                        if row[0]:
                            try:
                                project = Project.objects.using(db).get(project_id=row[0])
                            except ObjectDoesNotExist:
                                if row[0] not in pjt_ids:
                                    pjt_ids.append(row[0])
                        if row[1]:
                            try:
                                output = Output.objects.using(db).get(output_id=row[1])
                            except ObjectDoesNotExist:
                                if row[1] not in op_ids:
                                    op_ids.append(row[1])
                        donor_category = get_donor_category_value(row[11])
                        if organisation and project and output:
                            try:
                                data_dict = {
                                    'organisation': organisation,
                                    'donor_category': donor_category,
                                    'project': project,
                                    'output': output,
                                    'year': year.encode('utf-8'),
                                    'budget': float(row[13].encode('utf-8')),
                                    'expense': float(row[14].encode('utf-8')),
                                }
                                donor_funds.append(DonorFundSplitUp(**data_dict))

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
                                    'year': year
                                })
                            if project is None:
                                fund_split_errors.append({
                                    'object_type': 'project',
                                    'ref_id': self.process_org_id(row[2]),
                                    'project_id': row[0],
                                    'output_id': row[1],
                                    'year': year
                                })
                            if output is None:
                                fund_split_errors.append({
                                    'object_type': 'output',
                                    'ref_id': self.process_org_id(row[2]),
                                    'project_id': row[0],
                                    'output_id': row[1],
                                    'year': year
                                })
                    i += 1
            DonorFundSplitUp.objects.bulk_create(donor_funds)
            update_admin_log(JOBS.parse_donors_data, start_time,
                             file_name="report_donors.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.successful)
            print("Total records: %s" % str(i - 1))
        except Exception as e:
            update_admin_log(JOBS.parse_donors_data, start_time,
                             file_name="report_donors.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))
            # self.write_file(("Organisations not found: %s" % org_ids))
            # self.write_file(("Projects not found: %s" % pjt_ids))
            # self.write_file(("Outputs not found: %s" % op_ids))

    def process_org_id(self, process_org_id):
        length = len(process_org_id)
        if length < 5:
            padding = ''
            for i in range(5 - length):
                padding += '0'
            process_org_id = padding + process_org_id
        return process_org_id

    def donor_fund_modality(self):
        print("Donor fund modality")
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.parse_donors_data, file_name="report_donor_contributions.xlsx",
                          start_time=start_time)
            file_path = settings.CSV_UPLOAD_DIR + "/report_donor_contributions.xlsx"
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
                        organisation = Organisation.objects.using(db).get(ref_id=ref_id)
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

                row_iter += 1
            del workbook
            update_admin_log(JOBS.parse_donors_data, start_time,
                             file_name="report_donor_contributions.xlsx",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.successful)
            if len(org_ids) > 0:
                self.write_file(("Modality Organisations not found: %s" % org_ids))
            print("Total records: %s" % str(row_iter))
        except Exception as e:
            update_admin_log(JOBS.parse_donors_data, start_time,
                             file_name="report_donor_contributions.xlsx",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def write_file(self, content):
        file_path = settings.LOG_UPLOAD_DIR + "/donors_fin_split_up.txt"
        f = open(file_path, "w+")
        f.write(content)
        f.write("\r\n")
        f.close()


def write_to_csv(input_json, object_type):
    import csv
    try:
        if object_type == 'fund_split':
            file_name = 'fund_split.csv'
        else:
            file_name = 'fund_modality.csv'
        file_path = LOG_UPLOAD_DIR + "/" + file_name
        with open(file_path, 'w', newline="") as csvfile:
            csv_writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
            header = [key for key, value in input_json[0].items()]
            csv_writer.writerow(header)
            for item in input_json[1:]:
                row = [v for k, v in item.items()]
                csv_writer.writerow(row)
    except:
        pass
