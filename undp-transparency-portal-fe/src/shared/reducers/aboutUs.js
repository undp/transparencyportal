/************************* Redux Actions ************************/
import { ABOUT_US } from '../actions/aboutUs';

const defaultState = {
    contentList: [],
    loading: false,
    error: {
        message: '',
        code: ''
    }
};

export default (state = defaultState, action) => {
    switch (action.type) {
        case ABOUT_US.start:
            return {
                ...state,
                loading: true
            };

        case ABOUT_US.end:
            return {
                ...state,
                loading: false
            };

        case ABOUT_US.success:
            return {
                ...state,
                contentList: action.content,
                error: defaultState.error
            };

        case ABOUT_US.failed:
            return {
                ...state,
                error: action.errors
            };
        default: return state
    }
};