from sys import exit

from django.conf import settings as main_settings
from django.contrib.postgres.search import SearchVector
from django.db import transaction
from django_cron import CronJobBase, Schedule

from undp_admin.models import JOBS, LOG_STATUSES
from undp_admin.utils import add_admin_log, update_admin_log
from undp_outputs.models import Output, OutputParticipatingOrganisation, OutputLocation, OutputSector, Budget, \
    OutputTransaction, OutputResult, OutputResultPeriod, CountryBudget, CountryBudgetItem, \
    Expense, ActivityDate, OutputSdg, OutputActiveYear, OutputTarget
from utilities.konstants import LOG_TYPE
from utilities.utils import *
from undp_projects.utils import processXmlIterObject, getAllOrganisations, getIdFromKey, getRecepientCountry, \
    TEXT_TAGS, RELATED_ACTIVITY_TYPES, TRANSACTION_TYPES, getCurrentYearFromFilePath, SECTOR_VOCABULARY, \
    InsertDocumentLinks, InsertResults, write_file, save_log, download_file_from_location, \
    download_zip_file_from_location, write_to_csv, insert_project_participating_org, insert_project_sdg, \
    process_activity_date_node, update_project_time_line, REGION_VOCABULARY
from undp_projects.models import Project, ProjectParticipatingOrganisations, ProjectActiveYear, \
    ProjectAggregate, SectorAggregate, CountryDocument, ProjectSearch
from master_tables.models import Organisation, Sector, DocumentCategory, OperatingUnit, Sdg, SdgTargets
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
db = main_settings.DB_FOR_WRITE


def save_data_to_model(object_type, obj, current_year):
    if object_type == 'project':
        ProcessProject().process(obj, current_year)
    elif object_type == 'output':
        ProcessOutput().process(obj, current_year)


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
        file_names = sorted(get_filenames(annual_xml_filepath, 'xml'))
        print("Files to be uploaded: ")
        print(file_names)
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
            start_time = datetime.datetime.now()
            add_admin_log(JOBS.parse_projects_outputs, file_name=xml_file,
                          start_time=start_time)
            tag = 'iati-activity'
            current_year = getCurrentYearFromFilePath(xml_file)
            print("Year: ", current_year)
            iter_obj = iter(etree.iterparse(xml_file, tag=tag))
            i = 0
            OutputActiveYear.objects.using(db).filter(year=current_year).delete()
            ProjectActiveYear.objects.using(db).filter(year=current_year).delete()
            for event, obj in iter_obj:
                # IATI hierarchy used to determine if output or project
                if i % 500 == 0 or i == 0:
                    print("processing...")
                i = i + 1
                hierarchy = obj.attrib['hierarchy']
                data_factory = DataFactory()
                if hierarchy == '1':
                    data_factory.create_factory_object('project', obj, current_year)
                elif hierarchy == '2':
                    data_factory.create_factory_object('output', obj, current_year)
                obj.clear()
            update_admin_log(JOBS.parse_projects_outputs, start_time,
                             file_name=xml_file,
                             end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.successful)
            print("Updating project time line")
            update_project_time_line(current_year)
            print("Year: %s" % str(current_year))
            print("Total records: %s" % str(i))
            if project_error_dict:
                print('Writing project exception to file...')
                write_to_csv(project_error_dict, 'project', current_year)
            if output_error_dict:
                print('Writing output exception to file...')
                write_to_csv(output_error_dict, 'output', current_year)

    def write_file(self, content):
        file_path = settings.CSV_UPLOAD_DIR + "/missed.txt"
        f = open(file_path, "a+")
        f.write(content)
        f.write("\r\n")
        f.close()


class ProcessOutput:

    def process(self, obj, year):
        output_key = processXmlIterObject(obj, {'iati-identifier'}, None, TEXT_TAGS.text)
        # print(output_key)
        reporting_org_ref = self.get_attrib_from_tag(obj, 'reporting-org', 'ref')
        try:
            reporting_org = Organisation.objects.using(db).get(ref_id=reporting_org_ref)
        except Exception as e:
            output_error_dict.append({
                'output_id': output_key,
                'error_field': 'Reporting Org',
                'field_key': reporting_org_ref
            })
            reporting_org = ''
        recipient_country = self.get_recipient_country(output_key, obj)
        try:
            capital_spend = float(self.get_attrib_from_tag(obj, 'capital-spend', 'percentage'))
        except Exception as e:
            capital_spend = '0.0'
        contact_email = contact_website = ''
        try:
            contact_info = self.process_node(obj.find('contact-info'))[1]
        except Exception as e:
            contact_info = None
        if contact_info is not None:
            contact_email = contact_info.get('email', '')
            contact_website = contact_info.get('website', '')

        project = self.get_project_from_related_activity(obj.findall('related-activity'))
        output_id = self.get_output_id_from_ref(output_key)
        crs_code = self.get_crs_code(obj.findall('sector'))
        parsed_data = {
            'project': project,
            'organisation': reporting_org,
            'title': processXmlIterObject(obj, {'title'}, None, TEXT_TAGS.narrative).get('text', ''),
            'description': processXmlIterObject(obj, {'description'}, None, TEXT_TAGS.narrative).get('text', ''),
            'activity_status': self.get_attrib_from_tag(obj, 'activity-status', 'code'),
            'activity_scope': self.get_attrib_from_tag(obj, 'activity-scope', 'code'),
            'contact_email': contact_email,
            'contact_website': contact_website,
            'operating_unit': recipient_country,
            'policy_marker_vocabulary': self.get_attrib_from_tag(obj, 'policy-marker', 'vocabulary'),
            'policy_marker_code': self.get_attrib_from_tag(obj, 'policy-marker', 'code'),
            'policy_marker_significance': self.get_attrib_from_tag(obj, 'policy-marker', 'significance'),
            'collaboration_type': self.get_attrib_from_tag(obj, 'collaboration-type', 'code'),
            'default_flow_type': self.get_attrib_from_tag(obj, 'default-flow-type', 'code'),
            'default_finance_type': self.get_attrib_from_tag(obj, 'default-finance-type', 'code'),
            'default_aid_type': self.get_attrib_from_tag(obj, 'default-aid-type', 'code'),
            'default_tied_status': self.get_attrib_from_tag(obj, 'default-tied-status', 'code'),
            'capital_spend': capital_spend,
            'conditions_attached': self.get_attrib_from_tag(obj, 'conditions', 'attached'),
            'crs_code': crs_code
        }
        field_key = ''
        try:
            with transaction.atomic(using=db):
                field_key = 'output'
                output, created = Output.objects.update_or_create(
                    output_id=output_id,
                    defaults=parsed_data,
                )
                field_key = 'active year'
                self.output_active_years(output, year)
                self.process_participating_orgs_nodes(output, obj.findall('participating-org'))
                field_key = 'location node'
                self.process_location_node(output, obj.findall('location', ''))
                field_key = 'sector node'
                self.process_sector_nodes(output, obj.findall('sector'))
                field_key = 'sdg nodes'
                self.process_sdg_nodes(output, obj.findall('sector'), year)
                self.process_country_budget_items_node(output, obj.find('country-budget-items'))
                self.process_budget_nodes(output, project, obj.findall('budget'))
                self.process_transaction_nodes(output, obj.findall('transaction'))
                field_key = 'results node'
                self.process_results_node(output, obj.find('result', ''))
                field_key = 'activity date'
                self.process_activity_date_node(output, obj.findall('activity-date'))

        except Exception as e:
            print(e)
            output_error_dict.append({
                'output_id': output_id,
                'error_field': field_key,
                'field_key': (e.args[0])
            })

    def process_node(self, node):
        if node.text is None and len(node.attrib):
            return node.tag, node.attrib
        return node.tag, dict(map(self.process_node, node)) or node.text

    @staticmethod
    def output_active_years(output, year):
        try:
            OutputActiveYear.objects.update_or_create(
                output=output, year=int(year),
            )
        except Exception as e:
            output_error_dict.append({
                'output_id': output.output_id,
                'error_field': 'active year',
                'field_key': (e.args[0])
            })

    @staticmethod
    def get_attrib_from_tag(node, tag, attr):
        value = None
        try:
            value = node.find(tag, '').attrib.get(attr, '')
        except Exception as e:
            pass
        return value

    @staticmethod
    def get_crs_code(sector_nodes):
        for node in sector_nodes:
            if node.attrib['vocabulary'] == str(SECTOR_VOCABULARY.crs):
                return node.attrib['code']
        return ''

    def get_recipient_country(self, output_key, obj):
        recipient_country = None
        recipient_country_code = self.get_attrib_from_tag(obj, 'recipient-country', 'code')
        try:
            recipient_country = OperatingUnit.objects.using(db).get(iso2=recipient_country_code)
        except Exception as e:
            try:
                region_narrative = ''
                region_nodes = obj.findall('recipient-region')
                for region_node in region_nodes:
                    if region_node.attrib.get('vocabulary', '') == str(REGION_VOCABULARY.portal):
                        region_narrative = region_node.find('narrative').text.encode('utf-8')
                        break
                if region_narrative:
                    recipient_country = OperatingUnit.objects.using(db).get(name=region_narrative)
            except Exception as e:
                output_error_dict.append({
                    'output_id': output_key,
                    'error_field': 'Recipient Region/Country',
                    'field_key': recipient_country_code
                })
                recipient_country = None
        return recipient_country

    @staticmethod
    def get_project_from_related_activity(related_activity_nodes):
        project_ref = ''
        for node in related_activity_nodes:
            if node.attrib.get('type', '') == str(RELATED_ACTIVITY_TYPES.project):
                project_ref = node.attrib.get('ref', '')
                break
        try:

            project_id = project_ref.split('PROJECT-')[1].strip()
            project = Project.objects.using(db).get(project_id=project_id)
        except Exception as e:
            project = None
        return project

    @staticmethod
    def get_output_id_from_ref(output_key):
        try:
            output_id = output_key['text'].split('OUTPUT')[1].lstrip('-')
        except Exception as e:
            output_id = None
        return output_id

    @staticmethod
    def process_location_node(output, location_nodes):
        for location_node in location_nodes:
            try:
                ref = location_node.attrib.get('ref', '')
                operating_unit = OperatingUnit.objects.using(db).get(iso2=ref)
            except Exception as e:
                operating_unit = None
            try:
                pos = location_node.find('point').find('pos').text if location_node.find('point') is not None else ''
                latitude = pos.strip().split()[0]
                longitude = pos.strip().split()[1]
            except Exception as e:
                latitude = longitude = ''
            try:
                location_code = location_node.find('location-id').attrib.get('code', '') \
                    if location_node.find('location-id') is not None else ''
            except Exception as e:
                location_code = ''
            try:
                location_reach = location_node.find('location-reach').attrib.get('code', '')\
                    if location_node.find('location-reach') is not None else ''
            except:
                location_reach = ''
            try:
                activity_description = location_node.find('activity-description').find('narrative').text \
                    if location_node.find('activity-description') is not None else ''
            except:
                activity_description = ''

            location = {
                'location_vocabulary': location_node.find('location-id').attrib.get('vocabulary', '')
                if location_node.find('location-id') is not None else '',
                'name': location_node.find('name').find('narrative').text
                if location_node.find('name') is not None else '',
                'description': location_node.find('description').find('narrative').text
                if location_node.find('description') is not None else '',
                'administrative_level': location_node.find('administrative').attrib.get('level', '')
                if location_node.find('administrative') is not None else '',
                'administrative_code': location_node.find('administrative').attrib.get('code', '')
                if location_node.find('administrative') is not None else '',
                'administrative_vocabulary': location_node.find('administrative').attrib.get('vocabulary', '')
                if location_node.find('administrative') is not None else '',
                'srs_name': location_node.find('point').attrib.get('srsName', '')
                if location_node.find('point', None) is not None else '',
                'exactness': location_node.find('exactness').attrib.get('code', '')
                if location_node.find('exactness') is not None else '',
                'location_class': location_node.find('location-class').attrib.get('code', '')
                if location_node.find('location-class') is not None else '',
                'feature_designation': location_node.find('feature-designation').attrib.get('code', '')
                if location_node.find('feature-designation') is not None else ''
            }
            OutputLocation.objects.update_or_create(output=output, project=output.project,
                                                    operating_unit=operating_unit,
                                                    location_reach=location_reach,
                                                    activity_description=activity_description,
                                                    latitude=latitude,
                                                    longitude=longitude,
                                                    location_code=location_code, defaults=location)

    @staticmethod
    def process_participating_orgs_nodes(output, participating_orgs_nodes):
        try:
            for node in participating_orgs_nodes:
                ref = node.attrib.get('ref', '')
                organisation_name = node.find('narrative').text
                if organisation_name or ref:
                    participating_org = {
                        'organisation_id': ref,
                        'organisation_type': node.attrib['type'],
                    }
                    OutputParticipatingOrganisation.objects\
                        .update_or_create(output=output, project=output.project,
                                          org_name=organisation_name,
                                          organisation_role=node.attrib['role'],
                                          defaults=participating_org)
        except Exception as e:
            output_error_dict.append({
                'output_id': output.output_id,
                'error_field': 'participating orgs',
                'field_key': (e.args[0])
            })

    @staticmethod
    def process_sector_nodes(output, sector_nodes):
        for node in sector_nodes:
            if node.attrib['vocabulary'] == str(SECTOR_VOCABULARY.thematic):
                sector = Sector.objects.using(db).get(code=node.attrib['code'])
                OutputSector.objects.update_or_create(output=output, project=output.project, sector=sector)

    @staticmethod
    def process_sdg_nodes(output, sdg_nodes, year):
        try:
            for node in sdg_nodes:
                sdg_vocabulary = [str(SECTOR_VOCABULARY.sdg7), str(SECTOR_VOCABULARY.sdg8)]
                if node.attrib['vocabulary'] in sdg_vocabulary:
                    if node.attrib['code'].isnumeric():
                        sdg = Sdg.objects.using(db).get(code=node.attrib['code'])
                        OutputSdg.objects.update_or_create(output=output, project=output.project, sdg=sdg)
                    else:
                        sdg_target = SdgTargets.objects.using(db).get(target_id=node.attrib['code'])
                        OutputTarget.objects.using(db).update_or_create(output=output, project=output.project,
                                                                        target_id=sdg_target,
                                                                        percentage=node.attrib['percentage'],
                                                                        year=int(year))
        except Exception as e:
            print(e)

    @staticmethod
    def process_country_budget_items_node(output, country_budget_items_node):
        try:
            if country_budget_items_node is not None:
                country_budget, created = CountryBudget.objects\
                    .update_or_create(output=output, project=output.project,
                                      vocabulary=country_budget_items_node.attrib.get('vocabulary', ''))
                budget_item_nodes = country_budget_items_node.findall('budget-item')
                for node in budget_item_nodes:
                    budget_item = {
                        'percentage': node.attrib.get('percentage', ''),
                        'description': node.find('description', None).find('narrative').text
                        if node.find('description', None) is not None else ''
                    }
                    CountryBudgetItem.objects\
                        .update_or_create(country_budget=country_budget,
                                          code=node.attrib.get('code', ''),
                                          defaults=budget_item)
        except Exception as e:
            output_error_dict.append({
                'output_id': output.output_id,
                'error_field': 'country budget items node',
                'field_key': (e.args[0])
            })

    @staticmethod
    def process_budget_nodes(output, project, budget_nodes):
        try:
            for node in budget_nodes:
                budget = {
                    'amount_date': node.find('value').attrib.get('value-date', ''),
                    'amount': node.find('value').text if node.find('value') is not None else None
                }
                Budget.objects.update_or_create(output=output,
                                                project=project,
                                                budget_type=node.attrib.get('type', ''),
                                                status=node.attrib.get('status', ''),
                                                period_start=node.find('period-start').attrib.get('iso-date', ''),
                                                period_end=node.find('period-end').attrib.get('iso-date', ''),
                                                defaults=budget)
        except Exception as e:
            output_error_dict.append({
                'output_id': output.output_id,
                'error_field': 'budget node',
                'field_key': (e.args[0])
            })

    @staticmethod
    def process_transaction_nodes(output, transaction_nodes):
        try:
            for node in transaction_nodes:
                provider_ref = node.find('provider-org').attrib.get('ref', '') \
                    if node.find('provider-org', None) is not None else ''
                receiver_ref = node.find('receiver-org').attrib.get('ref', '') \
                    if node.find('receiver-org', None) is not None else ''
                try:
                    provider = Organisation.objects.using(db).get(ref_id=provider_ref)
                except Exception as e:
                    provider = None
                try:
                    receiver = Organisation.objects.using(db).get(ref_id=receiver_ref)
                except Exception as e:
                    receiver = None
                transaction_type = node.find('transaction-type', '').attrib.get('code', '') \
                    if node.find('transaction-type', '') is not None else ''
                transaction_date = node.find('transaction-date', '').attrib.get('iso-date', '') \
                    if node.find('transaction-date', '') is not None else ''
                transaction_year = transaction_date.split('-')[0].strip()
                value = node.find('value', '')
                disbursement_channel = node.find('disbursement-channel')
                if transaction_type == str(TRANSACTION_TYPES.expenditure):
                    transaction = {
                        'transaction_date': transaction_date,
                        'provider': provider,
                        'amount': value.text if value is not None else None,
                        'amount_date': value.attrib['value-date'] if value is not None else None,
                        'disbursement_channel': disbursement_channel.attrib['code'] if value is not None else '',
                    }
                    Expense.objects.update_or_create(output=output,
                                                     project=output.project,
                                                     transaction_date__year=transaction_year,
                                                     transaction_type=transaction_type,
                                                     defaults=transaction)
                else:
                    transaction = {
                        'transaction_date': transaction_date,
                        'receiver': receiver,
                        'amount': value.text if value is not None else None,
                        'amount_date': value.attrib['value-date'] if value is not None else None,
                        'disbursement_channel': disbursement_channel.attrib['code'] if value is not None else '',
                    }
                    OutputTransaction.objects.update_or_create(output=output,
                                                               project=output.project,
                                                               transaction_date__year=transaction_year,
                                                               transaction_type=transaction_type,
                                                               provider=provider,
                                                               defaults=transaction)
        except Exception as e:
            output_error_dict.append({
                'output_id': output.output_id,
                'error_field': 'transaction node',
                'field_key': (e.args[0])
            })

    @staticmethod
    def process_results_node(output, result_node):
        if result_node is not None:
            indicator = result_node.find('indicator')
            baseline = indicator.find('baseline')
            try:
                indicator_title = indicator.find('title').find('narrative').text
            except Exception as e:
                indicator_title = ''
            try:
                indicator_description = indicator.find('description').find('narrative').text
            except Exception as e:
                indicator_description = ''
            try:
                baseline_comment = baseline.find('comment').find('narrative').text
            except Exception as e:
                baseline_comment = ''
            baseline_year = baseline.attrib.get('year', '') if baseline is not None else ''
            result = {
                'result_type': result_node.attrib.get('type', ''),
                'aggregation_status': result_node.attrib.get('aggregation-status', ''),
                'indicator_title': indicator_title,
                'indicator_description': indicator_description,
                'indicator_measure': indicator.attrib.get('measure', '') if indicator is not None else '',
                'indicator_ascending': indicator.attrib.get('ascending', '') if indicator is not None else '',
                'baseline_comment': baseline_comment
            }
            result_obj, created = OutputResult.objects\
                .update_or_create(output=output, project=output.project, baseline_year=baseline_year, defaults=result)
            if indicator is not None:
                result_period_nodes = indicator.findall('period')
                if result_period_nodes is not None:
                    for node in result_period_nodes:
                        target_node = node.find('target', '')
                        actual_node = node.find('actual', '')
                        period_start = node.find('period-start').attrib.get('iso-date', '') \
                            if node.find('period-start') is not None else ''
                        period_end = node.find('period-end').attrib.get('iso-date', '') \
                            if node.find('period-end') is not None else ''
                        period = {
                            'target': target_node.find('comment').find('narrative').text
                            if target_node is not None else '',
                            'actual': actual_node.find('comment').find('narrative').text
                            if actual_node is not None else ''
                        }
                        OutputResultPeriod.objects.update_or_create(result=result_obj,
                                                                    period_start=period_start,
                                                                    period_end=period_end,
                                                                    defaults=period)

    @staticmethod
    def process_activity_date_node(output, activity_date_node):
        for node in activity_date_node:
            activity_date = {
                'iso_date': node.attrib.get('iso-date', '')
            }
            ActivityDate.objects \
                .update_or_create(output=output, project=output.project,
                                  activity_type=node.attrib.get('type', ''), defaults=activity_date)


class ProcessProject:

    def process(self, obj, year):
        project_key = processXmlIterObject(obj, {'iati-identifier'}, None, 2)
        project_id = getIdFromKey(project_key['text'])
        # print(project_id)

        title = processXmlIterObject(obj, {'title'}, None, 1)
        description = processXmlIterObject(obj, {'description'}, None, 1)
        reporting_org_ref_id = ''
        try:
            reporting_org_ref = processXmlIterObject(obj, {'reporting-org'}, {'ref'}, None)
            reporting_org_ref_id = reporting_org_ref['attribs']['ref']
            reporting_org = Organisation.objects.using(db).only('ref_id').get(ref_id=reporting_org_ref_id)
        except Exception as e:
            project_error_dict.append({
                'project_id': project_id,
                'error_field': 'Reporting Org',
                'field_key': reporting_org_ref_id
            })
            reporting_org = None

        try:
            contact_email = obj.find('contact-info').find('email').text
        except Exception as e:
            contact_email = ''

        try:
            contact_website = obj.find('contact-info').find('website').text
        except Exception as e:
            contact_website = ''
        crs_code = self.get_crs_code(obj.findall('sector'))

        recepient_country = getRecepientCountry(obj)

        if not recepient_country:
            recepient_country_code = processXmlIterObject(obj, {'recipient-country'}, {'code'}, None)
            project_error_dict.append({
                'project_id': project_id,
                'error_field': 'Recipient Country',
                'field_key': recepient_country_code
            })
        try:
            project_obj, created = Project.objects.update_or_create(
                project_id=project_id,
                defaults={'title': title['text'], 'organisation': reporting_org, 'crs_code': crs_code,
                          'description': description.get('text', ''), 'contact_email': contact_email,
                          'contact_website': contact_website, 'operating_unit': recepient_country,
                          'collaboration_type': self.get_attrib_from_tag(obj, 'collaboration-type', 'code'),
                          'default_flow_type': self.get_attrib_from_tag(obj, 'default-flow-type', 'code'),
                          'default_finance_type': self.get_attrib_from_tag(obj, 'default-finance-type', 'code'),
                          'default_aid_type': self.get_attrib_from_tag(obj, 'default-aid-type', 'code'),
                          'default_tied_status': self.get_attrib_from_tag(obj, 'default-tied-status', 'code'),
                          'conditions_attached': self.get_attrib_from_tag(obj, 'conditions', 'attached')
                          },
            )
        except Exception as e:
            print(e)
            project_error_dict.append({
                'project_id': project_id,
                'error_field': '',
                'field_key': e.args[0]
            })
        else:
            self.project_active_years(project_obj, year)
            insert_project_sdg(project_obj, obj.findall('sector'), year)
            participating_org_temp = obj.findall('participating-org')
            process_activity_date_node(project_obj, obj.findall('activity-date'))
            insert_project_participating_org(project_obj, participating_org_temp)
            document_link_obj = obj.findall('document-link')
            InsertDocumentLinks(document_link_obj, project_obj)
            InsertResults(obj, project_obj)

    @staticmethod
    def project_active_years(project, year):
        try:

            ProjectActiveYear.objects.update_or_create(
                project=project, year=year,
            )
        except Exception as e:
            print(e)

    @staticmethod
    def get_crs_code(sector_nodes):
        for node in sector_nodes:
            if node.attrib['vocabulary'] == str(SECTOR_VOCABULARY.crs):
                return node.attrib['code']
        return ''

    @staticmethod
    def get_attrib_from_tag(node, tag, attr):
        value = None
        try:
            value = node.find(tag, '').attrib.get(attr, '')
        except Exception as e:
            pass
        return value


class UploadCountryDocuments:

    def do(self):
        start_time = datetime.datetime.now()
        add_admin_log(JOBS.upload_country_documents, file_name="country_documents.xlsx",
                      start_time=start_time)
        file_path = settings.CSV_UPLOAD_DIR + "/country_documents.xlsx"
        workbook = xlrd.open_workbook(file_path)
        sheet = workbook.sheet_by_index(0)
        row_iter = 0
        country_ids = []
        for row in range(sheet.nrows):
            if row_iter != 0:
                iso2 = sheet.cell_value(row, 5)
                doc_url = sheet.cell_value(row, 1)
                doc_format = sheet.cell_value(row, 0)
                category = sheet.cell_value(row, 4)
                title = sheet.cell_value(row, 2)
                language = sheet.cell_value(row, 3)
                try:
                    operating_unit = OperatingUnit.objects.using(db).get(iso2=iso2)
                except:
                    operating_unit = None

                try:
                    document_category = DocumentCategory.objects.using(db).get(category=category)
                except Exception as e:
                    print(e)
                    document_category = None

                if operating_unit is not None:
                    defaults = {
                        'language': language,
                        'title': title,
                        'format': doc_format,
                        'category': document_category
                    }
                    try:
                        CountryDocument.objects.update_or_create(operating_unit=operating_unit, document_url=doc_url,
                                                                 defaults=defaults)
                    except Exception as e:
                        print(e)
                else:
                    country_ids.append(iso2)

            row_iter += 1
        update_admin_log(JOBS.upload_country_documents, start_time,
                         file_name="country_documents.xlsx",
                         end_time=datetime.datetime.now(),
                         status=LOG_STATUSES.successful)
        if len(country_ids) > 0:
            write_file(("Countries not found: %s" % country_ids))
        print("Total records: %s" % str(row_iter))


class DownloadXmlCron:
    annual_xml_filepath = settings.ANNUAL_DOWNLOAD_DIR
    download_filepath = settings.DOWNLOAD_DIR
    source_url = settings.ZIP_DOWNLOAD_URL

    def do(self):

        start_time = datetime.datetime.now()
        try:
            print('Cron Started')

            add_admin_log(JOBS.download_xml, start_time=start_time)
            if not os.path.isdir(self.annual_xml_filepath):
                os.makedirs(self.annual_xml_filepath)

            print("Downloading...")

            download_zip_file_from_location(self.source_url, self.download_filepath, self.annual_xml_filepath)
            end_time = datetime.datetime.now()
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
            print('Cron Ended')
            update_admin_log(JOBS.download_xml, start_time, end_time=end_time,
                             status=LOG_STATUSES.successful)
        except Exception as e:
            print(e)
            update_admin_log(JOBS.download_xml, start_time, end_time=datetime.datetime.now(),
                             status=LOG_STATUSES.failed, message=str(e))


class UpdateSearchModel:

    def do(self):
        print("Updating project search..")
        start_time = datetime.datetime.now()
        try:
            add_admin_log(JOBS.project_search_update, start_time=start_time)
            project_entries = ProjectActiveYear.objects.using(db).all()\
                .select_related('project', 'project__operating_unit', 'project__operating_unit__bureau')
            project_search_items = []
            for entry in project_entries:
                mappings = DonorFundSplitUp.objects.using(db).select_related('organisation')\
                    .filter(project=entry.project, year=entry.year)
                sectors = OutputSector.objects.using(db).filter(project=entry.project).select_related('sector')
                sdgs = OutputSdg.objects.using(db).filter(project=entry.project).select_related('sdg')
                body_text = [entry.project.project_id, entry.project.title, entry.project.description]
                for mapping in mappings:
                    body_text.append(mapping.organisation.org_name)
                    body_text.append(mapping.organisation.level_3_name)
                for sdg_item in sdgs:
                    body_text.append(sdg_item.sdg.code)
                    body_text.append(sdg_item.sdg.name)
                for sector_item in sectors:
                    body_text.append(sector_item.sector.code)
                    body_text.append(sector_item.sector.sector)
                if entry.project.operating_unit:
                    body_text.append(entry.project.operating_unit.name)
                    body_text.append(entry.project.operating_unit.bureau.bureau)

                if entry.project:
                    data = {
                        'project_id_id': entry.project.project_id,
                        'year': entry.year,
                        'body_text': body_text
                    }
                    project_search_items.append(ProjectSearch(**data))
            ProjectSearch.objects.bulk_create(project_search_items)
            ProjectSearch.objects.update(search_vector=SearchVector('body_text'))
            end_time = datetime.datetime.now()
            update_admin_log(JOBS.project_search_update, start_time, end_time=end_time,
                             status=LOG_STATUSES.successful)
            print("Project search updated..")
            run_time = end_time - start_time
            print('Runtime : ' + str(run_time))
        except Exception as e:
            print(e)
            update_admin_log(JOBS.project_search_update, start_time, end_time=datetime.datetime.now().time(),
                             status=LOG_STATUSES.failed)
