import { SET_MARKER_SUBTYPE } from '../actions/setMarkerSubtype';
const defaultState = {
    markerSubType: ''
};
export default (state=defaultState, action) => {
    switch (action.type) {
        case SET_MARKER_SUBTYPE:
            return {
                ...state,
                markerSubType: action.data
            }
        default:
            return state;
    }
}