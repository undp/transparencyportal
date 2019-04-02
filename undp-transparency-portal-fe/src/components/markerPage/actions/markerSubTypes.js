import Api from '../../../lib/api';
export const MARKER_SUBTYPE_DATA = {
    start: 'fetch_start/markerSubType_data',
    end: 'fetch_end/markerSubType_data',
    success: 'fetch_success/markerSubType_data',
    failed: 'fetch_failed/markerSubType_data',
    clear: 'clear/markerSubType_data'
}

export const markerSubTypeFetchStart = () => ({
    type: MARKER_SUBTYPE_DATA.start
})

export const markerSubTypeFetchEnd = () => ({
    type: MARKER_SUBTYPE_DATA.end
})
export const markerSubTypeClear = () => ({
    type: MARKER_SUBTYPE_DATA.clear
})

export const markerSubTypeFetchSuccess = (data) => (
    {
        type: MARKER_SUBTYPE_DATA.success,
        data
    })

export const markerSubTypeFetchFailed = (error) => ({
    type: MARKER_SUBTYPE_DATA.failed,
    error
})

export const fetchmarkerSubType = (markerId,country) => {
    country? null : country = '';
    return (dispatch,getState) => {
        dispatch(markerSubTypeFetchStart());
        if ( markerId !== '') {
            return Api.get(Api.API_MARKER_SUBTYPE_DATA(markerId,country)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.aggregate = resp.data.aggregate && resp.data.aggregate.length ? resp.data.aggregate[0]:{};
                    dispatch(markerSubTypeFetchEnd());
                    dispatch(markerSubTypeFetchSuccess(resp.data));
                } else {
                    dispatch(markerSubTypeFetchEnd());
                }
            }).catch((exception) => {
                dispatch(markerSubTypeFetchEnd());
                dispatch(markerSubTypeFetchFailed(exception));
            });
        }
        else {
            dispatch(markerSubTypeClear());
            dispatch(markerSubTypeFetchEnd());
        }
    }
}