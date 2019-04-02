import { RECIPIENT_BASIC } from '../../actions/recipientActions/getRecipientBasicDetails'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: {
        budget: '',
        expense: '',
        project_count: '',
        budget_sources: ''
    }
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RECIPIENT_BASIC.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_BASIC.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_BASIC.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECIPIENT_BASIC.failed:
            return {
                ...state,
                error: action.errors
            }
        case RECIPIENT_BASIC.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}