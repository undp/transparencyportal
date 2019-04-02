import Api from '../../../lib/api';

export const SSC_MARKER_DATA = {
    start: 'fetch_start/ssc_marker_data',
    end: 'fetch_end/ssc_marker_data',
    success: 'fetch_success/ssc_marker_data',
    failed: 'fetch_failed/ssc_marker_data',
    clear: 'clear/ssc_marker_data'
}

export const sscMarkerDataFetchStart = () => ({
    "type": SSC_MARKER_DATA.start
})

export const sscMarkerDataFetchEnd = () => ({
    "type": SSC_MARKER_DATA.end
})
export const sscMarkerDataClear = () => ({
    "type": SSC_MARKER_DATA.clear
})

export const sscMarkerDataFetchSuccess = (data) => ({
    "type": SSC_MARKER_DATA.success,
    data
})

export const sscMarkerDataFetchFailed = (error) => ({
    "type": SSC_MARKER_DATA.failed,
    error
})

export const fetchSscMarkerData = (year) => {
    return (dispatch, getState) => {
        dispatch(sscMarkerDataFetchStart());
        return Api.get(Api.API_SSC_MARKER_PATH).then(resp => {
            if (resp.success && resp.data) {
                dispatch(sscMarkerDataFetchEnd());
                dispatch(sscMarkerDataFetchSuccess(resp.data));
            } else {
                dispatch(sscMarkerDataFetchEnd());
            }
        }).catch((exception) => {
            dispatch(sscMarkerDataFetchEnd());
            dispatch(sscMarkerDataFetchFailed(exception));
        });

    }
}