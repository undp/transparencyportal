import { numberToCurrencyFormatter } from '../../../src/utils/numberFormatter'

export const TOOLTIP_LABEL = 'rightSDGTooltip'
export const SDG_OTHERS = "0"

export function TOOLTIP_HTML(sdg) {
    return '<span><b>' + sdg.name + ': </b></span><span>' + sdg.fullName + '</span><br><span"><b>Budget: </b></span><span>' + numberToCurrencyFormatter(sdg.size.budget, 0) + '</span><br><span"><b> Expense: </b></span><span>' + numberToCurrencyFormatter(sdg.size.expense, 0) + '</span>'
}
