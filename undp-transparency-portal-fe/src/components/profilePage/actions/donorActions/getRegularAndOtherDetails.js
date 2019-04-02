import Api from '../../../../lib/api';
import { aggregateCalculator } from '../../../../utils/commonMethods';



export const REGULAR_AND_OTHERS = {
    start: 'fetch_start/regular_and_others',
    end: 'fetch_end/regular_and_others',
    success: 'fetch_success/regular_and_others',
    failed: 'fetch_failed/regular_and_others',
    clear: 'clear/regular_and_others'
}

export const REGULAR_AND_OTHERS_UPDATE_COUNTRY_AGGREGATE = 'REGULAR_AND_OTHERS_UPDATE_COUNTRY_AGGREGATE';


export const regularAndOthersFetchStart = () => ({
    type: REGULAR_AND_OTHERS.start
})

export const regularAndOthersFetchEnd = () => ({
    type: REGULAR_AND_OTHERS.end
})

export const regularAndOthersFetchSuccess = (data) => (
    {
        type: REGULAR_AND_OTHERS.success,
        data
    })

export const regularAndOthersClear = () => ({
    type: REGULAR_AND_OTHERS.clear
})


export const updateCountryAggregate = (countryAggregate) => ({
    type: REGULAR_AND_OTHERS_UPDATE_COUNTRY_AGGREGATE,
    countryAggregate
})


export const regularAndOthersFetchFailed = (error) => ({
    type: REGULAR_AND_OTHERS.failed,
    error
})



export const fetchDonorRegularAndOthers = (code, year) => {
    return (dispatch) => {
        dispatch(regularAndOthersFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.API_DONOR_REGULAR_AND_OTHERS(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    if( resp.data && resp.data.country.length){
                        const countryAggregate = aggregateCalculator(resp.data.country,'total_contribution');
                        dispatch(updateCountryAggregate(countryAggregate))
                    }
                    dispatch(regularAndOthersFetchEnd())
                    dispatch(regularAndOthersFetchSuccess(resp.data))
                } else {
                    dispatch(regularAndOthersFetchEnd())
                }
            }).catch((exception) => {
                dispatch(regularAndOthersFetchEnd())
                dispatch(regularAndOthersFetchFailed(exception))
            });
        }
        else {
            dispatch(regularAndOthersClear())
            dispatch(regularAndOthersFetchEnd())
        }
    }
}



