/////////////////////// Fetch Project Output Details //////////////////////////
import Api from '../../../lib/api';
export const PROJECT_OUTPUT_DETAIL = {
	start: 'fetch_start/project_output_detail',
	end: 'fetch_end/project_output_detail',
	success: 'fetch_success/project_output_detail',
	failed: 'fetch_failed/project_output_detail'
};
export const projectOutputDetailFetchStart = () => ({
	type: PROJECT_OUTPUT_DETAIL.start
});

export const projectOutputDetailFetchEnd = () => ({
	type: PROJECT_OUTPUT_DETAIL.end
});

export const projectOutputDetailFetchSuccess = (data, index) => (
	{
		type: PROJECT_OUTPUT_DETAIL.success,
		data,
		index
	});

export const projectOutputDetailFetchFailed = (error) => ({
	type: PROJECT_OUTPUT_DETAIL.failed,
	error
});

export const fetchProjectOutputDetail = (id, index) => (dispatch, getState) => {
	dispatch(projectOutputDetailFetchStart());
	return Api.get(Api.API_PROJECT_OUTPUT_DETAIL(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectOutputDetailFetchEnd());
			dispatch(projectOutputDetailFetchSuccess(resp.data, index));
		}
		else {
			dispatch(projectOutputDetailFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectOutputDetailFetchEnd());
		dispatch(projectOutputDetailFetchFailed());
	});
}; 