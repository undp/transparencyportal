/************************* Redux Actions ************************/
import { ROUTE } from '../actions/routerActions.js';

const defaultState = {
	previous: '',
	current: ''
};

export default (state = defaultState, action) => {
	switch (action.type) {
		case ROUTE.ON_UPDATE_ROUTE_ARRAY:
			return {
				...state,
				routeArray: action.routeArray
			};
		case ROUTE.ON_UPDATE_CURRENT:
			return {
				...state,
				current: action.title
			};
		case ROUTE.ON_UPDATE_PREVIOUS:
			return {
				...state,
				previous: action.title
			};
		default:
			return state;
	}
};
