import { SDG_SUNBURST_DATA } from '../actions/index';

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
        case SDG_SUNBURST_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SDG_SUNBURST_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SDG_SUNBURST_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SDG_SUNBURST_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SDG_SUNBURST_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}