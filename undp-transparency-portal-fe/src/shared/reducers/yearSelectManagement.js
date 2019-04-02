/************************* Redux Actions ************************/
import { YEAR_SELECTION } from '../actions/yearSelectActions';

const defaultState = {
	loading: false,
	year: '',
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case YEAR_SELECTION.start:
			return {
				...state,
				loading: true
			};

		case YEAR_SELECTION.end:
			return {
				...state,
				loading: false
			};

		case YEAR_SELECTION.success:
			return {
				...state,
				year: action.year,
				error: defaultState.error
			};

		case YEAR_SELECTION.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};