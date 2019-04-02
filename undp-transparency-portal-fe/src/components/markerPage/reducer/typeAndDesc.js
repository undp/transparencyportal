import { MARKER_DESC_DATA } from '../actions/typeAndDesc';
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
        case MARKER_DESC_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case MARKER_DESC_DATA.end:
            return {
                ...state,
                loading: false
            }

        case MARKER_DESC_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case MARKER_DESC_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case MARKER_DESC_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}