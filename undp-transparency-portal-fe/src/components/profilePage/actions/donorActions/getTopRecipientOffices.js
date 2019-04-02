import Api from '../../../../lib/api';

export const RECIPIENT_TOP_OFFICES = {
    start: 'fetch_start/recipient_top_offices',
    end: 'fetch_end/recipient_top_offices',
    success: 'fetch_success/recipient_top_offices',
    failed: 'fetch_failed/recipient_top_offices',
    clear: 'clear/recipient_top_offices'
}

export const recipientTopOfficesFetchStart = () => ({
    type: RECIPIENT_TOP_OFFICES.start
})

export const recipientTopOfficesFetchEnd = () => ({
    type: RECIPIENT_TOP_OFFICES.end
})

export const recipientTopOfficesFetchSuccess = (data) => (
    {
        type: RECIPIENT_TOP_OFFICES.success,
        data
    })
export const recipientTopOfficesClear = () => ({
    type: RECIPIENT_TOP_OFFICES.clear
})

export const recipientTopOfficesFetchFailed = (error) => ({
    type: RECIPIENT_TOP_OFFICES.failed,
    error
})

export const fetchRecipientTopOffices = (code, year) => {
    return (dispatch) => {
        dispatch(recipientTopOfficesFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.RECIPIENT_TOP_OFFICES(code, year)).then(resp => {
   
                if (resp.success && resp.data) {
                    dispatch(recipientTopOfficesFetchEnd())
                    dispatch(recipientTopOfficesFetchSuccess(resp.data))
                } else {
                    dispatch(recipientTopOfficesFetchEnd())
                }
            }).catch((exception) => {
                dispatch(recipientTopOfficesFetchEnd())
                dispatch(recipientTopOfficesFetchFailed(exception))
            });
        }
        else {
            dispatch(recipientTopOfficesClear())
            dispatch(recipientTopOfficesFetchEnd())
        }
    }
}




