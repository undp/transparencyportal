import Api from '../../../lib/api'
export const SDG_SLIDER_DATA = {
    start: 'fetch_start/sdg_slider_data',
    end: 'fetch_end/sdg_slider_data',
    success: 'fetch_success/sdg_slider_data',
    failed: 'fetch_failed/sdg_slider_data',
    targetTitle: 'fetch_success/sdg_target_title',
    clear: 'clear/sdg_slider_data'
}

export const sdgSliderDataFetchStart = () => ({
    type: SDG_SLIDER_DATA.start
})

export const sdgSliderDataFetchEnd = () => ({
    type: SDG_SLIDER_DATA.end
})
export const sdgSliderDataClear = () => ({
    type: SDG_SLIDER_DATA.clear
})

export const sdgSliderDataFetchSuccess = (data) => (
    {
        type: SDG_SLIDER_DATA.success,
        data
    })


export const setTargetTitle = (data) => (
    {
        type: SDG_SLIDER_DATA.targetTitle,
        data
    })

export const sdgSliderDataFetchFailed = (error) => ({
    type: SDG_SLIDER_DATA.failed,
    error
})

export const fetchSdgSliderData = (year, sdg, targetId) => {
    return (dispatch,getState) => {
        
        const operatingUnits = "",
        budgetSources = ""
        dispatch(sdgSliderDataFetchStart())
        if (year != '' && sdg != '') {
            return Api.get(Api.API_SDG_SLIDER_DATA(year, sdg,operatingUnits,budgetSources, targetId)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(sdgSliderDataFetchEnd())
                    dispatch(sdgSliderDataFetchSuccess(resp.data))
                } else {
                    dispatch(sdgSliderDataFetchEnd())
                }
            }).catch((exception) => {
                dispatch(sdgSliderDataFetchEnd())
                dispatch(sdgSliderDataFetchFailed(exception))
            });
        }
        else {
            dispatch(sdgSliderDataClear())
            dispatch(sdgSliderDataFetchEnd())
        }
    }
}


export const fetchSdgTargetData = (year, targetId) => {
    return (dispatch,getState) => {
        
        const operatingUnits = "",
        budgetSources = ""
        dispatch(sdgSliderDataFetchStart())
        if (year != '' && targetId != '') {
            return Api.get(Api.API_SDG_TARGET_DATA(year, targetId,operatingUnits,budgetSources)).then(resp => {
                if (resp.success && resp.data) {
                    if(resp.data.aggregate && resp.data.aggregate.length)
                        resp.data.aggregate = resp.data.aggregate[0];
                    dispatch(sdgSliderDataFetchEnd());
                    dispatch(sdgSliderDataFetchSuccess(resp.data));
                    dispatch(setTargetTitle(resp.data.aggregate.target_desc));
                } else {
                    dispatch(sdgSliderDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(sdgSliderDataFetchEnd());
                dispatch(sdgSliderDataFetchFailed(exception));
            });
        }
        else {
            dispatch(sdgSliderDataClear());
            dispatch(sdgSliderDataFetchEnd());
        }
    }
}


