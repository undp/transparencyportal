import Api from '../../../../lib/api';
export const DONOR_BUDGET_SOURCES = {
    start: 'fetch_start/donor_budget_sources',
    end: 'fetch_end/donor_budget_sources',
    success: 'fetch_success/donor_budget_sources',
    failed: 'fetch_failed/donor_budget_sources',
    clear: 'clear/donor_budget_sources'
}

export const donorBudgetSourcesFetchStart = () => ({
    type: DONOR_BUDGET_SOURCES.start
})

export const donorBudgetSourcesFetchEnd = () => ({
    type: DONOR_BUDGET_SOURCES.end
})
export const donorBudgetSourcesClear = () => ({
    type: DONOR_BUDGET_SOURCES.clear
})

export const donorBudgetSourcesFetchSuccess = (data) => (
    {
        type: DONOR_BUDGET_SOURCES.success,
        data
    })

export const donorBudgetSourcesFetchFailed = (error) => ({
    type: DONOR_BUDGET_SOURCES.failed,
    error
})

export const fetchDonorBudgetSources = (code, year) => {
    return (dispatch) => {
        dispatch(donorBudgetSourcesFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.API_DONOR_BUDGET_SOURCES(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(donorBudgetSourcesFetchEnd())
                    dispatch(donorBudgetSourcesFetchSuccess(resp.data))
                } else {
                    dispatch(donorBudgetSourcesFetchEnd())
                }
            }).catch((exception) => {
                dispatch(donorBudgetSourcesFetchEnd())
                dispatch(donorBudgetSourcesFetchFailed(exception))
            });
        }
        else {
            dispatch(donorBudgetSourcesClear())
            dispatch(donorBudgetSourcesFetchEnd())
        }
    }
}



