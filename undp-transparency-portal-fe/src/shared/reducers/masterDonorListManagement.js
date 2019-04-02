/************************* Redux Actions ************************/
import { DONOR_LIST } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case DONOR_LIST.start:
			return {
				...state,
				loading: true
			};

		case DONOR_LIST.end:
			return {
				...state,
				loading: false
			};

		case DONOR_LIST.success:
			return {
				...state,
				...action.donorList,
				error: defaultState.error
			};

		case DONOR_LIST.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};