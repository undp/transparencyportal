import { DONOR_BUDGET_SOURCES } from '../../actions/donorActions/getBudgetSources'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: []
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case DONOR_BUDGET_SOURCES.start:
            return {
                ...defaultState,
                loading: true
            }

        case DONOR_BUDGET_SOURCES.end:
            return {
                ...state,
                loading: false
            }

        case DONOR_BUDGET_SOURCES.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case DONOR_BUDGET_SOURCES.failed:
            return {
                ...state,
                error: action.errors
            }
        case DONOR_BUDGET_SOURCES.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}