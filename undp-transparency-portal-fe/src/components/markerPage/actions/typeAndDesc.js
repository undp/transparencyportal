import Api from '../../../lib/api';
export const MARKER_DESC_DATA = {
    start: 'fetch_start/marker_desc_data',
    end: 'fetch_end/marker_desc_data',
    success: 'fetch_success/marker_desc_data',
    failed: 'fetch_failed/marker_desc_data',
    clear: 'clear/marker_desc_data'
}

export const markerDescriptionDataFetchStart = () => ({
    type: MARKER_DESC_DATA.start
})

export const markerDescriptionDataFetchEnd = () => ({
    type: MARKER_DESC_DATA.end
})
export const markerDescriptionDataClear = () => ({
    type: MARKER_DESC_DATA.clear
})

export const markerDescriptionDataFetchSuccess = (data) => (
    {
        type: MARKER_DESC_DATA.success,
        data
    })

export const markerDescriptionDataFetchFailed = (error) => ({
    type: MARKER_DESC_DATA.failed,
    error
})

export const fetchMarkerDescriptionData = (year, markerType,country,markerId) => {
    markerId ? null : markerId = '';
    country ? null :country = '';
    return (dispatch,getState) => {
        dispatch(markerDescriptionDataFetchStart());
        if (year !== '' && markerType !== '') {
            return Api.get(Api.API_MARKER_DESCRIPTION_DATA(year, markerType,country,markerId)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.aggregate = resp.data.aggregate && resp.data.aggregate.length ? resp.data.aggregate[0]:{};
                    dispatch(markerDescriptionDataFetchEnd());
                    dispatch(markerDescriptionDataFetchSuccess(resp.data));
                } else {
                    dispatch(markerDescriptionDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(markerDescriptionDataFetchEnd());
                dispatch(markerDescriptionDataFetchFailed(exception));
            });
        }
        else {
            dispatch(markerDescriptionDataClear());
            dispatch(markerDescriptionDataFetchEnd());
        }
    }
}
