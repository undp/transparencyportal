import { connect } from 'preact-redux'
import ProjectFilter from './components';
const mapStateToProps = (state) => {
    const {currentYear} = state.yearList
	const {countries} = state.countryList
	const sdgData = state.sdgData
	return {
        countries,
		currentYear,
		themeList: state.themeList,
		yearList:state.yearList,
		searchAllResult:state.searchAllResult,
		sdgData
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		// onChangeRoute: (url) => dispatch(onChangeRoute(url))
		// setPageHeader: data => dispatch(setPageHeader(data)),
		// updateProjectList: year => dispatch(updateProjectList(year))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFilter)