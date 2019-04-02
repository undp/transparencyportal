/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const THEMES_MAP_DATA = {
	start: 'fetch_start/themes_map_data',
	end: 'fetch_end/themes_map_data',
	success: 'fetch_success/themes_map_data',
	failed: 'fetch_failed/themes_map_data'
};

export const mapDataFetchStart = () => ({
	type: THEMES_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: THEMES_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: THEMES_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: THEMES_MAP_DATA.failed,
	error
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

export const loadThemesMapData = (year, sector, unit, source,signatureSolution) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit?unit:'';
	source = source?source:'';
	sector = (sector && sector!==-1)?sector:'';
	signatureSolution = signatureSolution ? signatureSolution : '';
	if (year !== null)
		return Api.get(Api.API_MAP_THEMES(year, sector, unit, source,signatureSolution) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};