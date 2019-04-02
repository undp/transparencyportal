import Api from '../../../lib/api';
import { FINANCIAL_FLOW}  from './index';

export const budgetFlowFetchStart = () => ({
	type: FINANCIAL_FLOW.start
});

export const budgetFlowFetchEnd = () => ({
	type: FINANCIAL_FLOW.end
});
export const budgetFlowClear = () => ({
	type: FINANCIAL_FLOW.clear
});

export const budgetFlowFetchSuccess = (data) => (
	{
		type: FINANCIAL_FLOW.success,
		data
	});

export const budgetFlowFetchFailed = (error) => ({
	type: FINANCIAL_FLOW.failed,
	error
});

export const fetchBudgetFinancialFlow = (year) => {
	return (dispatch) => {
		dispatch(budgetFlowFetchStart());
		if (year !== '') {
			return Api.get(Api.API_BUDGET_FINANCIAL_FLOW(year)).then(resp => {
				if (resp.success && resp.data) {
					dispatch(budgetFlowFetchEnd());
					dispatch(budgetFlowFetchSuccess(resp.data));
				} else {
					dispatch(budgetFlowFetchFailed());
				}
			}).catch((exception) => {
				dispatch(budgetFlowFetchEnd());
				dispatch(budgetFlowFetchFailed(exception));
			});
		}
		else {
			dispatch(budgetFlowClear());
			dispatch(budgetFlowFetchFailed());
		}
	};
};



