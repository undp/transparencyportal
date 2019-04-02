import { THEME_SLIDER_DATA } from '../actions/index'
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
        case THEME_SLIDER_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case THEME_SLIDER_DATA.end:
            return {
                ...state,
                loading: false
            }

        case THEME_SLIDER_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case THEME_SLIDER_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case THEME_SLIDER_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}