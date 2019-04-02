import Api from '../../../../lib/api';
export const DONOR_BASIC = {
    start: 'fetch_start/donor_basic',
    end: 'fetch_end/donor_basic',
    success: 'fetch_success/donor_basic',
    failed: 'fetch_failed/donor_basic',
    clear: 'clear/donor_basic'
}

export const donorBasicFetchStart = () => ({
    type: DONOR_BASIC.start
})

export const donorBasicFetchEnd = () => ({
    type: DONOR_BASIC.end
})
export const donorBasicClear = () => ({
    type: DONOR_BASIC.clear
})

export const donorBasicFetchSuccess = (data) => (
    {
        type: DONOR_BASIC.success,
        data
    })

export const donorBasicFetchFailed = (error) => ({
    type: DONOR_BASIC.failed,
    error
})

export const fetchDonorBasic = (code, year) => {
    return (dispatch) => {
        dispatch(donorBasicFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.API_DONOR_COUNTRY_BASIC(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(donorBasicFetchEnd())
                    dispatch(donorBasicFetchSuccess(resp.data))
                } else {
                    dispatch(donorBasicFetchEnd())
                }
            }).catch((exception) => {
                dispatch(donorBasicFetchEnd())
                dispatch(donorBasicFetchFailed(exception))
            });
        }
        else {
            dispatch(donorBasicClear())
            dispatch(donorBasicFetchEnd())
        }
    }
}



