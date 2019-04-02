/************************* Redux Actions ************************/
import { OPERATING_UNITS } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case OPERATING_UNITS.start:
			return {
				...state,
				loading: true
			};

		case OPERATING_UNITS.end:
			return {
				...state,
				loading: false
			};

		case OPERATING_UNITS.success:
			return {
				...state,
				...action.operatingUnitlist,
				error: defaultState.error
			};

		case OPERATING_UNITS.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};