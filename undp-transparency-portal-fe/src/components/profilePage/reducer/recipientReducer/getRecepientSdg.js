import {
    RECIPIENT_SDG,
    RECIPIENT_SDG_AGGREGATE
} from '../../actions/recipientActions/getRecepientSdg'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: [],
    sdgAggregate: 0
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case RECIPIENT_SDG.start:
            return {
                ...defaultState,
                loading: true
            }

        case RECIPIENT_SDG.end:
            return {
                ...state,
                loading: false
            }

        case RECIPIENT_SDG.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case RECIPIENT_SDG.failed:
            return {
                ...state,
                error: action.errors
            }

        case RECIPIENT_SDG_AGGREGATE:
            return {
                ...state,
                sdgAggregate: action.sdgAggregate
            }

        default:
            return state;
    }
}


