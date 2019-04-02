import {
    SSC_MARKER_DATA
} from '../action';

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
        case SSC_MARKER_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SSC_MARKER_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SSC_MARKER_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SSC_MARKER_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SSC_MARKER_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}