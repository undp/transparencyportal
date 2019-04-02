import { SDG_BAR_CHART_DATA,
    SDG_BAR_CHART_DATA_COUNTRY_AGGREGATE
} from '../actions/sdgBarChart';

const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: {
        total: [],
        country: []
    },
    countryAggregate:0
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case SDG_BAR_CHART_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SDG_BAR_CHART_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SDG_BAR_CHART_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SDG_BAR_CHART_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SDG_BAR_CHART_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        case SDG_BAR_CHART_DATA_COUNTRY_AGGREGATE:
            return {
                ...state,
                countryAggregate: action.countryAggregate
            }            
        default:
            return state;
    }
}

