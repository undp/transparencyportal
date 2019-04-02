import { fetchDonorBasic } from './getDonorBasicDetails';
import { fetchDonorRegularAndOthers } from './getRegularAndOtherDetails';
import { fetchDonorResourcesModalityContribution } from './getResourcesModalityContribution'
import { fetchRecipientTopOffices } from './getTopRecipientOffices'
import { fetchDonorBudgetSources } from './getBudgetSources'

let donorProfile = (dispatch, code, year) => {
    dispatch(fetchDonorBasic(code, year));
    dispatch(fetchDonorRegularAndOthers(code, year));
    dispatch(fetchDonorResourcesModalityContribution(code, year));
    dispatch(fetchRecipientTopOffices(code, year));
    dispatch(fetchDonorBudgetSources(code, year))
}

export default donorProfile;