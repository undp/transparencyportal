/************************* Redux Actions ************************/
import { EXPORT_PDF } from '../actions/exportPDF';
const defaultState = {
	loading: false,
	error: {
		message: '',
		code: ''
	},
	downloadUrl: undefined,
	previewUrl: undefined
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case EXPORT_PDF.start:
			return {
				...state,
				loading: true
			};

		case EXPORT_PDF.end:
			return {
				...state,
				loading: false
			};

		case EXPORT_PDF.success:
			return {
				...state,
				downloadUrl: action.downloadUrl,
				previewUrl: action.previewUrl,
				error: defaultState.error
			};

		case EXPORT_PDF.failed:
			return {
				...state,
				error: action.errors
			};
		case EXPORT_PDF.reset:
			return defaultState;
		default:
			return state;
	}
};