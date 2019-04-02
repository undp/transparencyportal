import { YEAR_SUMMARY } from '../actions'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data:{}
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case YEAR_SUMMARY.start:
            return {
                ...state,
                loading: true
            }

        case YEAR_SUMMARY.end:
            return {
                ...state,
                loading: false
            }

        case YEAR_SUMMARY.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case YEAR_SUMMARY.failed:
            return {
                ...state,
                error: action.errors
            }

        default:
            return state;
    }
}