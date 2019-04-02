/************************* Redux Actions ************************/
import { DONOR_FUND_LIST } from '../actions/getDonorFundAggrList';
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
		case DONOR_FUND_LIST.start:
			return {
				...state,
				loading: true
			};

		case DONOR_FUND_LIST.end:
			return {
				...state,
				loading: false
			};

		case DONOR_FUND_LIST.success:
			return {
				...state,
				data: action.data,
				error: defaultState.error
			};

		case DONOR_FUND_LIST.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};