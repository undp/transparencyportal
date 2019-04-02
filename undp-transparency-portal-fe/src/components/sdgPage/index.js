/**************************** Preact files ******************************/
import { connect } from 'preact-redux';

/**************************** Custom components *************************/
import SdgPage from './components';

/**************************** Redux Actions *******************************/
import { fetchDonorSliderData } from '../themeSlider/actions/index';
import { fetchSdgSliderData,fetchSdgTargetData  } from '../sdgSlider/actions/index';
import { loadThemesMapData } from '../../shared/actions/mapActions/themesMapData';
import { loadSdgMapData,loadTargetMapData } from '../../shared/actions/mapActions/sdgMapData';
import { updateProjectList } from '../../shared/actions/getProjectList';
import { fetchSdgSliderTargetData } from '../sdgSlider/actions/targetAction';

const mapStateToProps = (state) => {
	const themeSliderData = state.themeSliderData,
		sdgSliderData = state.sdgSliderData,
		{ themesMapData, sdgMapData } = state.mapData,
		projectList = state.projectList,
		currentYear = state.yearList.currentYear,
		sdgTargetSliderData = state.sdgTargetSliderData;
	return {
		themeSliderData,
		themesMapData,
		projectList,
		currentYear,
		sdgSliderData,
		sdgMapData,
		sdgTargetSliderData
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchDonorSliderData: (year, sector) => dispatch(fetchDonorSliderData(year, sector)),
	loadThemesMapData: (year, sector) => dispatch(loadThemesMapData(year, sector)),
	loadTargetMapData: (year, target, unit, source, tab) => dispatch( loadTargetMapData(year, target, unit, source, tab)),
	loadSdgMapData: (year, sdg, unit, source, tab) => dispatch(loadSdgMapData(year, sdg, unit, source, tab)),
	updateProjectList: (year, unit, source, theme, keyword, limit, offset, budgetType, sdg,target) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budgetType, sdg,target)),
	fetchSdgSliderData: (year,sdg) => dispatch(fetchSdgSliderData(year,sdg)),
	fetchSdgTargetData: (year,targetId) => dispatch(fetchSdgTargetData(year, targetId)),
	fetchSdgSliderTargetData: (year, sdg) => dispatch(fetchSdgSliderTargetData(year, sdg))
});

export default connect(mapStateToProps, mapDispatchToProps)(SdgPage);

