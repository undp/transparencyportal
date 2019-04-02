export const SET_COUNTRY_SELECTED = 'SET_COUNTRY_SELECTED';

export function setCountrySelected(value) {
    return {
      type: SET_COUNTRY_SELECTED,
      value
    }
  }

export  const updateCountrySelected = value => {
    return (dispatch, getState) => {
    dispatch(setCountrySelected(value))
    }
} 