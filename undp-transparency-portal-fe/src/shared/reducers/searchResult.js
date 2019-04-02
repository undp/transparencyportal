/************************* Redux Actions ************************/
import { SEARCH_ALL_RESULTS , UPDATE_SEARCH_TEXT } from '../actions/searchActions';

const defaultState = {
	loading: false,
	data: [],
	error: {
		message: '',
		code: ''
	},
	searchText: '',
	totalCount: 0,
	draw: ''

};

export default (state = defaultState, action) => {
	switch (action.type) {
		case SEARCH_ALL_RESULTS.start:
			return {
				...state,
				loading: true
			};

		case SEARCH_ALL_RESULTS.end:
			return {
				...state,
				loading: false
			};

		case SEARCH_ALL_RESULTS.success:
			return {
				...state,
				data: action.data,
				error: defaultState.error,
				totalCount: action.totalCount
			};

		case SEARCH_ALL_RESULTS.failed:
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