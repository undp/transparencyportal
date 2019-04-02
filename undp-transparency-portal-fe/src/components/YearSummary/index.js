import { connect } from 'preact-redux'
import {
    yearSummaryFetchData,
    fetchThemeSummaryData
} from './actions'

import {onUpdateYear} from '../TabSection/actions';
import {fetchDonorFundListData} from '../../shared/actions/getDonorFundAggrList';
import {setMapCurrentYear } from '../../shared/actions/mapActions';
import YearSummary from './component'

const mapStateToProps = (state) => {
    const {
        loading,
        error,
        ...data
    } = state.yearSummary
    const projectTimeline = state.projectTimeline,
                    themeSummary = state.themeSummary,
                    tabData = state.tabData;
    return {
        loading,
        error,
        data,
        projectTimeline,
        themeSummary,
        tabData
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchYearSummary: (year) => dispatch(yearSummaryFetchData(year)),
        fetchThemeSummaryData: (year) => dispatch(fetchThemeSummaryData(year)),
        fetchDonorFundListData : (year) => dispatch(fetchDonorFundListData(year)),
        onUpdateYear:(year) => dispatch(onUpdateYear(year)),
        setMapCurrentYear: (year) => dispatch(setMapCurrentYear(year))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(YearSummary)