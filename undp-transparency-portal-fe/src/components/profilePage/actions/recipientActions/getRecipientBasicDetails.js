import Api from '../../../../lib/api';
export const RECIPIENT_BASIC = {
    start: 'fetch_start/recipient_basic',
    end: 'fetch_end/recipient_basic',
    success: 'fetch_success/recipient_basic',
    failed: 'fetch_failed/recipient_basic',
    clear: 'clear/recipient_basic'
}

export const RecipientBasicFetchStart = () => ({
    type: RECIPIENT_BASIC.start
})

export const RecipientBasicFetchEnd = () => ({
    type: RECIPIENT_BASIC.end
})
export const RecipientBasicClear = () => ({
    type: RECIPIENT_BASIC.clear
})

export const RecipientBasicFetchSuccess = (data) => (
    {
        type: RECIPIENT_BASIC.success,
        data
    })

export const RecipientBasicFetchFailed = (error) => ({
    type: RECIPIENT_BASIC.failed,
    error
})

export const loadRecipientBasic = (code, year) => {
    return (dispatch) => {
        dispatch(RecipientBasicFetchStart())
        if(code!='' && year!=null) {
            return Api.get(Api.API_RECIPIENT_COUNTRY_BASIC(code,year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(RecipientBasicFetchEnd())
                    dispatch(RecipientBasicFetchSuccess(resp.data))
                } else {
                    dispatch(RecipientBasicFetchEnd())
                }
            }).catch((exception) => {
                dispatch(RecipientBasicFetchEnd())
                dispatch(RecipientBasicFetchFailed(exception))
            });
        }
        else {
            dispatch(RecipientBasicClear())
            dispatch(RecipientBasicFetchEnd())
        }
    }
}



