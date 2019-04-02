import { loadRecipientBasic } from './getRecipientBasicDetails';
import { loadRecipientTheme } from './getRecipientTheme';
import { fetchRecipientDocuments } from './getRecipientDocuments'
import { fetchRecipientTopBudgetSources } from './getRecipientTopBugetSources'
import { fetchRecipientWindRose } from './getRecipientWindRoseDetails'
import  {fetchRecepientBudgetVsExpense} from './getRecepientBudgetVsExpense';
import {fetchRecepientBudgetVsExpenseSdg} from './getRecepientbudgetVsExpenseSdg'
import {fetchRecipientSdg} from './getRecepientSdg';



let recipientProfile = (dispatch, code, year, sector, category) => {
    dispatch(loadRecipientBasic(code, year));
    dispatch(loadRecipientTheme(code, year));
    dispatch(fetchRecipientSdg(code,year));
    dispatch(fetchRecipientDocuments(code, year, category));
    dispatch(fetchRecipientTopBudgetSources(code, year));
    dispatch(fetchRecipientWindRose(code, year, sector));
    dispatch(fetchRecepientBudgetVsExpense(code, year));
    dispatch(fetchRecepientBudgetVsExpenseSdg(code, year));
}

export default recipientProfile;