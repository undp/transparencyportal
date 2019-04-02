import Api from '../../../lib/api';
export const THEME_SLIDER_DATA = {
    start: 'fetch_start/theme_slider_data',
    end: 'fetch_end/theme_slider_data',
    success: 'fetch_success/theme_slider_data',
    failed: 'fetch_failed/theme_slider_data',
    clear: 'clear/theme_slider_data'
};

export const donorSliderDataFetchStart = () => ({
    type: THEME_SLIDER_DATA.start
});

export const donorSliderDataFetchEnd = () => ({
    type: THEME_SLIDER_DATA.end
});
export const donorSliderDataClear = () => ({
    type: THEME_SLIDER_DATA.clear
});

export const donorSliderDataFetchSuccess = (data) => (
    {
        type: THEME_SLIDER_DATA.success,
        data
    });

export const donorSliderDataFetchFailed = (error) => ({
    type: THEME_SLIDER_DATA.failed,
    error
});

export const fetchDonorSliderData = (year, sector) => {
    return (dispatch, getState) => {
        budgetSources;
        const operatingUnits = "",
            budgetSources = "";
        // const operatingUnits = getState().tabData.themeFilter.operatingUnits?getState().tabData.themeFilter.operatingUnits:"",
        // budgetSources = getState().tabData.themeFilter.budgetSources?getState().tabData.themeFilter.budgetSources:""
        dispatch(donorSliderDataFetchStart());
        if (year != '' && sector != '') {
            return Api.get(Api.API_DONOR_SLIDER_DATA(year, sector, operatingUnits, budgetSources)).then(resp => {
                if (resp.success && resp.data) {
                    dispatch(donorSliderDataFetchEnd());
                    dispatch(donorSliderDataFetchSuccess(resp.data));
                } else {
                    dispatch(donorSliderDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(donorSliderDataFetchEnd());
                dispatch(donorSliderDataFetchFailed(exception));
            });
        }
        else {
            dispatch(donorSliderDataClear());
            dispatch(donorSliderDataFetchEnd());
        }
    };
};



