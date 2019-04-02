/************************* Redux Actions ************************/
import { PROJECT_LIST } from '../actions/getProjectList';

const defaultState = {
	projectList: {
		count: '',
		links: {},
		data: []
	},
	loading: false,
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case PROJECT_LIST.start:
			return {
				...state,
				loading: true
			};

		case PROJECT_LIST.end:
			return {
				...state,
				loading: false
			};

		case PROJECT_LIST.success:
			return {
				...state,
				projectList: action.data,
				error: defaultState.error
			};

		case PROJECT_LIST.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};