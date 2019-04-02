import {
    OUR_APPROACHES_DATA
} from '../action/ourApproaches';

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
        case OUR_APPROACHES_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case OUR_APPROACHES_DATA.end:
            return {
                ...state,
                loading: false
            }

        case OUR_APPROACHES_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case OUR_APPROACHES_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case OUR_APPROACHES_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}