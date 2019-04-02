/////////////////////// Fetch Project Timeline //////////////////////////
import Api from '../../../lib/api';

export const PROJECT_TIME_LINE = {
	start: 'fetch_start/project_time_line',
	end: 'fetch_end/project_time_line',
	success: 'fetch_success/project_time_line',
	failed: 'fetch_failed/project_time_line'
};

export const projectTimeLineFetchStart = () => ({
	type: PROJECT_TIME_LINE.start
});

export const projectTimeLineFetchEnd = () => ({
	type: PROJECT_TIME_LINE.end
});

export const projectTimeLineFetchSuccess = (data) => (
	{
		type: PROJECT_TIME_LINE.success,
		data
	});

export const projectTimeLineFetchFailed = (error) => ({
	type: PROJECT_TIME_LINE.failed,
	error
});

export const fetchProjectTimeLine = (id) => (dispatch, getState) => {
	dispatch(projectTimeLineFetchStart());
	return Api.get(Api.API_PROJECT_TIME_LINE(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectTimeLineFetchEnd());
			dispatch(projectTimeLineFetchSuccess(resp.data));
		}
		else {
			dispatch(projectTimeLineFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectTimeLineFetchEnd());
		dispatch(projectTimeLineFetchFailed());
	});
};
