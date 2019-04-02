import { MARKER_SUBTYPE_DATA } from '../actions/markerSubTypes';
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
        case MARKER_SUBTYPE_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case MARKER_SUBTYPE_DATA.end:
            return {
                ...state,
                loading: false
            }

        case MARKER_SUBTYPE_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case MARKER_SUBTYPE_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case MARKER_SUBTYPE_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}