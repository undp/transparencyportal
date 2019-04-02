import math
from django.contrib.humanize.templatetags.humanize import intcomma
from django import template
from datetime import datetime

register = template.Library()


def number_to_currency_formatter(input, decimals=2):
    try:
        suffixes = ['K', 'M', 'B', 'T', 'P', 'E']

        input = float(input)
        prefix = '$' if(input is None or input > 0 or input == 0) else '-$'
        input = abs(input)

        if math.isnan(input):
            return None

        if input < 1000:
            return prefix + str(input)
        try:
            exp = int(math.floor(math.log(input) / math.log(1000)))
            if exp > 2:
                exp = 2
        except:
            exp = 2
        try:
            decimals = int(decimals)
        except:
            decimals = 2
        rounded = str(round((input / math.pow(1000, exp)), decimals))
        # print(intcomma(rounded))
        return prefix + str(intcomma(rounded)) + suffixes[exp - 1]
    except Exception as e:
        print(e)
        return "--"


def number_to_comma_formatter(input):
    try:
        return intcomma(input)
    except Exception as e:
        print(e)
    return input


def number_to_dollar_formatter(input):
    try:
        prefix = '$' if (input is None or input > 0 or input == 0) else '-$'
        input = abs(int(input))
        return prefix + intcomma(input)
    except Exception as e:
        print(e)
    return input


def round_to(number, digits=1):
    try:
        number = float(number)
        if number > int(number):
            rounded_number = round(number, int(digits))
            if rounded_number > int(rounded_number):
                return rounded_number
            return int(rounded_number)
        if number == 0:
            return "0"
        if number < 0.5:
            return "< 1"
        return int(number)
    except Exception as e:
        print("round_to")
        print(e)
    return number


def ceil_to(number):
    try:
        return math.ceil(float(number) * 100) / 100
    except Exception as e:
        print("ceil to")
        print(e)
    return number


def total_contribution(data, fund_type='Regular Resources'):
    try:
        data_filtered = [d for d in data if d['fund_type'] == fund_type]
        if data_filtered:
            return data_filtered[0]['total_contribution']
    except Exception as e:
        print(e)
    return 0


def percentage_contribution(data, fund_type='Regular Resources'):
    try:
        data_filtered = [d for d in data if d['fund_type'] == fund_type]
        if data_filtered:
            return data_filtered[0]['percentage']
    except Exception as e:
        print(e)
    return 0


def format_date(value, format=""):
    try:
        value = datetime.strptime(value, "%Y-%m-%d")
        return datetime.strftime(value, "%d %B %Y")
    except Exception as e:
        print(e)
        print('format_date')
    return value


def calc(value1, value2):
    try:
        v1 = float(value1) if value1 else 0
        v2 = float(value2) if value2 else 0
        if v1 and v2:
            return round(v1 * v2 / 100, 2)
    except Exception as e:
        print(e)
        pass
    return 0


register.filter('numberToCurrencyFormatter', number_to_currency_formatter)
register.filter('numberToCommaFormatter', number_to_comma_formatter)
register.filter('numberToDollarFormatter', number_to_dollar_formatter)
register.filter('roundTo', round_to)
register.filter('ceilTo', ceil_to)
register.filter('TotalContribution', total_contribution)
register.filter('PercentageContribution', percentage_contribution)
register.filter('formatDate', format_date)
register.filter('calc', calc)
