/************************* Redux Actions ************************/
import { THEME_SUMMARY } from '../../../src/components/YearSummary/actions';

const defaultState = {
	loading: false,
	themes: [],
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case THEME_SUMMARY.start:
			return {
				...state,
				loading: true
			};

		case THEME_SUMMARY.end:
			return {
				...state,
				loading: false
			};

		case THEME_SUMMARY.success:
			return {
				...state,
				themes: action.data,
				error: defaultState.error
			};

		case THEME_SUMMARY.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};