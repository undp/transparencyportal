/*********************** Preact *******************************/
import { connect } from 'preact-redux'
/******************** Custom Components ***********************/
import Sankey from './component'
/************************* Actions ****************************/
import { fetchBudgetFinancialFlow } from './actions/budgetFinancialFlowActions'
import { fetchExpenseFinancialFlow } from './actions/expenseFinancialFlowActions'
/**************************************************************/

const mapStateToProps = (state) => {
    const { loading, error, items } = state.sankeyData,
    year = state.yearSummary.data.year;
    return { loading, error, items, year }
}
const mapDispatchToProps = (dispatch) => {
    return {
        fetchBudgetFinancialFlow: (year) => dispatch(fetchBudgetFinancialFlow(year)),
        fetchExpenseFinancialFlow: (year) => dispatch(fetchExpenseFinancialFlow(year))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Sankey)