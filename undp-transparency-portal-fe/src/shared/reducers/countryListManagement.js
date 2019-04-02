/************************* Redux Actions ************************/
import { COUNTRY_LIST } from '../actions/commonDataActions';
import { SEARCH_COUNTRY_LIST } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	countries: [],
	error: {
		message: '',
		code: ''
	},
	filteredCountryList: []
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case COUNTRY_LIST.start:
			return {
				...state,
				loading: true
			};

		case COUNTRY_LIST.end:
			return {
				...state,
				loading: false
			};

		case COUNTRY_LIST.success:
			return {
				...state,
				countries: action.countries,
				filteredCountryList: action.countries,
				error: defaultState.error
			};

		case COUNTRY_LIST.failed:
			return {
				...state,
				error: action.errors
			};
		case SEARCH_COUNTRY_LIST.start:
			return {
				...state,
				loading: true
			};

		case SEARCH_COUNTRY_LIST.end:
			return {
				...state,
				loading: false
			};

		case SEARCH_COUNTRY_LIST.success:
			return {
				...state,
				filteredCountryList: action.countries,
				error: defaultState.error
			};

		case SEARCH_COUNTRY_LIST.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};