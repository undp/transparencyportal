import { PROJECT_LIST_DATA } from '../actions/projectListing';
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
        case PROJECT_LIST_DATA.start:
            return {
                ...defaultState,
                loading: true
            }

        case PROJECT_LIST_DATA.end:
            return {
                ...state,
                loading: false
            }

        case PROJECT_LIST_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case PROJECT_LIST_DATA.failed:
            return {
                ...state,
                error: action.errors
            }
        case PROJECT_LIST_DATA.clear:
            return {
                ...defaultState,
                loading: true
            }
        default:
            return state;
    }
}