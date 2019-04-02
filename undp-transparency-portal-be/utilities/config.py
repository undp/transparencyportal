import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
DOWNLOAD_DIR = BASE_DIR + '/downloaded'
ANNUAL_DOWNLOAD_DIR = BASE_DIR + '/downloaded/tracked'
ANNUAL_UPLOAD_DIR = BASE_DIR + '/uploaded/annual'
CSV_UPLOAD_DIR = BASE_DIR + '/uploaded/csv'
LOG_UPLOAD_DIR = BASE_DIR + '/uploaded/logs'

ZIP_DOWNLOAD_URL_test = "https://undpdw01.blob.core.windows.net/iatipublishing/IATIPublishing122017.zip?" \
                   "sv=2017-04-17&ss=b&srt=sco&sp=rl&se=2019-02-01T00:00:00Z&st=2018-01-01T00:00:00Z&spr=" \
                   "https&sig=6yBDIf5cDWLj0YpZFBFuioJtiJfYU%2BsdNirE8CS3oO8%3D"

# ZIP_DOWNLOAD_URL = "https://undpdw01.blob.core.windows.net/iatipublishing/IATIPublishing060618.zip?" \
#                    "sv=2017-04-17&ss=b&srt=sco&sp=rl&se=2019-02-01T00:00:00Z&st=2018-01-01T00:00:00Z&spr=" \
#                    "https&sig=6yBDIf5cDWLj0YpZFBFuioJtiJfYU%2BsdNirE8CS3oO8%3D"

# ZIP_DOWNLOAD_URL = "https://undpdw01.blob.core.windows.net/iatipublishing/IATIPublishing050718.ZIP?" \
#                    "sv=2017-04-17&ss=b&srt=sco&sp=rl&se=2019-02-01T00:00:00Z&st=2018-01-01T00:00:00Z&spr=" \
#                    "https&sig=6yBDIf5cDWLj0YpZFBFuioJtiJfYU%2BsdNirE8CS3oO8%3D"

# ZIP_DOWNLOAD_URL = "https://undpdw01.blob.core.windows.net/iatipublishing/IATIPublishing.ZIP?" \
#                    "sv=2017-04-17&ss=b&srt=sco&sp=rl&se=2019-02-01T00:00:00Z&st=2018-01-01T00:00:00Z&spr=" \
#                    "https&sig=6yBDIf5cDWLj0YpZFBFuioJtiJfYU%2BsdNirE8CS3oO8%3D"

ZIP_DOWNLOAD_URL = "https://undpdw01.blob.core.windows.net/iatipublishing/IATIPublishing.zip?" \
                   "sv=2017-04-17&ss=b&srt=sco&sp=rl&se=2019-02-01T00:00:00Z&st=2018-01-01T00:00:00Z&spr=" \
                   "https&sig=6yBDIf5cDWLj0YpZFBFuioJtiJfYU%2BsdNirE8CS3oO8%3D"

UPLOAD_DIR = BASE_DIR + '/uploaded'
EXPORT_DIR = BASE_DIR + '/media/export'

EXPORT_PDF_DIR = BASE_DIR + '/media/export_pdf/'

SETTINGS_DIR = BASE_DIR + '/undp_transparency/settings'

FILE_DETAILS_PATH = BASE_DIR + '/file_details.ini'

UPDATE_DAY = 6
ALLOWED_START_YEAR = 2011
ALLOWED_END_YEAR = 2021
ALLOWED_YEARS = list(range(ALLOWED_START_YEAR, ALLOWED_END_YEAR))
# EXCLUDED_SECTOR_CODES = [9, 10, 11, 12, 13, 14, 15, 16]
EXCLUDED_SECTOR_CODES = ['9', '10', '11', '12', '13', '14', '15', '16']

NULL_SECTOR_COLOR_CODE = '808080'
NULL_SDG_COLOR_CODE = '808080'

DEFAULT_SECTOR_CODE = '1'

TRUE_VALUES = [True, 'true', 'TRUE', 1, '1', 'True']

UNDP_DONOR_ID = '00012'

BULK_INSERT_LIMIT = 50000

SDG_START_YEAR = 2016

SP_START_YEAR = 2018

SP_END_YEAR = 2021

SECTOR_OTHERS_YEAR = 2012

NEW_SECTOR_CODES = ['17', '18', '19']
OLD_SECTOR_CODES = ['1', '2', '3', '4', '5', '6', '7']

HUMANITARIAN_PLUS = 3

POLICY_MARKER_CODES = {
    1: 'Gender Equality',
    2: 'Aid to Environment',
    3: 'Participatory Development/Good Governance',
    4: 'Trade Development',
    5: 'Aid Targeting the Objectives of the Convention on Biological Diversity',
    6: 'Aid Targeting the Objectives of the Framework Convention on Climate Change - Mitigation',
    7: 'Aid Targeting the Objectives of the Framework Convention on Climate Change - Adaptation',
    8: 'Aid Targeting the Objectives of the Convention to Combat Desertification',
    9: 'Reproductive, Maternal, Newborn and Child Health (RMNCH)',
}

AID_TYPE_CODES = {
    'A01': 'General budget support',
    'A02': 'Sector budget support',
    'B01': 'Core support to NGOs, other private bodies, PPPs and research institutes',
    'B02': 'Core contributions to multilateral institutions',
    'B03': 'Contributions to specific-purpose programmes and funds managed by '
           'international organisations (multilateral, INGO)',
    'B04': 'Basket funds/pooled funding',
    'C01': 'Project-type interventions',
    'D01': 'Donor country personnel',
    'D02': 'Other technical assistance',
    'E01': 'Scholarships/training in donor country',
    'E02': 'Imputed student costs',
    'F01': 'Debt relief',
    'G01': 'Administrative costs not included elsewhere',
    'H01': 'Development awareness',
    'H02': 'Refugees in donor countries',
}

POLICY_SIGNIFICANCE_CODES = {
    0: 'Not targeted',
    1: 'Significant objective',
    2: 'Principal objective',
    3: 'principal objective AND in support of an action programme',
    4: 'Explicit primary objective'
}

FUND_TYPE_COLORS = {
    'Regular Resources': '16537d',
    'Other Resources': '52abe9'
}

FUND_STREAM_COLORS = {
    'Core': '808080',
    'Cost Sharing': '795E58',
    'Others': 'c3482f',
    'Vertical Funds': 'f09f58',
    'Thematic Funds': 'e25c5d',
    'Trust Funds': '4ecb4e',
    'Trust funds': '4ecb4e',
}

FUND_STREAM_PRIORITY = {
    'Cost Sharing': 1,
    'Vertical Funds': 2,
    'Thematic Funds': 3,
    'Trust funds': 4,
    'Trust Funds': 4,
    'Others': 5,
}


LEVEL_3_NAMES_MAPPING = {
    'FUNDS_GEF': 'Global Environment Facility',
    'FUNDS_GFATM': 'The Global Fund to Fight AIDS, Tuberculosis and Malaria',
    'FUNDS_MPU': 'Montreal Protocol',
    'MULTI-LATERAL AGENCY2': 'Multilateral Agencies',
    'FUNDS_EU': 'European Union',
    'IFI World Bank Group': 'World Bank Group',
    # 'OTHERS_UNCDF1': 'Others',
    'OTHERS_UNIDENTIFIED1': 'Others',
    '': 'N/A'
}


# EXPORT_TEMPLATES_MAPPING = {
#     'home_global': 'home/global.html',
#     'home_countries': 'home/countries.html',
#     'home_donors_global': 'home/donors_global.html',
#     'home_donors_selected': 'home/donors_selected.html',
#     'home_donors_selected_recipient': 'home/donors_selected_recipient.html',
#     'home_sectors_global': 'home/sectors_global.html',
#     'home_sectors_selected': 'home/sectors_selected.html',
#     'home_sectors_selected_recipient': 'home/sectors_selected_recipient.html',
#     'home_sdgs_global': 'home/sdgs_global.html',
#     'home_sdgs_selected': 'home/sdgs_selected.html',
#     'projects_global': 'projects/global.html',
#     'projects_selected': 'projects/selected.html',
#     'donors': 'donors.html',
#     'profile_recipient': 'profile/recipient.html',
#     'profile_donor': 'profile/donor.html'
# }


EXPORT_TEMPLATES_MAPPING = {
    'home_countries': 'home/global_countries.html',
    'home_donors': 'home/donors.html',
    'home_sectors': 'home/sectors.html',
    'home_sdgs': 'home/sdgs.html',
    'projects_global': 'projects/global.html',
    'projects_selected': 'projects/selected.html',
    'donors': 'donors.html',
    'profile_recipient': 'profile/recipient.html',
    'profile_donor': 'profile/donor.html',
    'profile_sector': 'profile/sector.html',
    'profile_sdg': 'profile/sdg.html',
}

CRS_INDEXES = {
    "15162": "Human rights",
    "99810": "Sectors Not Specified",
    "15150": "Strengthening civil society",
    "15110": "Economic and development policy/planning",
    "74010": "Disaster prevention and preparedness",
    "15140": "Government administration",
    "25010": "Business support services and institutions",
    "15161": "Elections",
    "15130": "Legal and judicial development",
    "16064": "Social mitigation of HIV/AIDS",
    "41010": "Environmental policy and administrative management",
    "73010": "Reconstruction relief and rehabilitation",
    "15164": "Women's equality organisations and institutions",
    "15120": "Public sector financial management",
    "13040": "STD control including HIV/AIDS",
    "15210": "Security system management and reform"
}

LOCAL_COUNTRIES = ["Argentina", "Brazil", "Colombia", "Peru", "Dominican Republic", "Turkey", "Egypt", "Kuwait",
                   "Saudi Arabia", "Panama", "Uruguay", "El Salvador", "Paraguay", "Morocco", "Mexico", "Chile",
                   "The Former Yugoslav Republic of Macedonia", "Macedonia, The Former Yugoslav Republic of",
                   "Honduras", "Armenia"]


SIGNATURE_SOLUTION_COLORS = {
    'Keeping people out of poverty': 'D63837',
    'Strengthen effective, inclusive and accountable governance': '215384',
    'Enhance national prevention and recovery capacities for resilient societies': 'E0763A',
    'Promote nature-based solutions for a sustainable planet': '537543',
    'Close the energy gap': 'F1B545',
    'Strenghten gender equality and the empowerment of women and girls': 'DC5037',
}

SDG_TARGET_COLORS = {
    'No poverty': 'E5243B',
    'Zero hunger': 'DDA63A',
    'Good health and well-being': '4C9F38',
    'Quality education': 'C5192D',
    'Gender equality': 'FF3A21',
    'Clean water and sanitation': '26BDE2',
    'Affordable and clean energy': 'FCC30B',
    'Decent work and economic growth': 'A21942',
    'Industry, innovation and infrastructure': 'FD6925',
    'Reduced inequalities': 'DD1367',
    'Sustainable cities and communities': 'FD9D24',
    'Responsible consumption and production': 'BF8B2E',
    'Climate action': '3F7E44',
    'Life below water': '0A97D9',
    'Life on Land': '56C02B',
    'Peace, justice, and strong institutions': '00689D',
    'Partnerships for the goals': '19486A'
}

SIGNATURE_SOLUTION_SHORT_NAMES = {
    '1': 'Poverty',
    '2': 'Governance',
    '3': 'Resilience',
    '4': 'Environment',
    '5': 'Energy',
    '6': 'Gender',
}

SDG_TARGET_SUB_COLORS = {

    '1.1': 'a01323',
    '1.2': 'b71528',
    '1.3': 'e73247',
    '1.4': 'ea485b',
    '1.5': 'f4a4ad',
    '1.a': 'cd182d',
    '1.b': 'a01323',
    '2.1': 'C69433',
    '2.2': 'BE923C',
    '2.3': 'B28A3C',
    '2.4': 'DAA43A',
    '2.5': 'C6A056',
    '2.a': 'A6823D',
    '2.b': 'BA8D35',
    '2.c': 'BC9B5C',
    '3.1': '4B913A',
    '3.2': '438234',
    '3.3': '588F4B',
    '3.4': '4D7F42',
    '3.5': '579248',
    '3.6': '60A050',
    '3.7': '66935C',
    '3.8': '5C8552',
    '3.9': '83A27B',
    '3.a': '769E6E',
    '3.b': '608958',
    '3.c': '81967B',
    '3.d': '5B964E',
    '4.1': 'C33B4A',
    '4.2': 'A82535',
    '4.3': 'A13845',
    '4.4': 'B11E2F',
    '4.5': 'C15763',
    '4.6': 'A23E49',
    '4.7': 'AE4B56',
    '4.a': '963D47',
    '4.b': '963D47',
    '4.c': 'A13845',
    '5.1': 'E1351F',
    '5.2': 'D5503F',
    '5.3': 'D56759',
    '5.4': 'C53F2E',
    '5.5': 'C04F40',
    '5.6': 'ED5441',
    '5.a': 'E07573',
    '5.b': 'A0493D',
    '5.c': 'B85D50',
    '6.1': '25ADCE',
    '6.2': '299EBB',
    '6.3': '6BB1C2',
    '6.4': '5EB3C7',
    '6.5': '3E94A8',
    '6.6': '79C2D3',
    '6.a': '71CDE3',
    '6.b': '328092',
    '7.1': 'F2BE17',
    '7.2': 'E3AF06',
    '7.3': 'EDCA57',
    '7.a': 'CC9F0F',
    '7.b': 'D4B03E',
    '8.1': '8B2040',
    '8.2': 'A53557',
    '8.3': 'A13756',
    '8.4': 'AB2950',
    '8.5': 'BB3C62',
    '8.6': '96284A',
    '8.7': 'BD637E',
    '8.8': 'BB4C6D',
    '8.9': 'CC7B93',
    '8.10': 'C6597A',
    '8.a': 'A33858',
    '8.b': 'CF4A72',
    '9.1': 'E5672D',
    '9.2': 'D16B3C',
    '9.3': 'DC835A',
    '9.4': 'E68051',
    '9.5': 'BE501E',
    '9.a': 'C06035',
    '9.b': 'B46E4D',
    '9.c': 'AB6546',
    '10.1': 'CC1C65',
    '10.2': 'D1457F',
    '10.3': 'C15984',
    '10.4': 'DD739F',
    '10.5': 'BC2966',
    '10.6': 'CC7B9D',
    '10.7': 'AB5176',
    '10.a': 'D9B2C3',
    '10.b': 'D86494',
    '10.c': 'DBA3BA',
    '11.1': 'E99122',
    '11.2': 'D8933C',
    '11.3': 'F0B264',
    '11.4': 'D79848',
    '11.5': 'EAC493',
    '11.6': 'FFB75C',
    '11.7': 'C18130',
    '11.a': 'E0A963',
    '11.b': 'D07D14',
    '11.c': 'C89757',
    '12.1': 'A67A2C',
    '12.2': 'D09E43',
    '12.3': 'B0925D',
    '12.4': '876426',
    '12.5': 'DBB26A',
    '12.6': 'C7B087',
    '12.7': 'E4CA9B',
    '12.8': 'B4893C',
    '12.a': 'C3A56E',
    '12.b': 'BAA98A',
    '12.c': 'DBCAAA',
    '13.1': '639667',
    '13.2': '256D2B',
    '13.3': '77BE7C',
    '13.a': '637E65',
    '14.1': '2593C7',
    '14.2': '1B80B0',
    '14.3': '4CA2CA',
    '14.4': '4B96B9',
    '14.5': '65B4DA',
    '14.6': '4B86A1',
    '14.7': '1BA8EA',
    '14.a': '40728A',
    '14.b': '56AAD1',
    '14.c': '2B607A',
    '15.1': '4FA72B',
    '15.2': '479C24',
    '15.3': '71B954',
    '15.4': '76A364',
    '15.5': '4F7440',
    '15.6': '89A37E',
    '15.7': '85C36B',
    '15.8': '6A9F55',
    '15.9': 'A3D090',
    '15.a': '608B4D',
    '15.b': 'AFE199',
    '15.c': '57694F',
    '16.1': '3580A6',
    '16.2': '3F748F',
    '16.3': '5E8DA6',
    '16.4': '187EB2',
    '16.5': '358AB6',
    '16.6': '5DA1C5',
    '16.7': '0D597F',
    '16.8': '1E698F',
    '16.9': '158FCC',
    '16.10': '274F64',
    '16.a': '71ADCC',
    '16.b': '8FA6B3',
    '17.1': '04324f',
    '17.2': '115588',
    '17.3': '2b6fa0',
    '17.4': '04324f',
    '17.5': '115588',
    '17.6': '2b6fa0',
    '17.7': '04324f',
    '17.8': '115588',
    '17.9': '2b6fa0',
    '17.10': '04324f',
    '17.11': '115588',
    '17.12': '2b6fa0',
    '17.13': '04324f',
    '17.14': '115588',
    '17.15': '2b6fa0',
    '17.16': '04324f',
    '17.17': '115588',
    '17.18': '2b6fa0',
    '17.19': '04324f',

}
