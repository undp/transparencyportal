/////////////////////// Fetch Project Output Results //////////////////////////
import Api from '../../../lib/api';
export const PROJECT_OUTPUT_RESULTS = {
	start: 'fetch_start/project_output_results',
	end: 'fetch_end/project_output_results',
	success: 'fetch_success/project_output_results',
	failed: 'fetch_failed/project_output_results'
};
export const projectOutputResultsFetchStart = () => ({
	type: PROJECT_OUTPUT_RESULTS.start
});

export const projectOutputResultsFetchEnd = () => ({
	type: PROJECT_OUTPUT_RESULTS.end
});

export const projectOutputResultsFetchSuccess = (data, index) => (
	{
		type: PROJECT_OUTPUT_RESULTS.success,
		data,
		index
	});

export const projectOutputResultsFetchFailed = (error) => ({
	type: PROJECT_OUTPUT_RESULTS.failed,
	error
});

export const fetchProjectOutputResults = (id, index) => (dispatch, getState) => {
	dispatch(projectOutputResultsFetchStart());
	return Api.get(Api.API_PROJECT_OUTPUT_RESULTS(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectOutputResultsFetchEnd());
			dispatch(projectOutputResultsFetchSuccess(resp.data, index));
		}
		else {
			dispatch(projectOutputResultsFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectOutputResultsFetchEnd());
		dispatch(projectOutputResultsFetchFailed());
	});
};