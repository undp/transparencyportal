/************************* Redux Actions ************************/
import { SECTOR_LIST } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case SECTOR_LIST.start:
			return {
				...state,
				loading: true
			};

		case SECTOR_LIST.end:
			return {
				...state,
				loading: false
			};

		case SECTOR_LIST.success:
			return {
				...state,
				...action.sectorList,
				error: defaultState.error
			};

		case SECTOR_LIST.failed:
			return {
				...state,
				error: action.errors
			};

		default:
			return state;
	}
};