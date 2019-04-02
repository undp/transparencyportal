/************************* Redux Actions ************************/
import { PROJECT_TIMELINE } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	year: [],
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case PROJECT_TIMELINE.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_TIMELINE.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_TIMELINE.success:
			return {
				...state,
				year: action.year,
				error: defaultState.error
			};

		case PROJECT_TIMELINE.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};