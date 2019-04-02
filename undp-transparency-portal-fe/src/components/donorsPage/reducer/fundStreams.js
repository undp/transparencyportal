import { FUND_STREAMS } from '../actions'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data:[],
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case FUND_STREAMS.start:
            return {
                ...state,
                loading: true
            }

        case FUND_STREAMS.end:
            return {
                ...state,
                loading: false
            }

        case FUND_STREAMS.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case FUND_STREAMS.failed:
            return {
                ...state,
                error: action.errors
            }

        default:
            return state;
    }
}