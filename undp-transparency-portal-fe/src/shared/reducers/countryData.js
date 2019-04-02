/************************* Redux Actions ************************/
import { COUNTRY_DATA } from '../actions/countryData';
import { RECIPIENT_COUNTRY_DATA } from '../actions/countryData';

const defaultState = {
	data: {
		country_name: 'Global',
		total_budget: 0,
		total_expense: 0,
		project_count: 0,
		donor_count: 0
	},
	loading: false,
	error: {
		message: '',
		code: ''
	}
};

export default (state = defaultState, action) => {
	switch (action.type) {
		//////////////////////////// GLOBAL DATA //////////////////////////////////
		case COUNTRY_DATA.start:
			return {
				...state,
				loading: true
			};

		case COUNTRY_DATA.end:
			return {
				...state,
				loading: false
			};

		case COUNTRY_DATA.success:
			return {
				...state,
				data: { ...action.data },
				error: defaultState.error
			};

		case COUNTRY_DATA.failed:
			return {
				...state,
				error: action.errors
			};
		case COUNTRY_DATA.update:
			return {
				...state,
				data: { ...action.data },
				error: defaultState.error
			};
			////////////////////////////////// RECIPIENT COUNTRY DATA ///////////////////////////////
		case RECIPIENT_COUNTRY_DATA.start:
			return {
				...state,
				loading: true
			};

		case RECIPIENT_COUNTRY_DATA.end:
			return {
				...state,
				loading: false
			};

		case RECIPIENT_COUNTRY_DATA.success:
			return {
				...state,
				data: { ...action.data },
				error: defaultState.error
			};

		case RECIPIENT_COUNTRY_DATA.failed:
			return {
				...state,
				error: action.errors
			};
		default:
			return state;
	}
};