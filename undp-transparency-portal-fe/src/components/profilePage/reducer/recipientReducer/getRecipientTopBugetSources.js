import { RECIPIENT_TOP_BUDGET_SOURCES } from '../../actions/recipientActions/getRecipientTopBugetSources'
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
        case RECIPIENT_TOP_BUDGET_SOURCES.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_TOP_BUDGET_SOURCES.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_TOP_BUDGET_SOURCES.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECIPIENT_TOP_BUDGET_SOURCES.failed:
            return {
                ...state,
                error: action.errors
            }
        default:
            return state;
    }
}