import Api from '../../../lib/api';
export const LEVEL_TWO_COUNTRY_DATA = {
    start: 'fetch_start/levelTwoCountry_data',
    end: 'fetch_end/levelTwoCountry_data',
    success: 'fetch_success/levelTwoCountry_data',
    failed: 'fetch_failed/levelTwoCountry_data',
    clear: 'clear/levelTwoCountry_data'
}

export const levelTwoCountryFetchStart = () => ({
    type: LEVEL_TWO_COUNTRY_DATA.start
})

export const levelTwoCountryFetchEnd = () => ({
    type: LEVEL_TWO_COUNTRY_DATA.end
})
export const levelTwoCountryClear = () => ({
    type: LEVEL_TWO_COUNTRY_DATA.clear
})

export const levelTwoCountryFetchSuccess = (data) => (
    {
        type: LEVEL_TWO_COUNTRY_DATA.success,
        data
    })

export const levelTwoCountryFetchFailed = (error) => ({
    type: LEVEL_TWO_COUNTRY_DATA.failed,
    error
})

export const fetchlevelTwoCountry = (opUnit, markerId) => {
    opUnit = !opUnit ? '' : opUnit;
    markerId = !markerId ? '' : markerId;
    return (dispatch,getState) => {
        dispatch(levelTwoCountryFetchStart());
        return Api.get(Api.API_LEVEL_TWO_COUNTRY_DATA(opUnit, markerId)).then(resp => {
            if (resp.success && resp.data) {
               dispatch(levelTwoCountryFetchEnd());
                dispatch(levelTwoCountryFetchSuccess(resp.data));
            } else {
                dispatch(levelTwoCountryFetchEnd());
            }
        }).catch((exception) => {
            dispatch(levelTwoCountryFetchEnd());
            dispatch(levelTwoCountryFetchFailed(exception));
        });
    }
}