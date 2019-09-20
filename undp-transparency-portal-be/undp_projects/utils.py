from __future__ import unicode_literals
import re
import zipfile
from urllib.request import urlopen, urlretrieve
from zipfile import ZipFile

import os
from django.db.models.aggregates import Count, Sum
from django.db.models.expressions import F
from django.db.models.query_utils import Q
from lxml import etree

from undp_donors.models import DonorFundSplitUp
from undp_projects.models import ProjectDocument, CountryResult, CountryResultPeriod, Log, DownloadLog, \
    ProjectParticipatingOrganisations, ProjectSdg, ProjectActivityDate, ProjectTarget
from undp_projects.serializers import MapDetailsSerializer
from utilities.config import LOG_UPLOAD_DIR
from utilities.konstants import Konstants, K
from master_tables.models import DocumentCategory, Organisation, OperatingUnit, Sdg, ProjectTimeLine, SdgTargets
from utilities import config as settings
from utilities.utils import get_zip_file_name, created_extraction_folder, \
    update_file_details, check_file_category, \
    save_file_to_local_path, get_file_name, get_file_category, create_download_file_path
from django.conf import settings as main_settings

db = main_settings.DB_FOR_WRITE

TEXT_TAGS = Konstants(K(narrative=1, label="Narrative"),
                      K(text=2, label="Text"))

RELATED_ACTIVITY_TYPES = Konstants(K(project=1, label='Project'),
                                   K(output=3, label='Output'))

TRANSACTION_TYPES = Konstants(K(incoming_funds=1, label='Incoming Funds'),
                              K(commitment=2, label='Commitment'),
                              K(disbursement=3, label='Disbursement'),
                              K(expenditure=4, label='Expenditure'),
                              K(interest_repayment=5, label='Interest Repayment'),
                              K(loan_repayment=6, label='Loan Repayment'),
                              K(reimbursement=7, label='Reimbursement'),
                              K(purchase_of_equity=8, label='Purchase of Equity'),
                              K(sale_of_equity=9, label='Sale of Equity'),
                              K(credit_guarantee=10, label='Credit Guarantee'),
                              K(incoming_commitment=11, label='Incoming Commitment'),
                              )

SECTOR_VOCABULARY = Konstants(K(thematic=99, label='Thematic Sector'),
                              K(sdg7=7, label='SDG'),
                              K(sdg8=8, label='SDG'),
                              K(crs=1, label='CRS'))

REGION_VOCABULARY = Konstants(K(portal=99, label='Portal Vocabulary'),
                              K(iati=1, label='IATI Vocabulary'))


def processXmlIterObject(obj, find, attribs, text):
    obj_temp = obj
    for needle in find:
        if obj_temp is not None:
            needle = str(needle)
            obj_temp = obj_temp.find(needle)

    obj = obj_temp
    result = {}
    if obj is not None:
        if attribs:
            result['attribs'] = {}
            for attrib in attribs:
                result['attribs'][attrib] = obj.attrib[attrib]
        if text:
            if text is TEXT_TAGS.narrative:
                obj_text = obj.find('narrative')
                if obj_text is not None:
                    result['text'] = obj_text.text
            elif text is TEXT_TAGS.text:
                result['text'] = obj.text

    return result


def getAllOrganisations():
    participating_orgs_cloud = Organisation.objects.using(db).all()
    organisations = {}
    for org in participating_orgs_cloud:
        organisations[str(org.ref_id)] = org.id

    return organisations


def getIdFromKey(key):
    key_dict = key.split('-')

    return key_dict[-1]


def getProjectId(obj):
    project_key = processXmlIterObject(obj, {'iati-identifier'}, None, 2)
    project_id = getIdFromKey(project_key['text'])

    return project_id


def getRecepientCountry(obj, project_id=''):
    recepient_country_code = processXmlIterObject(obj, {'recipient-country'}, {'code'}, None)
    recipient_country = None
    try:
        recepient_country_code = str(recepient_country_code['attribs']['code'])
        recipient_country = OperatingUnit.objects.using(db).get(iso2=recepient_country_code)
    except Exception as e:
        try:
            region_narrative = ''
            region_nodes = obj.findall('recipient-region')
            for region_node in region_nodes:
                if region_node.attrib.get('vocabulary', '') == str(REGION_VOCABULARY.portal):
                    region_narrative = region_node.find('narrative').text.strip().encode('utf-8')
                    break
            if region_narrative:
                recipient_country = OperatingUnit.objects.using(db).filter(name=region_narrative).first()
        except Exception as e:
            pass

    return recipient_country


def getCurrentYearFromFilePath(filepath):
    # Get Filename
    file_path_with_extension_split = filepath.split('/')
    file_name_with_extension = file_path_with_extension_split[-1]

    # Remove the extension
    full_filename_split = file_name_with_extension.split('.')
    full_file_name = full_filename_split[0]

    name_with_year_split = full_file_name.split('_')
    year = name_with_year_split[-1]

    return year


def InsertDocumentLinks(linkobj, project):
    for obj in linkobj:
        url = obj.attrib['url']
        format = obj.attrib['format']
        title_obj = obj.find('title').find('narrative')
        title = ""
        document = None
        if title_obj is not None:
            title = title_obj.text
        if url:
            document_category_obj = None
            document_category = getDocumentCategory(obj)
            if document_category:
                try:
                    document_category_obj = DocumentCategory.objects.using(db).get(category=document_category)
                except Exception as e:
                    document_category_obj = None
            try:
                document, created = ProjectDocument.objects.update_or_create(
                    project=project, document_url=url,
                    defaults={'format': format, 'title': title, 'category': document_category_obj},
                )
            except Exception as e:
                print(e)


# def getDocumentCategory(document_xml_obj):
#     category_order = ['A02', 'A03', 'A04', 'A05', 'A01', 'A07', 'A08', 'A09', 'A06', 'A11', 'A10']
#     document_categories = []
#     categories_obj = document_xml_obj.findall('category')
#     for category_obj in categories_obj:
#         category_code = category_obj.attrib.get('code', '')
#         document_categories.append(category_code)
#
#     document_category = None
#     for key, category in enumerate(category_order):
#         if category in document_categories:
#             document_category = category
#             break
#
#     return document_category

def getDocumentCategory(document_xml_obj):
    category_order = ['A02', 'A05', 'A08', 'A07', 'A01', 'A10', 'A03', 'A04', 'A09', 'A06', 'A11']
    document_categories = []
    categories_obj = document_xml_obj.findall('category')
    for category_obj in categories_obj:
        category_code = category_obj.attrib.get('code', '')
        document_categories.append(category_code)
    document_category = None
    if len(document_categories) == 1:
        document_category = document_categories[0]
    else:
        if 'A02' in document_categories:
            document_category = 'A02'
        elif 'A10' in document_categories:
            document_category = 'A10'
    if document_category is None:
        for key, category in enumerate(category_order):
            if category in document_categories:
                document_category = category
                break
    return document_category


def InsertResults(obj, project):
    result = obj.find('result')
    if result is not None:
        narrative = result.find('title').find('narrative').text
        try:
            country_code = obj.find('recipient-country').attrib.get('code', '')
            country = OperatingUnit.objects.using(db).get(iso2=str(country_code))
        except:
            country = None
        if country:
            indicators = result.findall('indicator')
            for indicator in indicators:
                indicator_id = indicator.find('title').find('narrative').text
                component_id = getResultComponentId(indicator_id)
                description = indicator.find('description').find('narrative').text
                baseline = indicator.find('baseline')
                if baseline is not None:
                    baseline_year = baseline.attrib['year']
                    baseline_value = baseline.attrib['value']
                else:
                    baseline_year = ''
                    baseline_value = ''

                try:
                    country_result, created = CountryResult.objects.update_or_create(
                        operating_unit=country, component_id=component_id,
                        defaults={'description': description, 'baseline_year': baseline_year,
                                  'baseline_value': baseline_value},
                    )
                except Exception as e:
                    country_result = None

                if country_result is not None:
                    periods = indicator.findall('period')
                    for period in periods:
                        period_start = period.find('period-start').get('iso-date', '')
                        period_end = period.find('period-end').get('iso-date', '')
                        target_value = ''
                        dimension_name = ''
                        dimension_value = ''
                        target = period.find('target')
                        if target is not None:
                            target_value = target.get('value', '')
                            dimension = target.find('dimension')
                            if dimension is not None:
                                dimension_name = dimension.get('name', '')
                                dimension_value = dimension.get('value', '')
                        actual = period.find('actual')
                        if actual is not None:
                            actual_value = actual.get('value', '')
                        else:
                            actual_value = ''

                        try:
                            CountryResultPeriod.objects.update_or_create(
                                operating_unit=country, component_id=component_id, period_start=period_start,
                                period_end=period_end,
                                defaults={'country_result': country_result, 'actual': actual_value,
                                          'target': target_value, 'dimension_name': dimension_name,
                                          'dimension_value': dimension_value}
                            )
                        except Exception as e:
                            print(e)


def getResultComponentId(indicator):
    indicator_list = indicator.split(" ")

    return indicator_list[-1]


def write_file(content, file='/output_logs.txt'):
    file_path = settings.LOG_UPLOAD_DIR + file
    f = open(file_path, "a+")
    f.write(content)
    f.write("\r\n")
    f.close()


def save_log(message='Error', type='', key=''):
    try:
        Log.objects.create(cron_type=type, cron_key=key, cron_message=message)
    except Exception as e:
        print(e)


def get_map_data(year, sector='', recipient_country='', budget_source='', project_id='', regular=''):
    query = Q(year=year) & Q(project__operating_unit__isnull=False)
    if recipient_country:
        query.add(Q(project__operating_unit__iso3=recipient_country), Q.AND)
    if budget_source:
        budget_source_query = Q(organisation__type_level_3=budget_source) | \
            Q(organisation__ref_id=budget_source)
        query.add(budget_source_query, Q.AND)
    if regular and int(regular) == 1:
        query.add(Q(organisation__ref_id=settings.UNDP_DONOR_ID), Q.AND)
    if sector:
        query.add(Q(output__outputsector__sector=sector), Q.AND)
    if project_id:
        query.add(Q(project=project_id), Q.AND)
    countries = DonorFundSplitUp.objects.using(db).filter(query)

    countries = countries.values('project__operating_unit') \
        .annotate(project_count=Count('project', distinct=True),
                  output_count=Count('output', distinct=True),
                  total_budget=Sum('budget'),
                  total_expense=Sum('expense'),
                  operating_unit_name=F('project__operating_unit__name'),
                  operating_unit_iso3=F('project__operating_unit__iso3'),
                  operating_unit_latitude=F('project__operating_unit__latitude'),
                  operating_unit_longitude=F('project__operating_unit__longitude'),
                  )
    serializer = MapDetailsSerializer(countries, many=True, context={'year': year,
                                                                     'query': query,
                                                                     })

    return serializer.data


def download_file_from_location(download_url, output_file_path):
    print("Downloading ", download_url)
    import requests

    try:
        print('download_url')
        print(download_url)
        print('output_file_path')
        print(output_file_path)
        output_file_name = output_file_path + "/annual_16.xml"
        response = requests.get(download_url)
        with open(output_file_name, 'wb') as file:
            file.write(response.content)

        message = "Download successful"

    except Exception as e:
        print(e)
        message = "%s" % e
    DownloadLog.objects.create(download_url=download_url,
                               file_name=output_file_path,
                               cron_message=message)


def save_to_outer_location(download_url, zfobj):
    from django.conf import settings as main_settings
    import os

    outer_download_path = main_settings.OUTER_DOWNLOAD_PATH
    print("Saving to outer location: ", outer_download_path)
    for name in zfobj.namelist():
        # folder_name = outer_download_path + '/'.join(name.split('/')[:-1])
        # file_name = outer_download_path + name
        folder_name = outer_download_path + 'iati_xml/'
        file_name = folder_name + name.split('/')[-1]
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)
        try:
            uncompressed = zfobj.read(name)
            output = open(file_name, 'wb')
            output.write(uncompressed)
            output.close()
            message = "Download successful"
        except Exception as e:
            print(e)
            message = "%s" % e


# def download_zip_file_from_location(download_url, output_file_path, atlas_files_path):
#     print("Downloading from ", download_url)
#     response = urlopen(download_url)
#     zipped_data = response.read()
#
#     # save data to disk
#     zip_file_name = get_zip_file_name(download_url)
#     output_zip_path = output_file_path + '/' + zip_file_name
#     print("Saving to ", output_zip_path)
#     output = open(output_zip_path, 'wb')
#     output.write(zipped_data)
#     output.close()
#
#     annual_xml_files = []
#     master_files = []
#     misc_files = []
#
#     files_to_be_uploaded = {
#         'annual_xml': annual_xml_files,
#         'master': master_files,
#         'misc': misc_files
#     }
#     # extract the data
#     zfobj = ZipFile(output_zip_path)
#     save_to_outer_location(download_url, zfobj)
#     extraction_folder_name, folder_exists = created_extraction_folder(output_file_path, zip_file_name)
#     annual_extraction_folder_name, annual_folder_exists = created_extraction_folder(atlas_files_path, zip_file_name)
#     if folder_exists and annual_folder_exists:
#         for name in zfobj.namelist():
#             f_name = get_file_name(name)
#             default_file_name = output_file_path + "/" + name
#             file_category = get_file_category(f_name)
#             output_file_name = create_download_file_path(f_name, file_category, default_file_name)
#             if file_category in ["annual_xml", "master", "misc"]:
#                 try:
#                     uncompressed = zfobj.read(name)
#                     output = open(output_file_name, 'wb')
#                     output.write(uncompressed)
#                     output.close()
#                     message = "Download successful"
#                 except Exception as e:
#                     print(e)
#                     message = "%s" % e
#                 file_name = save_file_to_local_path(name, output_file_name, file_category)
#
#                 if file_name:
#                     files_to_be_uploaded.get(file_category).append(file_name)
#                 DownloadLog.objects.create(download_url=download_url, file_name=output_file_path,
#                                            cron_message=message)
#
#     print('Files to be uploaded: ')
#     print(files_to_be_uploaded)
#     update_file_details(files_to_be_uploaded)

def download_zip_file_from_location(source_url, output_file_path, atlas_files_path):
    print("Downloading from ", source_url)
    response = urlopen(source_url)
    zipped_data = response.read()

    # save data to disk
    zip_file_name = get_zip_file_name(source_url)
    output_zip_path = output_file_path + '/' + zip_file_name
    print("Saving to ", output_zip_path)
    output = open(output_zip_path, 'wb')
    output.write(zipped_data)
    output.close()

    annual_xml_files = []
    master_files = []
    misc_files = []

    files_to_be_uploaded = {
        'annual_xml': annual_xml_files,
        'master': master_files,
        'misc': misc_files
    }
    # extract the data
    zfobj = ZipFile(output_zip_path)
    save_to_outer_location(source_url, zfobj)
    extraction_folder_name, folder_exists = created_extraction_folder(output_file_path, zip_file_name)
    annual_extraction_folder_name, annual_folder_exists = created_extraction_folder(atlas_files_path, zip_file_name)
    if folder_exists and annual_folder_exists:
        for name in zfobj.namelist():
            f_name = get_file_name(name)
            default_file_name = output_file_path + "/" + name
            file_category = get_file_category(f_name)
            output_file_name = create_download_file_path(f_name, file_category, default_file_name)
            if file_category in ["annual_xml", "master", "misc"]:
                try:
                    uncompressed = zfobj.read(name)
                    output = open(output_file_name, 'wb')
                    output.write(uncompressed)
                    output.close()
                    message = "Download successful"
                except Exception as e:
                    print(e)
                    message = "%s" % e
                file_name = save_file_to_local_path(name, output_file_name, file_category)

                if file_name:
                    files_to_be_uploaded.get(file_category).append(file_name)
                DownloadLog.objects.create(download_url=source_url, file_name=output_file_path,
                                           cron_message=message)

    print('Files to be uploaded: ')
    print(files_to_be_uploaded)
    update_file_details(files_to_be_uploaded)


def write_to_csv(input_json, object_type, current_year):
    import csv

    if object_type == 'output':

        file_name = 'output_exception_' + str(current_year) + '.csv'
    else:
        file_name = 'project_exception_' + str(current_year) + '.csv'
    file_path = LOG_UPLOAD_DIR + '/Exceptions/' + file_name
    with open(file_path, 'w', newline="") as csvfile:
        csv_writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
        header = [key for key, value in input_json[0].items()]
        header.append('current_year')
        csv_writer.writerow(header)
        for item in input_json[1:]:
            row = [v for k, v in item.items()]
            row.append(current_year)
            csv_writer.writerow(row)


def insert_project_participating_org(project_obj, participating_org_temp):
    try:
        for org in participating_org_temp:
            ref_id = org.attrib['ref']
            org_name = org.find('narrative').text
            participating_org_type = org.attrib['type']
            participating_org_role = org.attrib['role']
            if org_name or ref_id:
                try:
                    ProjectParticipatingOrganisations.objects.update_or_create(
                        project=project_obj, org_name=org_name,
                        defaults={'org_type': participating_org_type,
                                  'org_role': participating_org_role,
                                  'organisation_id': ref_id
                                  },
                    )
                except Exception as e:
                    print(e)
    except:
        pass


def insert_project_sdg(project_obj, sector_nodes, year):
    for node in sector_nodes:
        sdg_vocabulary = [str(SECTOR_VOCABULARY.sdg7), str(SECTOR_VOCABULARY.sdg8)]
        if node.attrib['vocabulary'] in sdg_vocabulary:
            if node.attrib['code'].isnumeric():
                sdg = Sdg.objects.using(db).get(code=node.attrib['code'])
                ProjectSdg.objects.update_or_create(project=project_obj, sdg=sdg)
            else:
                sdg_target = SdgTargets.objects.using(db).get(target_id=node.attrib['code'])
                ProjectTarget.objects.using(db).update_or_create(project=project_obj,
                                                                 target=sdg_target,
                                                                 percentage=node.attrib['percentage'],
                                                                 year=year)


def process_activity_date_node(project_obj, activity_date_node):
    for node in activity_date_node:
        activity_date = {
            'iso_date': node.attrib.get('iso-date', '')
        }
        ProjectActivityDate.objects \
            .update_or_create(project=project_obj,
                              activity_type=node.attrib.get('type', ''), defaults=activity_date)


def update_project_time_line(year):
    time_line, created = ProjectTimeLine.objects.using(db).get_or_create(year=year)
    time_line.is_active = True
    time_line.save()
