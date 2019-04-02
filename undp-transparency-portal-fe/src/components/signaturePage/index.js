import {
    connect
} from 'preact-redux';
import SignaturePage from './components';
import {
    fetchSignatureSliderData
} from '../themeSlider/actions/signatureDonor';
import {
    loadThemesMapData
} from '../../shared/actions/mapActions/themesMapData';
import {
    updateProjectList
} from '../../shared/actions/getProjectList';
import {
    fetchSignatureOutcome
} from '../themeSlider/actions/signatureOutcome';
import { updateSignatureSolution } from '../sideBar/action/updateSS'

const mapStateToProps = (state) => {
    // Donor Profile
    const themeSliderData = state.themeSliderData,
        {
            themesMapData
        } = state.mapData,
        outcomeData = state.donorProfile,
        projectList = state.projectList;

    return {
        themeSliderData,
        themesMapData,
        projectList,
        outcomeData 

    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        fetchSignatureSliderData: (year, sector) => dispatch(fetchSignatureSliderData(year, sector)),
        loadThemesMapData: (year, sector, unit, source,signatureSolution) => dispatch(loadThemesMapData(year, sector, unit, source,signatureSolution)),
        updateProjectList: (year, unit, source, theme, keyword, limit, offset, budget_type) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budget_type)),
        fetchSignatureOutcome: (code, year) => dispatch(fetchSignatureOutcome(code, year)),
        updateSignatureSolution: (code) => dispatch(updateSignatureSolution(code))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignaturePage);