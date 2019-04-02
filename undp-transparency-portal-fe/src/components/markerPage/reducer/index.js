import { MARKER_DATA } from '../actions/index';
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
        case MARKER_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case MARKER_DATA.end:
            return {
                ...state,
                loading: false
            }

        case MARKER_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case MARKER_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case MARKER_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}