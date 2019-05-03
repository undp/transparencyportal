import { SET_SELECTED_SDG } from './../action';

const defaultState = {
	sdg_code_selected: ''
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case SET_SELECTED_SDG:
			return {
				sdg_code_selected: action.sdgSelected
			};

		default:
			return state;
	}
};