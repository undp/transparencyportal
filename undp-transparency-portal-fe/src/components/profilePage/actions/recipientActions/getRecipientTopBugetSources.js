import Api from '../../../../lib/api';
import { debuglog } from 'util';

export const RECIPIENT_TOP_BUDGET_SOURCES = {
    start: 'fetch_start/recipient_top_budget_sources',
    end: 'fetch_end/recipient_top_budget_sources',
    success: 'fetch_success/recipient_top_budget_sources',
    failed: 'fetch_failed/recipient_top_budget_sources'
}

export const recipientTopBudgetSourcesFetchStart = () => ({
    type: RECIPIENT_TOP_BUDGET_SOURCES.start
})

export const recipientTopBudgetSourcesFetchEnd = () => ({
    type: RECIPIENT_TOP_BUDGET_SOURCES.end
})

export const recipientTopBudgetSourcesFetchSuccess = (data) => (
    {
        type: RECIPIENT_TOP_BUDGET_SOURCES.success,
        data
    })

export const recipientTopBudgetSourcesFetchFailed = (error) => ({
    type: RECIPIENT_TOP_BUDGET_SOURCES.failed,
    error
})

export const fetchRecipientTopBudgetSources = (code, year) => {
    return (dispatch) => {
        dispatch(recipientTopBudgetSourcesFetchStart())
        if(year!=null) {
            return Api.get(Api.API_RECIPIENT_COUNTRTY_TOP_BUDGET_SOURCES(code, year)).then(resp => {
            
                if (resp.success && resp.data) {
                    dispatch(recipientTopBudgetSourcesFetchEnd())
                    dispatch(recipientTopBudgetSourcesFetchSuccess(resp.data))
                } else {
                    dispatch(recipientTopBudgetSourcesFetchEnd())
                }
            }).catch((exception) => {
                dispatch(recipientTopBudgetSourcesFetchEnd())
                dispatch(recipientTopBudgetSourcesFetchFailed(exception))
            });
        }
    }
}




