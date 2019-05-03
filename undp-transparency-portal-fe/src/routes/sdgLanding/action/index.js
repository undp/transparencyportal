export const SET_SELECTED_SDG = 'SET_SELECTED_SDG';

export function setSDG(sdg_code) {
	return {
		type: SET_SELECTED_SDG,
		sdgSelected: sdg_code
	};
}

export  const updateSDG = (sdg_code) => (dispatch) => {
	dispatch(setSDG(sdg_code));
};