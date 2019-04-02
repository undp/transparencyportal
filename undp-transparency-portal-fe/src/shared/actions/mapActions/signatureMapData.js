/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const SIGNATURES_MAP_DATA = {
	start: 'fetch_start/signatures_map_data',
	end: 'fetch_end/signatures_map_data',
	success: 'fetch_success/signatures_map_data',
	failed: 'fetch_failed/signatures_map_data'
};

export const mapDataFetchStart = () => ({
	type: SIGNATURES_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: SIGNATURES_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: SIGNATURES_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: SIGNATURES_MAP_DATA.failed,
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

export const loadSignatureMapData = (year, sector, unit, source) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit?unit:'';
	source = source?source:'';
	sector =  (sector && sector!==-1)?sector:'';
	if (year !== null)
		return Api.get(Api.API_MAP_SIGNATURE(year, sector, unit, source) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};