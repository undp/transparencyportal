/************************* Lib Files ************************/
import Api from '../../../lib/api';

export const PROJECT_DETAIL_MAP_DATA = {
	start: 'fetch_start/project_detail_map_data',
	end: 'fetch_end/project_detail_map_data',
	success: 'fetch_success/project_detail_map_data',
	failed: 'fetch_failed/project_detail_map_data'
};

export const mapDataFetchStart = () => ({
	type: PROJECT_DETAIL_MAP_DATA.start
});

export const mapDataFetchEnd = () => ({
	type: PROJECT_DETAIL_MAP_DATA.end
});

export const mapDataFetchSuccess = (data) => (
	{
		type: PROJECT_DETAIL_MAP_DATA.success,
		data
	});

export const mapDataFetchFailed = (error) => ({
	type: PROJECT_DETAIL_MAP_DATA.failed,
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

export const loadProjectDetailsMapData = (projectId) => (dispatch) => {
	dispatch(mapDataFetchStart());
	projectId = projectId?projectId:'';
	return Api.get(Api.API_MAP_PROJECT_DETAIL(projectId) ).then(resp => mapResponseParser(dispatch, resp))
		.catch((exception) => {
			dispatch(mapDataFetchEnd());
			dispatch(mapDataFetchFailed(exception));
		});
};