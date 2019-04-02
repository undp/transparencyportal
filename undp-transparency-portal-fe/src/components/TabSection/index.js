import { connect } from 'preact-redux'
import {
    themeItemFetchData,
    donorItemFetchData,
    sdgItemFetchData,
    onTabSwitch,
    onTabSelection,
    updateDonorFilter,
    updateThemeFilter,
    updateSignatureFilter,
    updateSdgFilter,
    updateCountryRegionFilter
} from './actions'
import { downLoadProjectListCsv } from '../../shared/actions/downLoadCSV'

import { loadOutputsMapData } from '../../shared/actions/mapActions/fetchMapOutputs';
import { searchResult } from '../nestedDropList/actions';
import { onUpdateYear } from './actions';
import { fetchThemeSummaryData, fetchSignatureSummaryData } from '../YearSummary/actions';
import { searchCountryListData } from '../../shared/actions/commonDataActions';
import { updateProjectList } from '../../shared/actions/getProjectList';
import { loadGlobalMapData } from '../../shared/actions/mapActions/globalMapData';
import { loadThemesMapData } from '../../shared/actions/mapActions/themesMapData';
import { loadDonorsMapData } from '../../shared/actions/mapActions/donorsMapData';
import { loadSdgMapData } from '../../shared/actions/mapActions/sdgMapData';
import { loadSignatureMapData } from '../../shared/actions/mapActions/signatureMapData';
import { updateMapYearTimeline, setMapCurrentYear } from '../../shared/actions/mapActions/yearTimeline';

import { searchOperatingUnitsListData, 
         updateSearchDonorsText,
         upDateBudgetSourceField,
         updateSearchThemes,
         updateSearchSgd
} from '../nestedDropList/actions';
import { fetchDonorFundListData } from '../../shared/actions/getDonorFundAggrList';
import { fetchSdgListData } from '../../shared/actions/sdgAggregate';
import { updateCountryData, fetchGlobalData, fetchRecipientCountry } from '../../shared/actions/countryData'
import { searchCountryRegionsListData } from '../../shared/actions/countryRegionSearch'
import { fetchBudgetSources } from '../../shared/actions/countryDataBudgetSources'
import { fetchThemesBudget } from '../../shared/actions/countryDataThemesBudget';
import donorProfile from '../profilePage/actions/donorActions'
import {updateSearchCountryField,updateSearchText} from '../nestedDropList/actions';

import { fetchDonorSliderData } from '../themeSlider/actions/index';
import { fetchSdgSliderData } from '../sdgSlider/actions';
import { fetchRecipientSdg } from '../profilePage/actions/recipientActions/getRecepientSdg';
import { fetchSignatureOutcome } from '../themeSlider/actions/signatureOutcome';
import { fetchSignatureSliderData } from '../themeSlider/actions/signatureDonor';
import TabSection from './component';


const mapStateToProps = (state) => {
    const {
        loading,
        error,
        tabSelected,
        countryRegionFilter,
        donorFilter,
        themeFilter,
        signatureFilter,
        sdgFilter,
        ...data
    } = state.tabData
    const { mapCurrentYear } = state.mapData.yearTimeline;
    const { currentYearSelected } = !state.yearSummary.loading ? state.yearSummary.data.year : '';
    const { globalMapData, themesMapData, donorsMapData, sdgMapData, signatureMapData } = state.mapData;
    const countryData = state.countryData,
        countryList = state.countryList,
        themeSummary = state.themeSummary,
        themeList = state.themeList,
        budgetSourceSearch = state.budgetSourceSearch;
    const { countryDataBudgetSources: budgetSources } = state
    const { searchList } = state.countryList
    const themeSliderData = state.themeSliderData
    const sdgData = state.sdgData
    const { recepientSdg } = state.recipientProfile
    const { countryDataThemesBudget: themesBudget } = state
    const { searchResult: countryRegionsearchResult, searchText: countryRegionSearchText, loading: searchResultLoading } = state.countryRegionSearch;
    const signatureOutcome = state.signatureOutcome;
    return {
        loading,
        error,
        data,
        searchList,
        donorProfile: state.donorProfile,
        donorFundList: state.donorFundList,
        countryRegionsearchResult,
        countryRegionSearchText,
        searchResultLoading,
        projectList: state.projectList,
        countryData,
        countryList,
        recepientSdg,
        themeSliderData,
        sdgList: state.sdgAggregate,
        sdgSliderData: state.sdgSliderData,
        sdgData,
        globalMapData,
        themesMapData,
        donorsMapData,
        sdgMapData,
        themesBudget,
        outputMapData: state.mapData.outputData,
        sdgFilter,
        budgetSources,
        themeSummary,
        tabSelected,
        mapCurrentYear,
        donorFilter,
        themeFilter,
        countryRegionFilter,
        budgetSourceSearch,
        themeList,
        tabData: state.tabData,
        currentYearSelected: !state.yearSummary.loading ? state.yearSummary.data.year : '',
        signatureMapData,
        signatureOutcome
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchThemeItemData: () => dispatch(themeItemFetchData()),
        fetchDonorItemData: () => dispatch(donorItemFetchData()),
        fetchSDGItemData: () => dispatch(sdgItemFetchData()),
        updateCountryData: (item) => dispatch(updateCountryData(item)),
        onTabSwitch: (item) => {
            dispatch(onTabSwitch(item))
        },
        onTabSelection: (item) => {
            dispatch(onTabSelection(item))
        },
        fetchThemeSliderData: (year, sector) => dispatch(fetchDonorSliderData(year, sector)),
        fetchSdgSliderData: (year, sdg) => dispatch(fetchSdgSliderData(year, sdg)),
        onUpdateYear: (year) => dispatch(onUpdateYear(year)),
        searchOperatingUnitsListData: (key, item) => dispatch(searchOperatingUnitsListData(key, item)),
        updateDonorFilter: (key, data) => dispatch(updateDonorFilter(key, data)),
        updateThemeFilter: (key, data) => dispatch(updateThemeFilter(key, data)),
        updateSignatureFilter: (key, data) => dispatch(updateSignatureFilter(key, data)),
        updateSdgFilter: (key, data) => dispatch(updateSdgFilter(key, data)),
        updateCountryRegionFilter: (key, data) => dispatch(updateCountryRegionFilter(key, data)),
        fetchThemeSummaryData: (item) => dispatch(fetchThemeSummaryData(item)),
        fetchSignatureSummaryData: (item) => dispatch(fetchSignatureSummaryData(item)),
        fetchDonorFundListData: (item,operatingUnit) => dispatch(fetchDonorFundListData(item,operatingUnit)),
        fetchSdgListData: (item) => dispatch(fetchSdgListData(item)),
        searchResult: (item, key) => dispatch(searchResult(item, key)),
        updateSearchDonorsText: (text) => dispatch(updateSearchDonorsText(text)),
        fetchGlobalData: (year) => dispatch(fetchGlobalData(year)),
        loadGlobalMapData: (year, unit) => dispatch(loadGlobalMapData(year, unit)),
        loadThemesMapData: (year, sector, unit, source, signatureSolution) => dispatch(loadThemesMapData(year, sector, unit, source, signatureSolution)),
        loadSignatureMapData: (year, sector, unit, source) => dispatch(loadSignatureMapData(year, sector, unit, source)),
        loadSdgMapData: (year, sdg, unit, source, tab) => dispatch(loadSdgMapData(year, sdg, unit, source, tab)),
        loadDonorsMapData: (year, unit, sector, source, sdg) => dispatch(loadDonorsMapData(year, unit, sector, source, sdg)),
        fetchThemesBudget: (code, year) => dispatch(fetchThemesBudget(code, year)),
        fetchBudgetSources: (year, code) => dispatch(fetchBudgetSources(year, code)),
        searchCountryListData: (donor) => dispatch(searchCountryListData(donor)),
        searchCountryRegionsListData: (searchParam) => dispatch(searchCountryRegionsListData(searchParam)),
        fetchRecipientCountry: (country_name, code, year, iso2Code, type) => dispatch(fetchRecipientCountry(country_name, code, year, iso2Code, type)),
        updateSearchCountryField: (countryCode) => dispatch(updateSearchCountryField(countryCode)),
        updateSearchText: (text) => dispatch(updateSearchText(text)),
        updateSearchThemes: (themes) => dispatch(updateSearchThemes(themes)),
        updateSearchSgd: (sdg) => dispatch(updateSearchSgd(sdg)),
        getDonorDetails: (code, year) => donorProfile(dispatch, code, year),
        fetchRecipientSdg: (code, year) => dispatch(fetchRecipientSdg(code, year)),
        updateProjectList: (year, unit, source, theme, keyword, limit, offset, budget_type, sdg) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budget_type, sdg)),
        downLoadProjectListCsv: (year, keyword, source, sectors, units, sdgs,type,signatureSolution) => dispatch(downLoadProjectListCsv(year, keyword, source, sectors, units, sdgs,type,signatureSolution)),
        upDateBudgetSourceField:(themes,sdg,country) => dispatch(upDateBudgetSourceField(themes,sdg,country)),
        fetchSignatureOutcome: (code, year) => dispatch(fetchSignatureOutcome(code, year)),
        fetchSignatureSliderData: (year, sector) => dispatch(fetchSignatureSliderData(year, sector)),
        setMapCurrentYear: (year) => dispatch(setMapCurrentYear(year)),
        loadOutputsMapData:(year,unit) => dispatch(loadOutputsMapData(year,unit))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TabSection)


