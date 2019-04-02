/************************* Redux Actions ************************/
import { SDG_LIST } from '../actions/sdgListActions';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	masterSdgList: [],
	data: []
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case SDG_LIST.start:
			return {
				...state,
				loading: true
			};

		case SDG_LIST.end:
			return {
				...state,
				loading: false
			};

		case SDG_LIST.success:
			return {
				...state,
				data: action.data,
				error: defaultState.error
			};

		case SDG_LIST.failed:
			return {
				...state,
				error: action.errors
			};

		case SDG_LIST.updateList:
			return {
				...state,
				masterSdgList: action.data
			};

		default:
			return state;
	}
};