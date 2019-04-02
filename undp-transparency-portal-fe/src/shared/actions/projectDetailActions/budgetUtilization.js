/////////////////////// Fetch Project Budget Utilization //////////////////////////
import Api from '../../../lib/api';
export const PROJECT_BUDGET_UTILIZATION = {
	start: 'fetch_start/project_budget_utilization',
	end: 'fetch_end/project_budget_utilization',
	success: 'fetch_success/project_budget_utilization',
	failed: 'fetch_failed/project_budget_utilization'
};
export const projectBudgetUtilizationFetchStart = () => ({
	type: PROJECT_BUDGET_UTILIZATION.start
});

export const projectBudgetUtilizationFetchEnd = () => ({
	type: PROJECT_BUDGET_UTILIZATION.end
});

export const projectBudgetUtilizationFetchSuccess = (data) => (
	{
		type: PROJECT_BUDGET_UTILIZATION.success,
		data
	});

export const projectBudgetUtilizationFetchFailed = (error) => ({
	type: PROJECT_BUDGET_UTILIZATION.failed,
	error
});

export const fetchProjectBudgetUtilization = (id) => (dispatch, getState) => {
	dispatch(projectBudgetUtilizationFetchStart());
	return Api.get(Api.API_PROJECT_BUDGET_UTILIZATION(id)).then(resp => {
		if (resp.data && resp.success) {
			dispatch(projectBudgetUtilizationFetchEnd());
			dispatch(projectBudgetUtilizationFetchSuccess(resp.data));
		}
		else {
			dispatch(projectBudgetUtilizationFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectBudgetUtilizationFetchEnd());
		dispatch(projectBudgetUtilizationFetchFailed());
	});
};