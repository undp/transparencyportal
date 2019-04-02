import { UPDATE_SELCTED_ARC_BAR_CHART_DATA } from '../../actions/recipientActions/budgetVsExpenseCharts'
const defaultState = {
    groupedBarChartData: {
        sectorName:'',
        budget:'',
        expense:'',
        displayWrapper:false
    }
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case UPDATE_SELCTED_ARC_BAR_CHART_DATA:
            return {
                ...state,
                sectorName:action.data.sectorName,
                budget:action.data.budget,
                expense:action.data.expense,
                displayWrapper:action.data.displayWrapper

            }
            default:
            return state;

    }
}    


