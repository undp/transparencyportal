/************************* Redux Actions ************************/
import { COUNTRY_DATA_BUDGET_SOURCES } from '../actions/countryDataBudgetSources';

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
		case COUNTRY_DATA_BUDGET_SOURCES.start:
			return {
				...state,
				loading: true
			};

		case COUNTRY_DATA_BUDGET_SOURCES.end:
			return {
				...state,
				loading: false
			};

		case COUNTRY_DATA_BUDGET_SOURCES.success:
			return {
				...state,
				data: [...action.data],
				error: defaultState.error
			};

		case COUNTRY_DATA_BUDGET_SOURCES.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};