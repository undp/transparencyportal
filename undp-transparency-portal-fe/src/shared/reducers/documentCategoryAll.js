/************************* Redux Actions ************************/
import { DOCUMENT_CATEGORIES_ALL } from '../actions/commonDataActions';

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
		case DOCUMENT_CATEGORIES_ALL.start:
			return {
				...state,
				loading: true
			};

		case DOCUMENT_CATEGORIES_ALL.end:
			return {
				...state,
				loading: false
			};

		case DOCUMENT_CATEGORIES_ALL.success:
			return {
				...state,
				data: [...action.DocumentCategories],
				error: defaultState.error
			};

		case DOCUMENT_CATEGORIES_ALL.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};