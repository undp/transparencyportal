/************************* Redux Actions ************************/
import { DOCUMENT_CATEGORIES } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	data: []
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case DOCUMENT_CATEGORIES.start:
			return {
				...state,
				loading: true
			};

		case DOCUMENT_CATEGORIES.end:
			return {
				...state,
				loading: false
			};

		case DOCUMENT_CATEGORIES.success:
			return {
				...state,
				data: [...action.DocumentCategories],
				error: defaultState.error
			};

		case DOCUMENT_CATEGORIES.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};