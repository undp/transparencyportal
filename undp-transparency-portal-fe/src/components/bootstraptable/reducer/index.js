import { PROJECT_LIST_DATA } from '../actions'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data: [],
    year: ''

}

export default (state = defaultState, action) => {
    switch (action.type) {
        case PROJECT_LIST_DATA.start:
            return {
                ...state,
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
        case PROJECT_LIST_DATA.updateYear:
            return {
                ...state,
                year: action.year
            }

        default:
            return state;
    }
}