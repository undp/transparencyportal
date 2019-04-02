
/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const DONORS_MAP_DATA = {
	start: 'fetch_start/donors_map_data',
	end: 'fetch_end/donors_map_data',
	success: 'fetch_success/donors_map_data',
	failed: 'fetch_failed/donors_map_data'
};

export const mapDataFetchStart = () => ({
	type: DONORS_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: DONORS_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: DONORS_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: DONORS_MAP_DATA.failed,
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

export const loadDonorsMapData = (year, unit, sector, budgetSource, sdg) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit?unit:'';
	sector = sector?sector:'';
	budgetSource = budgetSource?budgetSource:'';
	sdg = sdg?sdg:'';
	if (year !== null)
		return Api.get(Api.API_MAP_DONORS(year, unit, sector, budgetSource, sdg) ).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};