export const SET_MARKER_SUBTYPE = 'SET_MARKER_SUBTYPE';

export function setMarkerSubType(value) {
    return {
      type: SET_MARKER_SUBTYPE,
      value
    }
  }

export  const updateMarkerSubType = value => {
    return (dispatch, getState) => {
    dispatch(setMarkerSubType(value))
    }
} 
