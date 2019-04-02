import Api from '../../../lib/api';

export const SDG_SUNBURST_DATA = {
    start: 'fetch_start/sdg_sunburst_data',
    end: 'fetch_end/sdg_sunburst_data',
    success: 'fetch_success/sdg_sunburst_data',
    failed: 'fetch_failed/sdg_sunburst_data',
    clear: 'clear/sdg_sunburst_data'
}

export const sdgSunburstDataFetchStart = () => ({
    type: SDG_SUNBURST_DATA.start
})

export const sdgSunburstDataFetchEnd = () => ({
    type: SDG_SUNBURST_DATA.end
})
export const sdgSunburstDataClear = () => ({
    type: SDG_SUNBURST_DATA.clear
})

export const sdgSunburstDataFetchSuccess = (data) => ({
    type: SDG_SUNBURST_DATA.success,
    data
})

export const sdgSunburstDataFetchFailed = (error) => ({
    type: SDG_SUNBURST_DATA.failed,
    error
})

export const fetchSdgSunburstData = (year) => {
    return (dispatch, getState) => {
        dispatch(sdgSunburstDataFetchStart());
        if (year !== '') {
            return Api.get(Api.API_SDG_SUNBURST_DATA(year)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.sdg.map(obj =>{ 
                     obj.fullName = obj.name;
                     obj.name = 'SDG '+obj.code;
                     obj.image = '/assets/icons/sdg/SDG-'+obj.code+'.svg';
                  });
                  let tempData = { name: '', size: 1 };
                  tempData.children = resp.data.sdg;
                  resp.data = tempData;
                    dispatch(sdgSunburstDataFetchEnd());
                    dispatch(sdgSunburstDataFetchSuccess(resp.data));
                } else {
                    dispatch(sdgSunburstDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(sdgSunburstDataFetchEnd());
                dispatch(sdgSunburstDataFetchFailed(exception));
            });
        } else {
            dispatch(sdgSunburstDataClear());
            dispatch(sdgSunburstDataFetchEnd());
        }
    }
}