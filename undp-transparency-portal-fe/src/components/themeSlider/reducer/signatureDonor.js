import {
    SIGNATURE_SLIDER_DATA
} from '../actions/signatureDonor';
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
        case SIGNATURE_SLIDER_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case SIGNATURE_SLIDER_DATA.end:
            return {
                ...state,
                loading: false
            }

        case SIGNATURE_SLIDER_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case SIGNATURE_SLIDER_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case SIGNATURE_SLIDER_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}