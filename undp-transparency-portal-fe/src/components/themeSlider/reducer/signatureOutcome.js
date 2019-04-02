import {
    SIGNATURE_OUTCOME_DATA,
    SIGNATURE_OUTCOME_AGGREGATE
} from '../actions/signatureOutcome';

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
    countryAggregate: 0
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case SIGNATURE_OUTCOME_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SIGNATURE_OUTCOME_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SIGNATURE_OUTCOME_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SIGNATURE_OUTCOME_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SIGNATURE_OUTCOME_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        case SIGNATURE_OUTCOME_AGGREGATE:
            return {
                ...state,
                countryAggregate: action.countryAggregate
            }            
        default:
            return state;
    }
}

