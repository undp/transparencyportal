/************************* Third party Files *************************/
import Api from '../../lib/api';

/************************* Redux Action Files ************************/
import { onTabSelection } from '../../components/TabSection/actions';

export const SDG_LIST_AGGREGATE = {
	start: 'fetch_start/sdg_list_aggregate',
	end: 'fetch_end/sdg_list_aggregate',
	success: 'fetch_success/sdg_list_aggregate',
	failed: 'fetch_failed/sdg_list_aggregate'
};

export const sdgAggregateFetchStart = () => ({
	type: SDG_LIST_AGGREGATE.start
});

export const sdgAggregateFetchEnd = () => ({
	type: SDG_LIST_AGGREGATE.end
});

export const sdgAggregateFetchSuccess = (data) => (
	{
		type: SDG_LIST_AGGREGATE.success,
		data
	});

export const sdgAggregateFetchFailed = (error) => ({
	type: SDG_LIST_AGGREGATE.failed,
	error
});


export function parseSdgAggregateData(data) {
	let parsedData = {
		project: { ...data.project },
		sdg: []
	};
	let newDataArray = [...data.sdg];
	newDataArray.forEach((item, index) => {
		item.label = item.sdg_name;
		item.share_percent = item.percentage;
		item.value = item.sdg_code;
		item.budget = item.total_budget;
		item.expense = item.total_expense;
		item.color = '#' + item.color;
		item.point = 100 + index;
	});
	parsedData.sdg = newDataArray;
	return parsedData;
}

export const fetchSdgListData = (year,recipentCountry,donor) => (dispatch, getState) => {
	const sdgFilter = getState().tabData.sdgFilter,
		newrecipentCountry = recipentCountry || ( sdgFilter.operatingUnits ? sdgFilter.operatingUnits : ''),
		newdonor = donor || (sdgFilter.budgetSources ? sdgFilter.budgetSources : ''),
		newYear =  year || getState().tabData.currentYear;
	dispatch(sdgAggregateFetchStart());
	if (newYear !== null)
		return Api.get(Api.API_SDG_AGGREGATE(newYear,newrecipentCountry,newdonor)).then(resp => {
			if (resp.success && resp.data) {
				let newData = parseSdgAggregateData(resp.data);
				dispatch(sdgAggregateFetchEnd());
				dispatch(sdgAggregateFetchSuccess(newData));
				dispatch(onTabSelection(getState().tabData.tabSelected));
			}
			else {
				dispatch(sdgAggregateFetchEnd());
			}
		}).catch((exception) => {
			dispatch(sdgAggregateFetchEnd());
			dispatch(sdgAggregateFetchFailed());
		});
	dispatch(sdgAggregateFetchFailed());
};
