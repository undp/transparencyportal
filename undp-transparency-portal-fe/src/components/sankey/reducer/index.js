import { FINANCIAL_FLOW } from '../actions';
const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	items: []
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case FINANCIAL_FLOW.start:
			return {
				...state,
				loading: true
			};

		case FINANCIAL_FLOW.end:
			return {
				...state,
				loading: false
			};

		case FINANCIAL_FLOW.success:
			return {
				...state,
				items: action.data,
				error: defaultState.error
			};

		case FINANCIAL_FLOW.failed:
			return {
				...state,
				error: action.errors
			};
		case FINANCIAL_FLOW.clear:
			return {
				...defaultState,
				loading: true
			};

		default:
			return state;
	}
};