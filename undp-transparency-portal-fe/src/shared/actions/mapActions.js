/************************* Lib Files ************************/
import Api from '../../lib/api';
export const MAP_DATA = {
	start: 'fetch_start/map_data',
	end: 'fetch_end/map_data',
	success: 'fetch_success/map_data',
	failed: 'fetch_failed/map_data'
};
export const MAP_YEAR_TIMELINE = {
	start: 'fetch_start/map_year_timeline',
	end: 'fetch_end/map_year_timeline',
	success: 'fetch_success/map_year_timeline',
	failed: 'fetch_failed/map_year_timeline',
	setYear: 'set_map_current_year'
};
/////////////////////////////////////// MAP DATA //////////////////////////////
export const mapDataFetchStart = () => ({
	type: MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: MAP_DATA.failed,
	error
});
///////////////////////////////////////////////////////////////////////////////////

export const yearListFetchStart = () => ({
	type: MAP_YEAR_TIMELINE.start
});

export const yearListFetchEnd = () => ({
	type: MAP_YEAR_TIMELINE.end
});

export const yearListFetchSuccess = (data) => (
	{
		type: MAP_YEAR_TIMELINE.success,
		data
	});

export const yearListFetchFailed = (error) => ({
	type: MAP_YEAR_TIMELINE.failed,
	error
});
export const updateCurrentYear = (year) => ({
	type: MAP_YEAR_TIMELINE.setYear,
	year
});

let mapResponseParser = (dispatch, resp) => {
	if (resp.success && resp.data) {
		let data = resp.data.filter((item, index) => item.latitude !== null && item.longitude !== null);
		data = data.map((item, index) => {
			let outputs = item.outputs.filter((output, key) => output.output_latitude !== null && output.output_longitude !== null);
			item.outputs = outputs;
			return item;
		});
		dispatch(mapDataFetchEnd());
		dispatch(mapDataFetchSuccess(data));
	}
	else {
		dispatch(mapDataFetchEnd());
	}
};

export const loadProjectListMapData = (year, sector, unit, source) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit?unit:'';
	source = source?source:'';
	sector = ( sector!== undefined && sector !== null )?sector:'';
	if (year !== null)
		return Api.get(Api.API_MAP_PROJECT_LIST(year, sector, unit, source) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};

export const loadProjectDetailsMapData = (year, projectId) => (dispatch) => {
	dispatch(mapDataFetchStart());
	projectId = projectId?projectId:'';
	if (year !== null)
		return Api.get(Api.API_MAP_PROJECT_DETAIL(year, projectId) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};

export const loadThemesMapData = (year, sector, unit, source) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit?unit:'';
	source = source?source:'';
	sector = (sector && sector!==-1)?sector:'';
	if (year !== null)
		return Api.get(Api.API_MAP_THEMES(year, sector, unit, source) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};

export const loadDonorsMapData = (year, unit, sector) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit?unit:'';
	sector = sector?sector:'';
	if (year !== null)
		return Api.get(Api.API_MAP_DONORS(year, unit, sector) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};

export const loadGlobalMapData = (year) => (dispatch) => {
	dispatch(mapDataFetchStart());
	if (year !== null)
		return Api.get(Api.API_MAP_GLOBAL(year)).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};
export const updateMapYearTimeline = () => (dispatch) => {
	dispatch(yearListFetchStart());
	return Api.get(Api.API_YEAR_LIST).then(resp => {
		dispatch(yearListFetchEnd());
		let currentYear = resp[0];
		dispatch(yearListFetchSuccess(resp.reverse()));
		dispatch(updateCurrentYear(currentYear));
	}).catch((exception) => {
		dispatch(yearListFetchEnd());
		dispatch(yearListFetchFailed(exception));
	});
};
export const setMapCurrentYear = (year) => (dispatch) => {
	dispatch(updateCurrentYear(year));
};


