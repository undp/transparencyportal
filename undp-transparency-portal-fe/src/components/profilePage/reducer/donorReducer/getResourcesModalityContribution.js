import { RESOURCES_MODALITY_CONTRIBUTION,
    RESOURCES_MODALITY_CONTRIBUTION_COUNTRY_AGGREGATE
} from '../../actions/donorActions/getResourcesModalityContribution'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: {
        total: [],
        country: []
    },
    countryAggregate:0
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RESOURCES_MODALITY_CONTRIBUTION.start:
            return {
                ...defaultState,
                loading: true
            }

        case RESOURCES_MODALITY_CONTRIBUTION.end:
            return {
                ...state,
                loading: false
            }

        case RESOURCES_MODALITY_CONTRIBUTION.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RESOURCES_MODALITY_CONTRIBUTION.failed:
            return {
                ...state,
                error: action.errors
            }
        case RESOURCES_MODALITY_CONTRIBUTION.clear:
            return {
                ...defaultState,
                loading: true
            }
        case RESOURCES_MODALITY_CONTRIBUTION_COUNTRY_AGGREGATE:
            return {
                ...state,
                countryAggregate: action.countryAggregate
            }            
        default:
            return state;
    }
}

