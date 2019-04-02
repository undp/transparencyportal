/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const DONOR_PROFILE_MAP_DATA = {
	start: 'fetch_start/donor_profile_map_data',
	end: 'fetch_end/donor_profile_map_data',
	success: 'fetch_success/donor_profile_map_data',
	failed: 'fetch_failed/donor_profile_map_data'
};

export const mapDataFetchStart = () => ({
	type: DONOR_PROFILE_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: DONOR_PROFILE_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: DONOR_PROFILE_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: DONOR_PROFILE_MAP_DATA.failed,
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

export const loadDonorProfileMapData = (year, unit, budgetType) => (dispatch) => {
	dispatch(mapDataFetchStart());
	unit = unit ? unit : '';
	budgetType = budgetType ? budgetType : '';
	if (year !== null)
		return Api.get(Api.API_MAP_DONOR(year, unit, budgetType)).then(resp => mapResponseParser(dispatch, resp))
			.catch((exception) => {
				dispatch(mapDataFetchEnd());
				dispatch(mapDataFetchFailed(exception));
			});
};