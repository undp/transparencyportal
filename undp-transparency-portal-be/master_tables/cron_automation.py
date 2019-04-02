from django.db.models.query_utils import Q
from django_cron import CronJobBase, Schedule

from undp_admin.models import LOG_STATUSES, JOBS
from undp_admin.utils import add_admin_log, update_admin_log
from utilities import config as settings
from master_tables.models import Bureau, Organisation, Sector, DocumentCategory, \
    Region, OperatingUnit, MapBoundary, Sdg, SdgTargets, SignatureSolution
from undp_outputs.models import Output
from undp_projects.models import Project, ProjectActiveYear
from lxml import etree
from django.conf import settings as main_settings

import os
import re
import sys
import csv
import xlrd
import datetime
from geopy.geocoders import GoogleV3
import json

from utilities.config import UNDP_DONOR_ID

db = main_settings.DB_FOR_WRITE
MASTER_FILES = ['bureau.csv', 'iati_reference_units.csv', 'country_donors.csv',
                'country_iso.csv', 'sectors.csv', 'sdg.csv', 'country_latitude_longitude.csv',
                'world.json', 'world2.json']

MISC_FILES = ['report_donors.csv', 'report_donor_contributions.xlsx', 'report_po.xlsx',
              'country_documents.xlsx']


COUNTRY_COORDINATES = [
    {
        'iso3': 'KOS',
        'latitude': '42.571',
        'longitude': '20.872',
    },
    {
        'iso3': 'PAL',
        'latitude': '32.1',
        'longitude': '35.25',
    },
    {
        'iso3': 'SSD',
        'latitude': '7.37',
        'longitude': '30.34',
    }
]


class MasterTables:

    def do(self):

        start_time = datetime.datetime.now()
        print('Cron Started')
        self.bureau()
        print("Completed Importing Bureau")
        self.region()
        print('Completed Importing Regions')
        self.countries()
        print('Completed Importing Countries iso')
        self.operating_unit()
        print('Completed Importing Operating Unit')
        self.organisation()
        print('Completed Importing Organisation')
        self.sector()
        print('Completed Sectors')
        self.sdg()
        print('Completed SDG')
        self.solutions()
        print("Completed Signature Solutions")
        self.sdg_targets()
        print("Completed SDG Targets")
        self.country_latitude_longitude()
        print('Completed Country Lat & Lon')
        self.map_boundaries()
        print('Completed Map Boundaries')
        end_time = datetime.datetime.now()
        run_time = end_time - start_time
        print('Runtime : ' + str(run_time))
        print('Cron Ended')

    def bureau(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="bureau.csv",
                          start_time=start_time)
            file_path = settings.CSV_UPLOAD_DIR + "/bureau.csv"
            csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')
            i = 1
            for row in csv_object:
                if i != 1:
                    Bureau.objects.using(db).update_or_create(
                        bureau=row[0], code=row[1]
                    )
                i += 1
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="bureau.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="bureau.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    # def region(self):
    #     start_time = datetime.datetime.now()
    #     try:
    #         add_admin_log(JOBS.upload_master_data, file_name="iati_reference_units.xlsx",
    #                       start_time=start_time)
    #         file_path = settings.CSV_UPLOAD_DIR + "/iati_reference_units.xlsx"
    #         workbook = xlrd.open_workbook(file_path)
    #         sheet = workbook.sheet_by_index(0)
    #         row_iter = 0
    #         oth_obj = Bureau.objects.using(db).get(code='GLOBAL')
    #         for row in range(sheet.nrows):
    #             if row_iter != 0:
    #                 bureau = sheet.cell_value(row, 1)
    #                 try:
    #                     bureau_obj = Bureau.objects.using(db).get(code=bureau)
    #                 except Exception as e:
    #                     bureau_obj = oth_obj
    #
    #                 region_code = sheet.cell_value(row, 5)
    #                 region_name = sheet.cell_value(row, 6)
    #
    #                 try:
    #                     Region.objects.using(db).update_or_create(
    #                         region_code=region_code,
    #                         defaults={'name': region_name, 'bureau': bureau_obj}
    #                     )
    #                 except Exception as e:
    #                     print(e)
    #
    #             row_iter += 1
    #         end_time = datetime.datetime.now()
    #         update_admin_log(JOBS.upload_master_data, start_time,
    #                          file_name="iati_reference_units.xlsx",
    #                          end_time=end_time,
    #                          status=LOG_STATUSES.successful)
    #     except Exception as e:
    #         update_admin_log(JOBS.upload_master_data, start_time,
    #                          file_name="iati_reference_units.xlsx",
    #                          end_time=datetime.datetime.now(),
    #                          status=LOG_STATUSES.failed,
    #                          message=str(e))

    # def operating_unit(self):
    #     start_time = datetime.datetime.now()
    #     try:
    #         add_admin_log(JOBS.upload_master_data, file_name="iati_reference_units.xlsx",
    #                       start_time=start_time)
    #         file_path = settings.CSV_UPLOAD_DIR + "/iati_reference_units.xlsx"
    #         workbook = xlrd.open_workbook(file_path)
    #         sheet = workbook.sheet_by_index(0)
    #         row_iter = 0
    #         oth_obj = Bureau.objects.using(db).get(code='GLOBAL')
    #         for row in range(sheet.nrows):
    #             if row_iter != 0:
    #                 bureau = sheet.cell_value(row, 1)
    #                 try:
    #                     bureau_obj = Bureau.objects.using(db).get(code=bureau)
    #                 except Exception as e:
    #                     bureau_obj = oth_obj
    #
    #                 region_code = sheet.cell_value(row, 5)
    #                 try:
    #                     region_obj = Region.objects.using(db).get(region_code=region_code)
    #                 except Exception as e:
    #                     region_obj = None
    #
    #                 name = sheet.cell_value(row, 3)
    #                 iso2 = sheet.cell_value(row, 9)
    #                 iso3 = sheet.cell_value(row, 2)
    #                 unit_type = sheet.cell_value(row, 0)
    #
    #                 defaults = {
    #                     'unit_type': unit_type,
    #                     'bureau': bureau_obj,
    #                     'bureau_local': bureau,
    #                     'name': name,
    #                     'language': sheet.cell_value(row, 4),
    #                     'region': region_obj,
    #                     'iso2': iso2,
    #                     'web': sheet.cell_value(row, 7),
    #                     'email': sheet.cell_value(row, 8),
    #                     'area_type': sheet.cell_value(row, 10),
    #                     'is_recipient': True
    #                 }
    #
    #                 try:
    #                     OperatingUnit.objects.update_or_create(iso3=iso3, defaults=defaults)
    #                 except Exception as e:
    #                     print(e)
    #
    #             row_iter += 1
    #         end_time = datetime.datetime.now()
    #         update_admin_log(JOBS.upload_master_data, start_time,
    #                          file_name="iati_reference_units.xlsx",
    #                          end_time=end_time,
    #                          status=LOG_STATUSES.successful)
    #     except Exception as e:
    #         update_admin_log(JOBS.upload_master_data, start_time,
    #                          file_name="iati_reference_units.xlsx",
    #                          end_time=datetime.datetime.now(),
    #                          status=LOG_STATUSES.failed,
    #                          message=str(e))
    @staticmethod
    def region():
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="iati_reference_units.csv",
                          start_time=start_time)
            file_path = settings.CSV_UPLOAD_DIR + "/iati_reference_units.csv"
            csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')
            i = 0
            oth_obj = Bureau.objects.using(db).get(code='GLOBAL')
            for row in csv_object:
                if i != 1:
                    bureau = row[1]
                    region_code = row[5]
                    region_name = row[6]
                    try:
                        bureau_obj = Bureau.objects.using(db).get(code=bureau)
                    except Exception as e:
                        bureau_obj = oth_obj

                    try:
                        Region.objects.using(db).update_or_create(
                            region_code=region_code,
                            defaults={'name': region_name, 'bureau': bureau_obj}
                        )
                    except Exception as e:
                        print(e)

                i += 1
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="iati_reference_units.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="iati_reference_units.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    @staticmethod
    def operating_unit():
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="iati_reference_units.csv",
                          start_time=start_time)
            file_path = settings.CSV_UPLOAD_DIR + "/iati_reference_units.csv"
            csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')

            i = 1
            oth_obj = Bureau.objects.using(db).get(code='GLOBAL')
            for row in csv_object:
                if i != 1:
                    bureau = row[1]
                    iso3 = row[2]
                    region_code = row[5]
                    try:
                        bureau_obj = Bureau.objects.using(db).get(code=bureau)
                    except Exception as e:
                        bureau_obj = oth_obj
                    try:
                        region_obj = Region.objects.using(db).get(region_code=region_code)
                    except Exception as e:
                        region_obj = None
                    defaults = {
                        'unit_type': row[0],
                        'bureau': bureau_obj,
                        'bureau_local': bureau,
                        'name': row[3],
                        'language': row[4],
                        'region': region_obj,
                        'iso2': row[9],
                        'web': row[7],
                        'email': row[8],
                        'area_type': row[10],
                        'is_recipient': True
                    }

                    try:
                        OperatingUnit.objects.update_or_create(iso3=iso3, defaults=defaults)
                    except Exception as e:
                        print(e)
                i += 1
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="iati_reference_units.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="iati_reference_units.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def organisation(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="country_donors.csv",
                          start_time=start_time)
            organisation_file_path = settings.CSV_UPLOAD_DIR + "/country_donors.csv"
            csv_object = csv.reader(open(organisation_file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')

            i = 1
            for row in csv_object:
                if i != 1:
                    try:
                        operating_unit = OperatingUnit.objects.using(db).get(iso3=row[7])
                        operating_unit.is_donor = True
                        operating_unit.save()
                    except Exception as e:
                        operating_unit = None

                    try:
                        ref_id = row[0].encode('utf-8')
                        level_3_name = row[8].encode('utf-8')
                        type_level_3 = row[7].encode('utf-8')
                        if ref_id == UNDP_DONOR_ID or ref_id == int(UNDP_DONOR_ID):
                            level_3_name = 'UNDP Regular Resources'
                            type_level_3 = 'UNDP'
                        Organisation.objects.update_or_create(
                            ref_id=ref_id,
                            defaults={'short_name': row[1].encode('utf-8'), 'org_name': row[2].encode('utf-8'),
                                      'type_level_1': row[3].encode('utf-8'), 'type_level_2': row[5].encode('utf-8'),
                                      'type_level_3': type_level_3, 'level_3_name': level_3_name,
                                      'operating_unit': operating_unit},
                        )
                    except Exception as e:
                        print(e)
                i += 1
            # Insert XM-DAC-41114
            Organisation.objects.update_or_create(
                ref_id='XM-DAC-41114',
                defaults={'short_name': 'UNDPR', 'org_name': 'United Nations Development Programme'},
            )
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="country_donors.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="country_donors.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def countries(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="country_iso.csv",
                          start_time=start_time)
            countries_file_path = settings.CSV_UPLOAD_DIR + "/country_iso.csv"
            csv_object = csv.reader(open(countries_file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')
            i = 1
            for row in csv_object:
                if i != 1:
                    try:
                        iso_num = str(row[2]).zfill(3)
                        iso3 = str(row[1].replace('\ufeff', ''))
                        name = str(row[0].replace('\ufeff', ''))
                        operating_unit, created = OperatingUnit.objects.using(db).get_or_create(iso3=iso3)
                        operating_unit.iso_num = iso_num
                        if not operating_unit.name:
                            operating_unit.name = name
                        operating_unit.save()
                    except Exception as e:
                        print('Exception')
                        print(e)

                i += 1
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="country_iso.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="country_iso.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def sector(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="sectors.csv",
                          start_time=start_time)
            sector_file_path = settings.CSV_UPLOAD_DIR + "/sectors.csv"
            csv_object = csv.reader(open(sector_file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')
            i = 1
            for row in csv_object:
                if i != 1:
                    try:
                        Sector.objects.update_or_create(
                            code=row[0],
                            defaults={'sector': row[1],
                                      'color': row[2],
                                      'start_year': row[3],
                                      'end_year': row[4],
                                      },
                        )
                    except Exception as e:
                        print(row[0])
                        print(e)
                i += 1
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="sectors.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="sectors.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def solutions(self):
        file_path = settings.CSV_UPLOAD_DIR + "/signature_solutions.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        try:
            for row in range(sheet.nrows):
                if row_iter != 0:
                    sp_id = round(sheet.cell_value(row, 1))
                    sp_output = sheet.cell_value(row, 2)
                    description = sheet.cell_value(row, 3)
                    name = sheet.cell_value(row, 4)
                    result = re.search('..(.*.)..', sp_output)
                    SignatureSolution.objects.update_or_create(
                            sp_output=sp_output,
                            sp_id_id=sp_id,
                            name=name,
                            sp_output_description=description,
                            ss_id=result.group(1)
                        )
                    others_ss = SignatureSolution(sp_output=0, name="Others",
                                                  sp_output_description='Others',
                                                  ss_id=0)
                    others_ss.save()
                row_iter = row_iter + 1

        except Exception as e:
            print(e)

    def sdg(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="sdg.csv",
                          start_time=start_time)
            sdg_file_path = settings.CSV_UPLOAD_DIR + "/sdg.csv"
            csv_object = csv.reader(open(sdg_file_path, 'r', encoding="utf-8"), dialect='excel',
                                    delimiter=',', quotechar='"')
            i = 1
            for row in csv_object:
                if i != 1:
                    try:
                        Sdg.objects.update_or_create(
                            code=row[0],
                            defaults={'name': row[1], 'color': row[2]},
                        )
                    except Exception as e:
                        print(row[0])
                        print(e)

                i += 1
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="sdg.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="sdg.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def sdg_targets(self):
        file_path = settings.CSV_UPLOAD_DIR + "/sdg_target.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        try:
            for row in range(sheet.nrows):
                if row_iter != 0:
                    sdg = sheet.cell_value(row, 0)
                    target_id = sheet.cell_value(row, 2)
                    description = sheet.cell_value(row, 3)
                    SdgTargets.objects.update_or_create(
                        target_id=target_id,
                        sdg_id=round(sdg),
                        description=description,
                    )
                row_iter = row_iter + 1

        except Exception as e:
            print(e)

    def country_latitude_longitude(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_master_data, file_name="country_latitude_longitude.csv",
                          start_time=start_time)
            file_path = settings.CSV_UPLOAD_DIR + "/country_latitude_longitude.csv"
            csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel', delimiter=',',
                                    quotechar='"')
            i = 1
            country_iso3 = []
            for row in csv_object:
                if i != 1:
                    try:
                        country = OperatingUnit.objects.using(db).get(iso3=row[2])
                    except Exception as e:
                        country_iso3.append(row[2])
                        print(e)

                    else:
                        country.latitude = row[4]
                        country.longitude = row[5]
                        country.save()

                i += 1
            for entry in COUNTRY_COORDINATES:
                try:
                    country = OperatingUnit.objects.using(db).get(iso3=entry['iso3'])
                except Exception as e:
                    country_iso3.append(entry['iso3'])
                    print(e)

                else:
                    country.latitude = entry['latitude']
                    country.longitude = entry['longitude']
                    country.save()
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="country_latitude_longitude.csv",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_master_data, start_time,
                             file_name="country_latitude_longitude.csv",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    def map_boundaries(self):
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.upload_map_boundaries, file_name="world.json",
                          start_time=start_time)
            files = ["/world.json", "/world2.json"]
            for file in files:
                file_path = settings.CSV_UPLOAD_DIR + file
                print('Cron Started')
                with open(file_path) as fp:
                    json_data = json.load(fp)

                    for item in json_data:
                        code = item['code']
                        geometry = self.process_geometry(item['geometry'])
                        defaults = {
                            'geometry': geometry
                        }
                        try:
                            MapBoundary.objects.update_or_create(code=code, defaults=defaults)
                        except Exception as e:
                            print(e)
            end_time = datetime.datetime.now()
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
            print('Cron Ended')
            update_admin_log(JOBS.upload_map_boundaries, start_time,
                             file_name="world.json",
                             end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            update_admin_log(JOBS.upload_map_boundaries, start_time,
                             file_name="world.json",
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed,
                             message=str(e))

    @staticmethod
    def process_geometry(input_geometry):
        geometry_type = input_geometry['type']
        if geometry_type == 'Polygon':
            for data in input_geometry['coordinates'][0]:
                data[0], data[1] = data[1], data[0]
        elif geometry_type == 'MultiPolygon':
            for geo in input_geometry['coordinates']:
                for item in geo:
                    for coordinate in item:
                        coordinate[0], coordinate[1] = coordinate[1], coordinate[0]
        return input_geometry

    @staticmethod
    def write_file(content, file='/output_logs.txt'):
        file_path = settings.LOG_UPLOAD_DIR + file
        f = open(file_path, "a+")
        f.write(content)
        f.write("\r\n")
        f.close()
