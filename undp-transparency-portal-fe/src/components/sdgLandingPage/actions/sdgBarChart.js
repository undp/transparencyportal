import Api from '../../../lib/api';
import { aggregateCalculator } from '../../../utils/commonMethods';

export const SDG_BAR_CHART_DATA = {
    start: 'fetch_start/sdg_bar_chart_data',
    end: 'fetch_end/sdg_bar_chart_data',
    success: 'fetch_success/sdg_bar_chart_data',
    failed: 'fetch_failed/sdg_bar_chart_data',
    clear: 'clear/sdg_bar_chart_data'
}


export const SDG_BAR_CHART_DATA_COUNTRY_AGGREGATE = 'RESOURCES_MODALITY_CONTRIBUTION_COUNTRY_AGGREGATE'

export const sdgBarChartFetchStart = () => ({
    type: SDG_BAR_CHART_DATA.start
})

export const sdgBarChartFetchEnd = () => ({
    type: SDG_BAR_CHART_DATA.end
})

export const sdgBarChartFetchSuccess = (data) => (
    {
        type: SDG_BAR_CHART_DATA.success,
        data
    })
export const sdgBarChartClear = () => ({
    type: SDG_BAR_CHART_DATA.clear
})

export const sdgBarChartFetchFailed = (error) => ({
    type: SDG_BAR_CHART_DATA.failed,
    error
})

export const updateCountryAggregate = (countryAggregate) => ({
    type: SDG_BAR_CHART_DATA_COUNTRY_AGGREGATE,
    countryAggregate
})


export const fetchSdgBarChart = (code, year) => {
    return (dispatch) => {
        dispatch(sdgBarChartFetchStart());
        if (code != '' && year != null) {
            return Api.get(Api.API_SDG_BAR_CHART(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    if( resp.data.country.length){
                        const countryAggregate = aggregateCalculator(resp.data.country,'total_contribution');
                        dispatch(updateCountryAggregate(countryAggregate))
                    }
                    resp.data.total[0].color = 'cae1f7';
                    resp.data.total = [resp.data.total[0]];
                    dispatch(sdgBarChartFetchEnd());
                    dispatch(sdgBarChartFetchSuccess(resp.data));
                } else {
                    dispatch(sdgBarChartFetchEnd());
                }
            }).catch((exception) => {
                dispatch(sdgBarChartFetchEnd());
                dispatch(sdgBarChartFetchFailed(exception));
            });
        }
        else {
            dispatch(sdgBarChartClear())
            dispatch(sdgBarChartFetchEnd())
        }
    }
}



