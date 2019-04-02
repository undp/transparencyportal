/************************* Redux Actions ************************/
import { LAST_UPDATED_DATE } from '../actions/commonDataActions';
const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	data: {}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case LAST_UPDATED_DATE.start:
			return {
				...state,
				loading: true
			};

		case LAST_UPDATED_DATE.end:
			return {
				...state,
				loading: false
			};

		case LAST_UPDATED_DATE.success:
			return {
				...state,
				data: action.date,
				error: defaultState.error
			};

		case LAST_UPDATED_DATE.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};