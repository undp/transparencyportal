import { REGULAR_AND_OTHERS ,
    REGULAR_AND_OTHERS_UPDATE_COUNTRY_AGGREGATE
} from '../../actions/donorActions/getRegularAndOtherDetails'
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
        case REGULAR_AND_OTHERS.start:
            return {
                ...defaultState,
                loading: true
            }

        case REGULAR_AND_OTHERS.end:
            return {
                ...state,
                loading: false
            }

        case REGULAR_AND_OTHERS.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case REGULAR_AND_OTHERS.failed:
            return {
                ...state,
                error: action.errors
            }
        case REGULAR_AND_OTHERS.clear:
            return {
                ...defaultState,
                loading: true
            }

            case  REGULAR_AND_OTHERS_UPDATE_COUNTRY_AGGREGATE :
            return {
                ...state,
                countryAggregate: action.countryAggregate
            }
        default:
            return state;
    }
}