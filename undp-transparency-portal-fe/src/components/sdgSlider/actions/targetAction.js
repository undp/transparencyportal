import Api from '../../../lib/api';

export const SDG_SLIDER_TARGET_DATA = {
    start: 'fetch_start/sdg_slider_target_data',
    end: 'fetch_end/sdg_slider_target_data',
    success: 'fetch_success/sdg_slider_target_data',
    failed: 'fetch_failed/sdg_slider_target_data',
    clear: 'clear/sdg_slider_target_data'
}

export const sdgSliderTargetDataFetchStart = () => ({
    type: SDG_SLIDER_TARGET_DATA.start
})

export const sdgSliderTargetDataFetchEnd = () => ({
    type: SDG_SLIDER_TARGET_DATA.end
})
export const sdgSliderTargetDataClear = () => ({
    type: SDG_SLIDER_TARGET_DATA.clear
})

export const sdgSliderTargetDataFetchSuccess = (data) => ({
    type: SDG_SLIDER_TARGET_DATA.success,
    data
})

export const sdgSliderTargetDataFetchFailed = (error) => ({
    type: SDG_SLIDER_TARGET_DATA.failed,
    error
})

export const fetchSdgSliderTargetData = (year, sdg) => {
    return (dispatch, getState) => {
        dispatch(sdgSliderTargetDataFetchStart());

        if (year !== '' && sdg !== '') {
            return Api.get(Api.API_SDG_TARGET_PERCENTAGE_DATA(year, sdg)).then(resp => {
                if (resp.success && resp.data) { 
                    dispatch(sdgSliderTargetDataFetchEnd());
                    dispatch(sdgSliderTargetDataFetchSuccess(resp.data));
                } else {
                    dispatch(sdgSliderTargetDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(sdgSliderTargetDataFetchEnd());
                dispatch(sdgSliderTargetDataFetchFailed(exception));
            });
        } else {
            dispatch(sdgSliderTargetDataClear());
            dispatch(sdgSliderTargetDataFetchEnd());
        }
    }
}