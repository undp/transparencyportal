import { DONOR_BASIC } from '../../actions/donorActions/getDonorBasicDetails'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: {
        budget: '',
        direct_funded_projects: '',
        regular_resources: ''
    }
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case DONOR_BASIC.start:
            return {
                ...defaultState,
                loading: true
            }

        case DONOR_BASIC.end:
            return {
                ...state,
                loading: false
            }

        case DONOR_BASIC.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case DONOR_BASIC.failed:
            return {
                ...state,
                error: action.errors
            }
        case DONOR_BASIC.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}