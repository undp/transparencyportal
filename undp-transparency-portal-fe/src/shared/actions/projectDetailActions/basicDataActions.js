/////////////////////// Fetch Project Basic Data //////////////////////////
import Api from '../../../lib/api';

export const PROJECT_BASIC_DATA = {
	start: 'fetch_start/project_basic_data',
	end: 'fetch_end/project_basic_data',
	success: 'fetch_success/project_basic_data',
	failed: 'fetch_failed/project_basic_data'
};

export const projectBasicDataFetchStart = () => ({
	type: PROJECT_BASIC_DATA.start
});

export const projectBasicDataFetchEnd = () => ({
	type: PROJECT_BASIC_DATA.end
});

export const projectBasicDataFetchSuccess = (data) => (
	{
		type: PROJECT_BASIC_DATA.success,
		data
	});

export const projectBasicDataFetchFailed = (error) => ({
	type: PROJECT_BASIC_DATA.failed,
	error
});

export const fetchProjectBasicData = (id) => (dispatch, getState) => {
	dispatch(projectBasicDataFetchStart());
	return Api.get(Api.API_PROJECT_DETAILS + id).then(resp => {
		if (resp.data && resp.success) {
			resp.data.storyMap = [
				{ location: 'Ubari', source: 'https://unosat.maps.arcgis.com/apps/Cascade/index.html?appid=1e216a4f58624dfd8fd88e4d10792d3b' },
				{location: 'Benghazi', source: 'https://unosat.maps.arcgis.com/apps/Cascade/index.html?appid=eb29652914fe4cfb9f10fb910b6c9b6a' } 
			];
			dispatch(projectBasicDataFetchEnd());
			dispatch(projectBasicDataFetchSuccess(resp.data));
		}
		else {
			dispatch(projectBasicDataFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectBasicDataFetchEnd());
		dispatch(projectBasicDataFetchFailed());
	});
};
