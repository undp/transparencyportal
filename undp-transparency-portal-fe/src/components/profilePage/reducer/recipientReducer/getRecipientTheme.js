import { RECIPIENT_THEME ,RECIPIENT_THEME_AGGREGATE} from '../../actions/recipientActions/getRecipientTheme'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: [
        // {
        //     sector_name: '',
        //     sector: '',
        //     expense: '',
        //     theme_budget: '',
        //     percentage: ''
        // }
    ],
    themeAggregate:0
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RECIPIENT_THEME.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_THEME.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_THEME.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECIPIENT_THEME.failed:
            return {
                ...state,
                error: action.errors
            }
            case RECIPIENT_THEME_AGGREGATE:
            return {
                ...state,
                themeAggregate: action.themeAggregate
            }
        default:
            return state;
    }
}

