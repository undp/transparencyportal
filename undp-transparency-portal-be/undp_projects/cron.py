from sys import exit

from django_cron import CronJobBase, Schedule

from undp_outputs.models import Output, OutputParticipatingOrganisation, OutputLocation, OutputSector, Budget, \
    OutputTransaction, OutputResult, OutputResultPeriod, CountryBudget, CountryBudgetItem, \
    Expense, ActivityDate
from utilities import config as settings
from utilities.utils import *
from undp_projects.utils import processXmlIterObject, getAllOrganisations, getIdFromKey, getRecepientCountry, \
    TEXT_TAGS, RELATED_ACTIVITY_TYPES, TRANSACTION_TYPES, getCurrentYearFromFilePath, SECTOR_VOCABULARY, \
    InsertDocumentLinks, InsertResults
from undp_projects.models import Project, ProjectParticipatingOrganisations, ProjectActiveYear, \
    ProjectAggregate, SectorAggregate
from master_tables.models import Organisation, Sector, DocumentCategory, OperatingUnit
from lxml import etree
from django.db.models import Sum

import os
import re
import sys
import datetime
import csv


# class CronJob(CronJobBase):
#     RUN_EVERY_MINS = .25  # every 2 hours
#     schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
#     code = 'undp_projects.cron_job'  # a unique code

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
            iter_obj = iter(etree.iterparse(xml_file, tag=tag))
            i = 0
            for event, obj in iter_obj:
                i = i + 1
                # IATI hierarchy used to determine if output or input1

                hierarchy = obj.attrib['hierarchy']
                if hierarchy == '1':
                    ProcessProject().process(obj, current_year)
                elif hierarchy == '2':
                    ProcessOutput().process(obj)

    def write_file(self, content):
        file_path = settings.CSV_UPLOAD_DIR + "/missed.txt"
        f = open(file_path, "a+")
        f.write(content)
        f.write("\r\n")
        f.close()


class ProcessOutput:

    def process(self, obj):
        output_key = processXmlIterObject(obj, {'iati-identifier'}, None, TEXT_TAGS.text)
        print(output_key)
        reporting_org_ref = self.get_attrib_from_tag(obj, 'reporting-org', 'ref')
        try:
            reporting_org = Organisation.objects.get(ref_id=reporting_org_ref)
        except Exception as e:
            reporting_org = ''
        recipient_country_code = self.get_attrib_from_tag(obj, 'recipient-country', 'code')
        try:
            recipient_country = OperatingUnit.objects.get(iso2=recipient_country_code)
        except Exception as e:
            print(e)
            recipient_country = None
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
            'default_finance_type': self.get_attrib_from_tag(obj, 'default-flow-type', 'code'),
            'default_aid_type': self.get_attrib_from_tag(obj, 'default-aid-type', 'code'),
            'default_tied_status': self.get_attrib_from_tag(obj, 'default-tied-status', 'code'),
            'capital_spend': capital_spend,
            'conditions_attached': self.get_attrib_from_tag(obj, 'conditions', 'attached')
        }
        try:
            output, created = Output.objects.update_or_create(
                output_id=output_id,
                defaults=parsed_data,
            )
        except Exception as e:
            self.write_file('Output id: %s' % output_id, '/output.txt')
            self.write_file('Output Error: %s' % e, '/output.txt')
            print(e)
        else:
            try:
                self.process_participating_orgs_nodes(output, obj.findall('participating-org'))
            except Exception as e:
                print('Participating Orgs: %s' % output_id)
                self.write_file('Output id: %s' % output_id, '/participating_org.txt')
                self.write_file('Participating Orgs Error: %s' % e, '/participating_org.txt')
            try:
                self.process_location_node(output, obj.find('location', ''))
            except Exception as e:
                self.write_file('Output id: %s' % output_id, '/locations.txt')
                self.write_file('Locations Error: %s' % e, '/locations.txt')
            try:
                self.process_sector_nodes(output, obj.findall('sector'))
            except Exception as e:
                print("Error")
                print(e)
                self.write_file('Output id: %s' % output_id, '/sectors.txt')
                self.write_file('Sectors Error: %s' % e, '/sectors.txt')
            try:
                self.process_country_budget_items_node(output, obj.find('country-budget-items'))
            except Exception as e:
                print("Error")
                self.write_file('Output id: %s' % output_id, '/country_budget.txt')
                self.write_file('Country budget items Error: %s' % e, '/country_budget.txt')
            try:
                self.process_budget_nodes(output, project, obj.findall('budget'))
            except Exception as e:
                print("Error")
                self.write_file('Output id: %s' % output_id, '/budget.txt')
                self.write_file('Budgets Error: %s' % e, '/budget.txt')
            try:
                self.process_transaction_nodes(output, obj.findall('transaction'))
            except Exception as e:
                print("Error")
                self.write_file('Output id: %s' % output_id, '/transaction.txt')
                self.write_file('Transaction Error: %s' % e, '/transaction.txt')
            try:
                self.process_results_node(output, obj.find('result', ''))
            except Exception as e:
                self.write_file('Output id: %s' % output_id, '/result.txt')
                self.write_file('Result Error: %s' % e, '/result.txt')
            try:
                self.process_activity_date_node(output, obj.findall('activity-date'))
            except Exception as e:
                self.write_file('Output id: %s' % output_id, '/activity_date.txt')
                self.write_file('Activity Date Error: %s' % e, '/activity_date.txt')

    def process_node(self, node):
        if node.text is None and len(node.attrib):
            return node.tag, node.attrib
        return node.tag, dict(map(self.process_node, node)) or node.text

    @staticmethod
    def get_attrib_from_tag(node, tag, attr):
        value = None
        try:
            value = node.find(tag, '').attrib.get(attr, '')
        except Exception as e:
            pass
        return value

    @staticmethod
    def get_project_from_related_activity(related_activity_nodes):
        project_ref = ''
        for node in related_activity_nodes:
            if node.attrib.get('type', '') == str(RELATED_ACTIVITY_TYPES.project):
                project_ref = node.attrib.get('ref', '')
                break
        try:

            project_id = project_ref.split('PROJECT-')[1].strip()
            project = Project.objects.get(project_id=project_id)
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
    def process_location_node(output, location_node):
        if location_node is not None:
            try:
                ref = location_node.attrib.get('ref', '')
                operating_unit = OperatingUnit.objects.get(iso2=ref)
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
            location = {
                'location_reach': location_node.find('location-reach').attrib.get('code', '')
                if location_node.find('location-reach') is not None else '',
                'location_vocabulary': location_node.find('location-id').attrib.get('vocabulary', '')
                if location_node.find('location-id') is not None else '',
                'name': location_node.find('name').find('narrative').text
                if location_node.find('name') is not None else '',
                'description': location_node.find('description').find('narrative').text
                if location_node.find('description') is not None else '',
                'activity_description': location_node.find('activity-description').find('narrative').text
                if location_node.find('activity-description') is not None else '',
                'administrative_level': location_node.find('administrative').attrib.get('level', '')
                if location_node.find('administrative') is not None else '',
                'administrative_code': location_node.find('administrative').attrib.get('code', '')
                if location_node.find('administrative') is not None else '',
                'administrative_vocabulary': location_node.find('administrative').attrib.get('vocabulary', '')
                if location_node.find('administrative') is not None else '',
                'srs_name': location_node.find('point').attrib.get('srsName', '')
                if location_node.find('point', None) is not None else '',
                'latitude': latitude,
                'longitude': longitude,
                'exactness': location_node.find('exactness').attrib.get('code', '')
                if location_node.find('exactness') is not None else '',
                'location_class': location_node.find('location-class').attrib.get('code', '')
                if location_node.find('location-class') is not None else '',
                'feature_designation': location_node.find('feature-designation').attrib.get('code', '')
                if location_node.find('feature-designation') is not None else ''
            }
            OutputLocation.objects.update_or_create(output=output, project=output.project,
                                                    operating_unit=operating_unit,
                                                    location_code=location_code, defaults=location)

    @staticmethod
    def process_participating_orgs_nodes(output, participating_orgs_nodes):
        participating_orgs = []
        for node in participating_orgs_nodes:
            try:
                ref = node.attrib['ref']
                organisation = Organisation.objects.get(ref_id=ref)
            except Exception as e:
                organisation = None

            participating_org = {
                # 'output': output,
                # 'organisation': organisation,
                'organisation_type': node.attrib['type'],
                'organisation_role': node.attrib['role']
            }
            OutputParticipatingOrganisation.objects\
                .update_or_create(output=output, project=output.project, organisation=organisation,
                                  defaults=participating_org)
        #     participating_orgs.append(OutputParticipatingOrganisation(**participating_org))
        # OutputParticipatingOrganisation.objects.bulk_create(participating_orgs)

    @staticmethod
    def process_sector_nodes(output, sector_nodes):
        for node in sector_nodes:
            if node.attrib['vocabulary'] == str(SECTOR_VOCABULARY.thematic):
                sector = Sector.objects.get(code=node.attrib['code'])
                OutputSector.objects.update_or_create(output=output, project=output.project, sector=sector)

    @staticmethod
    def process_country_budget_items_node(output, country_budget_items_node):
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

    @staticmethod
    def process_budget_nodes(output, project, budget_nodes):
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

    @staticmethod
    def process_transaction_nodes(output, transaction_nodes):
        for node in transaction_nodes:
            provider_ref = node.find('provider-org').attrib.get('ref', '') \
                if node.find('provider-org', None) is not None else ''
            receiver_ref = node.find('receiver-org').attrib.get('ref', '') \
                if node.find('receiver-org', None) is not None else ''
            try:
                provider = Organisation.objects.get(ref_id=provider_ref)
            except Exception as e:
                provider = None
            try:
                receiver = Organisation.objects.get(ref_id=receiver_ref)
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

    @staticmethod
    def write_file(content, file='/output_logs.txt'):
        file_path = settings.LOG_UPLOAD_DIR + file
        f = open(file_path, "a+")
        f.write(content)
        f.write("\r\n")
        f.close()


class ProcessProject:

    def process(self, obj, year):
        project_key = processXmlIterObject(obj, {'iati-identifier'}, None, 2)
        project_id = getIdFromKey(project_key['text'])
        print(project_id)

        title = processXmlIterObject(obj, {'title'}, None, 1)
        description = processXmlIterObject(obj, {'description'}, None, 1)

        reporting_org_ref = processXmlIterObject(obj, {'reporting-org'}, {'ref'}, None)
        reporting_org_ref_id = reporting_org_ref['attribs']['ref']
        try:
            reporting_org = Organisation.objects.only('ref_id').get(ref_id=reporting_org_ref_id)
        except Exception as e:
            reporting_org = ''

        flag_project_inserted = 0
        try:
            contact_email = obj.find('contact-info').find('email').text
        except Exception as e:
            contact_email = ''

        try:
            contact_website = obj.find('contact-info').find('website').text
        except Exception as e:
            contact_website = ''

        recepient_country = getRecepientCountry(obj)

        try:
            Project.objects.update_or_create(
                project_id=project_id,
                defaults={'title': title['text'], 'organisation': reporting_org,
                          'description': description['text'], 'contact_email': contact_email,
                          'contact_website': contact_website, 'operating_unit': recepient_country},
            )
            flag_project_inserted = 1
        except Exception as e:
            print(e)

        if flag_project_inserted == 1:
            try:
                project_obj = Project.objects.only('project_id').get(project_id=str(project_id))
            except Exception as e:
                print(e)
            self.project_active_years(project_obj, year)
            participating_org_temp = obj.findall('participating-org')
            for org in participating_org_temp:
                ref_id = org.attrib['ref']
                participating_org_type = org.attrib['type']
                participating_org_role = org.attrib['role']
                try:
                    participating_org = Organisation.objects.only('ref_id').get(ref_id=ref_id)
                except Exception as e:
                    participating_org = ''
                    print(e)
                if participating_org:
                    try:
                        ProjectParticipatingOrganisations.objects.update_or_create(
                            project=project_obj, organisation=participating_org,
                            defaults={'org_type': participating_org_type, 'org_role': participating_org_role},
                        )
                    except Exception as e:
                        print(e)

            document_link_obj = obj.findall('document-link')
            InsertDocumentLinks(document_link_obj, project_obj)
            InsertResults(obj, project_obj)

    def project_active_years(self, project, year):
        try:

            ProjectActiveYear.objects.update_or_create(
                project=project, year=year,
            )
            flag_project_inserted = 1
        except Exception as e:
            print(e)
