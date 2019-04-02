import Api from '../../../lib/api';
export const SIGNATURE_SLIDER_DATA = {
    start: 'fetch_start/theme_slider_data',
    end: 'fetch_end/theme_slider_data',
    success: 'fetch_success/theme_slider_data',
    failed: 'fetch_failed/theme_slider_data',
    clear: 'clear/theme_slider_data'
};

export const signatureSliderDataFetchStart = () => ({
    type: SIGNATURE_SLIDER_DATA.start
});

export const signatureSliderDataFetchEnd = () => ({
    type: SIGNATURE_SLIDER_DATA.end
});
export const signatureSliderDataClear = () => ({
    type: SIGNATURE_SLIDER_DATA.clear
});

export const signatureSliderDataFetchSuccess = (data) => (
    {
        type: SIGNATURE_SLIDER_DATA.success,
        data
    });

export const signatureSliderDataFetchFailed = (error) => ({
    type: SIGNATURE_SLIDER_DATA.failed,
    error
});

export const fetchSignatureSliderData = (year, sector) => {
    return (dispatch, getState) => {
        budgetSources;
        const operatingUnits = "",
            budgetSources = "";
        dispatch(signatureSliderDataFetchStart());
        if (year != '' && sector != '') {
            return Api.get(Api.API_SIGNATURE_SLIDER_DATA(year, sector, operatingUnits, budgetSources)).then(resp => {
                if (resp.success && resp.data) {
                      resp.data.aggregate = resp.data.aggregate[0];
                      resp.data.aggregate.budget_amount = Number(resp.data.aggregate.budget);
                      resp.data.aggregate.percentage = ((Number(resp.data.aggregate.expense_amount) * 100) / resp.data.aggregate.budget_amount).toFixed(2);
                      resp.data.aggregate.sector_name = resp.data.aggregate.signature_solution;
                      resp.data.aggregate.expense_amount = Number(resp.data.aggregate.expense);
                      resp.data.aggregate.sector = resp.data.aggregate.ss_id;
                      resp.data.aggregate.budget_sources = Number(resp.data.aggregate.donors);
                      resp.data.aggregate.countries =  resp.data.aggregate.operating_units;
                      resp.data.aggregate.outputs =  resp.data.aggregate.total_outputs;
                      resp.data.aggregate.year =  resp.data.aggregate.year.toString();
                    dispatch(signatureSliderDataFetchEnd());
                    dispatch(signatureSliderDataFetchSuccess(resp.data));
                } else {
                    dispatch(signatureSliderDataFetchEnd());
                }
            }).catch((exception) => {
                dispatch(signatureSliderDataFetchEnd());
                dispatch(signatureSliderDataFetchFailed(exception));
            });
        }
        else {
            dispatch(signatureSliderDataClear());
            dispatch(signatureSliderDataFetchEnd());
        }
    };
};



