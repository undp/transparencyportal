import Api from '../../../lib/api';
export const PROJECT_LIST_DATA = {
    start: 'fetch_start/project_list_data',
    end: 'fetch_end/project_list_data',
    success: 'fetch_success/project_list_data',
    failed: 'fetch_failed/project_list_data',
    clear: 'clear/project_list_data'
}

export const markerProjectListFetchStart = () => ({
    type: PROJECT_LIST_DATA.start
})

export const markerProjectListFetchEnd = () => ({
    type: PROJECT_LIST_DATA.end
})
export const markerProjectListClear = () => ({
    type: PROJECT_LIST_DATA.clear
})

export const markerProjectListFetchSuccess = (data) => (
    {
        type: PROJECT_LIST_DATA.success,
        data
    })

export const markerProjectListFetchFailed = (error) => ({
    type: PROJECT_LIST_DATA.failed,
    error
})

export const fetchMarkerProjectList = (year, markerId) => {
    return (dispatch,getState) => {
        dispatch(markerProjectListFetchStart());
        if (year !== '' && markerId !== '') {
            return Api.get(Api.API_MARKER_PROJECTLIST_DATA(year, markerId)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.aggregate = resp.data.aggregate && resp.data.aggregate.length ? resp.data.aggregate[0]:{};
                    dispatch(markerProjectListFetchEnd());
                    dispatch(markerProjectListFetchSuccess(resp.data));
                } else {
                    dispatch(markerProjectListFetchEnd());
                }
            }).catch((exception) => {
                dispatch(markerProjectListFetchEnd());
                dispatch(markerProjectListFetchFailed(exception));
            });
        }
        else {
            dispatch(markerProjectListClear());
            dispatch(markerProjectListFetchEnd());
        }
    }
}
