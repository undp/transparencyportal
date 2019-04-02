/************************* Redux Actions ************************/
import { SDG_LIST_AGGREGATE } from '../actions/sdgAggregate';
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
		case SDG_LIST_AGGREGATE.start:
			return {
				...state,
				loading: true
			};

		case SDG_LIST_AGGREGATE.end:
			return {
				...state,
				loading: false
			};

		case SDG_LIST_AGGREGATE.success:
			return {
				...state,
				data: action.data,
				error: defaultState.error
			};

		case SDG_LIST_AGGREGATE.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};