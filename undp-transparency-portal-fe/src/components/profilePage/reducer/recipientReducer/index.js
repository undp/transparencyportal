import { combineReducers } from 'redux';
import basicDetails from './getRecipientBasicDetails';
import themeBudget from './getRecipientTheme';
import documentList from './getRecipientDocuments'
import topBudgetSources from './getRecipientTopBugetSources'
import windRose from './getRecipientWindRoseDetails'
import budgetVsExpense from './getRecipientBudgetVsExpenseDetails'
import budgetExpenseChartData from './budgetVsExpenseCharts';
import budgetVsExpenseSdg from './getRecepientbudgetVsExpenseSdg'
import recepientSdg from './getRecepientSdg';
export default combineReducers({
    basicDetails,
    themeBudget,
    documentList,
    topBudgetSources,
    windRose,
    budgetVsExpense,
    budgetVsExpenseSdg,
    budgetExpenseChartData,
    recepientSdg
})