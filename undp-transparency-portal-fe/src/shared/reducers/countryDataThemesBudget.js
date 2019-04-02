/************************* Redux Actions ************************/
import { COUNTRY_DATA_THEMES } from '../actions/countryDataThemesBudget';

const defaultState = {
	data: [],
	loading: false,
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case COUNTRY_DATA_THEMES.start:
			return {
				...state,
				loading: true
			};

		case COUNTRY_DATA_THEMES.end:
			return {
				...state,
				loading: false
			};

		case COUNTRY_DATA_THEMES.success:
			return {
				...state,
				data: [...action.data],
				error: defaultState.error
			};

		case COUNTRY_DATA_THEMES.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};