import subprocess
import os

from django.core import management
from django.core.management.commands import loaddata, flush

from master_tables.cron_automation import MasterTables
from undp_admin.models import JOBS, LOG_STATUSES, AdminLog
from undp_admin.utils import add_admin_log, update_admin_log
from undp_donors.cron_automation import CronJob as DonorCronJob
from undp_extra_features.cron_automation import ProjectYearSummaryCron
from undp_projects.cron_automation import CronJob as ProjectCronJob, UploadCountryDocuments, UpdateSearchModel, \
    DownloadXmlCron
import datetime
import simplejson
import csv
from django.conf import settings as main_settings

from undp_purchase_orders.cron_automation import PurchaseOrderCron
import xlrd
from utilities import config as settings
from master_tables.models import SignatureSolution, OperatingUnit, ProjectTimeLine, SdgTargets
from undp_outputs.models import Output, MARKER_TYPE_CHOICES, MARKER_PARENT_CHOICES, ProjectMarker, StoryMap
from undp_projects.models import SDGSunburst, ProjectTarget, SDGMap, Project
from django.conf import settings as main_settings
from utilities.config import SDG_START_YEAR
from utilities.utils import get_sdg_sunburst, get_filenames
from undp_projects.api_views import get_map_data

db = main_settings.DB_FOR_WRITE
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))


class Automation:

    def do(self):
        print('Automation process has been inititated...')
        start_time = datetime.datetime.now()
        AdminLog.objects.using(main_settings.DB_FOR_READ)\
            .filter(status=LOG_STATUSES.in_progress)\
            .update(status=LOG_STATUSES.successful)

        add_admin_log(JOBS.initiate_automation, file_name="",
                      start_time=start_time)
        self.truncate_models()
        self.download_xmls()
        self.upload_initial_data()
        self.parse_xmls()
        self.output_signature_solution()  # Mapping Signature Solution to Output
        self.project_markers()
        self.upload_donor_data()
        self.upload_misc_data()
        self.load_sdg_data()
        self.load_sdg_map_data()
        self.cache_script()
        self.story_map_data()
        end_time = datetime.datetime.now()
        run_time = end_time - start_time
        update_admin_log(JOBS.initiate_automation, start_time,
                         file_name="",
                         end_time=end_time,
                         status=LOG_STATUSES.successful)
        self.switch_database()

        self.restart_server()

        print('Automation time : ' + str(run_time))

        print('Process has been completed successfully')

    def download_xmls(self):
        DownloadXmlCron().do()

    def upload_initial_data(self):
        print("Loading master data..")
        management.call_command(loaddata.Command(), 'timeline.json', verbosity=0, database=db)
        management.call_command(loaddata.Command(), 'document_categories.json', verbosity=0, database=db)
        management.call_command(loaddata.Command(), 'sdg_color.json', verbosity=0, database=db)
        MasterTables().do()

    def parse_xmls(self):
        print("Processing XMLs..")
        ProjectCronJob().do()

    def upload_donor_data(self):
        print("Loading donors data..")
        DonorCronJob().do()

    def upload_misc_data(self):
        print("Loading misc data..")
        ProjectYearSummaryCron().do()
        UpdateSearchModel().do()
        UploadCountryDocuments().do()
        PurchaseOrderCron().do()

    def truncate_models(self):
        from django.db import connections
        print("Truncating models")
        cursor = connections[db].cursor()
        cursor.execute("TRUNCATE TABLE master_tables_operatingunit cascade")
        cursor.execute("TRUNCATE TABLE master_tables_sector cascade")
        cursor.execute("TRUNCATE TABLE master_tables_sdg cascade")
        cursor.execute("TRUNCATE TABLE master_tables_region cascade")
        cursor.execute("TRUNCATE TABLE master_tables_organisation cascade")
        cursor.execute("TRUNCATE TABLE undp_projects_project cascade")
        cursor.execute("TRUNCATE TABLE undp_outputs_output cascade")
        cursor.execute("TRUNCATE TABLE master_tables_signaturesolution cascade")
        cursor.execute("TRUNCATE TABLE undp_purchase_orders_purchaseorder")
        cursor.execute("TRUNCATE TABLE undp_projects_countrydocument")
        cursor.execute("TRUNCATE TABLE undp_donors_donorfundsplitup")
        cursor.execute("TRUNCATE TABLE undp_donors_donorfundmodality")
        cursor.execute("TRUNCATE TABLE undp_extra_features_projectyearsummary")
        cursor.execute("TRUNCATE TABLE undp_projects_projectsearch")
        cursor.execute("TRUNCATE TABLE undp_projects_sdgsunburst")
        print("Models Truncated")

    # def switch_database(self):
    #     import configparser
    #     config = configparser.ConfigParser()
    #     config['database'] = {}
    #
    #     read_db = main_settings.DB_FOR_READ
    #     write_db = main_settings.DB_FOR_WRITE
    #     if read_db == 'mirror1' and write_db == 'mirror2':
    #         change_local_settings('config.ini', 'config_mirror.ini')
    #     elif read_db == 'mirror2' and write_db == 'mirror1':
    #         change_local_settings('config_mirror.ini', 'config.ini')
    #     print("DB switched")

    def switch_database(self):
        import configparser
        print("Switching DB..")
        config = configparser.ConfigParser()
        config['database'] = {}
        config['default'] = {}
        config['action'] = {}
        read_db = main_settings.DB_FOR_READ
        write_db = main_settings.DB_FOR_WRITE
        config_path = main_settings.CONFIG_PATH
        if read_db == 'mirror1' and write_db == 'mirror2':
            config['action']['db_for_read'] = 'mirror2'
            config['action']['db_for_write'] = 'mirror1'
        elif read_db == 'mirror2' and write_db == 'mirror1':
            config['action']['db_for_read'] = 'mirror1'
            config['action']['db_for_write'] = 'mirror2'
        config['default']['MIRROR1'] = 'mirror1'
        config['default']['MIRROR2'] = 'mirror2'
        config['database']['MIRROR1'] = 'mirror1'
        config['database']['MIRROR2'] = 'mirror2'
        with open(config_path, 'w') as configfile:
            config.write(configfile)

        # update wsgi file to restart server, removed on switching to nginx
        # WSGI_PATH = main_settings.BASE_DIR + '/wsgi.py'
        #
        # with open(WSGI_PATH, 'rb+') as wsgi_file:
        #     wsgi_file.seek(-1, 2)
        #     wsgi_file.write(b'\n')
        print("DB switched")

    def restart_server(self):
        import os
        BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
        script_file_path = BASE_DIR + '/undp_transparency/settings/restart_server.py'
        if os.path.exists(script_file_path):
            os.system("python %s" % script_file_path)
        else:
            print("Server restart script not found")

    def output_signature_solution(self):
        # Mapping SS to Output

        file_path = settings.CSV_UPLOAD_DIR + "/report_markers.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        try:
            for row in range(sheet.nrows):
                if row_iter != 0:
                    output_id = (sheet.cell_value(row, 4))
                    ss_id = sheet.cell_value(row, 6)
                    if ss_id != 'NOT_APPLICABLE':
                        ss_id = ss_id.replace('OUTPUT_', '')
                        try:
                            ss = SignatureSolution.objects.using(db).get(sp_output=ss_id)
                            if ss:
                                Output.objects.using(db).filter(pk=output_id).update(signature_solution=ss)
                        except Exception:
                            pass
                row_iter = row_iter + 1

        except Exception as e:
            pass

    def load_sdg_data(self):
        import simplejson
        year = ProjectTimeLine.objects.using(db).filter(year__gte=SDG_START_YEAR).order_by('year')\
                .values_list('year', flat=True)
        for sdg_year in list(year):
            try:
                response = get_sdg_sunburst(year=sdg_year)
                if response:
                    SDGSunburst.objects.using(db).update_or_create(sdg_year=sdg_year,
                                                                   response=simplejson.dumps(response))
            except Exception as e:
                pass

    def load_sdg_map_data(self):
        year = ProjectTimeLine.objects.using(db).filter(year__gte=SDG_START_YEAR).order_by('year') \
            .values_list('year', flat=True)
        sdgs = SdgTargets.objects.values_list('sdg', flat=True).distinct('sdg').order_by('sdg')
        targets = SdgTargets.objects.values_list('target_id', flat=True).distinct('target_id').order_by('target_id')
        print("Loading SDG Data")
        for sdg_year in year:
            for sdg in sdgs:
                try:
                    sdg_response = get_map_data(year=sdg_year, sdg=sdg)
                    if sdg_response:
                        SDGMap.objects.using(db).update_or_create(year=sdg_year,
                                                                  sdg=sdg,
                                                                  response=simplejson.dumps(sdg_response))
                except Exception as e:
                    pass
        print("Loading SDG Target Data")
        for sdg_year in year:
            for target in targets:
                try:
                    target_response = get_map_data(year=sdg_year, sdg_target=target)
                    if target_response:
                        SDGMap.objects.using(db).update_or_create(year=sdg_year,
                                                                  sdg=target,
                                                                  response=simplejson.dumps(target_response))
                except Exception as e:
                    pass

    def project_markers(self):
        file_path = settings.CSV_UPLOAD_DIR + "/report_markers.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        try:
            for row in range(sheet.nrows):
                if row_iter != 0:
                    try:
                        output = sheet.cell_value(row, 4)
                        type = getattr(MARKER_TYPE_CHOICES, sheet.cell_value(row, 7))
                        parent_type = round(sheet.cell_value(row, 8))
                        parent_marker_desc = sheet.cell_value(row, 10)
                        marker_id = sheet.cell_value(row, 11)
                        marker_title = sheet.cell_value(row, 12)
                        marker_desc = sheet.cell_value(row, 13)
                        level_two_marker_id = 0 if sheet.cell_value(row, 14) is '' else sheet.cell_value(row, 14)
                        level_two_marker_title = sheet.cell_value(row, 15)
                        level_two_marker_description = sheet.cell_value(row, 16)
                        iso3 = sheet.cell_value(row, 20)

                        if type == MARKER_TYPE_CHOICES.ssc_marker:
                            level_two_marker_title = OperatingUnit.objects.get(iso3=iso3).name
                            level_two_marker_description = OperatingUnit.objects.get(iso3=iso3).name

                        try:
                            op = Output.objects.using(db).get(output_id=output)
                            if op:
                                ProjectMarker.objects.using(db).update_or_create(
                                    output=op,
                                    type=type,
                                    parent_type=parent_type,
                                    parent_marker_desc=parent_marker_desc,
                                    marker_id=marker_id,
                                    marker_title=marker_title,
                                    marker_desc=marker_desc,
                                    level_two_marker_id=level_two_marker_id,
                                    level_two_marker_title=level_two_marker_title,
                                    level_two_marker_description=level_two_marker_description
                                )

                        except Exception as e:
                            pass
                    except Exception as e:
                        pass
                row_iter = row_iter + 1

        except Exception as e:
            print(e)

    def cache_script(self):
        subprocess.call(BASE_DIR + '/cache.sh')

    def story_map_data(self):
        file_path = settings.CSV_UPLOAD_DIR + "/report_storymaps.csv"
        csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel',
                                delimiter=',', quotechar='"')
        i = 1
        try:
            for row in csv_object:
                if i != 1:
                    iso3 = row[0]
                    location_name = row[1]
                    project_id = row[2]
                    output_id = row[3]
                    map_link = row[4]
                    try:
                        operating_unit = OperatingUnit.objects.using(db).get(iso3=iso3)
                        output = Output.objects.using(db).get(output_id=output_id)
                        project = Project.objects.using(db).get(project_id=project_id)
                        StoryMap.objects.using(db).update_or_create(
                            operating_unit=operating_unit,
                            location=location_name,
                            project=project,
                            output=output,
                            link=map_link
                        )
                    except Exception as e:
                        print(e)
                        pass
                i += 1
        except Exception as e:
            print(e)
