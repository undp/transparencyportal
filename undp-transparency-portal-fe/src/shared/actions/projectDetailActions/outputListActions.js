/////////////////////// Fetch Project Output List //////////////////////////
import Api from '../../../lib/api';
export const PROJECT_OUTPUT_LIST = {
	start: 'fetch_start/project_output_list',
	end: 'fetch_end/project_output_list',
	success: 'fetch_success/project_output_list',
	failed: 'fetch_failed/project_output_list'
};
export const projectOutputListFetchStart = () => ({
	type: PROJECT_OUTPUT_LIST.start
});

export const projectOutputListFetchEnd = () => ({
	type: PROJECT_OUTPUT_LIST.end
});

export const projectOutputListFetchSuccess = (data) => (
	{
		type: PROJECT_OUTPUT_LIST.success,
		data
	});

export const projectOutputListFetchFailed = (error) => ({
	type: PROJECT_OUTPUT_LIST.failed,
	error
});

export const fetchProjectOutputList = (id) => (dispatch, getState) => {
	dispatch(projectOutputListFetchStart());
	return Api.get(Api.API_PROJECT_OUTPUT_LIST(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectOutputListFetchEnd());
			dispatch(projectOutputListFetchSuccess(resp.data));
		}
		else {
			dispatch(projectOutputListFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectOutputListFetchEnd());
		dispatch(projectOutputListFetchFailed());
	});
};