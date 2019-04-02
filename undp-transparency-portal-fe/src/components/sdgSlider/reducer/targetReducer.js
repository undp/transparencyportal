import { SDG_SLIDER_TARGET_DATA } from '../actions/targetAction';

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
        case SDG_SLIDER_TARGET_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SDG_SLIDER_TARGET_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SDG_SLIDER_TARGET_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SDG_SLIDER_TARGET_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SDG_SLIDER_TARGET_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}