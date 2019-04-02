/************************* Lib Files **********************************/
import Api from '../../../src/lib/api';

/************************* Redux Actions Files ************************/
import { updateSearchResult } from '../../components/nestedDropList/actions';
import { fetchSdgData, fetchMasterSdgList } from './sdgListActions';
import { searchCountryRegionsListData, getMasterCountryRegionsList } from './countryRegionSearch';
import { setCurrentYear, updateYearList } from './getYearList';
import { setMapCurrentYear } from  './mapActions/yearTimeline';

/////////////////////// Fetch Project Timeline Data //////////////////////////
export const PROJECT_TIMELINE = {
	start: 'fetch_start/project_timeline',
	end: 'fetch_end/project_timeline',
	success: 'fetch_success/project_timeline',
	failed: 'fetch_failed/project_timeline'
};
export const projectTimelineFetchStart = () => ({
	type: PROJECT_TIMELINE.start
});

export const projectTimelineFetchEnd = () => ({
	type: PROJECT_TIMELINE.end
});

export const projectTimelineFetchSuccess = (year) => (
	{
		type: PROJECT_TIMELINE.success,
		year
	});

export const projectTimelineFetchFailed = (error) => ({
	type: PROJECT_TIMELINE.failed,
	error
});
export const fetchProjectTimelineData = () => (dispatch) => {
	dispatch(projectTimelineFetchStart());
	return Api.get(Api.API_PROJECT_TIMELINE_RANGE).then(resp => {
		if (resp && resp.length) {
			dispatch(projectTimelineFetchEnd());
			dispatch(projectTimelineFetchSuccess(resp));
			dispatch(setMapCurrentYear(resp[0]));
			dispatch(setCurrentYear(resp[0]));
			dispatch(searchCountryRegionsListData()); //Fetch Country Region List
			dispatch(fetchthemeListData('','',resp[0]));
			dispatch(fetchSdgData('','',''));
			dispatch(fetchMasterSdgList(resp[0]));         // Fetch SDG Data
			dispatch(updateYearList());
			// Fetch OpeatingUnitsListData
			// set current year initially
		}
		else {
			dispatch(projectTimelineFetchEnd());
		}
	}).catch((exception) => {
		dispatch(projectTimelineFetchEnd());
		dispatch(projectTimelineFetchFailed());
	});
};

/////////////////////// Fetch Country List Data //////////////////////////


export const COUNTRY_LIST = {
	start: 'fetch_start/country_list',
	end: 'fetch_end/country_list',
	success: 'fetch_success/country_list',
	failed: 'fetch_failed/country_list'
};
export const countryListFetchStart = () => ({
	type: COUNTRY_LIST.start
});

export const countryListFetchEnd = () => ({
	type: COUNTRY_LIST.end
});

export const countryListFetchSuccess = (countries) => (
	{
		type: COUNTRY_LIST.success,
		countries
	});

export const countryListFetchFailed = (error) => ({
	type: COUNTRY_LIST.failed,
	error
});
export const fetchCountryListData = () => (dispatch) => {
	dispatch(countryListFetchStart());
	return Api.get(Api.API_COUNTRY_LIST).then(resp => {
		if (resp.success && resp.data) {
			let pasrsedData = resp.data.map((item) => ({
				...item,
				label: item.name,
				value: item.iso3
			}));
			dispatch(countryListFetchEnd());
			dispatch(countryListFetchSuccess(pasrsedData));
		}
		else {
			dispatch(countryListFetchEnd());
		}
	}).catch((exception) => {
		dispatch(countryListFetchEnd());
		dispatch(countryListFetchFailed());
	});
};
/////////////////////// Search Country List Data //////////////////////////


export const SEARCH_COUNTRY_LIST = {
	start: 'fetch_start/search_country_list',
	end: 'fetch_end/search_country_list',
	success: 'fetch_success/search_country_list',
	failed: 'fetch_failed/search_country_list'
};
export const countryListSearchStart = () => ({
	type: SEARCH_COUNTRY_LIST.start
});

export const countryListSearchEnd = () => ({
	type: SEARCH_COUNTRY_LIST.end
});

export const countryListSearchSuccess = (countries) => (
	{
		type: SEARCH_COUNTRY_LIST.success,
		countries
	});

export const countryListSearchFailed = (error) => ({
	type: SEARCH_COUNTRY_LIST.failed,
	error
});
export const searchCountryListData = (donor) => (dispatch) => {
	dispatch(countryListSearchStart());
	donor=donor?donor:'';
	return Api.get(Api.API_COUNTRY_LIST+donor).then(resp => {
		if (resp.success && resp.data) {
			let pasrsedData = resp.data.map((item) => ({
				...item,
				label: item.name,
				value: item.iso3
			}));
			dispatch(countryListSearchEnd());
			dispatch(countryListSearchSuccess(pasrsedData));
		}
		else {
			dispatch(countryListSearchEnd());
		}
	}).catch((exception) => {
		dispatch(countryListSearchEnd());
		dispatch(countryListSearchFailed());
	});
};

////////////////////////////Theme List /////////////////////////////

export const THEME_LIST = {
	start: 'fetch_start/theme_list',
	end: 'fetch_end/theme_list',
	success: 'fetch_success/theme_list',
	failed: 'fetch_failed/theme_list',
	updateList: 'update_list/theme_list'
};
export const themeListFetchStart = () => ({
	type: THEME_LIST.start
});

export const themeListFetchEnd = () => ({
	type: THEME_LIST.end
});

export const themeListFetchSuccess = (themes) => (
	{
		type: THEME_LIST.success,
		themes
	});

export const themeListFetchFailed = (error) => ({
	type: THEME_LIST.failed,
	error
});

export const updateThemeList = (themes) => (
	{
		type: THEME_LIST.updateList,
		themes
	});

export const getMasterThemeList = () => (dispatch, getState) => Api.get(Api.API_THEME_LIST).then(resp => {
	if (resp && resp.length) {
		resp.forEach((data) => {
			data.label = data.sector;
			data.value = data.code;
		});
		dispatch(updateThemeList(resp));

	}
});

export const fetchthemeListData = (unit, donor, year,appendOthers) => (dispatch, getState) => {
	dispatch(themeListFetchStart());
	unit=unit?unit:'';
	donor=donor?donor:'';
	const currentYear = year?year:'';
	return Api.get(Api.API_THEME_LIST+`?operating_unit=${unit}&donor=${donor}&year=${currentYear}${appendOthers === 1 ? '&append_others=1' :''}`).then(resp => {
		if (resp && resp.length) {
			resp.forEach((data) => {
				data.label = data.sector;
				data.value = data.code;
			});
		}
		dispatch(themeListFetchEnd());
		dispatch(themeListFetchSuccess(resp));
		
	}).catch((exception) => {
		dispatch(themeListFetchEnd());
		dispatch(themeListFetchFailed());
	});
};

//////////////// ------------------ Master Donor List -------------------- ////////////////////


export const DONOR_LIST = {
	start: 'fetch_start/donor_list',
	end: 'fetch_end/donor_list',
	success: 'fetch_success/donor_list',
	failed: 'fetch_failed/donor_list'
};
export const donorListFetchStart = () => ({
	type: DONOR_LIST.start
});

export const donorListFetchEnd = () => ({
	type: DONOR_LIST.end
});

export const donorListFetchSuccess = (donorList) => (
	{
		type: DONOR_LIST.success,
		donorList
	});

export const donorListFetchFailed = (error) => ({
	type: DONOR_LIST.failed,
	error
});

export const fetchDonorListData = () => (dispatch,getState) => {
	dispatch(donorListFetchStart());
	return Api.get(Api.API_OPERATING_UNITS).then(resp => {
		if (resp && resp.data) {
			dispatch(donorListFetchEnd());
			dispatch(donorListFetchSuccess(resp));
		}
		else {
			dispatch(donorListFetchFailed());
		}
	}).catch((exception) => {
		dispatch(donorListFetchEnd());
		dispatch(donorListFetchFailed(exception));
	});
};

//////////////// ------------------ Sector List -------------------- ////////////////////


export const SECTOR_LIST = {
	start: 'fetch_start/sector_list',
	end: 'fetch_end/sector_list',
	success: 'fetch_success/sector_list',
	failed: 'fetch_failed/sector_list'
};
export const sectorListFetchStart = () => ({
	type: SECTOR_LIST.start
});

export const sectorListFetchEnd = () => ({
	type: SECTOR_LIST.end
});

export const sectorListFetchSuccess = (sectorList) => (
	{
		type: SECTOR_LIST.success,
		sectorList
	});

export const sectorListFetchFailed = (error) => ({
	type: SECTOR_LIST.failed, 
	error
});

export const fetchSectorListData = () => (dispatch,getState) => {
	dispatch(sectorListFetchStart());
	return Api.get(Api.API_SECTOR_LIST).then(resp => {
		if (resp && resp.data) {
			dispatch(sectorListFetchEnd());
			dispatch(sectorListFetchSuccess(resp));
		}
		else {
			dispatch(sectorListFetchFailed());
		}
	}).catch((exception) => {
		dispatch(sectorListFetchEnd());
		dispatch(sectorListFetchFailed(exception));
	});
};
//////////////// ------------------ Operating Units -------------------- ////////////////////


export const OPERATING_UNITS = {
	start: 'fetch_start/operating_units',
	end: 'fetch_end/operating_units',
	success: 'fetch_success/operating_units',
	failed: 'fetch_failed/operating_units'
};
export const operatingUnitsFetchStart = () => ({
	type: OPERATING_UNITS.start
});

export const operatingUnitsFetchEnd = () => ({
	type: OPERATING_UNITS.end
});

export const operatingUnitsFetchSuccess = (operatingUnitlist) => (
	{
		type: OPERATING_UNITS.success,
		operatingUnitlist
	});

export const operatingUnitsFetchFailed = (error) => ({
	type: OPERATING_UNITS.failed,
	error
});

export const fetchOperatingUnitsListData = (year) => (dispatch,getState) => {
	dispatch(operatingUnitsFetchStart());
	return Api.get(`${Api.API_OPERATING_UNITS}`).then(resp => {
		if (resp && resp.data) {
			dispatch(operatingUnitsFetchEnd());
			dispatch(operatingUnitsFetchSuccess(resp));
		}
		else {
			dispatch(operatingUnitsFetchFailed());
		}
	}).catch((exception) => {
		dispatch(operatingUnitsFetchEnd());
		dispatch(operatingUnitsFetchFailed(exception));
	});
};

//////////////// ------------------ Document Categories -------------------- ////////////////////


export const DOCUMENT_CATEGORIES = {
	start: 'fetch_start/document_categories',
	end: 'fetch_end/document_categories',
	success: 'fetch_success/document_categories',
	failed: 'fetch_failed/document_categories'
};
export const documentCategoriesFetchStart = () => ({
	type: DOCUMENT_CATEGORIES.start
});

export const documentCategoriesFetchEnd = () => ({
	type: DOCUMENT_CATEGORIES.end
});

export const documentCategoriesFetchSuccess = (documentCategories) => (
	{
		type: DOCUMENT_CATEGORIES.success,
		documentCategories
	});

export const documentCategoriesFetchFailed = (error) => ({
	type: DOCUMENT_CATEGORIES.failed,
	error
});

export const fetchDocumentCategories = () => (dispatch) => {
	dispatch(documentCategoriesFetchStart());
	return Api.get(Api.API_DOCUMENT_CATEGORY_FILTER).then(resp => {
		if (resp && resp.length) {
			resp.forEach((data) => {
				data.label = data.title;
				data.value = data.category;
			});
			dispatch(documentCategoriesFetchEnd());
			dispatch(documentCategoriesFetchSuccess(resp));
			dispatch(updateSearchResult(resp));
		}
		else {
			dispatch(documentCategoriesFetchFailed());
		}
	}).catch((exception) => {
		dispatch(documentCategoriesFetchEnd());
		dispatch(documentCategoriesFetchFailed(exception));
	});
};


//////////////// ------------------ Document Categories --ALL---------------- ////////////////////


export const DOCUMENT_CATEGORIES_ALL = {
	start: 'fetch_start/document_categories_all',
	end: 'fetch_end/document_categories_all',
	success: 'fetch_success/document_categories_all',
	failed: 'fetch_failed/document_categories_all'
};
export const documentCategoriesAllFetchStart = () => ({
	type: DOCUMENT_CATEGORIES_ALL.start
});

export const  documentCategoriesAllFetchEnd = () => ({
	type: DOCUMENT_CATEGORIES_ALL.end
});

export const  documentCategoriesAllFetchSuccess = (DocumentCategories) => (
	{
		type: DOCUMENT_CATEGORIES_ALL.success,
		DocumentCategories
	});

export const  documentCategoriesAllFetchFailed = (error) => ({
	type: DOCUMENT_CATEGORIES_ALL.failed,
	error
});

export const  fetchAllDocumentCategoriesAlltCategories = () => (dispatch) => {
	dispatch(documentCategoriesAllFetchStart());
	return Api.get(`${Api.API_DOCUMENT_CATEGORY_FILTER}?show_all`).then(resp => {
		if (resp && resp.length) {
			resp.forEach((data) => {
				data.label = data.title;
				data.value = data.category;
			});
			dispatch(documentCategoriesAllFetchEnd());
			dispatch(documentCategoriesAllFetchSuccess(resp));
			dispatch(updateSearchResult(resp));
		}
		else {
			dispatch(documentCategoriesAllFetchFailed());
		}
	}).catch((exception) => {
		dispatch(documentCategoriesAllFetchEnd());
		dispatch(documentCategoriesAllFetchFailed(exception));
	});
};

///////////////////////////// update Filters /////////////////////////
 
export const updateFilters = (unit, theme, sdg, donor, year,appendOthers) => (dispatch) => {
	dispatch(fetchthemeListData(unit, donor, year,appendOthers));         // Fetch Theme List Data
	dispatch(fetchSdgData(unit,donor, year));                // Fetch SDG Data
};

//////////////////////// Last Updated Date ///////////////////////////
export const LAST_UPDATED_DATE = {
	start: 'fetch_start/last_updated_date',
	end: 'fetch_end/last_updated_date',
	success: 'fetch_success/last_updated_date',
	failed: 'fetch_failed/last_updated_date'
};
export const lastUpdatedDateFetchStart = () => ({
	type: LAST_UPDATED_DATE.start
});

export const  lastUpdatedDateFetchEnd = () => ({
	type: LAST_UPDATED_DATE.end
});

export const  lastUpdatedDateFetchSuccess = (date) => (
	{
		type: LAST_UPDATED_DATE.success,
		date
	});

export const  lastUpdatedDateFetchFailed = (error) => ({
	type: LAST_UPDATED_DATE.failed,
	error
});

export const  fetchLastUpdatedDate = () => (dispatch) => {
	dispatch(lastUpdatedDateFetchStart());
	return Api.get(`${Api.API_LAST_UPDATED}`).then(resp => {
		if (resp && resp.data) {
			dispatch(lastUpdatedDateFetchEnd());
			dispatch(lastUpdatedDateFetchSuccess(resp.data));
		}
		else {
			dispatch(lastUpdatedDateFetchFailed());
		}
	}).catch((exception) => {
		dispatch(lastUpdatedDateFetchEnd());
		dispatch(lastUpdatedDateFetchFailed(exception));
	});
};

////////////////////////////Signature List /////////////////////////////

export const SIGNATURE_LIST = {
	start: 'fetch_start/signature_list',
	end: 'fetch_end/signature_list',
	success: 'fetch_success/signature_list',
	failed: 'fetch_failed/signature_list',
	updateList: 'update_list/signature_list'
};
export const signatureListFetchStart = () => ({
	type: SIGNATURE_LIST.start
});

export const signatureListFetchEnd = () => ({
	type: SIGNATURE_LIST.end
});

export const signatureListFetchSuccess = (signatures) => (
	{
		type: SIGNATURE_LIST.success,
		signatures
	});

export const signatureListFetchFailed = (error) => ({
	type: SIGNATURE_LIST.failed,
	error
});

export const updateSignatureList = (signatures) => (
	{
		type: SIGNATURE_LIST.updateList,
		signatures
	});

export const getMasterSignatureList = () => (dispatch, getState) => Api.get(Api.API_SIGNATURE_LIST).then(resp => {
	if (resp && resp.length) {
		resp.forEach((data) => {
			data.label = data.sector;
			data.value = data.code;
		});
		dispatch(updateSignatureList(resp));

	}
});

export const fetchsignatureListData = (unit, donor, year) => (dispatch, getState) => {
	dispatch(signatureListFetchStart());
	unit=unit?unit:'';
	donor=donor?donor:'';
	const currentYear = year?year:'';
	return Api.get(Api.API_SIGNATURE_LIST+`?operating_unit=${unit}&donor=${donor}&year=${currentYear}`).then(resp => {
		if (resp && resp.length) {
			resp.forEach((data) => {
				data.label = data.sector;
				data.value = data.code;
			});
			dispatch(signatureListFetchEnd());
			dispatch(signatureListFetchSuccess(resp));
		}
		else {
			dispatch(signatureListFetchEnd());
		}
	}).catch((exception) => {
		dispatch(signatureListFetchEnd());
		dispatch(signatureListFetchFailed());
	});
};

////////////////////////////  App Init ///////////////////////////////

export const onAppInit = () => (dispatch) => {
	dispatch(fetchCountryListData());       // Fetch CountryList Data
	dispatch(fetchDonorListData());         // Fetch Master Donor List
	dispatch(fetchSectorListData()); 		// Fetch Sector List
	dispatch(fetchProjectTimelineData());   // Fetch Project Timeline Data
	dispatch(getMasterThemeList());         // Fetch Theme List Data
	dispatch(fetchDocumentCategories());    // Fetch DocumentCategories
	dispatch(getMasterCountryRegionsList());
	dispatch(fetchLastUpdatedDate());		// Fetch Last Updated Date
	dispatch(getMasterSignatureList());         // Fetch Signature List Data
};