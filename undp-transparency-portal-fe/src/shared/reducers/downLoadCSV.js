/************************* Redux Actions ************************/
import { EXPORT_CSV } from '../actions/downLoadCSV';
const defaultState = {
	error: {
		message: '',
		code: ''
	},
	downloadUrl: '',
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case EXPORT_CSV.success:
			return {
				...state,
				downloadUrl:action.url
            }
        	case EXPORT_CSV.reset:
			return {
				defaultState
			}    

		default:
			return state;
	}
};