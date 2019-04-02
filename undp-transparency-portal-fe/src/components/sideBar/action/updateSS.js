export const SET_SIGNATURE_SOLUTION = 'SET_SIGNATURE_SOLUTION';

export function setSignatureSolution(value) {
    return {
      type: SET_SIGNATURE_SOLUTION,
      value
    }
  }

export  const updateSignatureSolution = value => {
    return (dispatch, getState) => { 
    dispatch(setSignatureSolution(value))
    }
} 