/************************* Lib Files ************************/
import Api from '../../lib/api';

export const COUNTRY_DATA_BUDGET_SOURCES = {
	start: 'fetch_start/budget_sources',
	end: 'fetch_end/budget_sources',
	success: 'fetch_success/budget_sources',
	failed: 'fetch_failed/budget_sources'
};

export const budgetSourcesFetchStart = () => ({
	type: COUNTRY_DATA_BUDGET_SOURCES.start
});

export const budgetSourcesFetchEnd = () => ({
	type: COUNTRY_DATA_BUDGET_SOURCES.end
});

export const budgetSourcesFetchSuccess = (data) => (
	{
		type: COUNTRY_DATA_BUDGET_SOURCES.success,
		data
	});

export const budgetSourcesFetchFailed = (error) => ({
	type: COUNTRY_DATA_BUDGET_SOURCES.failed,
	error
});


export const fetchBudgetSources= (year, code) => (dispatch) => {
	dispatch(budgetSourcesFetchStart());
	code=code?code:'';
	if (year !== null)
		return Api.get(Api.API_GLOBAL_TOP_BUDGET_SOURCES(year, code)).then(resp => {
			if (resp.success && resp.data) {
				dispatch(budgetSourcesFetchEnd());
				dispatch(budgetSourcesFetchSuccess(resp.data));
			}
			else {
				dispatch(budgetSourcesFetchEnd());
			}
		}).catch((exception) => {
			dispatch(budgetSourcesFetchEnd());
			dispatch(budgetSourcesFetchFailed());
		});
};