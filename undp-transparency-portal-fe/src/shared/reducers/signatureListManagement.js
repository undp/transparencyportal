/************************* Redux Actions ************************/
import { THEME_LIST } from '../actions/commonDataActions';

const defaultState = {
	loading: false,
	masterSignaturesList: [],
	signatures: [],
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case THEME_LIST.start:
			return {
				...state,
				loading: true
			};

		case THEME_LIST.end:
			return {
				...state,
				loading: false
			};

		case THEME_LIST.success:
			return {
				...state,
				signatures: action.signatures
			};

		case THEME_LIST.failed:
			return {
				...state,
				error: action.errors
			};

		case THEME_LIST.updateList:
			return {
				...state,
				masterSignaturesList: action.signatures
			};

		default:
			return state;
	}
};