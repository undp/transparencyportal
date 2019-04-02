/************************* Lib Files ************************/
import Api from '../../lib/api';

/************************* Lib Files ************************/
import { onTabSelection } from '../../components/TabSection/actions';

/************************* Util Files ************************/
import { roundTo } from '../../utils/numberFormatter';


export const DONOR_FUND_LIST = {
	start: 'fetch_start/donor_fund_list',
	end: 'fetch_end/donor_fund_list',
	success: 'fetch_success/donor_fund_list',
	failed: 'fetch_failed/donor_fund_list'
};

export const donorFundListFetchStart = () => ({
	type: DONOR_FUND_LIST.start
});

export const donorFundListFetchEnd = () => ({
	type: DONOR_FUND_LIST.end
});

export const donorFundListFetchSuccess = (data) => (
	{
		type: DONOR_FUND_LIST.success,
		data
	});

export const donorFundListFetchFailed = (error) => ({
	type: DONOR_FUND_LIST.failed,
	error
});


export function parseDonorFundListData(data){
	let parsedData = {
		project: { ...data.project },
		data: []
	};
	let newDataArray = [...data.data];
	newDataArray.forEach((item, index) => {
		item.label = item.level_3_name;
		item.share_percent = roundTo(item.percentage?item.percentage:0,1);
		item.value = item;
		item.donor_name =  item.level_3_name? item.level_3_name:'';
		item.budget = item.total_budget ?item.total_budget:'';
		item.expense = item.total_expense ? item.total_expense: '';
		item.color = '#cccfff';
		item.point = 100+index;
	});
	parsedData.data = newDataArray;
	return parsedData;
}

export const fetchDonorFundListData = (year,recipentCountry,donor,themes,sdg) => (dispatch,getState) => {
	const donorFilter = getState().tabData.donorFilter,
		recipentCountry =  recipentCountry || (donorFilter.operatingUnits?donorFilter.operatingUnits:''),
		newthemes = themes || (donorFilter.themes?donorFilter.themes:''),
		donor = donor || (donorFilter.budgetSources?donorFilter.budgetSources:'') ,
		sdg = sdg || (donorFilter.sdg?donorFilter.sdg:''),
		newYear = year || ( getState().tabData.currentYear );

	dispatch(donorFundListFetchStart());
	if (newYear !== null)
		return Api.get(`${Api.API_DONOR_FUND_LIST}?year=${newYear}&recipient_countries=${recipentCountry}&sectors=${newthemes}&donor=${donor}&sdg=${sdg}`).then(resp => {
			if (resp.success && resp.data) {
				dispatch(donorFundListFetchEnd());
				dispatch(donorFundListFetchSuccess(resp.data));
				dispatch(onTabSelection(getState().tabData.tabSelected));
			}
			else {
				dispatch(donorFundListFetchEnd());
			}
		}).catch((exception) => {
			dispatch(donorFundListFetchEnd());
			dispatch(donorFundListFetchFailed());
		});
	dispatch(donorFundListFetchFailed());
};
