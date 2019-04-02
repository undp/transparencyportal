import Api from '../../../lib/api'
import {FINANCIAL_FLOW}  from './index'

export const expenseFlowFetchStart = () => ({
    type: FINANCIAL_FLOW.start
})

export const expenseFlowFetchEnd = () => ({
    type: FINANCIAL_FLOW.end
})
export const expenseFlowClear = () => ({
    type: FINANCIAL_FLOW.clear
})

export const expenseFlowFetchSuccess = (data) => (
    {
        type: FINANCIAL_FLOW.success,
        data
    })

export const expenseFlowFetchFailed = (error) => ({
    type: FINANCIAL_FLOW.failed,
    error
})

export const fetchExpenseFinancialFlow = (year) => {
    return (dispatch) => {
        dispatch(expenseFlowFetchStart())
        if (year != '') {
            return Api.get(Api.API_EXPENSE_FINANCIAL_FLOW(year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(expenseFlowFetchEnd())
                    dispatch(expenseFlowFetchSuccess(resp.data))
                } else {
                    dispatch(expenseFlowFetchFailed())
                }
            }).catch((exception) => {
                dispatch(expenseFlowFetchEnd())
                dispatch(expenseFlowFetchFailed(exception))
            });
        }
        else {
            dispatch(expenseFlowClear())
            dispatch(expenseFlowFetchFailed())
        }
    }
}



