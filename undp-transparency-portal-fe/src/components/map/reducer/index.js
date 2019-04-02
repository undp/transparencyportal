import { MAP_DATA } from '../actions'
const defaultState = {
    loading: false,
    error: {
        message: '',
        code: ''
    },
    data:[]
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case MAP_DATA.start:
            return {
                ...state,
                loading: true
            }

        case MAP_DATA.end:
            return {
                ...state,
                loading: false
            }

        case MAP_DATA.success:
            return {
                ...state,
                data: action.data,
                error: defaultState.error
            }

        case MAP_DATA.failed:
            return {
                ...state,
                error: action.errors
            }

        default:
            return state;
    }
}