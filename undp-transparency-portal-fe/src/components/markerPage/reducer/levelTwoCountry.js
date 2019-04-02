import { LEVEL_TWO_COUNTRY_DATA } from '../actions/levelTwoCountry';
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
        case LEVEL_TWO_COUNTRY_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case LEVEL_TWO_COUNTRY_DATA.end:
            return {
                ...state,
                loading: false
            }

        case LEVEL_TWO_COUNTRY_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case LEVEL_TWO_COUNTRY_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case LEVEL_TWO_COUNTRY_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}