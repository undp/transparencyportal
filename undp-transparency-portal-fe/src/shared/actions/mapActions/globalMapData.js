/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const GLOBAL_MAP_DATA = {
	start: 'fetch_start/global_map_data',
	end: 'fetch_end/global_map_data',
	success: 'fetch_success/global_map_data',
	failed: 'fetch_failed/global_map_data'
};

export const mapDataFetchStart = () => ({
	type: GLOBAL_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: GLOBAL_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: GLOBAL_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: GLOBAL_MAP_DATA.failed,
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

export const loadGlobalMapData = (year, unit) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit=unit?unit:'';
	if (year !== null)
		return Api.get(Api.API_MAP_GLOBAL(year, unit)).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};