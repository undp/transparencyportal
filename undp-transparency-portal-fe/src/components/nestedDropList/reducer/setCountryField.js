import { SET_COUNTRY_SELECTED } from '../actions/setCountryField';

const defaultState = {

    countrySelected:'' 

}

export default (state = defaultState, action) => {
    switch (action.type) {
        case SET_COUNTRY_SELECTED:
            return {
                countrySelected: action.value
            }

        default:
            return state;
    }
}