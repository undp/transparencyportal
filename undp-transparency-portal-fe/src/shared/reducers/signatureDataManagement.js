/************************* Redux Actions ************************/
import { SIGNATURE_SUMMARY } from '../../../src/components/YearSummary/actions';

const defaultState = {
	loading: false,
	signatures: [],
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case SIGNATURE_SUMMARY.start:
			return {
				...state,
				loading: true
			};

		case SIGNATURE_SUMMARY.end:
			return {
				...state,
				loading: false
			};

		case SIGNATURE_SUMMARY.success:
			return {
				...state,
				signatures: action.data,
				error: defaultState.error
			};

		case SIGNATURE_SUMMARY.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};