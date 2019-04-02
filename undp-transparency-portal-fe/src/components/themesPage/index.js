import { connect } from 'preact-redux'
import ThemesPage from './components'
import { fetchDonorSliderData } from '../themeSlider/actions/index'
import { loadThemesMapData } from '../../shared/actions/mapActions/themesMapData'
import { updateProjectList } from '../../shared/actions/getProjectList';
import {fetchSignatureSolutionChartData } from '../themeSlider/actions/signatureOutcome'

const mapStateToProps = (state) => {
    // Donor Profile
    const themeSliderData = state.themeSliderData,
        { themesMapData } = state.mapData,
        projectList = state.projectList,
        donutChartData = state.donorProfile;
    return {
        themeSliderData,
        themesMapData,
        projectList,
        donutChartData
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        fetchDonorSliderData: (year, sector) => dispatch(fetchDonorSliderData(year, sector)),
        loadThemesMapData: (year, sector) => dispatch(loadThemesMapData(year, sector)),
        updateProjectList: (year, unit, source, theme, keyword, limit, offset, budget_type) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budget_type)),
        fetchSignatureSolutionChartData: (code,year) => dispatch(fetchSignatureSolutionChartData(code,year))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThemesPage);
