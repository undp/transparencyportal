/************************* Redux Actions ************************/
import { YEAR_LIST } from '../actions/getYearList';

const defaultState = {
	list: [],
	loading: false,
	error: {
		message: '',
		code: ''
	},
	data: [],
	currentYear: null
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case YEAR_LIST.start:
			return {
				...state,
				loading: true
			};

		case YEAR_LIST.end:
			return {
				...state,
				loading: false
			};

		case YEAR_LIST.success:
			return {
				...state,
				list: action.data,
				data: action.parsedList,
				error: defaultState.error
			};

		case YEAR_LIST.failed:
			return {
				...state,
				error: action.errors
			};
		case YEAR_LIST.setYear:
			return {
				...state,
				currentYear: action.year
			};

		default:
			return state;
	}
};