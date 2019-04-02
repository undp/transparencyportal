
export const SET_MARKER_SUBTYPE = 'set/marker_sub-type';

export const setMarkerSubtype = (data) => {
    return (dispatch,getState) => {
    dispatch( { type: SET_MARKER_SUBTYPE,data } );
    }
};

