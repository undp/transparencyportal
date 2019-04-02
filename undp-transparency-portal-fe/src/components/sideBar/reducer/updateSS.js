import { SET_SIGNATURE_SOLUTION } from '../action/updateSS';

const defaultState = {

    selectedSignature: ''

}

export default (state = defaultState, action) => {
    switch (action.type) {
        case SET_SIGNATURE_SOLUTION:
            return {
                ...state,
                selectedSignature: action.value
            }

        default:
            return state;
    }
}