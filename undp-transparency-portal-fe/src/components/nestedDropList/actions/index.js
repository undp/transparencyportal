import Api from '../../../lib/api'
import {fetchOperatingUnitsListData} from '../../../shared/actions/commonDataActions'



export const OPERATING_UNITS_SEARCH = {
    start: 'fetch_start/operating_units_search_list',
    end: 'fetch_end/operating_units_search_list',
    success: 'fetch_success/operating_units_search_list',
    failed: 'fetch_failed/operating_units_search_list',
}

export const OPERATING_UNITS_SEARCH_BAR = {  
	start: 'fetch_start/operating_units_search_bar',
	end: 'fetch_end/operating_units_search_bar',
	success: 'fetch_success/operating_units_search_bar',
	failed: 'fetch_failed/operating_units_search_bar'
}



export const UPDATE_SEARCH_RESULT = "UPDATE_SEARCH_RESULT";
export const CLEAR_SEARCH_RESUlt = "CLEAR_SEARCH_RESUlt";
export const UPDATE_SEARCH_TEXT = "UPDATE_SEARCH_TEXT_NESTED";
export const UPDATE_SEARCH_DONOR_TEXT = "UPDATE_SEARCH_DONOR_TEXT";
export const UPDATE_SEARCH_RESULT_SEARCH_BAR = "UPDATE_SEARCH_RESULT_SEARCH_BAR";
export const UPDATE_SEARCH_COUNTRY_FIELD = "UPDATE_SEARCH_COUNTRY_FIELD";
export const CLEAR_SEARCH_COUNTRY_FIELD = "CLEAR_SEARCH_COUNTRY_FIELD";
export const UPDATE_TEMP_SEARCH_RESULT = "UPDATE_TEMP_SEARCH_RESULT";
export const UPDATE_SEARCH_THEMES = "UPDATE_SEARCH_THEMES";
export const UPDATE_SEARCH_SDG = "UPDATE_SEARCH_SDG";

export const updateSearchText = (text) => ({
	type: UPDATE_SEARCH_TEXT,
	text
})



export const updateSearchDonorsText = (text) => {
	return ({
		type: UPDATE_SEARCH_DONOR_TEXT,
		text
	})
} 


export const updateTempSearchResult = (data,countryFieldKey,sdgFieldKey,themesFieldKey) => {
	return ({
		type: UPDATE_TEMP_SEARCH_RESULT,
		data,
		countryFieldKey ,
		sdgFieldKey,
		themesFieldKey
	})
} 


// update budgetSource fields

export const clearSearchCountryField = ()=> {
	return(
		{
			type: CLEAR_SEARCH_COUNTRY_FIELD
		}
	)
}


// update budgetSource fields

export const upDateBudgetSourceField = (themes="",sdg="",country="") =>{
	return (dispatch, getState) => {
		dispatch(updateSearchThemes(themes))
		dispatch(updateSearchSgd(sdg))		
		dispatch(updateSearchCountryField(country))
	}
}		



//Operating Units drop list


export const operatingUnitsFetchStart = () => ({
	type: OPERATING_UNITS_SEARCH.start
})


export const operatingUnitsFetchEnd = () => ({
	type: OPERATING_UNITS_SEARCH.end
})

export const operatingUnitsFetchSuccess = (operatingUnitlist) => (
	{
		type: OPERATING_UNITS_SEARCH.success,
		operatingUnitlist
	})

export const operatingUnitsFetchFailed = (error) => ({
	type: OPERATING_UNITS_SEARCH.failed,
	error
})


//Operating Units search bar 

export const operatingUnitsFetchStartSearchBar = () => ({
	type: OPERATING_UNITS_SEARCH_BAR.start
})

export const operatingUnitsFetchEndSearchBar = () => ({
	type: OPERATING_UNITS_SEARCH_BAR.end
})

export const operatingUnitsFetchSuccessSearchBar = (operatingUnitlist) => (
	{
		type: OPERATING_UNITS_SEARCH_BAR.success,
		operatingUnitlist
	})

export const operatingUnitsFetchFailedSearchBar = (error) => ({
	type: OPERATING_UNITS_SEARCH_BAR.failed,
	error
})




export const searchBarOpearatingUnitsListData = (searchParam,key,operatingUnit) =>{
	return (dispatch, getState) => {
		const currentYear = getState().mapData.yearTimeline.mapCurrentYear;        
        
		dispatch(operatingUnitsFetchStartSearchBar())
		return Api.get(Api.API_OPERATING_UNITS + `?search=${searchParam}`+`&year=${currentYear}`+`&country=${operatingUnit}`).then(resp => {
			if (resp && resp.data) {
				if (getState().budgetSourceSearch.searchDonorText == resp.data.draw) {
					dispatch(updateSearchResultSearchBar(resp.data.donors))
					dispatch(operatingUnitsFetchEndSearchBar())
                           
				}
                

			} else {
				dispatch(operatingUnitsFetchFailedSearchBar())                
				dispatch(operatingUnitsFetchEndSearchBar())
			}
		}).catch((exception) => {
			dispatch(operatingUnitsFetchEndSearchBar())
			dispatch(operatingUnitsFetchFailedSearchBar())
		})
	}
}





export const searchOperatingUnitsListData = (searchParam, key, year = null) => {
	return (dispatch, getState) => {
		const currentYear =  year === ''?'':year || getState().mapData.yearTimeline.mapCurrentYear;
		const country = getState().budgetSourceSearch.searchCountryField;
		const themes = getState().budgetSourceSearch.searchThemesField?getState().budgetSourceSearch.searchThemesField:'';
		const searchtext = getState().budgetSourceSearch.searchText;
		const searchParameter = searchParam === null ? searchtext : searchParam;
		const sdg = getState().budgetSourceSearch.searchSdgField?getState().budgetSourceSearch.searchSdgField:'';
		dispatch(operatingUnitsFetchStart());
		let searchParamURL = getState().tabData.tabSelected === 'signature' ? `?search=${searchParameter}` + `&year=${currentYear}` + `&country=${country}` + `&ss_id=${themes && themes!==-1 ? themes : ''}` + `&sdg=${sdg}` 
		: `?search=${searchParameter}` + `&year=${currentYear}` + `&country=${country}` + `&sector=${themes && themes!==-1 ? themes : ''}` + `&sdg=${sdg}`;
		return Api.get(Api.API_OPERATING_UNITS + searchParamURL).then(resp => { 
			if (resp && resp.data) {
				if (getState().budgetSourceSearch.searchText == resp.data.draw) {
					dispatch(updateSearchResult(resp.data.donors))
					if (searchParameter == '') {
						dispatch(updateTempSearchResult(resp.data.donors, country, sdg, themes))

					}
					dispatch(operatingUnitsFetchEnd())

				}

			} else {
				dispatch(operatingUnitsFetchFailed())
				dispatch(operatingUnitsFetchEnd())

			}
		}).catch((exception) => {
			dispatch(operatingUnitsFetchEnd())
			dispatch(operatingUnitsFetchFailed())
		})
	}
}

export const updateSearchResult = (data) => {
	return ({
		type: UPDATE_SEARCH_RESULT,
		data
	})
}

export const updateSearchResultSearchBar = (data) =>{
	return ({
		type: UPDATE_SEARCH_RESULT_SEARCH_BAR,
		data
	})
}




//drop list params


/// Country Field

export const updateSearchCountryField = (data) =>{
	return ({
		type: UPDATE_SEARCH_COUNTRY_FIELD,
		data
	})
}


// Themes 
export const updateSearchThemes = (data) =>{
	return ({
		type: UPDATE_SEARCH_THEMES,
		data
	})
}


// Sdg

export const updateSearchSgd = (data) =>{
	return ({
		type: UPDATE_SEARCH_SDG,
		data
	})
}



export const clearSearchResult = () => ({
	type: CLEAR_SEARCH_RESUlt
})




export const searchResult = (searchParam,key,source=false) => {
    return (dispatch, getState) => {
        const country = getState().budgetSourceSearch.searchCountryField?getState().budgetSourceSearch.searchCountryField:'';
        const themes = getState().budgetSourceSearch.searchThemesField;
        const sdg = getState().budgetSourceSearch.searchSdgField;
		const operatingUnit = (getState().tabData.donorFilter.operatingUnits);
		
		if(key ==="dropList"){

            dispatch(updateSearchText(searchParam))
            if (searchParam == '') {
                dispatch(updateSearchResult(getState().budgetSourceSearch.searchResultTemp.data))

                if(source){
                    dispatch(operatingUnitsFetchEnd())  
                }
         
            }
            else {
                dispatch(searchOperatingUnitsListData(searchParam,key))
            }
        }
        else{
            dispatch(updateSearchDonorsText(searchParam));            
            if (searchParam !== "") {
                dispatch(searchBarOpearatingUnitsListData(searchParam,key,operatingUnit && getState().tabData.tabSelected === 'donors' ? operatingUnit: ''));
            }
            else {
                dispatch(updateSearchResultSearchBar([]))
            }
        }
    }
}



