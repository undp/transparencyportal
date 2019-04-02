import { SDG_SLIDER_DATA } from '../actions/index'
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
        case SDG_SLIDER_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SDG_SLIDER_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SDG_SLIDER_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SDG_SLIDER_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SDG_SLIDER_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        case SDG_SLIDER_DATA.targetTitle:
            return {
                ...state,
                targetTitle: action.data
            }
        default:
            return state;
    }
}