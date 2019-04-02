/**************************** Preact files ******************************/
import { connect } from 'preact-redux';

/**************************** Custom components *************************/
import SDGLandingPage from './components';

/**************************** Redux Actions *******************************/
import { fetchSdgSunburstData } from './actions';
import { fetchsdgTopFiveData } from './actions/donorsAction';
import { fetchSdgBarChart } from './actions/sdgBarChart';

const mapStateToProps = (state) => {
    const sdgSunburstData = state.sdgSunburstData,
        currentYear = state.yearList.currentYear,
        sdgTopFiveData = state.sdgTopFiveData,
        sdgBarChartData =  state.sdgBarChartData;
		
	return {
        sdgSunburstData,
        currentYear,
        sdgTopFiveData,
        sdgBarChartData
	};
};
const mapDispatchToProps = (dispatch) => ({
        fetchSdgSunburstData: (year) => dispatch(fetchSdgSunburstData(year)),
        fetchsdgTopFiveData: (year, sdg) => dispatch(fetchsdgTopFiveData(year, sdg)),
        fetchSdgBarChart: (code, year) => dispatch(fetchSdgBarChart(code, year))
});

export default connect(mapStateToProps, mapDispatchToProps)(SDGLandingPage);

