import { SDG_TOP_FIVE_DONORS } from '../actions/donorsAction';

const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: {}
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case SDG_TOP_FIVE_DONORS.start:
            return {
                ...defaultState,
                loading: true
            }

        case SDG_TOP_FIVE_DONORS.end:
            return {
                ...state,
                loading: false
            }

        case SDG_TOP_FIVE_DONORS.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SDG_TOP_FIVE_DONORS.failed:
            return {
                ...state,
                error: action.errors
            }
        case SDG_TOP_FIVE_DONORS.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}