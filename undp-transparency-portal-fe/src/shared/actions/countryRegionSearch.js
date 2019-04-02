/************************* Lib Files ************************/
import Api from '../../lib/api';

export const COUNTRY_REGIONS_SEARCH = {
	start: 'fetch_start/country_regions_search',
	end: 'fetch_end/country_regions_search',
	success: 'fetch_success/country_regions_search',
	failed: 'fetch_failed/country_regions_search',
	updateList: 'update_list/country_regions_search'
};
export const UPDATE_SEARCH_TEXT = 'UPDATE_SEARCH_TEXT';
export const countryRegionsFetchStart = () => ({
	type: COUNTRY_REGIONS_SEARCH.start
});

export const countryRegionsFetchEnd = () => ({
	type: COUNTRY_REGIONS_SEARCH.end
});

export const countryRegionsFetchSuccess = (countryRegionList) => (
	{
		type: COUNTRY_REGIONS_SEARCH.success,
		countryRegionList
	});

export const updateRegionList = (countryRegionList) => (
	{
		type: COUNTRY_REGIONS_SEARCH.updateList,
		countryRegionList
	});

export const countryRegionsFetchFailed = (error) => ({
	type: COUNTRY_REGIONS_SEARCH.failed,
	error
});

export const updateSearchText = (text) => ({
	type: UPDATE_SEARCH_TEXT,
	text
});

export const getMasterCountryRegionsList = () => (dispatch, getState) => Api.get(Api.API_COUNTRYREGION_MASTER).then(resp => {
	if (resp && resp.data) {
		dispatch(updateRegionList(resp.data.data));
	}
});


export const searchCountryRegionsListData = (searchParam, theme, sdg, donor, year, markerType, markerId, levelTwoMarker) => (dispatch, getState) => {
	dispatch(countryRegionsFetchStart());
	searchParam = searchParam ? searchParam : '';
	donor = donor ? donor : '';
	theme = (theme && theme!==-1) ? theme : '';
	sdg = sdg ? sdg : '';
	const currentYear = year ? year : '';
	markerId = markerId ? markerId : '';
	levelTwoMarker = levelTwoMarker ? levelTwoMarker : '';
	markerType = markerType ? markerType : '';
	
	dispatch(updateSearchText(searchParam));
	let apiCall = Api.API_COUNTRYREGION_SEARCH(searchParam,theme,sdg,donor,currentYear);
	if (getState().tabData.tabSelected === 'signature')
		apiCall = Api.API_SIGNATURE_COUNTRYREGION_SEARCH(searchParam,theme,sdg,donor,currentYear);

	if ( markerType ){
		apiCall = Api.API_SSC_COUNTRY_REGION_SEARCH(searchParam, theme, sdg, donor, currentYear, markerType, markerId, levelTwoMarker);
	}
	return Api.get(apiCall).then(resp => {
		if (resp && resp.data) {
			if (getState().countryRegionSearch.searchText === resp.data.draw) {
				dispatch(countryRegionsFetchEnd());
				dispatch(countryRegionsFetchSuccess(resp.data.data));
			}
		}
		else {
			dispatch(countryRegionsFetchEnd());
			dispatch(countryRegionsFetchFailed());
		}
	}).catch((exception) => {
		dispatch(countryRegionsFetchEnd());
		dispatch(countryRegionsFetchFailed());
	});
};