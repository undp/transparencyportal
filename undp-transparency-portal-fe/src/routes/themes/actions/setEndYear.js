export const SET_END_YEAR = 'SET_END_YEAR';

export function setEndYear(startYear,endYear) {
    return {
      type: SET_END_YEAR,
      startYear,
      endYear
    }
  }

export  const updateEndYear = (startYear,endYear) => {
    return (dispatch, getState) => {
    dispatch(setEndYear(startYear,endYear))
    }
} 