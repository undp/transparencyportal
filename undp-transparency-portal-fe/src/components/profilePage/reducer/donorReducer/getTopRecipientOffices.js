import { RECIPIENT_TOP_OFFICES } from '../../actions/donorActions/getTopRecipientOffices'
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
        case RECIPIENT_TOP_OFFICES.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_TOP_OFFICES.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_TOP_OFFICES.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECIPIENT_TOP_OFFICES.failed:
            return {
                ...state,
                error: action.errors
            }
        case RECIPIENT_TOP_OFFICES.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}