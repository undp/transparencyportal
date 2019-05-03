import { connect } from 'preact-redux'
import ProfilePage from './components'
import recipientProfile from './actions/recipientActions';
import donorProfile from './actions/donorActions'
import { fetchRecipientWindRose } from './actions/recipientActions/getRecipientWindRoseDetails';
import { fetchRecipientDocuments } from './actions/recipientActions/getRecipientDocuments';
import { loadRecipientProfileMapData } from '../../shared/actions/mapActions/recipientProfileMapData';
import { loadDonorProfileMapData } from '../../shared/actions/mapActions/donorProfileMapData';
import { loadOutputsMapData } from '../../shared/actions/mapActions/fetchMapOutputs';
import { updateBarChartOnArcHover } from './actions/recipientActions/budgetVsExpenseCharts';
import { fetchthemeListData } from '../../shared/actions/commonDataActions';
import {getAPIBaseUrRl} from '../../utils/commonMethods';
const mapStateToProps = (state) => {
    // Donor Profile
    const donorBasicDetails = state.donorProfile.basicDetails ?
        state.donorProfile.basicDetails : [],
        topRecipientOffices = state.donorProfile.topRecipientOffices.data ?
            state.donorProfile.topRecipientOffices.data : [],
        regularAndOthers = state.donorProfile.regularAndOthers.data.country ?
            state.donorProfile.regularAndOthers.data.country : [],
        contributionToRegular = state.donorProfile.regularAndOthers.data.donor_vs_total ?
            state.donorProfile.regularAndOthers.data.donor_vs_total : [],
        fundModlaitySplitUp = state.donorProfile.resourcesModalityContribution.data.country ?
            state.donorProfile.resourcesModalityContribution.data.country : [],
        otherResourcesContributions = state.donorProfile.resourcesModalityContribution.data.total ?
            state.donorProfile.resourcesModalityContribution.data.total : [],

        // Recipient Profile
        recipientBasicDetails = state.recipientProfile.basicDetails,
        documentListLoading = state.recipientProfile.documentList.loading,
        recipientDocumentList = state.recipientProfile.documentList.data.data ?
            state.recipientProfile.documentList.data.data : [],
        topBudgetSources = state.recipientProfile.topBudgetSources.data ?
            state.recipientProfile.topBudgetSources.data : [],
        themeBudget = state.recipientProfile.themeBudget,
        recepientSdg = state.recipientProfile.recepientSdg,
        windRose = state.recipientProfile.windRose,
        { loading, error, projectList } = state.projectList,
        { currentYear } = state.yearList,
        budgetVsExpense=state.recipientProfile.budgetVsExpense?state.recipientProfile.budgetVsExpense:[],
        budgetVsExpenseSdg = state.recipientProfile.budgetVsExpenseSdg,
        yearList = state.yearList,
        baseURL = getAPIBaseUrRl();

    const {recipientMapData, donorProfileMapData} = state.mapData

    return {
        // Donor Profile
        donorBasicDetails,          // Get Donor's basic Details
        topRecipientOffices,        // Get Donor's top Recipient Offices
        regularAndOthers,           // Get Donor's Contribution to Regular and Other Resources
        contributionToRegular,      // Get Donor's Contribution to UNDP Regular Resources
        fundModlaitySplitUp,        // Get Donor's Contribution to Other Resources by Fund Category
        otherResourcesContributions, // Other Resources Modality Contributions - All Donors vs Algeria
        // Recipient Profile
        recipientBasicDetails,      // Get Recipient's basic Details
        recipientDocumentList,      // Get Recipient's Document List
        documentListLoading,
        topBudgetSources,           // Get Recipient's top Budget Sources
        themeBudget,                // Get Recipient's Themes (% of Budget)
        recepientSdg,               // Get Recipient's Sdg (% of Budget)
        windRose,                   // Get Recipient's UNDP Strategic Plan IRRF Indicators
        // Others
        recipientMapData,
        donorProfileMapData,
        loading,
        error,
        projectList,
        themeList: state.themeList,
        currentYear,
        budgetVsExpense,
        budgetVsExpenseSdg,
        yearList,
        baseURL

    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        getRecipientDetails: (code, year, theme) => recipientProfile(dispatch, code, year, theme),
        getDonorDetails: (code, year) => donorProfile(dispatch, code, year),
        fetchWindRose: (code, year, theme) => dispatch(fetchRecipientWindRose(code, year, theme)),
        fetchDocuments: (code, year, category) => dispatch(fetchRecipientDocuments(code, year, category)),
        loadRecipientProfileMapData: (year, unit) => dispatch(loadRecipientProfileMapData(year, unit)),
        loadDonorProfileMapData: (year, source, budget_type) => dispatch(loadDonorProfileMapData(year, source, budget_type)),
        updateBarChartOnArcHover:(data) => dispatch(updateBarChartOnArcHover(data)) ,
        loadOutputsMapData:(year, unit, sector, source, project_id, budget_type) => dispatch(loadOutputsMapData(year, unit, sector, source, project_id, budget_type)),
        fetchthemeListData: (unit, donor, year,appendOthers) => dispatch(fetchthemeListData(unit, donor, year,appendOthers))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
