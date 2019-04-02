import { combineReducers } from 'redux';
import basicDetails from './getDonorBasicDetails';
import regularAndOthers from './getRegularAndOtherDetails';
import resourcesModalityContribution from './getResourcesModalityContribution'
import topRecipientOffices from './getTopRecipientOffices'
import budgetSources from './getBudgetSources'
export default combineReducers({
    basicDetails,
    regularAndOthers,
    resourcesModalityContribution,
    topRecipientOffices,
    budgetSources
})