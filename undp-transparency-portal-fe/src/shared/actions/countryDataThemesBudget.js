/************************* Lib Files ************************/
import Api from '../../lib/api';

export const COUNTRY_DATA_THEMES = {
	start: 'fetch_start/themes_budget',
	end: 'fetch_end/themes_budget',
	success: 'fetch_success/themes_budget',
	failed: 'fetch_failed/themes_budget'
};

export const themesBudgetFetchStart = () => ({
	type: COUNTRY_DATA_THEMES.start
});

export const themesBudgetFetchEnd = () => ({
	type: COUNTRY_DATA_THEMES.end
});

export const themesBudgetFetchSuccess = (data) => (
	{
		type: COUNTRY_DATA_THEMES.success,
		data
	});

export const themesBudgetFetchFailed = (error) => ({
	type: COUNTRY_DATA_THEMES.failed,
	error
});


const parsefetchThemesBudget = (dataArray) => {
	dataArray.forEach((item) => {
		item.color = item.sector_color;
		item.fund_stream = item.sector_name;
	});
};

export const fetchThemesBudget= (year, code) => (dispatch) => {
	dispatch(themesBudgetFetchStart());
	code=code?code:'';
	if (year !== null)
		return Api.get(Api.API_GLOBAL_THEMES_BUDGET(year, code)).then(resp => {
			if (resp.success && resp.data) {
				dispatch(themesBudgetFetchEnd());
				parsefetchThemesBudget(resp.data);
				dispatch(themesBudgetFetchSuccess(resp.data));
			}
			else {
				dispatch(themesBudgetFetchEnd());
			}
		}).catch((exception) => {
			dispatch(themesBudgetFetchEnd());
			dispatch(themesBudgetFetchFailed());
		});
};