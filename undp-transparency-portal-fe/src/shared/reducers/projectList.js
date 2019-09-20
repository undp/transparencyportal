/************************* Redux Actions ************************/
import { PROJECT_LIST } from '../actions/getProjectList';

const defaultState = {
	projectList: {
		count: '',
		links: {},
		data: []
	},
	top10Projects: [],
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
			if (action.offset === '0' || action.offset === 0){
				return {
					...state,
					projectList: action.data,
					top10Projects: action.data && action.data.data ? action.data.data.length > 10 ? action.data.data.slice(0,10) : action.data.data : [],
					error: defaultState.error
				};

			}
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