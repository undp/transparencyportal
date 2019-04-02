/************************* Third party Files ************************/
import ReactGA from 'react-ga';
export const ROUTE = {
	ON_UPDATE_ROUTE_ARRAY: 'ON_UPDATE_ROUTE_ARRAY',
	ON_UPDATE_CURRENT: 'ON_UPDATE_CURRENT',
	ON_UPDATE_PREVIOUS: 'ON_UPDATE_PREVIOUS'
};

export function onChangeRoute(title) {
	return (dispatch, getState) => {
		if (getState().router.current === ''){
			dispatch(updateCurrent(title));
		}
		else {
			let current = getState().router.current;
			dispatch(updatePrevious(current));
			dispatch(updateCurrent(title));
		}
		ReactGA.ga('send',
			'event',
			'Navigation',
			'From - To',
			getState().router.previous +' - '+ getState().router.current
		);
	};
}

export function updateCurrent(title) {
	return (
		{
			type: ROUTE.ON_UPDATE_CURRENT,
			title
		}
	);
}
export function updatePrevious(title) {
	return (
		{
			type: ROUTE.ON_UPDATE_PREVIOUS,
			title
		}
	);
}
export function updateRouteArray(routeArray) {
	return (
		{
			type: ROUTE.ON_UPDATE_ROUTE_ARRAY,
			routeArray
		}
	);
}
