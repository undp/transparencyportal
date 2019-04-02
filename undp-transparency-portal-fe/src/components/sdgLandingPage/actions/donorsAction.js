import Api from '../../../lib/api';
export const SDG_TOP_FIVE_DONORS = {
    start: 'fetch_start/sdg_top_five_donors',
    end: 'fetch_end/sdg_top_five_donors',
    success: 'fetch_success/sdg_top_five_donors',
    failed: 'fetch_failed/sdg_top_five_donors',
    clear: 'clear/sdg_top_five_donors'
};

export const sdgTopFIveDataFetchStart = () => ({
    type: SDG_TOP_FIVE_DONORS.start
});

export const sdgTopFIveDataFetchEnd = () => ({
    type: SDG_TOP_FIVE_DONORS.end
});
export const sdgTopFIveDataClear = () => ({
    type: SDG_TOP_FIVE_DONORS.clear
});

export const sdgTopFIveDataFetchSuccess = (data) => (
    {
        type: SDG_TOP_FIVE_DONORS.success,
        data
    });

export const sdgTopFIveDataFetchFailed = (error) => ({
    type: SDG_TOP_FIVE_DONORS.failed,
    error
});

export const fetchsdgTopFiveData = (year, sdg) => {
    return (dispatch, getState) => {
        budgetSources;
        const operatingUnits = "",
            budgetSources = "";
        // const operatingUnits = getState().tabData.themeFilter.operatingUnits?getState().tabData.themeFilter.operatingUnits:"",
        // budgetSources = getState().tabData.themeFilter.budgetSources?getState().tabData.themeFilter.budgetSources:""
        dispatch(sdgTopFIveDataFetchStart());
        if (year != '' && sdg != '') {
            return Api.get(Api.API_SDG_SLIDER_DATA(year, sdg, operatingUnits, budgetSources)).then(resp => {
                if (resp.success && resp.data) {
                    let budget_sources = [],
                        top_recipient_offices = [];
                    resp.data.budget_sources.map(obj =>{ 
                        if(budget_sources.length != 5)
                        budget_sources.push(obj);
                    });
                    resp.data.budget_sources = budget_sources;
                    resp.data.top_recipient_offices.map(obj =>{ 
                        if(top_recipient_offices.length != 5)
                        top_recipient_offices.push(obj);
                    });
                    resp.data.top_recipient_offices = top_recipient_offices;
                    dispatch(sdgTopFIveDataFetchEnd());
                    dispatch(sdgTopFIveDataFetchSuccess(resp.data));
                } else {
                    dispatch(sdgTopFIveDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(sdgTopFIveDataFetchEnd());
                dispatch(sdgTopFIveDataFetchFailed(exception));
            });
        }
        else {
            dispatch(sdgTopFIveDataClear());
            dispatch(sdgTopFIveDataFetchEnd());
        }
    };
};



