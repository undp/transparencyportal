import Api from '../../../../lib/api';
import { aggregateCalculator } from '../../../../utils/commonMethods';

export const RESOURCES_MODALITY_CONTRIBUTION = {
    start: 'fetch_start/resources_modality_contribution',
    end: 'fetch_end/resources_modality_contribution',
    success: 'fetch_success/resources_modality_contribution',
    failed: 'fetch_failed/resources_modality_contribution',
    clear: 'clear/resources_modality_contribution'
}


export const RESOURCES_MODALITY_CONTRIBUTION_COUNTRY_AGGREGATE = 'RESOURCES_MODALITY_CONTRIBUTION_COUNTRY_AGGREGATE'

export const resourcesModalityContributionFetchStart = () => ({
    type: RESOURCES_MODALITY_CONTRIBUTION.start
})

export const resourcesModalityContributionFetchEnd = () => ({
    type: RESOURCES_MODALITY_CONTRIBUTION.end
})

export const resourcesModalityContributionFetchSuccess = (data) => (
    {
        type: RESOURCES_MODALITY_CONTRIBUTION.success,
        data
    })
export const resourcesModalityContributionClear = () => ({
    type: RESOURCES_MODALITY_CONTRIBUTION.clear
})

export const resourcesModalityContributionFetchFailed = (error) => ({
    type: RESOURCES_MODALITY_CONTRIBUTION.failed,
    error
})

export const updateCountryAggregate = (countryAggregate) => ({
    type: RESOURCES_MODALITY_CONTRIBUTION_COUNTRY_AGGREGATE,
    countryAggregate
})


export const fetchDonorResourcesModalityContribution = (code, year) => {
    return (dispatch) => {
        dispatch(resourcesModalityContributionFetchStart())
        if (code != '' && year != null) {
            return Api.get(Api.API_RECIPIENT_RESOURCES_MODALITY_CONTRIBUTION(code, year)).then(resp => {
                if (resp.success && resp.data) {
                    if( resp.data.country.length){
                        const countryAggregate = aggregateCalculator(resp.data.country,'total_contribution');
                        dispatch(updateCountryAggregate(countryAggregate))
                    }
                    dispatch(resourcesModalityContributionFetchEnd())
                    dispatch(resourcesModalityContributionFetchSuccess(resp.data))
                } else {
                    dispatch(resourcesModalityContributionFetchEnd())
                }
            }).catch((exception) => {
                dispatch(resourcesModalityContributionFetchEnd())
                dispatch(resourcesModalityContributionFetchFailed(exception))
            });
        }
        else {
            dispatch(resourcesModalityContributionClear())
            dispatch(resourcesModalityContributionFetchEnd())
        }
    }
}



