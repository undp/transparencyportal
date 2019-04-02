import { BAR_CHART_DATA } from '../actions/barchartDataFetch';
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
        case BAR_CHART_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case BAR_CHART_DATA.end:
            return {
                ...state,
                loading: false
            }

        case BAR_CHART_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case BAR_CHART_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case BAR_CHART_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}