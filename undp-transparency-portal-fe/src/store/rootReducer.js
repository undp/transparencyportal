/************************* Redux Files ************************/
import { combineReducers } from 'redux';

/************************* Reducer Files ************************/
import yearSummary from '../components/YearSummary/reducer';
import sankeyData from '../components/sankey/reducer';
import individualMarkerData from '../components/markerPage/reducer';
import breadCrumb from '../components/urlBreadCrumb/data/reducer';
import tabData from '../components/TabSection/reducer';
import mapData from '../shared/reducers/mapData';
import router from '../shared/reducers/router';
import countryData from '../shared/reducers/countryData';
import countryDataBudgetSources from '../shared/reducers/countryDataBudgetSources';
import countryRegionSearch from '../shared/reducers/countryRegionSearch';
import countryDataThemesBudget from '../shared/reducers/countryDataThemesBudget';
import yearList from '../shared/reducers/yearList';
import projectDetail from '../shared/reducers/projectDetailManagement';
import projectList from '../shared/reducers/projectList';
import recipientProfile from '../components/profilePage/reducer/recipientReducer';
import donorProfile from '../components/profilePage/reducer/donorReducer';
import yearSelection from '../shared/reducers/yearSelectManagement';
import countryList from '../shared/reducers/countryListManagement';
import projectTimeline from '../shared/reducers/projectTimelineRangeManagement';
import themeSummary from '../shared/reducers/themeDataManagement';
import themeList from '../shared/reducers/themeListManagement';
import operationUnits from '../shared/reducers/operatingUnits';
import masterDonorList from '../shared/reducers/masterDonorListManagement';
import documentCategories from '../shared/reducers/documentCategories';
import documentCategoriesAll from '../shared/reducers/documentCategoryAll';
import budgetSourceSearch from '../components/nestedDropList/reducer';
import donorFundList from '../shared/reducers/donorFundList';
import exportPDF from '../shared/reducers/exportPDF';
import downLoadCsv from '../shared/reducers/downLoadCSV'
import donorData from '../components/donorsPage/reducer';
import donorTypes from '../components/donorsPage/reducer/donorTypes';
import fundStreams from '../components/donorsPage/reducer/fundStreams';
import themeSliderData from '../components/themeSlider/reducer/themeSliderData';
import signatureOutcome from '../components/themeSlider/reducer/signatureOutcome';
import signatureDonor from '../components/themeSlider/reducer/signatureDonor';
import sdgSliderData from '../components/sdgSlider/reducer';
import searchAllResult from '../shared/reducers/searchResult';
import aboutUsContent from '../shared/reducers/aboutUs';
import sdgData from '../shared/reducers/sdgManagement';
import sdgAggregate from '../shared/reducers/sdgAggregate';
import lastUpdatedDate from '../shared/reducers/lastUpdatedDate';
import sdgTargetSliderData from '../components/sdgSlider/reducer/targetReducer';
import sdgSunburstData from '../components/sdgLandingPage/reducer';
import sdgTopFiveData from '../components/sdgLandingPage/reducer/donors';
import sdgBarChartData from '../components/sdgLandingPage/reducer/sdgBarChart';
import sscMarkerPathData from '../components/sscMarker/reducer';
import sscCountry from '../components/sscMarker/reducer/selectCountry';
import sectorListData from '../shared/reducers/sectorListManagement';
import sscApproachesData from '../components/sscMarker/reducer/ourApproaches';
import markerDetails from '../shared/reducers/markerReducer';
import markerDescData from '../components/markerPage/reducer/typeAndDesc';
import markerBarChartData from '../components/markerPage/reducer/markerBarChart';
import markerProjectListData from '../components/markerPage/reducer/projectList';
import markerSubTypes from '../components/markerPage/reducer/markerSubTypes';
import currentMarkerSubType from '../components/markerPage/reducer/setMarkerSubtype';
import sscMarkerType from '../components/sscMarker/reducer/selectMarker';
import sscL2Country from '../components/sscMarker/reducer/selectL2Country';
import markerSubTypeSelected from '../components/bootstraptable/reducer/setMarkerType';
import countrySelected from '../components/nestedDropList/reducer/setCountryField';
import startAndEndYears from '../routes/themes/reducers/setEndYear';
import levelTwoCountries from '../components/markerPage/reducer/levelTwoCountry';
import selectedSignatureSolution from '../components/sideBar/reducer/updateSS'

export default combineReducers({
	yearSummary,
	aboutUsContent,
	sankeyData,
	tabData,
	mapData,
	breadCrumb,
	exportPDF,
	router,
	countryData,
	countryDataBudgetSources,
	countryDataThemesBudget,
	masterDonorList,
	countryRegionSearch,
	projectDetail,
	projectList,
	yearSelection,
	recipientProfile,
	yearList,
	projectTimeline,
	themeList,
	countryList,
	themeSummary,
	operationUnits,
	documentCategories,
	budgetSourceSearch,
	donorFundList,
	sdgAggregate,
	donorData,
	donorProfile,
	donorTypes,
	fundStreams,
	themeSliderData,
	sdgSliderData,
	searchAllResult,
	startAndEndYears,
	documentCategoriesAll,
	sdgData,
	lastUpdatedDate,
	signatureOutcome,
	signatureDonor,
	sdgTargetSliderData,
	sdgSunburstData,
	sdgTopFiveData,
	individualMarkerData,
	sdgBarChartData,
	sscMarkerPathData,
	sscCountry,
	sscApproachesData,
	sectorListData,
	markerDescData,
	markerProjectListData,
	markerBarChartData,
	markerDetails,
	markerSubTypes,
	currentMarkerSubType,
	sscMarkerType,
	sscL2Country,
	markerSubTypeSelected,
	countrySelected,
	selectedSignatureSolution,
	levelTwoCountries
});