import configparser
import os
import re
from itertools import chain
from shutil import copyfile
from django.conf import settings as main_settings

from django.db.models.aggregates import Sum, Count
from django.db.models.expressions import Value, Case, When, Func, F
from django.db.models.fields import FloatField, CharField, DecimalField, IntegerField
from django.db.models.functions.base import Coalesce
from django.db.models.query_utils import Q

from master_tables.cron_automation import MASTER_FILES, MISC_FILES
from undp_admin.models import AdminLog, JOBS, LOG_STATUSES
from undp_donors.models import DonorFundSplitUp, DonorFundModality, DONOR_CATEGORY_CHOICES
from undp_purchase_orders.models import VENDOR_CLASSIFICATION_TYPES
from utilities import config as settings
from undp_outputs.models import Expense, Budget, OutputSector, Output, OutputTransaction, ProjectMarker, \
    MARKER_TYPE_CHOICES, SDGChartColor
from undp_projects.models import ProjectActiveYear, Project, CountryResultPeriod, ProjectTarget
from master_tables.models import Organisation, OperatingUnit, Bureau, Sector, SignatureSolution, SdgTargets, Sdg
from undp_outputs.models import Expense, Budget, OutputSector, OutputTransaction, OutputTarget
from undp_projects.models import ProjectActiveYear
from utilities.config import EXCLUDED_SECTOR_CODES, NULL_SECTOR_COLOR_CODE, UNDP_DONOR_ID, NULL_SDG_COLOR_CODE, \
    SETTINGS_DIR, ANNUAL_UPLOAD_DIR, FILE_DETAILS_PATH, CSV_UPLOAD_DIR, DOWNLOAD_DIR, ANNUAL_DOWNLOAD_DIR, \
    SDG_START_YEAR, UPDATE_DAY, SIGNATURE_SOLUTION_COLORS, SIGNATURE_SOLUTION_SHORT_NAMES, SECTOR_OTHERS_YEAR, \
    SP_START_YEAR, NEW_SECTOR_CODES, OLD_SECTOR_CODES, SDG_TARGET_COLORS

from utilities.konstants import DONOR_CATEGORY_COLORS, BUREAU_COLORS


def get_filenames(path, ext=None):
    """The function extracts filenames in a directory
    If the extension is provided, only the files with the specified
    extension are returned

    Arguments:
    path -- Full path of the directory e.g. /path/to/file
    ext -- the file extension, e.g. xml
    """
    changed_files = get_file_details(FILE_DETAILS_PATH, 'annual_xml')
    files = []
    for fn in os.listdir(path):
        if ext:
            # If extension does not start with a dot, add one
            if re.search('^\.', ext) is None:
                ext = '.' + ext
            fn_path = path + '/' + fn
            if fn.endswith(ext) and (fn in changed_files):
                files.append(fn_path)
            # if fn.endswith(ext):
            #     files.append(fn_path)

            # return [path + '/' + fn for fn in os.listdir(path)
            #         if fn.endswith(ext) and path + '/' + fn in changed_files]
        else:
            return [path + '/' + fn for fn in os.listdir(path)]
    return files


def copy_file_to_upload_folder(source, target):
    copyfile(source, target)


def get_file_details(path, category):
    config = configparser.ConfigParser()
    config.read(path)
    changed_files = []
    for file in config[category]:
        changed_files.append(file)
    return changed_files


def get_total_project_in_year(year):
    total_project_count = ProjectActiveYear.objects.filter(year=year).count()

    return total_project_count


def get_total_expense_in_year(year):
    project_expense = Expense.objects \
        .filter(amount_date__year=year) \
        .aggregate(Sum('amount'))

    return project_expense['amount__sum'] if project_expense['amount__sum'] is not None else 0


def get_total_budget_in_year(year):
    project_budget = Budget.objects \
        .filter(amount_date__year=year) \
        .aggregate(Sum('amount'))
    return project_budget['amount__sum'] if project_budget['amount__sum'] is not None else 0


def get_total_donors_in_year(year):
    providers_count = OutputTransaction.objects.filter(amount_date__year=year).distinct(). \
        values_list('provider__ref_id').count()

    return providers_count


def get_total_operating_units_in_year(year):
    project_ids = ProjectActiveYear.objects.filter(year=year).values_list('project__project_id', flat=True)
    countries_count = Project.objects.filter(project_id__in=project_ids).distinct(). \
        values_list('operating_unit').count()

    return countries_count


def get_output_by_sector(sector, flat=True):
    if sector.code != 8:
        output_sectors = OutputSector.objects.filter(sector=sector)
    else:
        output_sectors = OutputSector.objects.filter(Q(sector=sector) |
                                                     Q(sector__code__in=settings.EXCLUDED_SECTOR_CODES))
    if flat is True:
        return output_sectors.values_list('output_id', flat=True)

    return output_sectors


def get_total_project_per_theme_in_year(year, sector):
    output_sectors = get_output_by_sector(sector=sector)
    project_ids = Output.objects.filter(output_id__in=output_sectors).distinct().values_list('project_id', flat=True)
    project_in_year = ProjectActiveYear.objects \
        .filter(project_id__in=project_ids) \
        .filter(year=year) \
        .count()

    return project_in_year


def get_total_budget_per_theme_in_year(year, sector):
    output_sectors = get_output_by_sector(sector=sector, flat=True)

    theme_budget = Budget.objects \
        .filter(output_id__in=output_sectors) \
        .filter(amount_date__year=year) \
        .aggregate(Sum('amount'))

    return theme_budget['amount__sum'] if theme_budget['amount__sum'] is not None else 0


def get_total_expense_per_theme_in_year(year, sector):
    output_sectors = get_output_by_sector(sector=sector, flat=True)

    theme_budget = Expense.objects \
        .filter(output_id__in=output_sectors) \
        .filter(amount_date__year=year) \
        .aggregate(Sum('amount'))

    return theme_budget['amount__sum'] if theme_budget['amount__sum'] is not None else 0


def get_budget_share_for_theme_in_year(year, sector):
    total_budget_for_year = get_total_budget_in_year(year)
    budget_for_theme_for_year = get_total_budget_per_theme_in_year(year, sector)
    if total_budget_for_year is not 0:
        return budget_for_theme_for_year / total_budget_for_year * 100
    else:
        return 0


def get_receiver_organisations(year):
    receivers = OutputTransaction.objects.filter(amount_date__year=year).values('receiver')
    organisations = Organisation.objects.filter(ref_id__in=receivers)
    return organisations


def get_provider_organisations(year):

    transaction_providers = OutputTransaction.objects.filter(amount_date__year=year).values_list('provider', flat=True)
    expense_providers = Expense.objects.filter(amount_date__year=year, provider__isnull=False). \
        values_list('provider', flat=True)
    providers = list(transaction_providers) + list(expense_providers)
    organisations = Organisation.objects.filter(ref_id__in=providers)
    return organisations


def get_active_projects_for_year(year, flat=True, operating_unit=None, sector=None, budget_source=None):
    active_projects = ProjectActiveYear.objects.filter(year=year)
    if sector:
        try:
            sectors = OutputSector.objects.filter(sector__code=sector)
            active_projects = active_projects.filter(project__outputsector__in=sectors)
        except Exception as e:
            pass
    if budget_source:
        budget_source_query = Q(project__donorfundsplitup__organisation__ref_id=budget_source) | \
            Q(project__donorfundsplitup__organisation__type_level_3=budget_source)
        active_projects = active_projects \
            .filter(budget_source_query)
    if operating_unit:
        op_query = Q(project__operating_unit__iso3=operating_unit) | \
            Q(project__operating_unit__bureau__code=operating_unit)
        active_projects = active_projects.filter(op_query)

    if flat is True:
        active_projects = active_projects.values_list('project', flat=True)
    active_projects = active_projects.distinct()
    return active_projects


def get_budget_for_recipient(outputs, year):
    budget = Budget.objects.filter(output__in=outputs, amount_date__year=year).aggregate(total_budget=Sum('amount'))
    return budget


def get_recipient_theme_details(operating_unit, year):
    active_projects = get_active_projects_for_year(year)
    op_query = Q(project__operating_unit=operating_unit) | \
        Q(project__operating_unit__bureau__code=operating_unit)

    total_budget = DonorFundSplitUp.objects\
        .filter(project__in=active_projects)\
        .filter(year=year)\
        .filter(op_query) \
        .aggregate(total_budget=Sum('budget'))['total_budget']
    other_sector_query = Q(output__outputsector__sector__isnull=True) | \
        Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)

    sector_year_query = Q(output__outputsector__sector__start_year__lte=year) & \
                                Q(output__outputsector__sector__end_year__gte=year)

    EXCLUDED_SECTOR_CODES.append('8')
    results = DonorFundSplitUp.objects\
        .filter(project__in=active_projects)\
        .filter(year=year) \
        .filter(op_query & sector_year_query)\
        .exclude(other_sector_query)\
        .values('output__outputsector__sector')\
        .annotate(total_budget=Value(total_budget, output_field=DecimalField()))\
        .annotate(theme_budget=Sum('budget'),
                  percentage=Case(When(total_budget=0, then=0),
                                  default=(Sum('budget') / Value(total_budget) * 100)))\
        .values('output__outputsector__sector', 'output__outputsector__sector__sector',
                'theme_budget', 'percentage', 'output__outputsector__sector__color') \
        .order_by('-theme_budget')
    results = list(results)
    other_sector_results = DonorFundSplitUp.objects\
        .filter(project__in=active_projects)\
        .filter(other_sector_query)\
        .filter(project__operating_unit=operating_unit, year=year)\
        .aggregate(theme_budget=Sum('budget'))

    try:
        percentage = other_sector_results['theme_budget'] / total_budget * 100
    except:
        percentage = 0
    if other_sector_results['theme_budget']:
        res = {
            'output__outputsector__sector': '0',
            'output__outputsector__sector__sector': 'Others',
            'output__outputsector__sector__color': NULL_SECTOR_COLOR_CODE,
            'theme_budget': other_sector_results['theme_budget'],
            'percentage': percentage
        }
        results.append(res)
    return results


def get_recipient_sdg_details(operating_unit, year):
    active_projects = get_active_projects_for_year(year)
    results = []
    op_query = Q(project__operating_unit=operating_unit) | \
        Q(project__operating_unit__bureau__code=operating_unit)
    total_budget = DonorFundSplitUp.objects \
        .filter(project__in=active_projects) \
        .filter(year=year) \
        .filter(op_query)\
        .aggregate(total_budget=Sum('budget'))['total_budget']
    total_expense = DonorFundSplitUp.objects \
        .filter(project__in=active_projects) \
        .filter(year=year) \
        .filter(op_query) \
        .aggregate(total_expense=Sum('expense'))['total_expense']
    # results = DonorFundSplitUp.objects \
    #     .filter(project__in=active_projects) \
    #     .filter(year=year) \
    #     .filter(op_query)\
    #     .values('output__outputsdg__sdg') \
    #     .annotate(total_budget=Value(total_budget, output_field=DecimalField())) \
    #     .annotate(sdg_budget=Sum('budget'),
    #               percentage=Case(When(total_budget=0, then=0),
    #                               default=(Sum('budget') / Value(total_budget) * 100))) \
    #     .annotate(sdg_color=Case(When(output__outputsdg__isnull=True,
    #                                   then=Value(NULL_SDG_COLOR_CODE, output_field=CharField())),
    #                              default=F('output__outputsdg__sdg__color')),
    #               sdg_name=Case(When(output__outputsdg__isnull=True,
    #                                  then=Value('Others', output_field=CharField())),
    #                             default=F('output__outputsdg__sdg__name'))) \
    #     .values('output__outputsdg__sdg__code', 'sdg_name',
    #             'sdg_budget', 'percentage', 'sdg_color') \
    #     .order_by('-sdg_budget')
    # sdg_data = DonorFundSplitUp.objects \
    #     .filter(project__in=active_projects) \
    #     .filter(year=year) \
    #     .filter(op_query).values('output__outputtarget__target_id__sdg')\
    #     .distinct()\
    #     .annotate(sdg_color=Case(When(output__outputtarget__isnull=True,
    #                                   then=Value(NULL_SDG_COLOR_CODE, output_field=CharField())),
    #                              default=F('output__outputtarget__target_id__sdg__color')),
    #               sdg_name=Case(When(output__outputtarget__isnull=True,
    #                                  then=Value('Others', output_field=CharField())),
    #                             default=F('output__outputtarget__target_id__sdg__name'))
    #               )
    # for sdg in sdg_data:
    #     sdg_code = sdg['output__outputtarget__target_id__sdg']
    #     budget = DonorFundSplitUp.objects \
    #         .filter(project__in=active_projects) \
    #         .filter(year=year) \
    #         .filter(op_query)\
    #         .filter(project__projecttarget__year=year)\
    #         .distinct()\
    #         .annotate(total_budget=Value(total_budget, output_field=DecimalField()),
    #                   budget_percentage=Sum(Case(When(project__projecttarget__target_id__sdg=sdg_code,
    #                                             then=(F('budget') * F('project__projecttarget__percentage') / 100.0)),
    #                                              default=Value(0, output_field=DecimalField())))
    #                   ) \
    #         .aggregate(sdg_budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
    #                                        Value(0, output_field=DecimalField())),
    #                    percentage=Case(When(total_budget=0, then=0),
    #                                    default=(Sum('budget_percentage') / Value(total_budget) * 100))
    #                    )
    for sdg in Sdg.objects.all():
        sdg_data = get_sdg_target_aggregate(year, sdg, operating_unit=operating_unit, active_projects=active_projects)
        if sdg_data:
            data = {'output__outputtarget__target_id__sdg__code': sdg.code,
                    'sdg_name': sdg_data['sdg_name'],
                    'sdg_budget': sdg_data['total_budget'],
                    'percentage': sdg_data['percentage'],
                    'sdg_color': sdg_data['color'],
                    'sdg_expense': sdg_data['total_expense']
                    }
            if data:
                results.append(data)
    total_percentage = sum(sdg['percentage'] for sdg in results)
    sdg_total_budget = sum(sdg['sdg_budget'] for sdg in results)
    sdg_total_expense = sum(sdg['sdg_expense'] for sdg in results)
    other_sdg = get_sdg_target_aggregate(year, sdg=None, operating_unit=operating_unit, active_projects=active_projects)
    if other_sdg:
        data = {'output__outputtarget__target_id__sdg__code': other_sdg['sdg_code'],
                'sdg_name': other_sdg['sdg_name'],
                'sdg_budget': total_budget - sdg_total_budget,
                'percentage': 100 - total_percentage,
                'sdg_color': other_sdg['color'],
                'sdg_expense': total_expense - sdg_total_expense
                }
        if data:
            results.append(data)
    results = list(results)
    return results


def get_recipient_theme_budget_vs_expense(operating_unit, year):
    active_projects = get_active_projects_for_year(year)
    EXCLUDED_SECTOR_CODES.append('8')
    sector_year_query = Q(output__outputsector__sector__start_year__lte=year) & \
                        Q(output__outputsector__sector__end_year__gte=year)
    other_sector_query = Q(output__outputsector__sector__isnull=True) | \
        Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
    op_query = Q(project__operating_unit=operating_unit) | \
        Q(project__operating_unit__bureau__code=operating_unit)
    results = DonorFundSplitUp.objects \
        .filter(project__in=active_projects) \
        .filter(op_query & sector_year_query) \
        .filter(year=year)\
        .exclude(other_sector_query)\
        .values('output__outputsector__sector')\
        .annotate(theme_budget=Sum('budget'), theme_expense=Sum('expense'))\
        .values('output__outputsector__sector', 'output__outputsector__sector__sector',
                'output__outputsector__sector__color', 'theme_budget', 'theme_expense')\
        .order_by('-theme_budget')
    results = list(results)
    other_sector_results = DonorFundSplitUp.objects \
        .filter(project__in=active_projects) \
        .filter(other_sector_query)\
        .filter(project__operating_unit=operating_unit, year=year)\
        .aggregate(theme_budget=Sum('budget'), theme_expense=Sum('expense'))
    if other_sector_results.get('theme_budget') or other_sector_results.get('theme_expense'):
        res = {
            'theme_budget': other_sector_results['theme_budget'],
            'theme_expense': other_sector_results['theme_expense'],
            'output__outputsector__sector': '0',
            'output__outputsector__sector__sector': 'Others',
            'output__outputsector__sector__color': NULL_SECTOR_COLOR_CODE,
        }
        results.append(res)
    return results


def get_recipient_sdg_budget_vs_expense(operating_unit, year):
    active_projects = get_active_projects_for_year(year)
    op_query = Q(project__operating_unit=operating_unit) | \
        Q(project__operating_unit__bureau__code=operating_unit)
    results = []
    # other_sdg = Q(output__outputsdg__sdg__isnull=True)
    # results = DonorFundSplitUp.objects \
    #     .filter(Q(project__in=active_projects) & Q(year=year) & op_query)\
    #     .exclude(other_sdg)\
    #     .values('output__outputsdg__sdg') \
    #     .annotate(sdg_budget=Sum('budget'), sdg_expense=Sum('expense')) \
    #     .annotate(color=Case(When(output__outputsdg__isnull=True,
    #                               then=Value(NULL_SDG_COLOR_CODE, output_field=CharField())),
    #                          default=F('output__outputsdg__sdg__color')),
    #               sdg_name=Case(When(output__outputsdg__isnull=True,
    #                                  then=Value('Others', output_field=CharField())),
    #                             default=F('output__outputsdg__sdg__name')))\
    #     .values('output__outputsdg__sdg__code', 'sdg_name',
    #             'color', 'sdg_budget', 'sdg_expense') \
    #     .order_by('-sdg_budget')
    other_sdg = Q(output__outputtarget__target_id__sdg__isnull=True)
    sdg_data = DonorFundSplitUp.objects\
        .filter(Q(project__in=active_projects) & Q(year=year) & op_query)\
        .exclude(other_sdg)\
        .values('output__outputtarget__target_id__sdg')\
        .distinct()\
        .annotate(color=Case(When(output__outputtarget__isnull=True,
                                  then=Value(NULL_SDG_COLOR_CODE, output_field=CharField())),
                             default=F('output__outputtarget__target_id__sdg__color')),
                  sdg_name=Case(When(output__outputtarget__isnull=True,
                                     then=Value('Others', output_field=CharField())),
                                default=F('output__outputtarget__target_id__sdg__name')))
    for sdg in sdg_data:
        sdg_code = sdg['output__outputtarget__target_id__sdg']
        budget = DonorFundSplitUp.objects \
            .filter(project__in=active_projects) \
            .filter(year=year) \
            .filter(project__projecttarget__year=year) \
            .filter(op_query) \
            .exclude(other_sdg)\
            .distinct() \
            .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target_id__sdg=sdg_code,
                                                      then=(F('budget') * F(
                                                          'project__projecttarget__percentage') / 100.0)),
                                                 default=Value(0, output_field=DecimalField()))),
                      expense_percentage=Sum(Case(When(project__projecttarget__target_id__sdg=sdg_code,
                                                       then=F('expense') * F(
                                                           'project__projecttarget__percentage') / 100.0)),
                                             default=Value(0, output_field=DecimalField()))
                      ) \
            .aggregate(sdg_budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
                                           Value(0, output_field=DecimalField())),
                       sdg_expense=Coalesce(Sum(F('expense_percentage'), output_field=DecimalField()),
                                            Value(0, output_field=DecimalField()))
                       )
        data = {'output__outputtarget__target_id__sdg__code': sdg_code,
                'sdg_name': sdg['sdg_name'],
                'color': sdg['color'],
                'sdg_budget': budget['sdg_budget'],
                'sdg_expense': budget['sdg_expense']
                }
        results.append(data)
    results = list(results)
    other_sdg_aggregate = DonorFundSplitUp.objects \
        .filter(Q(project__in=active_projects) & Q(year=year) & op_query & other_sdg)\
        .aggregate(sdg_budget=Sum('budget'), sdg_expense=Sum('expense'))

    if other_sdg_aggregate['sdg_budget'] or other_sdg_aggregate['sdg_expense']:
        other_sdg_results = [{
            'output__outputtarget__target_id__sdg__code': '0',
            'sdg_name': 'Others',
            'color': NULL_SDG_COLOR_CODE,
            'sdg_budget': other_sdg_aggregate['sdg_budget'],
            'sdg_expense': other_sdg_aggregate['sdg_expense']
        }]
        results += other_sdg_results
    return results


def process_query_params(value):
    if value:
        value = value.strip(" ").rstrip(",").split(",")
        value = [i.lower().strip() for i in value]
        return value
    return None


def get_project_search_query(year, operating_units, budget_sources, themes, keyword,
                             budget_type='', category='', sdgs=[]):
    query = Q()
    if year:
        year_query = Q(Q(project_active__year__in=year) & Q(donorfundsplitup__year__in=year)) | \
            Q(Q(project_active__year__in=year) & Q(~Q(donorfundsplitup__year__in=year) |
                                                   Q(donorfundsplitup__isnull=True)))

        query.add(Q(year_query), Q.AND)
    if operating_units:
        operating_units = [unit.upper().strip() for unit in operating_units]
        op_query = Q(operating_unit__in=operating_units) | \
            Q(operating_unit__bureau__code__in=operating_units)
        query.add(op_query, Q.AND)
    if budget_type:
        budget_type_query = Q()
        if budget_type == 'direct':
            budget_type_query.add(Q(donorfundsplitup__isnull=False), Q.AND)
        elif budget_type == 'regular':
            budget_type_query.add(Q(donorfundsplitup__organisation=UNDP_DONOR_ID), Q.AND)
        if year:
            budget_type_query.add(Q(donorfundsplitup__year__in=year), Q.AND)
        query.add(budget_type_query, Q.AND)
    if budget_sources:
        if budget_type != 'regular':
            budget_sources = [item.upper() for item in budget_sources]
            budget_sources_query = Q(donorfundsplitup__organisation__in=budget_sources) | \
                Q(donorfundsplitup__organisation__type_level_3__in=budget_sources)
            if year:
                budget_sources_query = budget_sources_query & Q(donorfundsplitup__year__in=year)
            query.add(budget_sources_query, Q.AND)
    if themes:
        theme_query = Q()
        EXCLUDED_SECTOR_CODES.append('8')
        themes_temp = themes
        if '0' in themes or list(set(themes_temp).intersection(EXCLUDED_SECTOR_CODES)):
            if '0' in themes:
                themes.remove('0')

            other_sector_query = Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                Q(output__outputsector__sector__isnull=True)
            theme_query |= other_sector_query
        if themes:
            theme_query |= Q(output__outputsector__sector__in=themes)

        query.add(theme_query, Q.AND)
    if sdgs:
        sdgs_query = Q()
        if '0' in sdgs:
            sdgs.remove('0')
            # sdgs_query |= Q(output__outputsdg__sdg__isnull=True)
            sdgs_query |= Q(output__outputtarget__target_id__sdg__isnull=True)
        if sdgs:
            # sdgs_query |= Q(output__outputsdg__sdg__in=sdgs)
            sdgs_query |= Q(output__outputtarget__target_id__sdg__in=sdgs)
        query.add(sdgs_query, Q.AND)
    if keyword:
        keyword_query = Q(title__icontains=keyword) | Q(description__icontains=keyword) | \
            Q(project_id__icontains=keyword) | Q(operating_unit__bureau__bureau__icontains=keyword) |\
            Q(operating_unit__name__icontains=keyword) | \
            Q(donorfundsplitup__organisation__org_name__icontains=keyword) | \
            Q(donorfundsplitup__organisation__level_3_name__icontains=keyword) | \
            Q(output__outputsector__sector__sector__icontains=keyword) | \
            Q(output__outputsector__sector__code__icontains=keyword) | \
            Q(output__outputtarget__target_id__sdg__code__icontains=keyword) | \
            Q(output__outputtarget__target_id__sdg__name__icontains=keyword)
        query.add(keyword_query, Q.AND)
    return query


def get_project_full_text_search_query(year, operating_units, budget_sources, themes, keyword,
                                       budget_type='', category='', sdgs=[], sdg_targets=[], signature_solution='',
                                       marker_type='', marker_id='', level_two_marker=''):

    query = Q()

    if year:
        year = [int(y) for y in year]
        query.add(Q(year__in=year), Q.AND)
    if operating_units:
        operating_units = [unit.upper().strip() for unit in operating_units]
        op_query = Q(project_id__operating_unit__in=operating_units) | \
            Q(project_id__operating_unit__bureau__code__in=operating_units)
        query.add(op_query, Q.AND)
    if budget_type:
        if budget_type == 'direct':
            query.add(Q(project_id__donorfundsplitup__isnull=False), Q.AND)
        elif budget_type == 'regular':
            query.add(Q(project_id__donorfundsplitup__organisation=UNDP_DONOR_ID), Q.AND)
        if year:
            query.add(Q(project_id__donorfundsplitup__year__in=year), Q.AND)
    if budget_sources:
        if budget_type != 'regular':
            budget_sources = [item.upper() for item in budget_sources]
            budget_sources_query = Q(project_id__donorfundsplitup__organisation__in=budget_sources) | \
                Q(project_id__donorfundsplitup__organisation__type_level_3__in=budget_sources)
            if year:
                budget_sources_query = budget_sources_query & Q(project_id__donorfundsplitup__year__in=year)
            query.add(budget_sources_query, Q.AND)
    if themes:
        theme_query = Q()
        EXCLUDED_SECTOR_CODES.append('8')
        themes_temp = themes
        if '0' in themes or list(set(themes_temp).intersection(EXCLUDED_SECTOR_CODES)):
            if '0' in themes:
                themes.remove('0')

            other_sector_query = Q(project_id__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                Q(project_id__outputsector__sector__isnull=True)
            theme_query |= other_sector_query
        if themes:
            theme_query |= Q(project_id__outputsector__sector__in=themes)

        query.add(theme_query, Q.AND)
    if sdgs:
        sdgs_query = Q()
        if '0' in sdgs:
            sdgs.remove('0')
            # sdgs_query |= Q(project_id__outputsdg__sdg__isnull=True)
            sdgs_query |= Q(project_id__outputtarget__target_id__sdg__isnull=True)
        if sdgs:
            # sdgs_query |= Q(project_id__outputsdg__sdg__in=sdgs)
            sdgs_query |= Q(project_id__outputtarget__target_id__sdg__in=sdgs) \
                          & Q(project_id__outputtarget__year__in=year)
        query.add(sdgs_query, Q.AND)
    if keyword:
        keyword_query = Q(search_vector=keyword)
        query.add(keyword_query, Q.AND)
    if sdg_targets:
        sdg_target_query = Q()
        sdg_target_query |= Q(project_id__outputtarget__target_id__in=sdg_targets) \
                            & Q(project_id__outputtarget__year__in=year)
        query.add(sdg_target_query, Q.AND)
    if signature_solution:
        signature_solution_query = Q()
        signature_solution_query |= Q(project_id__output__signature_solution__ss_id=signature_solution)
        query.add(signature_solution_query, Q.AND)
    if marker_type:
        query.add(Q(project_id__output__marker_output__type=marker_type), Q.AND)
    if marker_id:
        if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
            query.add(Q(project_id__output__marker_output__parent_marker_desc=str(marker_id)), Q.AND)
        elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
            query.add(Q(project_id__output__marker_output__marker_title=str(marker_id)), Q.AND)
        elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
            query.add(Q(project_id__output__marker_output__level_two_marker_description=str(marker_id)), Q.AND)
        else:
            query.add(Q(project_id__output__marker_output__marker_id=marker_id), Q.AND)
    if level_two_marker:
        query.add(Q(project_id__output__marker_output__level_two_marker_title=level_two_marker), Q.AND)
    return query


def get_project_query(year, operating_unit=None, budget_source=None, sector=None, sdg=None, signature_solution=None):
    query = Q()
    if year:
        query.add(Q(project_active__year=year), Q.AND)
    if operating_unit:
        op_unit_query = Q(operating_unit__bureau__code=operating_unit) | Q(operating_unit__iso3=operating_unit)
        query.add(op_unit_query, Q.AND)
    if sector:
        if sector == '0':
            EXCLUDED_SECTOR_CODES.append('8')
            sector_query = Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                Q(outputsector__isnull=True)
        else:
            sector_query = Q(output__outputsector__sector=sector)
        query.add(sector_query, Q.AND)
    if sdg:
        # if year and int(year) < 2018:
        #     if sdg == '0':
        #         sdg_query = Q(output__outputsdg__isnull=True)
        #     else:
        #         sdg_query = Q(output__outputsdg__sdg=sdg)
        if sdg == '0':
            sdg_query = Q(output__outputtarget__isnull=True)
        else:
            sdg_query = Q(output__outputtarget__target_id__sdg=sdg) & Q(output__outputtarget__year=year)

        query.add(sdg_query, Q.AND)
    if budget_source:
        budget_source_query = Q(donorfundsplitup__organisation__ref_id=budget_source) | \
            Q(donorfundsplitup__organisation__type_level_3=budget_source)
        query.add(Q(budget_source_query) & Q(donorfundsplitup__year=year), Q.AND)
    if signature_solution:
        signature_solution_query = Q(output__signature_solution__ss_id=signature_solution)
        query.add(signature_solution_query, Q.AND)

    return query


def get_fund_split_query(year, budget_source=None, budget_type='', operating_unit=None, sector=None,
                         sdg=None, signature_solution=None, project_id=None, sdg_target=None,
                         marker_type=None, marker_id=None):
    query = Q()
    if year:
        query.add(Q(year=year), Q.AND)
    if budget_source:
        if budget_type != 'regular':
            query.add(Q(organisation__ref_id=budget_source) | Q(organisation__type_level_3=budget_source), Q.AND)
        if budget_type == 'regular':
            query.add(Q(organisation__ref_id=UNDP_DONOR_ID), Q.AND)
    if operating_unit:
        op_unit_query = Q(project__operating_unit__bureau__code=operating_unit) | \
            Q(project__operating_unit__iso3=operating_unit)
        query.add(op_unit_query, Q.AND)
    if sector:
        if year and int(year) < SP_START_YEAR:
            if sector == '0':
                EXCLUDED_SECTOR_CODES.append('8')
                # other_sector_query = Q(outputsector__isnull=True) | \
                #                      Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES) | Q(
                #     outputsector__sector__in=NEW_SECTOR_CODES)
                other_sector_query = Q(outputsector__isnull=True) | \
                                     Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES)
                outputs = Output.objects.filter(other_sector_query).distinct().values_list('output_id', flat=True)
            else:
                outputs = Output.objects.filter(Q(outputsector__sector=sector),
                                                Q(outputsector__sector__start_year__lte=year))\
                    .distinct().values_list('output_id', flat=True)
        else:
            if sector == '0':
                EXCLUDED_SECTOR_CODES.append('8')
                # other_sector_query = Q(outputsector__isnull=True) | \
                #                      Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES) | Q(
                #     outputsector__sector__in=OLD_SECTOR_CODES)
                other_sector_query = Q(outputsector__isnull=True) | \
                                     Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES)
                outputs = Output.objects.filter(other_sector_query).distinct().values_list('output_id', flat=True)
            else:
                outputs = Output.objects.filter(Q(outputsector__sector=sector),
                                                Q(outputsector__sector__start_year__gte=SP_START_YEAR))\
                    .distinct().values_list('output_id', flat=True)

        query.add(Q(output__in=outputs), Q.AND)
    if sdg:
        # if year and int(year) < SP_START_YEAR:
        #     if sdg == '0':
        #         outputs = Output.objects.filter(Q(outputsdg__isnull=True)).distinct().values_list('output_id',
        #                                                                                           flat=True)
        #     else:
        #         outputs = Output.objects.filter(Q(outputsdg__sdg=sdg)).distinct().values_list('output_id', flat=True)
        if sdg == '0':
                outputs = Output.objects.filter(Q(outputtarget__isnull=True)).distinct().values_list('output_id',
                                                                                                     flat=True)
        else:
            outputs = Output.objects.filter(Q(outputtarget__target_id__sdg=sdg) & Q(
                    output_active__year=year) & Q(outputtarget__year=year))\
                .distinct().values_list('output_id', flat=True)
        query.add(Q(output__in=outputs), Q.AND)
    if sdg_target:
        outputs = Output.objects.filter(Q(outputtarget__target_id=sdg_target) & Q(
            output_active__year=year) & Q(outputtarget__year=year)).distinct().values_list('output_id', flat=True)
        query.add(Q(output__in=outputs), Q.AND)
    if marker_type:
        outputs = ProjectMarker.objects.filter(Q(type=marker_type) & Q(
            output__output_active__year=year)).distinct().values_list('output_id', flat=True)

        if marker_id:
            if int(marker_type) == MARKER_TYPE_CHOICES.partner_marker:
                outputs = outputs.filter(Q(parent_marker_desc=str(marker_id)) & Q(
                    output__output_active__year=year)).distinct().values_list('output_id', flat=True)
            elif int(marker_type) == MARKER_TYPE_CHOICES.whos_marker:
                outputs = outputs.filter(Q(marker_title=str(marker_id)) & Q(
                    output__output_active__year=year)).distinct().values_list('output_id', flat=True)
            elif int(marker_type) == MARKER_TYPE_CHOICES.jointprogramme_marker:
                outputs = outputs.filter(Q(level_two_marker_description=str(marker_id)) & Q(
                    output__output_active__year=year)).distinct().values_list('output_id', flat=True)
            else:
                outputs = outputs.filter(Q(marker_id=marker_id) & Q(
                    output__output_active__year=year)).distinct().values_list('output_id', flat=True)
        query.add(Q(output__in=outputs), Q.AND)
    if signature_solution:
        signature_solution_query = Q(output__signature_solution__ss_id=signature_solution)
        query.add(signature_solution_query, Q.AND)

    if project_id:
        query.add(Q(project=project_id), Q.AND)

    return query


def get_fund_split_many_query(years, budget_sources=None, budget_type='', operating_units=None, sector=None, sdg=None):
    query = Q()
    if years:
        years = [int(y) for y in years]
        query.add(Q(year__in=years), Q.AND)
    if budget_sources:
        if budget_type != 'regular':
            budget_sources = [item.upper() for item in budget_sources]
            query.add(Q(organisation__ref_id__in=budget_sources) | Q(organisation__type_level_3__in=budget_sources),
                      Q.AND)
        if budget_type == 'regular':
            query.add(Q(organisation__ref_id=UNDP_DONOR_ID), Q.AND)
    return query


def get_project_aggregate(year, active_projects, operating_unit=None, budget_source=None,
                          sector=None, sdg=None):
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sector=sector, sdg=sdg)
    projects = Project.objects.filter(projects_query).distinct()

    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      sector=sector, sdg=sdg)
    donor_query = fund_query & Q(project__in=projects)

    project_aggregate = projects\
        .aggregate(outputs_count=Count('output', distinct=True),
                   projects_count=Count('project_id', distinct=True))
    countries_count = projects.filter(operating_unit__area_type='country')\
        .aggregate(countries_count=Count('operating_unit', distinct=True))['countries_count']

    fund_aggregate = DonorFundSplitUp.objects.filter(donor_query)\
        .aggregate(budget_amount=Sum('budget'),
                   expense_amount=Sum('expense'),
                   donors_count=Count('organisation', distinct=True))

    return {
        'outputs': project_aggregate.get('outputs_count', 0),
        'projects': project_aggregate.get('projects_count', 0),
        'expense': fund_aggregate.get('expense_amount', 0),
        'budget': fund_aggregate.get('budget_amount', 0),
        'year': year,
        'countries': countries_count,
        'donors': fund_aggregate.get('donors_count', 0)
    }


def get_sector_aggregate(year, active_projects, sector=None, operating_unit=None, budget_source=None):
    import datetime
    if sector is not None:
        sector_name = sector.sector
        sector_code = sector
        start_year = sector.start_year
        end_year = sector.end_year
    else:
        sector_name = 'Others'
        sector_code = '0'
        start_year = SECTOR_OTHERS_YEAR
        end_year = datetime.date.today().year
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sector=sector_code)
    projects = Project.objects.filter(projects_query).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      sector=sector_code)
    donor_query = fund_query & Q(project__in=projects)
    total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                            sector=None)
    project_aggregate = projects\
        .aggregate(countries_count=Count('operating_unit', distinct=True),
                   outputs_count=Count('output', distinct=True),
                   projects_count=Count('project_id', distinct=True))
    countries_count = projects.filter(Q(operating_unit__area_type='country'))\
        .aggregate(countries_count=Count('operating_unit', distinct=True))['countries_count']
    fund_aggregate = DonorFundSplitUp.objects.filter(donor_query)\
        .aggregate(budget_amount=Sum('budget'),
                   expense_amount=Sum('expense'),
                   donors_count=Count('organisation', distinct=True))
    total_budget = DonorFundSplitUp.objects.filter(total_fund_query)\
        .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
    budget = fund_aggregate.get('budget_amount', 0)
    expense = fund_aggregate.get('expense_amount', 0)
    project_count = project_aggregate.get('projects_count', 0)
    output_count = project_aggregate.get('outputs_count', 0)
    if budget and total_budget:
        budget_percentage = budget / total_budget * 100 if total_budget > 0 else 0
    else:
        budget_percentage = 0
    return {
        'sector': sector_code,
        'sector_name': sector_name,
        'year': year,
        'total_projects': project_count,
        'total_outputs': output_count,
        'expense': expense if expense else 0,
        'budget': budget if budget else 0,
        'percentage': round(budget_percentage, 1),
        'countries_count': countries_count,
        'start_year': start_year,
        'end_year': end_year,
    }


def get_organisation_fund_split(year, organisation):
    result = DonorFundSplitUp.objects.filter(year=year, organisation=organisation).values('year')\
        .annotate(total_budget=Sum('budget'), total_expense=Sum('expense')).order_by('total_budget')
    return result


def get_budget_sources_for_year(year, operating_unit=None, project=None, sector=None):
    active_projects = get_active_projects_for_year(year)
    result = DonorFundSplitUp.objects.filter(year=year, project__in=active_projects)
    if operating_unit:
        result = result.filter(Q(project__operating_unit=operating_unit) |
                               Q(project__operating_unit__bureau__code=operating_unit))
    if project:
        result = result.filter(project=project)
    if sector:
        result = result.filter(output__outputsector__code=sector)
    # result = result \
    #     .values('organisation__ref_id', 'organisation__org_name', 'organisation__short_name',
    #             'organisation__type_level_3') \
    #     .annotate(total_budget=Sum('budget'), total_expense=Sum('expense'))\
    #     .order_by('-total_budget')
    result = result \
        .values('organisation__level_3_name',
                'organisation__type_level_3') \
        .annotate(total_budget=Sum('budget'), total_expense=Sum('expense')) \
        .filter(total_budget__gt=0)\
        .order_by('-total_budget')
    return result


def get_fund_modality(year, donor=None, group_by='', donor_vs_total=False):
    result = DonorFundModality.objects.filter(year=year, contribution__gt=0)
    if donor is not None:
        donor_query = Q(organisation__type_level_3=donor) | Q(organisation__ref_id=donor)
        result = result.filter(donor_query)
    if not group_by:
        result = result.values('fund_type')
    else:
        # result = result.filter(fund_type='Other Resources')
        result = result.values('fund_stream')
    if donor_vs_total:
        result = DonorFundModality.objects.filter(year=year, contribution__gt=0, fund_type='Regular Resources')
        total_contribution = result.aggregate(amount=Sum('contribution'))['amount']
        if donor:
            result = result.filter(donor_query)
        result = result.values('fund_type')
    else:
        total_contribution = result.aggregate(amount=Sum('contribution'))['amount']

    if not group_by:
        result = result.annotate(total_contribution=Sum('contribution')) \
            .filter(total_contribution__gt=0) \
            .annotate(percentage=(Case(When(total_contribution=0, then=0),
                                       default=(Sum('contribution') / Value(total_contribution) * 100)))) \
            .filter(percentage__gt=0)\
            .order_by('-percentage')
    else:
        result = result.annotate(total_contribution=Sum('contribution'))\
            .filter(total_contribution__gt=0)\
            .annotate(percentage=(Case(When(total_contribution=0, then=0),
                                       default=(Sum('contribution') / Value(total_contribution) * 100))),
                      priority=Case(When(fund_stream='Core', then=Value(1, output_field=IntegerField())),
                                    When(fund_stream='Cost Sharing', then=Value(2, output_field=IntegerField())),
                                    When(fund_stream='Vertical Funds', then=Value(3, output_field=IntegerField())),
                                    When(fund_stream='Thematic Funds', then=Value(4, output_field=IntegerField())),
                                    When(fund_stream='Trust Funds', then=Value(5, output_field=IntegerField())),
                                    When(fund_stream='Others', then=Value(6, output_field=IntegerField())),
                                    default=Value(10, output_field=IntegerField())
                                    )
                      ) \
            .filter(percentage__gt=0) \
            .order_by('priority')

    return result


def get_fund_aggregate(year, donor=None, recipient_countries=None, sector=None, sdg=None):
    result = DonorFundSplitUp.objects.filter(Q(year=year) &
                                             ~Q(organisation__type_level_3=''))
    if donor:
        result = result.filter(Q(organisation__type_level_3__iexact=donor) |
                               Q(organisation__level_3_name__iexact=donor) |
                               Q(organisation__ref_id=donor))
    if recipient_countries:
        recipient_countries = [item.upper() for item in recipient_countries]
        op_query = Q(project__operating_unit__in=recipient_countries) | \
            Q(project__operating_unit__bureau__code__in=recipient_countries)
        result = result.filter(op_query)
    if sector:
        if sector == '0' or sector in EXCLUDED_SECTOR_CODES:
            EXCLUDED_SECTOR_CODES.append('8')
            sector_query = Q(output__outputsector__sector=sector) | Q(output__outputsector__isnull=True) |\
                Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
            result = result.filter(sector_query)
        else:
            result = result.filter(output__outputsector__sector=sector)
    if sdg:
        if sdg == '0':
            # result = result.filter(output__outputsdg__isnull=True)
            result = result.filter(output__outputtarget__isnull=True)
        else:
            # result = result.filter(output__outputsdg__sdg=sdg)
            result = result.filter(output__outputtarget__target_id__sdg=sdg)
    if donor and result.filter(organisation__ref_id=donor).exists():
        result = result.values('organisation')\
            .annotate(total_budget=Sum('budget'), total_expense=Sum('expense'),
                      total_projects=Count('project', distinct=True),
                      org_name=F('organisation__org_name'))\
            .filter(total_budget__gt=0)\
            .order_by('-total_budget')\
            .values('organisation_id', 'organisation__type_level_3', 'organisation__level_3_name',
                    'total_budget', 'total_expense', 'total_projects', 'org_name')
    else:
        result = result.values('organisation__type_level_3', 'organisation__level_3_name')\
            .annotate(total_budget=Sum('budget'), total_expense=Sum('expense'),
                      total_projects=Count('project', distinct=True)) \
            .filter(Q(total_budget__gt=0) | Q(total_expense__gt=0)) \
            .order_by('-total_budget')
    return result


def get_top_recipients(year, donor=None):
    query = Q(year=year) & Q(Q(organisation__type_level_3=donor) | Q(organisation__ref_id=donor))
    result = DonorFundSplitUp.objects.filter(query)\
        .filter(project__operating_unit__isnull=False)\
        .values('project__operating_unit')\
        .annotate(total_budget=Sum('budget'), total_expense=Sum('expense'), total_projects=Count('project')) \
        .filter(total_budget__gt=0)\
        .values('total_budget', 'total_expense', 'project__operating_unit__name',
                'total_projects', 'project__operating_unit')\
        .order_by('-total_budget')[:10]

    return result


class RoundToTwo(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 2)'


class Round(Func):
    function = 'ROUND'
    template = '%(function)s(%(expressions)s, 0)'


def get_donor_category_value(label):
    value = DONOR_CATEGORY_CHOICES.get_value(label)
    if label in ['Non-DAC and non-programme cty', 'Non-DAC and non-programme countries',
                 'Non-DAC and non-programme country']:
        value = DONOR_CATEGORY_CHOICES.get_value('Non-DAC and non-programme country')
    elif value == 'OTHERS_UNIDENTIFIED':
        value = DONOR_CATEGORY_CHOICES.get_value('Others Unidentified')
    return value


def get_donor_category_label(value):
    label = DONOR_CATEGORY_CHOICES.get_label(value)
    return label


# def get_vendor_classification_value(label):
#     value = VENDOR_CLASSIFICATION_TYPES.get_value(label)
#     return value


def get_bureau_label(value):
    try:
        label = Bureau.objects.get(id=value).bureau
    except Exception as e:
        print(e)
        label = ''
    return label


def get_donor_category_color(label):
    value = DONOR_CATEGORY_COLORS.get_value(label)
    return value


def get_bureau_color(label):
    value = BUREAU_COLORS.get_value(label)
    return value


def in_dictlist(my_dictlist, *item):
    for this in my_dictlist:
        if this[item[0]] == item[1]:
            return this
    return {}


def get_sankey_nodes(donor_query, recipient_query, sector_year_query, ss_query=None):
    EXCLUDED_SECTOR_CODES.append('8')

    nodes = []
    donor_types = DONOR_CATEGORY_CHOICES.choices()
    valid_donor_values = DonorFundSplitUp.objects.filter(donor_query) \
        .annotate(new_donor_category=Case(When(donor_category__in=[7, 12, 13],
                                               then=Value(16, output_field=IntegerField())),
                                          When(donor_category__in=[2, 5, 14],
                                               then=Value(17, output_field=IntegerField())),
                                          default=F('donor_category'))) \
        .values_list('new_donor_category', flat=True).distinct()
    valid_bureau_values = DonorFundSplitUp.objects.filter(donor_query) \
        .values_list('project__operating_unit__bureau__code', flat=True).distinct()
    valid_sectors = DonorFundSplitUp.objects \
        .filter(recipient_query & sector_year_query & Q(output__outputsector__sector__isnull=False)) \
        .exclude(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) \
        .values_list('output__outputsector__sector', flat=True).distinct()
    null_sector_query = Q(output__outputsector__sector__isnull=False) | \
        Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
    null_sector = DonorFundSplitUp.objects.filter(recipient_query & sector_year_query & null_sector_query) \
        .values_list('output__outputsector__sector', flat=True).distinct()
    i = 0
    donor_types = dict((key, value) for key, value in dict(donor_types).items() if key in valid_donor_values)

    for (k, v) in donor_types.items():
        nodes.append({
            'code': i,
            'name': v,
            'color': get_donor_category_color(v)
        })
        i += 1
    bureaus = Bureau.objects.filter(code__in=valid_bureau_values)
    for bureau in bureaus:
        nodes.append({
            'code': i,
            'name': bureau.bureau,
            'color': get_bureau_color(bureau.bureau)
        })
        i += 1
    sectors = Sector.objects.filter(code__in=valid_sectors)
    for sector in sectors:
        nodes.append({
            'code': i,
            'name': sector.sector,
            'color': sector.color
        })
        i += 1
    if null_sector:
        nodes.append({
            'code': i,
            'name': 'Others',
            'color': NULL_SECTOR_COLOR_CODE
        })
        i += 1
    if ss_query:
        signature_solutions = SignatureSolution.objects.values('ss_id', 'name').distinct()
        for signature_solution in signature_solutions:
            nodes.append({
                'code': i,
                'name': signature_solution['name'] if signature_solution['name'] != 'Others' else ' Others',
                'short_name': SIGNATURE_SOLUTION_SHORT_NAMES.get(signature_solution['ss_id'], '') if signature_solution['name'] != 'Others' else 'Others',
                'color': SIGNATURE_SOLUTION_COLORS.get(signature_solution['name'], '')
            })
            i += 1

    return nodes


def check_file_category(value, category="atlas"):
    import re
    pattern = re.compile("IATIPublishing122017/atlas_projects_[0-9]{4}")

    if category == "annual_xml":

        return pattern.match(value)
    if category == "master":
        if value in MASTER_FILES:
            return True
    if category == "misc":
        if value in MISC_FILES:
            return True
    return False


def get_file_category(value):
    import re

    pattern = re.compile("atlas_projects_[0-9]{4}")
    if pattern.match(value):
        return "annual_xml"
    value = value.split('/')[:1][0]
    if value in MASTER_FILES:
        return "master"
    if value in MISC_FILES:
        return "misc"
    return ""


def get_file_name(name):
    name_l = name.split('/')[-1]
    return name_l


def save_file_to_local_path(name, output_file_name, category):
    try:
        local_file = get_local_filename(name, category)
        same = check_if_file_is_modified(local_file, output_file_name)
        if not same and category in ["annual_xml", "master", "misc"]:
            copy_file_to_upload_folder(output_file_name, local_file)
            file_name = local_file.split('/')[-1]
            return file_name
        return ''
    except Exception as e:
        print(e)
    return ''


def get_zip_file_name(url):
    from urllib.parse import urlparse, urlsplit
    split = urlsplit(url)
    filename = split.path.split("/")[-1]
    return filename


def created_extraction_folder(extraction_path, zip_file_name):
    folder_name = zip_file_name.split('.')[0]
    folder_path = extraction_path + '/' + folder_name
    if not os.path.isdir(folder_path):
        os.makedirs(folder_path)
    return folder_name, True


def create_upload_file_path(file_name, category, default_file_name):
    if category == "annual_xml":
        return ANNUAL_UPLOAD_DIR + '/' + file_name
    if category == "master":
        return CSV_UPLOAD_DIR + '/' + file_name
    if category == "misc":
        return CSV_UPLOAD_DIR + '/' + file_name
    return default_file_name


def create_download_file_path(file_name, category, default_file_name):
    if category in ["annual_xml", "master", "misc"]:
        return ANNUAL_DOWNLOAD_DIR + '/' + file_name
    return default_file_name


def check_if_file_is_modified(local_file, downloaded_file):
    import filecmp
    try:
        same = filecmp.cmp(local_file, downloaded_file)
    except:
        same = None
    return same


def get_local_filename(name, category=""):
    file_name = name.split('/')[-1]
    if category == "annual_xml":
        return ANNUAL_UPLOAD_DIR + '/' + file_name
    if category == "master" or category == "misc":
        return CSV_UPLOAD_DIR + '/' + file_name
    return ''


def update_file_details(files_to_be_uploaded):
    old_file_config = configparser.ConfigParser()
    old_file_config.read(FILE_DETAILS_PATH)
    file_config = configparser.ConfigParser()
    file_config['annual_xml'] = {}
    file_config['master'] = {}
    file_config['misc'] = {}
    file_config['new'] = {}
    default_section_files = {
        'master': MASTER_FILES,
        'misc': MISC_FILES,
    }
    for section, files in files_to_be_uploaded.items():
        for f in files:
            file_config[section][f] = '1'
            file_config['new'][f] = '1'

        for item in old_file_config['new']:
            if section in default_section_files.keys():
                default_files = default_section_files.get(section, '')

                if item not in file_config[section] and item in default_files:
                    file_config[section][item] = '1'
            else:
                if item not in MASTER_FILES and item not in MISC_FILES:
                    file_config[section][item] = '1'

    with open(FILE_DETAILS_PATH, 'w') as file_config_output:
        file_config.write(file_config_output)


# def get_global_theme_details(year, operating_unit=''):
#     query = Q(year=year) & Q(project__project_active__year=year)
#     if operating_unit:
#         query.add(Q(project__operating_unit=operating_unit) |
#                   Q(project__operating_unit__bureau__code=operating_unit), Q.AND)
#
#     total_budget = DonorFundSplitUp.objects.filter(query)\
#         .aggregate(total_budget=Sum('budget'))['total_budget']
#     other_sector_query = Q(output__outputsector__sector__isnull=True) | \
#         Q(output__outputsector__sector__in=EXCLUDED_SECTOR_CODES)
#
#     EXCLUDED_SECTOR_CODES.append('8')
#     results = DonorFundSplitUp.objects\
#         .filter(query) \
#         .exclude(other_sector_query)\
#         .values('output__outputsector__sector')\
#         .annotate(total_budget=Value(total_budget, output_field=DecimalField()))\
#         .annotate(theme_budget=Sum('budget'),
#                   percentage=Case(When(total_budget=0, then=0),
#                                   default=(Sum('budget') / Value(total_budget) * 100)))\
#         .values('output__outputsector__sector', 'output__outputsector__sector__sector',
#                 'theme_budget', 'percentage', 'output__outputsector__sector__color') \
#         .order_by('-theme_budget')
#     results = list(results)
#     other_sector_results = DonorFundSplitUp.objects\
#         .filter(other_sector_query)\
#         .filter(query)\
#         .aggregate(theme_budget=Sum('budget'))
#     try:
#         percentage = other_sector_results['theme_budget'] / total_budget * 100
#     except:
#         percentage = 0
#     if percentage:
#         res = {
#             'output__outputsector__sector': '0',
#             'output__outputsector__sector__sector': 'Others',
#             'output__outputsector__sector__color': NULL_SECTOR_COLOR_CODE,
#             'theme_budget': other_sector_results['theme_budget'],
#             'percentage':  percentage
#         }
#         results.append(res)
#     return results
#


def get_global_theme_details(year, sector=None, operating_unit=None, budget_source=None):
    if sector is not None:
        sector_name = sector.sector
        sector_code = sector
        sector_color = sector.color
    else:
        sector_name = 'Others'
        sector_code = '0'
        sector_color = NULL_SECTOR_COLOR_CODE
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sector=sector_code)
    projects = Project.objects.filter(projects_query).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      sector=sector_code)
    donor_query = fund_query & Q(project__in=projects)
    total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                            sector=None)
    fund_aggregate = DonorFundSplitUp.objects.filter(donor_query)\
        .aggregate(budget_amount=Sum('budget'),
                   expense_amount=Sum('expense'))
    total_budget = DonorFundSplitUp.objects.filter(total_fund_query)\
        .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
    total_expense = DonorFundSplitUp.objects.filter(total_fund_query) \
        .aggregate(expense_amount=Sum('expense')).get('expense_amount', 0)
    budget = fund_aggregate.get('budget_amount', 0)
    expense = fund_aggregate.get('expense_amount', 0)
    if budget and total_budget:
        percentage = budget / total_budget * 100 if total_budget > 0 else 0
    else:
        percentage = 0
    if percentage:
        results = {
            'output__outputsector__sector': sector_code,
            'output__outputsector__sector__sector': sector_name,
            'output__outputsector__sector__color': sector_color,
            'theme_budget': budget,
            'percentage': percentage,
            'theme_expense': expense,
            'total_budget': total_budget,
            'total_expense': total_expense
        }
    else:
        results = {}
    return results


def get_sdg_aggregate(year, sdg, operating_unit='', budget_source=''):
    if sdg is not None:
        sdg_name = sdg.name
        sdg_code = sdg
        sdg_color = sdg.color
    else:
        sdg_name = 'Others'
        sdg_code = '0'
        sdg_color = NULL_SECTOR_COLOR_CODE
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sdg=sdg_code)
    projects = Project.objects.filter(projects_query).distinct()
    countries_count = Project.objects.filter(projects_query & Q(operating_unit__area_type='country')) \
        .aggregate(countries=Count('operating_unit', distinct=True))['countries']

    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      sdg=sdg_code)
    donor_query = fund_query & Q(project__in=projects)
    total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                            sector=None)
    fund_aggregate = DonorFundSplitUp.objects.filter(donor_query)\
        .aggregate(budget_amount=Sum('budget'),
                   expense_amount=Sum('expense'))
    total_budget = DonorFundSplitUp.objects.filter(total_fund_query)\
        .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
    budget = fund_aggregate.get('budget_amount', 0)
    if budget and total_budget:
        percentage = budget / total_budget * 100 if total_budget > 0 else 0
    else:
        percentage = 0

    if percentage > 0:
        aggregate = {
            'total_budget': fund_aggregate['budget_amount'],
            'total_expense': fund_aggregate['expense_amount'],
            'total_projects': projects.distinct().count(),
            'sdg_code': sdg_code,
            'sdg_name': sdg_name,
            'color': sdg_color,
            'percentage': percentage,
            'year': year,
            'countries_count': countries_count
        }
    else:
        aggregate = None
    return aggregate

# def get_sdg_aggregate(year, sdg, operating_unit='', budget_source=''):
#     query = Q(year=year) & Q(project__project_active__year=year)
#     if operating_unit:
#         query.add(Q(project__operating_unit=operating_unit), Q.AND)
#     if budget_source:
#         budget_source_query = Q(organisation__ref_id=budget_source) | \
#                               Q(organisation__type_level_3=budget_source)
#         query.add(budget_source_query, Q.AND)
#     total_mapping = DonorFundSplitUp.objects.filter(query)\
#         .aggregate(total_budget=Coalesce(Sum('budget'), 0))
#     if sdg:
#         query.add(Q(output__outputsdg__sdg=sdg), Q.AND)
#     else:
#         query.add(Q(output__outputsdg__isnull=True), Q.AND)
#     mapping = DonorFundSplitUp.objects.filter(query)\
#         .aggregate(total_budget=Coalesce(Sum('budget'), 0),
#                    total_expense=Coalesce(Sum('expense'), 0),
#                    projects_count=Count('project', distinct=True))
#     if total_mapping['total_budget'] > 0:
#         percentage = mapping['total_budget'] / total_mapping['total_budget'] * 100
#     else:
#         percentage = 0
#     if percentage > 0:
#         aggregate = {
#             'total_budget': mapping['total_budget'],
#             'total_expense': mapping['total_expense'],
#             'total_projects': mapping['projects_count'],
#             'sdg_code': sdg.code if sdg else '0',
#             'sdg_name': sdg.name if sdg else 'Others',
#             'color': sdg.color if sdg else NULL_SDG_COLOR_CODE,
#             'percentage': percentage,
#             'year': year
#         }
#     else:
#         aggregate = None
#     return aggregate


def get_country_results_with_actual_data(actual_year, operating_unit):
    previous_year_data = CountryResultPeriod.objects \
        .filter(~Q(actual='') &
                Q(period_start__year=actual_year) &
                Q(operating_unit=operating_unit))
    if previous_year_data:
        return previous_year_data
    year = actual_year - 1
    get_country_results_with_actual_data(year, operating_unit)


def get_country_results_with_target_data(target_year, operating_unit):
    previous_year_data = CountryResultPeriod.objects\
        .filter(~Q(target='') &
                Q(period_start__year=target_year) &
                Q(operating_unit=operating_unit))
    if previous_year_data:
        return previous_year_data
    year = target_year - 1
    get_country_results_with_target_data(year, operating_unit)


def change_database(alias):
    from django.db import connections

    if alias not in connections.databases:
        connections.databases[alias] = connections.databases['default']  # Copy 'default'
        connections.databases[alias]['NAME'] = alias


def change_default_database_to_alias(alias):
    # from django.db import connections
    # connections.databases['default'] = connections.databases[alias]
    # connections.databases['default']['NAME'] = alias
    settings.DB_ALIAS = alias


def get_active_database_name():
    from django.db import connection
    db_name = connection.settings_dict['NAME']
    print(connection.settings_dict)
    return db_name


def change_local_settings(source, target):
    source_path = SETTINGS_DIR + "/" + source
    target_path = SETTINGS_DIR + "/" + target
    temp_path = SETTINGS_DIR + "/temp.txt"
    os.rename(target_path, temp_path)
    os.rename(source_path, target_path)
    os.rename(temp_path, source_path)


def get_valid_sectors(year, operating_unit, donor, sector=''):
    query = Q()
    if year:
        year_query = Q(Q(project_active__year=year) & Q(donorfundsplitup__year=year)) | \
            Q(Q(project_active__year=year) &
              Q(Q(donorfundsplitup__isnull=True) | ~Q(donorfundsplitup__year=year)))
        query.add(year_query, Q.AND)
    if operating_unit:
        op_query = Q(operating_unit__iso3=operating_unit) | Q(operating_unit__bureau__code=operating_unit)
        query.add(op_query, Q.AND)
    if donor:
        donor_query = Q(donorfundsplitup__organisation=donor) | Q(donorfundsplitup__organisation__type_level_3=donor)
        if year:
            donor_query.add(Q(donorfundsplitup__year=year), Q.AND)
        query.add(donor_query, Q.AND)
    if sector == '0':
        EXCLUDED_SECTOR_CODES.append('8')
        sector_query = Q(outputsector__sector__in=EXCLUDED_SECTOR_CODES) | Q(outputsector__isnull=True)
        query.add(sector_query, Q.AND)
    sectors = Project.objects.filter(query).values_list('outputsector__sector', flat=True)
    return sectors


def get_valid_sdgs(year, operating_unit, donor, sdg=''):
    query = Q()
    if year:
        year_query = Q(Q(project_active__year=year) & Q(donorfundsplitup__year=year)) | \
            Q(Q(project_active__year=year) &
              Q(Q(donorfundsplitup__isnull=True) | ~Q(donorfundsplitup__year=year)))
        query.add(year_query, Q.AND)
    if operating_unit:
        op_query = Q(operating_unit__iso3=operating_unit) | Q(operating_unit__bureau__code=operating_unit)
        query.add(op_query, Q.AND)
    if donor:
        donor_query = Q(donorfundsplitup__organisation=donor) | Q(donorfundsplitup__organisation__type_level_3=donor)
        if year:
            donor_query.add(Q(donorfundsplitup__year=year), Q.AND)
        query.add(donor_query, Q.AND)
    if sdg == '0':
        # query.add(Q(outputsdg__isnull=True), Q.AND)
        query.add(Q(outputtarget__isnull=True), Q.AND)
    if sdg != '0'and year:
        query.add(Q(outputtarget__year=year), Q.AND)
    # sdgs = Project.objects.filter(query).values_list('outputsdg__sdg', flat=True)
    sdgs = Project.objects.filter(query).values_list('outputtarget__target_id__sdg', flat=True)
    return sdgs


def get_actual_year_data(actual_year, operating_unit, component_id):
    country_results = CountryResultPeriod.objects.filter(period_start__year=actual_year,
                                                         operating_unit__iso3=operating_unit,
                                                         component_id=component_id)
    if actual_year == 2012:
        return ''
    if country_results:
        actual = country_results[0].actual
        if actual:
            return actual
    year = actual_year - 1
    return get_actual_year_data(year, operating_unit, component_id)

#
# def get_db_config(config_path):
#     with open(config_path, 'r') as config_file:
#         content = config_file.read()
#     content_list = content.split("\n")
#     item_list_1 = content_list[0].split('=')
#     item_list_2 = content_list[1].split('=')
#     if item_list_1[0] == 'MIRROR1':
#         mirror1 = item_list_1[1]
#         mirror2 = item_list_2[1]
#     else:
#         mirror2 = item_list_1[1]
#         mirror1 = item_list_2[1]
#     return mirror2, mirror1
#
#
# def set_db_config(config_path, mirror1, mirror2):
#     content = "MIRROR1 = %s\nMIRROR2 = %s" % (mirror1, mirror2)
#     with open(config_path, 'w') as config_file:
#         config_file.write(content)
#
#
# def change_local_settings():
#     config_path = SETTINGS_DIR + "/config.ini"
#     mirror2, mirror1 = get_db_config()
#     set_db_config(config_path, mirror1, mirror2)


def export_to_csv(file_path, content, header=[]):
    import csv
    try:
        with open(file_path, 'w', newline="", encoding='utf-8') as csvfile:
            csv_writer = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
            csv_writer.writerow(header)
            for item in content:
                row = [item[h] for h in header]
                csv_writer.writerow(row)
    except Exception as e:
        print(e)
        pass


def get_media_path(file_name):
    return "%s%s" % (main_settings.MEDIA_URL, file_name)


def convert_to_ordered_dict(json_dict):

    converted_data = []
    if isinstance(json_dict, dict):
        return get_ordered_dict(json_dict)
    else:
        for item in json_dict:
            pass
    return converted_data


def convert_json_to_ordered_dict(json_dict):
    import json
    from collections import OrderedDict

    json_data = json.loads(json_dict)
    data = json.loads(json_data, object_pairs_hook=OrderedDict)
    return json.dumps(data, indent=4)


def get_ordered_dict(dict_data):
    from collections import OrderedDict

    ordered_dict = OrderedDict()
    for k, v in dict_data.items():
        ordered_dict[k] = v
    return ordered_dict


def get_last_updated_date():
    admin_logs = AdminLog.objects.filter(job=JOBS.initiate_automation, status=LOG_STATUSES.successful) \
        .order_by('-executed_date')
    executed_date = ''
    if not admin_logs:
        admin_logs = AdminLog.objects \
            .filter(job=JOBS.parse_projects_outputs, status=LOG_STATUSES.successful) \
            .order_by('-executed_date')
    if admin_logs:
        executed_date = admin_logs[0].executed_date
    return executed_date


# def last_day_of_month():
#     import datetime
#     today = datetime.date.today()
#     first = today.replace(day=1)
#     last_month = first - datetime.timedelta(days=1)
#     return last_month

def last_day_of_month():
    import datetime
    today = datetime.date.today()
    first = today.replace(day=1)
    month = first - datetime.timedelta(days=1)
    if today.day >= UPDATE_DAY:
        last_month = month
    else:
        last_month_first = month.replace(day=1)
        last_month = last_month_first - datetime.timedelta(days=1)
    return last_month


def check_sdg_year(year_list):
    for y in year_list:
        if int(y) >= SDG_START_YEAR:
            return True
    return False


def get_signature_solutions_aggregate(year, active_projects, signature_solution=None, operating_unit=None,
                                      budget_source=None):
    if signature_solution is not None:
        ss_id = signature_solution.ss_id
        sp_name = signature_solution.name
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       signature_solution=ss_id)
    projects = Project.objects.filter(projects_query).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      signature_solution=ss_id)
    donor_query = fund_query & Q(project__in=projects)
    total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                            signature_solution=None)
    project_aggregate = projects \
        .aggregate(countries_count=Count('operating_unit', distinct=True),
                   outputs_count=Count('output', distinct=True),
                   projects_count=Count('project_id', distinct=True))
    countries_count = projects.filter(Q(operating_unit__area_type='country')) \
        .aggregate(countries_count=Count('operating_unit', distinct=True))['countries_count']
    fund_aggregate = DonorFundSplitUp.objects.filter(donor_query & Q(output__signature_solution__ss_id=ss_id)) \
        .aggregate(budget_amount=Sum('budget'),
                   expense_amount=Sum('expense'),
                   donors_count=Count('organisation', distinct=True))
    total_budget = DonorFundSplitUp.objects.filter(total_fund_query) \
        .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
    budget = fund_aggregate.get('budget_amount', 0)
    expense = fund_aggregate.get('expense_amount', 0)
    project_count = project_aggregate.get('projects_count', 0)
    output_count = project_aggregate.get('outputs_count', 0)
    donor_count = fund_aggregate.get('donors_count', 0)

    if budget and total_budget:
        budget_percentage = budget / total_budget * 100 if total_budget > 0 else 0
    else:
        budget_percentage = 0

    return {
        'ss_id': ss_id,
        'name': sp_name,
        'year': year,
        'projects': project_count,
        'total_outputs': output_count,
        'expense': expense if expense else 0,
        'budget': budget if budget else 0,
        'percentage': round(budget_percentage, 1),
        'operating_units': countries_count,
        'donors': donor_count
    }


def get_sdg_target_aggregate(year, sdg, operating_unit='', budget_source='', active_projects=[]):
    if sdg is not None:
        sdg_name = sdg.name
        sdg_code = sdg
        sdg_color = sdg.color
    else:
        sdg_name = 'Others'
        sdg_code = '0'
        sdg_color = NULL_SECTOR_COLOR_CODE
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sdg=sdg_code)

    projects = Project.objects.filter(projects_query & Q(project_id__in=active_projects)).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      sdg=sdg_code)
    donor_query = fund_query & Q(project__in=active_projects)
    countries_count = Project.objects.filter(projects_query & Q(operating_unit__area_type='country')) \
        .aggregate(countries=Count('operating_unit', distinct=True))['countries']
    total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                            sector=None) & Q(project__in=active_projects)
    total_budget = DonorFundSplitUp.objects.filter(total_fund_query).distinct() \
        .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
    if sdg:
        target_data = DonorFundSplitUp.objects.filter(donor_query & Q(project__projecttarget__year=year))\
            .distinct().values('project', 'project__projecttarget__target') \
            .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg_code,
                                                      then=(F('budget')*F('project__projecttarget__percentage')/100.0)),
                                                 default=Value(0, output_field=DecimalField()))),
                      expense_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg_code,
                                                       then=F('expense')*F('project__projecttarget__percentage')/100.0)),
                                             default=Value(0, output_field=DecimalField())))\
            .aggregate(total_budget=Coalesce(Sum(F('budget_percentage'),  output_field=DecimalField()),
                                             Value(0, output_field=DecimalField())),
                       total_expense=Coalesce(Sum(F('expense_percentage'),  output_field=DecimalField()),
                                              Value(0, output_field=DecimalField())),
                       )
    else:
        target_data = DonorFundSplitUp.objects.filter(donor_query & Q(project__projecttarget__isnull=True)
                                                      & Q(project__project_active__year=year))\
            .distinct().values('project') \
            .aggregate(total_budget=Coalesce(Sum(F('budget'),  output_field=DecimalField()),
                                             Value(0, output_field=DecimalField())),
                       total_expense=Coalesce(Sum(F('expense'),  output_field=DecimalField()),
                                              Value(0, output_field=DecimalField())),
                       )
    if total_budget:
        percentage = target_data['total_budget'] / total_budget * 100 if total_budget > 0 else 0
        budget_total = target_data.get('total_budget', 0)
        expense_total = target_data.get('total_expense', 0)
    if percentage > 0:
        return {
            'total_budget': budget_total,
            'total_expense': expense_total,
            'year': year,
            'sdg_name': sdg_name,
            'sdg_code': sdg_code,
            'color': sdg_color,
            'total_projects': projects.count(),
            'countries_count': countries_count,
            'percentage': percentage
        }
    return None


def get_sdg_budget_total(sdg, target_data, year):
    total_budget = total_expense = 0
    for item in target_data:
        target = item['target']
        budget_amount = item['total_budget']
        expense_amount = item['total_expense']
        project_id = item['project']
        try:
            percentage = ProjectTarget.objects.filter(project=project_id, target=target).last().percentage
        except:
            percentage = 100
        total_budget += budget_amount * percentage / 100
        total_budget += expense_amount * percentage / 100
    return total_budget, total_expense


#
# def get_sdg_budget_total(sdg, target_data, year):
#     targets = ProjectTarget.objects.filter(target__sdg=sdg, project__project_active__year=year)
#     print(targets)
#     total_budget = total_expense = 0
#     don_qs = target_data
#     print(target_data)
#     for ds in don_qs:
#         print(ds)
#         for target in targets.filter(project_id=ds['project']):
#             total_budget += ds['total_budget'] * target.percentage / 100
#             total_expense += ds['total_expense'] * target.percentage / 100
#     return total_budget, total_expense


def get_target_aggregate(year, target, operating_unit='', budget_source=''):
    sdg_obj = SdgTargets.objects.values('sdg', 'description').get(target_id=target)
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sdg=sdg_obj['sdg'])
    projects = Project.objects.filter(projects_query).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                      sdg=sdg_obj['sdg'])
    donor_query = fund_query & Q(project__in=projects)
    fund_aggregate = DonorFundSplitUp.objects.filter(donor_query) \
        .aggregate(budget_amount=Sum('budget'),
                   expense_amount=Sum('expense'))
    sdg_budget = fund_aggregate['budget_amount']
    outputs = OutputTarget.objects.values('output').filter(target_id=target)
    percent_budget = 0
    budget_percentage = 1
    target_budget = 0
    target_expense = 0
    for output in outputs:
        percent = OutputTarget.objects.values('percentage').get(target_id=target,
                                                                output=output['output'])
        target_aggregate = DonorFundSplitUp.objects.filter(Q(output__outputtarget__target_id=target)
                                                           & Q(output=output['output']) & Q(year=year)) \
            .annotate(total_expense=Coalesce(Sum('expense'), 0),
                      total_budget=Coalesce(Sum('budget'), 0)).values('total_budget', 'total_expense')

        for i in target_aggregate:
            target_budget = i['total_budget']
            target_expense = i['total_expense']
        if target_budget:
            percent_budget = target_budget / percent['percentage']
    if sdg_budget and percent_budget:
        budget_percentage = budget_percentage / sdg_budget * 100 if sdg_budget > 0 else 0
    if budget_percentage > 0:
        return {
            'target_budget': target_budget,
            'target_expense': target_expense,
            'budget_percentage': budget_percentage,
            'year': year,
        }
    return None


def get_target_aggregate_new(year, target, sdg,  operating_unit='', budget_source='', active_projects=[]):
    projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                       sdg=sdg)
    projects = Project.objects.filter(projects_query & Q(project_id__in=active_projects)).distinct()
    fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit, sdg=sdg)
    donor_query = fund_query & Q(project__in=projects)
    sdg_targets_aggregate = DonorFundSplitUp.objects.filter(donor_query & Q(project__projecttarget__year=year))\
        .distinct().values('project', 'project__projecttarget__target') \
        .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target=target,
                                                  then=(F('budget') * F('project__projecttarget__percentage') / 100.0)),
                                             default=Value(0, output_field=DecimalField()))),
                  expense_percentage=Sum(Case(When(project__projecttarget__target=target,
                                                   then=F('expense') * F(
                                                       'project__projecttarget__percentage') / 100.0)),
                                         default=Value(0, output_field=DecimalField())))\
        .aggregate(total_budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
                                     Value(0, output_field=DecimalField())),
                   total_expense=Coalesce(Sum(F('expense_percentage'), output_field=DecimalField()),
                                      Value(0, output_field=DecimalField())),
                   )

    sdg_aggregate = DonorFundSplitUp.objects.filter(donor_query & Q(project__projecttarget__year=year))\
        .distinct().values('project', 'project__projecttarget__target') \
        .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg,
                                                  then=(F('budget') * F('project__projecttarget__percentage') / 100.0)),
                                             default=Value(0, output_field=DecimalField()))),
                  expense_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg,
                                                   then=F('expense') * F(
                                                       'project__projecttarget__percentage') / 100.0)),
                                         default=Value(0, output_field=DecimalField())))\
        .aggregate(total_budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
                                         Value(0, output_field=DecimalField())),
                   total_expense=Coalesce(Sum(F('expense_percentage'), output_field=DecimalField()),
                                          Value(0, output_field=DecimalField())),
                   )
    sdg_budget = sdg_aggregate['total_budget']
    sdg_expense = sdg_aggregate['total_expense']
    if sdg_budget > 0:
        budget_percentage = sdg_targets_aggregate['total_budget'] / sdg_budget * 100
    else:
        budget_percentage = 0
    if sdg_expense > 0:
        expense_percentage = sdg_targets_aggregate['total_expense'] / sdg_expense * 100
    else:
        expense_percentage = 0
    return {
        'target_budget': sdg_targets_aggregate['total_budget'],
        'target_expense': sdg_targets_aggregate['total_expense'],
        'budget_percentage': budget_percentage,
        'expense_percentage': expense_percentage,
        'year': year,
    }


def get_sdg_target_based_fund_aggregate(year, sdg, operating_unit='', budget_source='', active_projects=[],
                                        project_id='', budget_type='', signature_solution='', sdg_target='',
                                        marker_type='', marker_id=''):
        projects_query = get_project_query(year, operating_unit=operating_unit, budget_source=budget_source,
                                           sdg=sdg)

        projects = Project.objects.filter(projects_query & Q(project_id__in=active_projects)).distinct()
        fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                          sdg=sdg, project_id=project_id, budget_type=budget_type,
                                          signature_solution=signature_solution, sdg_target=sdg_target,
                                          marker_type=marker_type, marker_id=marker_id)
        donor_query = fund_query & Q(project__in=projects)
        target_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                                 sdg_target=sdg_target)
        target_query = target_fund_query & Q(project__in=projects)
        countries_count = Project.objects.filter(projects_query & Q(operating_unit__area_type='country')) \
            .aggregate(countries=Count('operating_unit', distinct=True))['countries']
        total_fund_query = get_fund_split_query(year, budget_source=budget_source, operating_unit=operating_unit,
                                                sector=None) & Q(project__in=active_projects)
        total_budget = DonorFundSplitUp.objects.filter(total_fund_query).distinct() \
            .aggregate(budget_amount=Sum('budget')).get('budget_amount', 0)
        if sdg and sdg != '0':
            target_data = DonorFundSplitUp.objects.filter(donor_query & Q(project__projecttarget__year=year))\
                .distinct().values('project', 'project__projecttarget__target') \
                .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg,
                                                          then=(F('budget') * F(
                                                              'project__projecttarget__percentage') / 100.0)),
                                                     default=Value(0, output_field=DecimalField()))),
                          expense_percentage=Sum(Case(When(project__projecttarget__target__sdg=sdg,
                                                           then=F('expense') * F(
                                                               'project__projecttarget__percentage') / 100.0)),
                                                 default=Value(0, output_field=DecimalField()))) \
                .aggregate(total_budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
                                                 Value(0, output_field=DecimalField())),
                           total_expense=Coalesce(Sum(F('expense_percentage'), output_field=DecimalField()),
                                                  Value(0, output_field=DecimalField())),
                           )
        else:
            target_data = DonorFundSplitUp.objects.filter(
                donor_query & Q(project__projecttarget__isnull=True)).distinct().values('project') \
                .aggregate(total_budget=Coalesce(Sum(F('budget'), output_field=DecimalField()),
                                                 Value(0, output_field=DecimalField())),
                           total_expense=Coalesce(Sum(F('expense'), output_field=DecimalField()),
                                                  Value(0, output_field=DecimalField())),
                           )

        percentage = target_data['total_budget'] / total_budget * 100 if total_budget > 0 else 0
        budget_total = target_data.get('total_budget', 0)
        expense_total = target_data.get('total_expense', 0)
        if sdg_target:
            sdg_targets_aggregate = DonorFundSplitUp.objects.filter(target_query & Q(project__projecttarget__year=year)) \
                .distinct().values('project', 'project__projecttarget__target') \
                .annotate(budget_percentage=Sum(Case(When(project__projecttarget__target=sdg_target,
                                                          then=(F('budget') * F(
                                                              'project__projecttarget__percentage') / 100.0)),
                                                     default=Value(0, output_field=DecimalField()))),
                          expense_percentage=Sum(Case(When(project__projecttarget__target=sdg_target,
                                                           then=F('expense') * F(
                                                               'project__projecttarget__percentage') / 100.0)),
                                                 default=Value(0, output_field=DecimalField()))) \
                .aggregate(total_budget=Coalesce(Sum(F('budget_percentage'), output_field=DecimalField()),
                                                 Value(0, output_field=DecimalField())),
                           total_expense=Coalesce(Sum(F('expense_percentage'), output_field=DecimalField()),
                                                  Value(0, output_field=DecimalField())),
                           )
            percentage = sdg_targets_aggregate['total_budget'] / total_budget * 100 if total_budget > 0 else 0
            budget_total = sdg_targets_aggregate.get('total_budget', 0)
            expense_total = sdg_targets_aggregate.get('total_expense', 0)
        if percentage > 0:
            return {
                'total_budget': budget_total,
                'total_expense': expense_total,
                'year': year,
                'total_projects': projects.count(),
                'countries': countries_count,
                'percentage': percentage
            }
        return None


def get_sdg_sunburst(year, operating_unit='', budget_source='', sdg_code=''):
    sdg_aggregate = []
    sdg_list = []
    active_projects = get_active_projects_for_year(year, operating_unit=operating_unit,
                                                   budget_source=budget_source)
    sdgs = Sdg.objects.all()
    if sdg_code:
        sdgs = sdgs.filter(code=sdg_code)
    if year and int(year) >= SDG_START_YEAR:
        if sdgs:
            for sdg in sdgs:
                aggregate = get_sdg_target_aggregate(year, sdg=sdg,
                                                     operating_unit=operating_unit,
                                                     budget_source=budget_source,
                                                     active_projects=active_projects)
                target = []
                sdg_targets = SdgTargets.objects.values('target_id', 'description') \
                    .filter(sdg=sdg.code)
                # if sdg_code:
                count = 1
                if sdg_targets:
                    for sdg_target in sdg_targets:
                        if count == 1:
                            color = SDGChartColor.objects.get(count=1, sdg_code=sdg.code).color
                        elif count % 2 == 0:
                            color = SDGChartColor.objects.get(count=2, sdg_code=sdg.code).color
                        else:
                            color = SDGChartColor.objects.get(count=3, sdg_code=sdg.code).color
                        target_agg = get_target_aggregate_new(year, sdg_target['target_id'],
                                                              sdg.code,
                                                              operating_unit=operating_unit,
                                                              budget_source=budget_source,
                                                              active_projects=active_projects)
                        values = {'budget': target_agg['target_budget'],
                                  'expense': target_agg['target_expense'],
                                  'percentage': target_agg['budget_percentage']}
                        if target_agg['target_budget'] != 0:
                            target.append({'name': "Target " + sdg_target['target_id'],
                                           # 'color': SDG_TARGET_COLOR_NEW.get(sdg_target['target_id'], 'FFFFFF'),
                                           'color': color,
                                           'description': sdg_target['description'],
                                           'size': values
                                           })
                            count += 1

                    result = []
                    result_str = []
                    if target:
                        for target_val in target:
                            if target_val['name'].split('.')[1][0:2].isdigit():
                                result.append(int(target_val['name'].split('.')[1][0:2]))
                            else:
                                result_str.append(target_val['name'].split('.')[1][0:2])
                        outputs = sorted(result) + sorted(result_str)
                        target_data = []
                        for output in outputs:
                            for target_per in target:
                                if target_per['name'].split('.')[1][0:2] == str(output):
                                    target_data.append(target_per)
                        if aggregate:
                            size = {'budget': aggregate['total_budget'],
                                    'expense': aggregate['total_expense'],
                                    'percentage': aggregate['percentage']}
                        if aggregate and aggregate['total_budget'] != 0:
                            sdg_aggregate.append(aggregate)
                            sdg_list.append({'name': aggregate['sdg_name'],
                                             'size': size,
                                             'color': SDG_TARGET_COLORS.get(aggregate['sdg_name'], ''),
                                             'children': target_data,
                                             'code': str(aggregate['sdg_code'])
                                             })
        # SDG Others
        # other_sdg_aggregate = get_sdg_aggregate(year, sdg=None, operating_unit=operating_unit,
        #                                         budget_source=budget_source)
        # if other_sdg_aggregate:
        #     size = {'budget': other_sdg_aggregate['total_budget'],
        #             'expense': other_sdg_aggregate['total_expense'],
        #             'percentage': other_sdg_aggregate['percentage']}
        #     sdg_list.append({'name': other_sdg_aggregate['sdg_name'],
        #                      'size': size,
        #                      'color': other_sdg_aggregate['color'],
        #                      'code': str(other_sdg_aggregate['sdg_code'])})

        data = {
            'sdg': sdg_list
        }
        return data
