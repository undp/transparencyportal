from django.db.models.aggregates import Sum
from django.db.models.expressions import F, Value, Case, When
from django.db.models.fields import CharField, IntegerField, DecimalField
from django.db.models.query_utils import Q
from django.db.models.functions.base import Coalesce

from master_tables.models import OperatingUnit, Organisation
from undp_donors.models import DonorFundSplitUp
from utilities.config import EXCLUDED_SECTOR_CODES


def get_operating_units(search):
    operating_units = OperatingUnit.objects.values('iso3', 'name') \
        .annotate(code=F('iso3'), type=Value('1', output_field=CharField()))
    if search is not '':
        operating_units = operating_units.filter(Q(name__icontains=search) | Q(iso3__icontains=search))

    return operating_units


def get_organisations(search):
    organisations = Organisation.objects.values('ref_id', 'org_name').filter(org_name__icontains=search)\
        .annotate(code=F('ref_id'), name=F('org_name'), type=Value('2', output_field=CharField()))

    return organisations


# def get_budget_sources(search):
#
#     query = Q(organisation__ref_id=search) | Q(organisation__type_level_3=search) | \
#             Q(organisation__org_name__icontains=search) | Q(organisation__level_3_name__icontains=search)
#     query.add(Q(organisation__donorfundsplitup__isnull=False), Q.AND)
#     operating_units = OperatingUnit.objects.filter(query)\
#         .annotate(total_budget=Sum('organisation__donorfundsplitup__budget'),
#                   total_expense=Sum('organisation__donorfundsplitup__expense'),
#                   code=F('iso3'), type=Value(1, output_field=IntegerField()))
#
#     return operating_units.order_by('-total_budget')


def get_budget_sources(search, year='', country='', sector='', sdg='', ss_id=''):

    query = Q(organisation__ref_id=search) | Q(organisation__type_level_3=search) | \
        Q(organisation__org_name__icontains=search) | Q(organisation__level_3_name__icontains=search)
    if year:
        query.add(Q(year=year), Q.AND)
        query.add(Q(project__project_active__year=year), Q.AND)
    if country:
        query.add(Q(project__operating_unit=country), Q.AND)
    if sector:
        if sector == '0':
            EXCLUDED_SECTOR_CODES.append('8')
            sector_query = Q(project__output__outputsector__sector__in=EXCLUDED_SECTOR_CODES) | \
                Q(project__output__outputsector__isnull=True)
        else:
            sector_query = Q(Q(project__output__outputsector__sector=sector))
        query.add(sector_query, Q.AND)
    if sdg:
        if sdg == '0':
            # sdg_query = Q(project__output__outputsdg__isnull=True)
            sdg_query = Q(project__output__outputtarget__isnull=True)
        else:
            # sdg_query = Q(project__output__outputsdg__sdg=sdg)
            sdg_query = Q(project__output__outputtarget__target_id__sdg=sdg)
        query.add(sdg_query, Q.AND)
    if ss_id:
        ss_query = Q(project__output__signature_solution__ss_id=ss_id)
        query.add(ss_query, Q.AND)
    donor_organisations = DonorFundSplitUp.objects.filter(query)\
        .values('organisation__type_level_3')\
        .annotate(total_budget=Sum('budget'),
                  code=F('organisation__type_level_3'),
                  type=Value(1, output_field=IntegerField()),
                  donor_name=F('organisation__level_3_name')
                  )\
        .annotate(priority=Case(When(organisation__operating_unit__isnull=False,
                                then=Value(1, output_field=IntegerField())),
                                default=Value(0, output_field=IntegerField())))\
        .filter(total_budget__gt=0)\
        .order_by('-priority', '-total_budget')
    # budget_sources = list(chain(operating_units, donor_organisations))
    # budget_sources = sorted(budget_sources, key=lambda sector: sector['total_budget'], reverse=True)

    return donor_organisations
