from django.db.models.query_utils import Q
from django_cron import CronJobBase, Schedule
from utilities import config as settings
from master_tables.models import Bureau, Organisation, Sector, DocumentCategory, \
    Region, OperatingUnit, MapBoundary, Sdg, SdgTargets, SignatureSolution
from undp_outputs.models import Expense
from undp_projects.models import Project, ProjectActiveYear
from lxml import etree

import os
import re
import sys
import csv
import xlrd
import datetime
from geopy.geocoders import GoogleV3
import json


# class MasterTables(CronJobBase):
#     RUN_EVERY_MINS = .25  # every 2 hours
#     schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
#     code = 'master_tables.master_tables'  # a unique code
from utilities.config import UNDP_DONOR_ID


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
        print('Completed SDG Targets')
        self.country_latitude_longitude()
        print('Completed Country Lat & Lon')
        self.map_boundaries()
        print('Completed Map Boundaries')
        end_time = datetime.datetime.now()
        run_time = end_time - start_time
        print('Runtime : ' + str(run_time))
        print('Cron Ended')

    def bureau(self):
        file_path = settings.CSV_UPLOAD_DIR + "/bureau.csv"
        csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel',
                                delimiter=',', quotechar='"')
        iterate = 1
        for row in csv_object:
            if iterate != 1:
                Bureau.objects.update_or_create(
                    bureau=row[0], code=row[1]
                )
            iterate = iterate + 1

    def region(self):
        file_path = settings.CSV_UPLOAD_DIR + "/iati_reference_units.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        oth_obj = Bureau.objects.get(code='GLOBAL')
        for row in range(sheet.nrows):
            if row_iter != 0:
                bureau = sheet.cell_value(row, 1)
                try:
                    bureau_obj = Bureau.objects.get(code=bureau)
                except Exception as e:
                    bureau_obj = oth_obj

                region_code = sheet.cell_value(row, 5)
                region_name = sheet.cell_value(row, 6)

                try:
                    Region.objects.update_or_create(
                        region_code=region_code,
                        defaults={'name': region_name, 'bureau': bureau_obj}
                    )
                except Exception as e:
                    print(e)

            row_iter = row_iter + 1

    def operating_unit(self):
        file_path = settings.CSV_UPLOAD_DIR + "/iati_reference_units.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        oth_obj = Bureau.objects.get(code='GLOBAL')
        for row in range(sheet.nrows):
            if row_iter != 0:
                bureau = sheet.cell_value(row, 1)
                try:
                    bureau_obj = Bureau.objects.get(code=bureau)
                except Exception as e:
                    bureau_obj = oth_obj

                region_code = sheet.cell_value(row, 5)
                try:
                    region_obj = Region.objects.get(region_code=region_code)
                except Exception as e:
                    region_obj = None

                name = sheet.cell_value(row, 3)
                iso2 = sheet.cell_value(row, 9)
                iso3 = sheet.cell_value(row, 2)
                unit_type = sheet.cell_value(row, 0)

                defaults = {
                    'unit_type': unit_type,
                    'bureau': bureau_obj,
                    'bureau_local': bureau,
                    'name': name,
                    'language': sheet.cell_value(row, 4),
                    'region': region_obj,
                    'iso2': iso2,
                    'web': sheet.cell_value(row, 7),
                    'email': sheet.cell_value(row, 8),
                    'area_type': sheet.cell_value(row, 10),
                    'is_recipient': True
                }

                try:
                    OperatingUnit.objects.update_or_create(iso3=iso3, defaults=defaults)
                except Exception as e:
                    print(e)

            row_iter = row_iter + 1

    def organisation(self):
        organisation_file_path = settings.CSV_UPLOAD_DIR + "/country_donors.csv"
        csv_object = csv.reader(open(organisation_file_path, 'r', encoding="utf-8"), dialect='excel',
                                delimiter=',', quotechar='"')

        iter = 1
        for row in csv_object:
            if iter != 1:
                try:
                    operating_unit = OperatingUnit.objects.get(iso3=row[7])
                    operating_unit.is_donor = True
                    operating_unit.save()
                except Exception as e:
                    operating_unit = None

                try:
                    ref_id = row[0].encode('utf-8')
                    level_3_name = row[8].encode('utf-8')
                    type_level_3 = row[7].encode('utf-8')
                    if ref_id == UNDP_DONOR_ID:
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

            iter = iter + 1

        # Insert XM-DAC-41114
        Organisation.objects.update_or_create(
            ref_id='XM-DAC-41114',
            defaults={'short_name': 'UNDPR', 'org_name': 'United Nations Development Programme'},
        )

    def countries(self):
        countries_file_path = settings.CSV_UPLOAD_DIR + "/country_iso.csv"
        csv_object = csv.reader(open(countries_file_path, 'r', encoding="utf-8"), dialect='excel',
                                delimiter=',', quotechar='"')

        iter = 1
        for row in csv_object:
            if iter != 1:
                try:
                    iso3 = str(row[1].replace('\ufeff', ''))
                    name = str(row[0].replace('\ufeff', ''))
                    operating_unit, created = OperatingUnit.objects.get_or_create(iso3=iso3)
                    operating_unit.name = name
                    operating_unit.save()
                except Exception as e:
                    print(e)

            iter = iter + 1

    def sector(self):
        sector_file_path = settings.CSV_UPLOAD_DIR + "/sectors.csv"
        csv_object = csv.reader(open(sector_file_path, 'r', encoding="utf-8"), dialect='excel',
                                delimiter=',', quotechar='"')
        iter = 1
        for row in csv_object:
            if iter != 1:
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

            iter = iter + 1

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
                    SignatureSolution.objects.update_or_create(
                            sp_output=sp_output,
                            sp_id_id=sp_id,
                            name=name,
                            sp_output_description=description,
                        )
                    others_ss = SignatureSolution(sp_output=0, name="Others",
                                                  sp_output_description='Others',
                                                  ss_id=0)
                    others_ss.save()
                row_iter = row_iter + 1

        except Exception as e:
            print(e)

    def sdg(self):
        sdg_file_path = settings.CSV_UPLOAD_DIR + "/sdg.csv"
        csv_object = csv.reader(open(sdg_file_path, 'r', encoding="utf-8"), dialect='excel',
                                delimiter=',', quotechar='"')
        iter = 1
        for row in csv_object:
            if iter != 1:
                try:
                    Sdg.objects.update_or_create(
                        code=row[0],
                        defaults={'name': row[1], 'color': row[2]},
                    )
                except Exception as e:
                    print(row[0])
                    print(e)

            iter = iter + 1

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

    # def document_category(self):
    #     file_path = settings.CSV_UPLOAD_DIR + "/DocumentCategory.xml"
    #     iter_obj = iter(etree.iterparse(file_path, tag='codelist'))
    #     for event, obj in iter_obj:
    #         codelist_items = obj.find('codelist-items')
    #         codelist_items = codelist_items.findall('codelist-item')
    #         for item in codelist_items:
    #             code = item.find('code').text
    #             name = item.find('name')
    #             narrative_items = name.findall('narrative')
    #             iterate = 0
    #             for narrative_item in narrative_items:
    #                 # print(narrative_item.keys())
    #                 if not narrative_item.attrib.get('{http://www.w3.org/XML/1998/namespace}lang', ''):
    #                     code_name = narrative_item.text
    #
    #             DocumentCategory.objects.update_or_create(category=code, defaults={'title': code_name},)

    def country_latitude_longitude(self):
        file_path = settings.CSV_UPLOAD_DIR + "/country_latitude_longitude.csv"
        csv_object = csv.reader(open(file_path, 'r', encoding="utf-8"), dialect='excel', delimiter=',',
                                quotechar='"')
        iter = 1
        country_iso3 = []
        for row in csv_object:
            if iter != 1:
                try:
                    country = OperatingUnit.objects.get(iso3=row[2])
                except Exception as e:
                    country_iso3.append(row[2])
                    print(e)

                else:
                    country.latitude = row[4]
                    country.longitude = row[5]
                    country.save()

            iter = iter + 1

        self.write_file('Missing Countries Iso3: %s' % country_iso3, '/missing_countries.txt')

    def map_boundaries(self):
        file_path = settings.CSV_UPLOAD_DIR + "/world.json"
        start_time = datetime.datetime.now()
        print('Cron Started')
        json_data = json.load(open(file_path))

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


class FetchCountryCoordinates:

    def do(self):
        countries = OperatingUnit.objects.filter(Q(latitude__isnull=True) | Q(longitude__isnull=True))\
            .filter(area_type='country')
        for country in countries[0:2]:

            try:
                country = country.name
                geo_locator = GoogleV3()
                location = geo_locator.geocode(country)
                print(location)
                if location:
                    print(location)
                    if location.latitude:
                        country.latitude = location.latitude
                    if location.longitude:
                        country.longitude = location.longitude
                    country.save()
            except Exception as e:
                print(e)


class MapBoundaryCron:
    def do(self):
        start_time = datetime.datetime.now()
        print('Cron Started')
        files = ["/world.json", "/world2.json"]
        for file in files:
            file_path = settings.CSV_UPLOAD_DIR + file
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
