import { connect } from 'preact-redux'
import { fetchProjectDetailsOnSelection } from '../../shared/actions/projectDetailActions'
import { updateProjectList,fetchMarkerProjectList } from '../../shared/actions/getProjectList';
import BootTable from './component'
import marker from '../../routes/marker';
import { setMarkerSubtype } from '../markerPage/actions/setMarkerSubtype';


const mapStateToProps = (state) => {
	const { currentYear } = state.yearList,
		dropdownCountrySelected = state.budgetSourceSearch,
		markerSubTypeSelected = state.markerSubTypeSelected,
		projectCount = state.projectList.projectList.count;
	return {
		currentYear,
		dropdownCountrySelected,
		markerSubTypeSelected,
		projectCount
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setMarkerSubtype: (data) => dispatch(setMarkerSubtype(data)),
		fetchProjectDetailsOnSelection: (id) => dispatch(fetchProjectDetailsOnSelection(id)),
		updateProjectList: (year, unit, source, theme, keyword, limit, offset, budget_type, sdg,target,signatureSolution) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budget_type, sdg,target,signatureSolution)),
		fetchMarkerProjectList: (year, markerId, keyword, limit, offset, country, markerType, l2country) => dispatch(fetchMarkerProjectList(year, markerId, keyword, limit, offset, country, markerType, l2country))
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(BootTable);