/************************* Lib Files ************************/
import Api from '../../lib/api';
export const SEARCH_ALL_RESULTS = {
	start: 'fetch_start/search_all_results',
	end: 'fetch_end/search_all_results',
	success: 'fetch_success/search_all_results',
	failed: 'fetch_failed/search_all_results'
};

export const UPDATE_SEARCH_TEXT = 'update_search_text/search_all_results';

export const updateSearchText = (text) => (
	{
		type: UPDATE_SEARCH_TEXT,
		text
	});

export const searchAllFetchStart = () => ({
	type: SEARCH_ALL_RESULTS.start
});

export const ssearchAllFetchEnd = () => ({
	type: SEARCH_ALL_RESULTS.end
});

export const searchAllFetchSuccess = (data,totalCount) => (
	{
		type: SEARCH_ALL_RESULTS.success,
		data,
		totalCount
	});

export const searchAllFetchFailed = (error) => ({
	type: SEARCH_ALL_RESULTS.failed,
	error
});


export const searchAllResults = (filterObj) => {

	let filterQueryString = {
		country: '',
		themes: '',
		sources: '',
		search: '',
		year: '',
		pageIndex: '',
		pageSize: '',
		sdgs: ''
	};

	for (let key in filterObj){
		filterQueryString[key] = '';
		if (key != 'search' && key != 'pageIndex' && key != 'pageSize' ){
			let filterItemlength = filterObj[key].length;
			if (filterItemlength!=0 ){
				filterObj[key].forEach((item,index) => {
					if ( filterItemlength -1 != index)
						filterQueryString[key] = filterQueryString[key]+ item.value+',';
					else
						filterQueryString[key] = filterQueryString[key]+item.value;
				});
			}
		}
	}


	return (dispatch) => {
		dispatch(searchAllFetchStart());
		const queryString = `${Api.API_SEARCH_RESULT}year=${filterQueryString.year}&keyword=${filterObj.search}&budget_sources=${filterQueryString.sources}&sectors=${filterQueryString.themes}&operating_units=${filterQueryString.country}&limit=${filterObj.pageSize}&offset=${(filterObj.pageIndex-1)*filterObj.pageSize}&sdgs=${filterQueryString.sdgs}`;
		return Api.get(queryString).then(resp => {
			dispatch(ssearchAllFetchEnd());
			dispatch(searchAllFetchSuccess(resp.data.data,resp.data.count));
		}).catch((exception) => {
			dispatch(ssearchAllFetchEnd());
			dispatch(searchAllFetchFailed(exception));
		});
	};
};
