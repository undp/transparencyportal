/////////////////////// Fetch Project Budget Sources //////////////////////////
import Api from '../../../lib/api';
export const PROJECT_BUDGET_SOURCE = {
	start: 'fetch_start/project_budget_source',
	end: 'fetch_end/project_budget_source',
	success: 'fetch_success/project_budget_source',
	failed: 'fetch_failed/project_budget_source'
};
export const projectBudgetSourceFetchStart = () => ({
	type: PROJECT_BUDGET_SOURCE.start
});

export const projectBudgetSourceFetchEnd = () => ({
	type: PROJECT_BUDGET_SOURCE.end
});

export const projectBudgetSourceFetchSuccess = (data) => (
	{
		type: PROJECT_BUDGET_SOURCE.success,
		data
	});

export const projectBudgetSourceFetchFailed = (error) => ({
	type: PROJECT_BUDGET_SOURCE.failed,
	error
});

export const fetchProjectBudgetSource = (id) => (dispatch, getState) => {
	dispatch(projectBudgetSourceFetchStart());
	return Api.get(Api.API_PROJECT_BUDGET_SOURCE(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectBudgetSourceFetchEnd());
			dispatch(projectBudgetSourceFetchSuccess(resp.data));
		}
		else {
			dispatch(projectBudgetSourceFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectBudgetSourceFetchEnd());
		dispatch(projectBudgetSourceFetchFailed());
	});
};
