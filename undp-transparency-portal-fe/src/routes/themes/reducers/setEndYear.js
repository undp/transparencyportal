import { SET_END_YEAR } from '../actions/setEndYear';

const defaultState = {
    endYear: '' ,
    startYear: ''
}

export default (state = defaultState, action) => {

    switch (action.type) {
        case SET_END_YEAR:
            return {
                endYear: action.endYear,
                startYear: action.startYear
            }

        default:
            return state;
    }
}