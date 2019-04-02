import Api from '../../../lib/api';
export const BAR_CHART_DATA = {
    start: 'fetch_start/bar_chart_data',
    end: 'fetch_end/bar_chart_data',
    success: 'fetch_success/bar_chart_data',
    failed: 'fetch_failed/bar_chart_data',
    clear: 'clear/bar_chart_data' 
}


export const markerBarChartDataFetchStart = () => ({
    type: BAR_CHART_DATA.start
})

export const markerBarChartDataFetchEnd = () => ({
    type: BAR_CHART_DATA.end
})
export const markerBarChartDataClear = () => ({
    type: BAR_CHART_DATA.clear
})

export const markerBarChartDataFetchSuccess = (data) => (
    {
        type: BAR_CHART_DATA.success,
        data
    })

export const markerBarChartDataFetchFailed = (error) => ({
    type: BAR_CHART_DATA.failed,
    error
})

export const fetchMarkerBarChartData = (year, markerId, country, marker_id, levelTwoMarker) => {
    country ? null: country = '';
    marker_id ? null : marker_id = '';
    levelTwoMarker = levelTwoMarker ? levelTwoMarker : '';
    return (dispatch,getState) => {
        dispatch(markerBarChartDataFetchStart());
        if (year !== '' && markerId !== '') {
            return Api.get(Api.API_MARKER_BARCHART_DATA(year, markerId, country, marker_id, levelTwoMarker)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.aggregate = resp.data.aggregate && resp.data.aggregate.length ? resp.data.aggregate[0]:{};
                    dispatch(markerBarChartDataFetchEnd());
                    dispatch(markerBarChartDataFetchSuccess(resp.data));
                } else {
                    dispatch(markerBarChartDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(markerBarChartDataFetchEnd());
                dispatch(markerBarChartDataFetchFailed(exception));
            });
        }
        else {
            dispatch(markerBarChartDataClear());
            dispatch(markerBarChartDataFetchEnd());
        }
    }
}
