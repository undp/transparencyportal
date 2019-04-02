import { DONOR_TYPES } from '../actions'
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
        case DONOR_TYPES.start:
            return {
                ...state,
                loading: true
            }

        case DONOR_TYPES.end:
            return {
                ...state,
                loading: false
            }

        case DONOR_TYPES.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case DONOR_TYPES.failed:
            return {
                ...state,
                error: action.errors
            }

        default:
            return state;
    }
}