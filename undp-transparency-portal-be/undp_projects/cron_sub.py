from __future__ import unicode_literals

from undp_outputs.models import OutputSdg
from utilities.utils import *
from undp_projects.utils import processXmlIterObject, getAllOrganisations, getIdFromKey, getRecepientCountry, \
    TEXT_TAGS, RELATED_ACTIVITY_TYPES, TRANSACTION_TYPES, getCurrentYearFromFilePath, SECTOR_VOCABULARY, \
    download_zip_file_from_location, write_to_csv, insert_project_participating_org, insert_project_sdg, \
    process_activity_date_node, update_project_time_line, REGION_VOCABULARY
from undp_projects.models import Project, ProjectParticipatingOrganisations, ProjectActiveYear, \
    ProjectAggregate, SectorAggregate, CountryDocument
from master_tables.models import Organisation, Sector, DocumentCategory, OperatingUnit, Sdg
from lxml import etree
from django.db.models import Sum

import os
import re
import sys
import datetime
import csv
import xlrd


# class CronJob(CronJobBase):
#     RUN_EVERY_MINS = .25  # every 2 hours
#     schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
#     code = 'undp_projects.cron_job'  # a unique code

output_error_dict = []
project_error_dict = []


def save_data_to_model(object_type, obj, current_year):
    if object_type == 'project':
        ProcessProject().process(obj, current_year)
    elif object_type == 'output':
        ProcessOutput().process(obj)


class DataFactory:

    def create_factory_object(self, input_string, obj, current_year=''):
        save_data_to_model(input_string, obj, current_year)


class CronJob:

    def do(self):
        self.generateReports()

    def generateReports(self):
        annual_xml_filepath = settings.ANNUAL_UPLOAD_DIR
        print('Cron Started')
        start_time = datetime.datetime.now()
        file_names = get_filenames(annual_xml_filepath, 'xml')
        try:
            self.processXML(file_names)
        except Exception as e:
            print(e)
        end_time = datetime.datetime.now()
        run_time = end_time - start_time
        print('Runtime : ' + str(run_time))
        print('Cron Ended')

    def processXML(self, file_names):
        for xml_file in file_names:
            tag = 'iati-activity'
            current_year = getCurrentYearFromFilePath(xml_file)
            print(xml_file)
            iter_obj = iter(etree.iterparse(xml_file, tag=tag))
            i = 0
            ProjectActiveYear.objects.filter(year=current_year).delete()
            for event, obj in iter_obj:
                i = i + 1
                # IATI hierarchy used to determine if output or project

                hierarchy = obj.attrib['hierarchy']
                data_factory = DataFactory()
                # if i <= 25:
                if hierarchy == '1':
                    data_factory.create_factory_object('project', obj, current_year)
                elif hierarchy == '2':
                    pass
                    # data_factory.create_factory_object('output', obj)
            print("Year: %s" % str(current_year))
            print("Total records: %s" % str(i))
            if project_error_dict:
                print('Writing project exception to file...')
                write_to_csv(project_error_dict, 'project', current_year)
            if output_error_dict:
                print('Writing output exception to file...')
                write_to_csv(output_error_dict, 'output', current_year)


class ProcessOutput:

    def process(self, obj):
        output_key = processXmlIterObject(obj, {'iati-identifier'}, None, TEXT_TAGS.text)
        # print(output_key)
        output_id = self.get_output_id_from_ref(output_key)
        try:

            output_obj = Output.objects.get(output_id=output_id)
            self.process_sdg_nodes(output_obj, obj.findall('sector'))
            # recipient_country = self.get_recipient_country(output_key, obj)
            # if recipient_country:
            #     output_obj.operating_unit = recipient_country
            #     output_obj.save()
            # print("Output: ", output_id, " : ", recipient_country)
        except Exception as e:
            print("Output: ", output_id)
            print(e)

    @staticmethod
    def get_attrib_from_tag(node, tag, attr):
        value = None
        try:
            value = node.find(tag, '').attrib.get(attr, '')
        except Exception as e:
            pass
        return value

    @staticmethod
    def get_output_id_from_ref(output_key):
        try:
            output_id = output_key['text'].split('OUTPUT')[1].lstrip('-')
        except Exception as e:
            output_id = None
        return output_id

    def get_recipient_country(self, output_key, obj):
        recipient_country = None
        recipient_country_code = self.get_attrib_from_tag(obj, 'recipient-country', 'code')
        try:
            recipient_country = OperatingUnit.objects.get(iso2=recipient_country_code)
        except Exception as e:
            try:
                region_narrative = ''
                region_nodes = obj.findall('recipient-region')
                for region_node in region_nodes:
                    if region_node.attrib.get('vocabulary', '') == str(REGION_VOCABULARY.portal):
                        region_narrative = region_node.find('narrative').text.encode('utf-8')
                        print(region_narrative)
                        break
                if region_narrative:
                    recipient_country = OperatingUnit.objects.get(name=region_narrative)
                    print(output_key, " : ", recipient_country)
            except Exception as e:
                print(e)
                output_error_dict.append({
                    'output_id': output_key,
                    'error_field': 'Recipient Region/Country',
                    'field_key': recipient_country_code
                })
                recipient_country = None

        return recipient_country

    @staticmethod
    def process_sdg_nodes(output, sdg_nodes):
        for node in sdg_nodes:
            sdg_vocabulary = [str(SECTOR_VOCABULARY.sdg7), str(SECTOR_VOCABULARY.sdg8)]
            if node.attrib['vocabulary'] in sdg_vocabulary:
                sdg = Sdg.objects.get(code=node.attrib['code'])
                OutputSdg.objects.update_or_create(output=output, project=output.project, sdg=sdg)


class ProcessProject:

    def process(self, obj, year):
        project_key = processXmlIterObject(obj, {'iati-identifier'}, None, 2)
        project_id = getIdFromKey(project_key['text'])
        try:
            project_obj = Project.objects.get(project_id=project_id)
            self.project_active_years(project_obj, year)
            # recipient_country = getRecepientCountry(obj, project_id)
            # if recipient_country:
            #     project_obj.operating_unit = recipient_country
            #     project_obj.save()
            # insert_project_sdg(project_obj, obj.findall('sector'))
            # participating_org_temp = obj.findall('participating-org')
            # process_activity_date_node(project_obj, obj.findall('activity-date'))
            # insert_project_participating_org(project_obj, participating_org_temp)
            # document_link_obj = obj.findall('document-link')
            # print("Project: ", project_id, " : ", recipient_country)
            # InsertDocumentLinks(document_link_obj, project_obj)
            # InsertResults(obj, project_obj)
        except Exception as e:
            print(e)

    def project_active_years(self, project, year):
        try:

            ProjectActiveYear.objects.update_or_create(
                project=project, year=year,
            )
        except Exception as e:
            print(e)

    @staticmethod
    def get_attrib_from_tag(node, tag, attr):
        value = None
        try:
            value = node.find(tag, '').attrib.get(attr, '')
        except Exception as e:
            pass
        return value
