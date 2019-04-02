import Api from '../../../lib/api';
import { aggregateCalculator } from '../../../utils/commonMethods';

export const SIGNATURE_OUTCOME_DATA = {
    start: 'fetch_start/resources_modality_contribution',
    end: 'fetch_end/resources_modality_contribution',
    success: 'fetch_success/resources_modality_contribution',
    failed: 'fetch_failed/resources_modality_contribution',
    clear: 'clear/resources_modality_contribution'
};
export const SIGNATURE_OUTCOME_AGGREGATE = 'SIGNATURE_OUTCOME_AGGREGATE';

export const signatureOutcomeFetchStart = () => ({
    type: SIGNATURE_OUTCOME_DATA.start
});

export const signatureOutcomeFetchEnd = () => ({
    type: SIGNATURE_OUTCOME_DATA.end
});

export const signatureOutcomeFetchSuccess = (data) => ({
    type: SIGNATURE_OUTCOME_DATA.success,
    data
})
export const signatureOutcomeClear = () => ({
    type: SIGNATURE_OUTCOME_DATA.clear
});

export const signatureOutcomeFetchFailed = (error) => ({
    type: SIGNATURE_OUTCOME_DATA.failed,
    error
});

export const updateCountryAggregate = (countryAggregate) => ({
    type: SIGNATURE_OUTCOME_AGGREGATE,
    countryAggregate
});
export const fetchSignatureOutcome = (code, year) => {
    return (dispatch, getState) => {
        dispatch(signatureOutcomeFetchStart());
        if (year != '' && code != '') {
            return Api.get(Api.API_SIGNATURE_OUTCOME(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    resp.data.percentage.sort(function(a, b) {
                        return Number(b.percent) - Number(a.percent);
                    });
                    if (resp.data.percentage.length) {
                        resp.data.percentage.forEach((item, index) => {
                            item.percentage = item.percent;
                            item.fund_stream = item.sector_name;
                            item.color = item.sector_color;
                        });
                        resp.data.total = resp.data.percentage;
                        resp.data.country = resp.data.total;
                    }
                    dispatch(signatureOutcomeFetchEnd());
                    dispatch(signatureOutcomeFetchSuccess(resp.data));
                } else {
                    dispatch(signatureOutcomeFetchEnd());
                }
            }).catch((exception) => {
                dispatch(signatureOutcomeFetchEnd());
                dispatch(signatureOutcomeFetchFailed(exception));
            });
        }
        else {
            dispatch(signatureOutcomeClear());
            dispatch(signatureOutcomeFetchEnd());
        }
    }; 
};
export const fetchSignatureSolutionChartData = (code, year) => {
    return (dispatch, getState) => {
        dispatch(signatureOutcomeFetchStart());
        if (year != '' && code != '') {
            return Api.get(Api.API_FETCH_SIGNATURE_SOLUTION_CHART_DATA(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    if (resp.data.percentage.length) {
                        resp.data.percentage.forEach((item, index) => {
                            item.percentage = item.percent;
                            item.fund_stream = item.signature_solution_name;
                            item.color = item.color;
                        });
                        resp.data.percentage.sort(function(a, b) {
                            return Number(a.signature_solution_id) - Number(b.signature_solution_id);
                        });
                        resp.data.country = resp.data.total = resp.data.percentage;
                    }
                    dispatch(signatureOutcomeFetchEnd());
                    dispatch(signatureOutcomeFetchSuccess(resp.data));
                } else {
                    dispatch(signatureOutcomeFetchEnd());
                }
            }).catch((exception) => {
                dispatch(signatureOutcomeFetchEnd());
                dispatch(signatureOutcomeFetchFailed(exception));
            });
        }
        else {
            dispatch(signatureOutcomeClear());
            dispatch(signatureOutcomeFetchEnd());
        }
    };
};