import Api from '../../../lib/api';

export const OUR_APPROACHES_DATA = {
    start: 'fetch_start/our_approaches_data',
    end: 'fetch_end/our_approaches_data',
    success: 'fetch_success/our_approaches_data',
    failed: 'fetch_failed/our_approaches_data',
    clear: 'clear/our_approaches_data'
}

export const ourApproachesDataFetchStart = () => ({
    type: OUR_APPROACHES_DATA.start
})

export const ourApproachesDataFetchEnd = () => ({
    type: OUR_APPROACHES_DATA.end
})
export const ourApproachesDataClear = () => ({
    type: OUR_APPROACHES_DATA.clear
})

export const ourApproachesDataFetchSuccess = (data) => ({
    type: OUR_APPROACHES_DATA.success,
    data
})

export const ourApproachesDataFetchFailed = (error) => ({
    type: OUR_APPROACHES_DATA.failed,
    error
})

export const fetchOurApproachesData = (country, level2marker, markerType) => {
    return (dispatch, getState) => {
        dispatch(ourApproachesDataFetchStart());
        country = country ? country : '';
        level2marker = level2marker ? level2marker : '';
        markerType = markerType ? markerType : '';
        return Api.get(Api.SSC_OUR_APPROACHES(country, level2marker, markerType)).then(resp => {
            if (resp.success && resp.data) {
                resp.data = _.sortByOrder(resp.data, ['title'], ['asc']);
                dispatch(ourApproachesDataFetchEnd());
                dispatch(ourApproachesDataFetchSuccess(resp.data));
            } else {
                dispatch(ourApproachesDataFetchEnd());
            }
        }).catch((exception) => {
            dispatch(ourApproachesDataFetchEnd());
            dispatch(ourApproachesDataFetchFailed(exception));
        });
    }
}