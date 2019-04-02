import Api from '../../../lib/api';
export const MARKER_DATA = {
    start: 'fetch_start/marker_data',
    end: 'fetch_end/marker_data',
    success: 'fetch_success/marker_data',
    failed: 'fetch_failed/marker_data',
    clear: 'clear/marker_data'
}

export const markerDataFetchStart = () => ({
    type: MARKER_DATA.start
})

export const markerDataFetchEnd = () => ({
    type: MARKER_DATA.end
})
export const markerDataClear = () => ({
    type: MARKER_DATA.clear
})

export const markerDataFetchSuccess = (data) => (
    {
        type: MARKER_DATA.success,
        data
    })

export const markerDataFetchFailed = (error) => ({
    type: MARKER_DATA.failed,
    error
})

export const fetchMarkerData = (year, markerType, country,markerId,level2Marker) => {
    year ? null:year='';
    markerType ? null :markerType ='';
    country?null: country='all';
    (level2Marker && level2Marker!=='all') ? null : level2Marker = '';
    markerId ? null : markerId = '';
    return (dispatch,getState) => {
        year ? null:year='';
        markerId ? null :markerId ='';
        country?null: country='all';
        markerType = markerType ? markerType : '';
        dispatch(markerDataFetchStart());
        if (year !== '' && markerType !== '') {
            return Api.get(Api.API_MARKER_DATA(year, markerType, country,markerId,level2Marker)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.aggregate = resp.data.aggregate && resp.data.aggregate.length ? resp.data.aggregate[0]:{};
                    dispatch(markerDataFetchEnd());
                    dispatch(markerDataFetchSuccess(resp.data));
                } else {
                    dispatch(markerDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(markerDataFetchEnd());
                dispatch(markerDataFetchFailed(exception));
            });
        }
        else {
            dispatch(markerDataClear());
            dispatch(markerDataFetchEnd());
        }
    }
}

