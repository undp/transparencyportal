/************************* Redux Actions ************************/
import { COUNTRY_REGIONS_SEARCH, UPDATE_SEARCH_TEXT } from '../actions/countryRegionSearch';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	list: [],
	searchResult: [],
	searchResultSearchBar: [],
	searchText: ''
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case COUNTRY_REGIONS_SEARCH.start:
			return {
				...state,
				loading: true
			};

		case COUNTRY_REGIONS_SEARCH.end:
			return {
				...state,
				loading: false
			};

		case COUNTRY_REGIONS_SEARCH.success:
			return {
				...state,
				searchResult: action.countryRegionList,
				error: defaultState.error
			};
		case COUNTRY_REGIONS_SEARCH.updateList:
			return {
				...state,
				list: action.countryRegionList,
				error: defaultState.error
			};

		case COUNTRY_REGIONS_SEARCH.failed:
			return {
				...state,
				error: action.errors
			};
		case UPDATE_SEARCH_TEXT:
			return {
				...state,
				searchText: action.text
			};
		default:
			return state;
	}
};