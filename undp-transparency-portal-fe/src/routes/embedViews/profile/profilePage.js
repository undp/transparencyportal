import { h, Component } from 'preact';
import BootTable from '../../../components/bootstraptable'
import Map from '../../../components/map';
import GenerateRecipientCharts from '../../../components/profilePage/components/generateRecipientCharts';
import GenerateDonorCharts  from '../../../components/profilePage/components/generateDonorCharts';

import ProjectDetailDocTable from '../../../components/projectDetailDocuTable';
import PreLoader from '../../../components/preLoader';

import NodataTemplate from '../../../components/no-data-template'


import { connect } from 'preact-redux';
import { loadProjectListMapData } from '../../../shared/actions/mapActions/projectListMapData';
import {
    updateYearList,
    setCurrentYear
} from "../../../shared/actions/getYearList";

import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter'

import recipientProfile from '../../../components/profilePage/actions/recipientActions';
import donorProfile from '../../../components/profilePage/actions/donorActions';
import { fetchRecipientWindRose } from '../../../components/profilePage/actions/recipientActions/getRecipientWindRoseDetails';
import { fetchRecipientDocuments } from '../../../components/profilePage/actions/recipientActions/getRecipientDocuments';
import { updateBarChartOnArcHover } from '../../../components/profilePage/actions/recipientActions/budgetVsExpenseCharts';
import { loadRecipientProfileMapData } from '../../../shared/actions/mapActions/recipientProfileMapData';
import { loadDonorProfileMapData } from '../../../shared/actions/mapActions/donorProfileMapData';
import { loadOutputsMapData } from '../../../shared/actions/mapActions/fetchMapOutputs';
import GenerateDonorSummary from '../../../components/profilePage/components/generateDonorSummary';

import style from './style';


class ProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listSelected: false,
            totalDataSize: 0,
            currentYear: this.props.year,
            budgetType: this.props.budgetType,
            selectedCountry: {
                name: '',
                iso2: '',
                iso3: '',
                email: '',
                web: ''
            },
            projectList: [],
        }
        this.sectorSelected = '';
        this.categorySelected = '';

        this.mapTilte = {
            "donorprofile": "Donor Profile",
            "recipientprofile": "Recipient Profile"
        }
        this.mapBudgeType = {
            direct:'Direct Funded Projects',
            regular:'UNDP Regular Resources'
        }

    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.projectList != this.props.projectList) {
            let data = nextProps.projectList.data;
            let parseData = (data) => {
                data.forEach((item) => {
                    item.country_name = item.country;
                    item.probObj = {
                        title: item.title,
                        project_id: item.project_id
                    }
                    item.total_budget = item.budget == null ? 0 : item.budget
                    item.total_expense = item.expense == null ? 0 : item.expense
                })
                return data
            }
            this.setState({ projectList: parseData(data), totalDataSize: nextProps.projectList.count, links: nextProps.projectList.links })
        }
        // if (nextProps.selectedCountry != this.props.selectedCountry) {
        //     if (nextProps.profileType === 'donorprofile') {
        //         this.props.getDonorDetails(
        //             nextProps.selectedCountry.iso3,
        //             this.props.year);
        //         this.props.loadDonorProfileMapData(this.props.year,
        //             nextProps.selectedCountry.iso3,
        //             this.state.budgetType
        //         )
        //     }
        //     else {
        //         this.props.fetchDocuments(this.props.selectedCountry.iso3,
        //             this.props.year,
        //             this.props.docCategory)
        //         this.props.getRecipientDetails(
        //             nextProps.selectedCountry.iso3,
        //             this.props.year,
        //             this.sectorSelected,
        //             this.categorySelected);
        //         if (nextProps.unitType != 2) {
        //             this.props.loadRecipientProfileMapData(this.props.year, nextProps.selectedCountry.iso3)
        //         }
        //         else
        //             this.props.loadOutputsMapData(this.props.year, nextProps.selectedCountry.iso3)
        //     }

        // }
    }

    componentWillMount() {
        let item;
        if (this.props.profileType === 'donorprofile') {
            this.props.getDonorDetails(this.props.selectedCountry.iso3,
                this.props.year);
            this.props.loadDonorProfileMapData(this.props.year, this.props.selectedCountry.iso3, this.state.budgetType)
        }
        else {
            this.props.fetchDocuments(this.props.selectedCountry.iso3,
                this.props.year,
                this.props.docCategory)
            this.props.getRecipientDetails(this.props.selectedCountry.iso3,
                this.props.year,
                this.sectorSelected);
            if (this.props.unitType != 2)
                this.props.loadRecipientProfileMapData(this.props.year, this.props.selectedCountry.iso3)
            else
                this.props.loadOutputsMapData(this.props.year, this.props.selectedCountry.iso3)
        }
        this.setState({ countryDetails: this.props.selectedCountry })
    }

    render(props, { projectList,
        totalDataSize,
        donutBudget,
        donutModality,
        selectedCountry }) {
        const { recipientBasicDetails,
            themeBudget,
            recipientDocumentList,
            topBudgetSources,
            windRose,
            donorBasicDetails,
            topRecipientOffices,
            recipientMapData,
            donorProfileMapData,
            regularAndOthers,
            contributionToRegular,
            fundModlaitySplitUp,
            otherResourcesContributions,
            budgetVsExpense,
            budgetVsExpenseSdg,
            recepientSdg
        } = props;

        return (
            <div>
                {
                    this.props.title === 'true' ? <div class={style.titleWrapper}>
                        {`${this.mapTilte[props.profileType]}${props.profileType === 'donorprofile'? `- ${this.mapBudgeType[this.props.budgetType]}`:''}`}
                    </div> : null
                }
                {props.profileType !== "recipientprofile" && this.props.fundModality === 'true' ? 
                    <GenerateDonorSummary
                    donorBasicDetails={donorBasicDetails}
                    countryDetails={props.selectedCountry}
                    donutBudget={regularAndOthers}
                    donutModality={fundModlaitySplitUp}
                    displayfundModality={this.props.fundModality}
                    displayContributionSplit={this.props.fundModality}
                    contributionToRegular={contributionToRegular}
                    otherResourcesContributions={otherResourcesContributions}
                    embed={true}
                    listStyle={style.list}
                    labelStyle={style.label}
                    valueStyle={style.value}
                    />
                : 
                null
                }
                <div class={style.statsWrapper}>
                {
                    this.props.stats === 'true' ?
                        props.profileType == "recipientprofile" ?
                            <div>
                                {
                                    recipientBasicDetails.loading ?
                                        <div style={{ position: "relative", height: 83 }}>
                                            <PreLoader />
                                        </div>
                                        :
                                        <ul class={style.list}>
                                            <li>
                                                <span class={style.value}>{recipientBasicDetails.data.budget && numberToCurrencyFormatter(recipientBasicDetails.data.budget, 2)}</span>
                                                <span class={style.label}>Budget</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{recipientBasicDetails.data.expense && numberToCurrencyFormatter(recipientBasicDetails.data.expense, 2)}</span>
                                                <span class={style.label}>Expense</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{recipientBasicDetails.data.projects_count && numberToCommaFormatter(recipientBasicDetails.data.projects_count)}</span>
                                                <span class={style.label}>Projects</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{recipientBasicDetails.data.budget_sources && numberToCommaFormatter(recipientBasicDetails.data.budget_sources)}</span>
                                                <span class={style.label}>Donors</span>
                                            </li>
                                        </ul>
                                }
                            </div>
                            :
                            <div>
                                {
                                    donorBasicDetails.loading ?
                                        <div style={{ position: "relative", height: 83 }}>
                                            <PreLoader />
                                        </div>
                                        :
                                        <ul class={style.list}>
                                            <li>
                                                <span class={style.value}>{donorBasicDetails.data.budget ? numberToCurrencyFormatter(donorBasicDetails.data.budget, 2) : numberToCurrencyFormatter(0)}</span>
                                                <span class={style.label}> Budget</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{donorBasicDetails.data.expense ? numberToCurrencyFormatter(donorBasicDetails.data.expense, 2) : numberToCurrencyFormatter(0)}</span>
                                                <span class={style.label}> Expense</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{donorBasicDetails.data.direct_funded_projects ? numberToCommaFormatter(donorBasicDetails.data.direct_funded_projects) : numberToCommaFormatter(0)}</span>
                                                <span class={style.label}>  Direct Funded Projects</span>
                                            </li>
                                            {
                                                donorBasicDetails.data.show_regular_resources > 0 && <li>
                                                    <span class={style.value}>{donorBasicDetails.data.regular_resources ? numberToCommaFormatter(donorBasicDetails.data.regular_resources) : numberToCommaFormatter(0)}</span>
                                                    <span class={style.label}>  UNDP Regular Resources</span>
                                                </li>
                                            }
                                        </ul>
                                }
                            </div>
                        : null
                }
                </div>


                {
                    this.props.map === 'true' ?
                        <div class={style.mapContainer} style={{ position: 'relative', display: 'block' }}>
                            <Map
                                embed={true}
                                clusterMode={this.props.unitType == 2 && props.profileType == "recipientprofile" ? true : false}
                                source={props.profileType == "donorprofile" && this.props.selectedCountry.iso3}
                                budgetType={props.profileType == "donorprofile" && this.state.budgetType}
                                mapData={
                                    this.props.unitType == 1 ? props.profileType == "donorprofile" ?
                                        donorProfileMapData
                                        : recipientMapData
                                        : donorProfileMapData
                                } />
                            <div class={style.disclaimer}>
                                {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                            </div>
                        </div>
                        : null
                }

                {
                    this.props.projectTable === 'true' ?
                        <div style={{ paddingTop: '9px', display: 'block' }}>
                            <div class={style.sectionTitle}>Projects</div>
                            <BootTable count={totalDataSize}
                                loading={this.props.loading}
                                budgetType={props.profileType == "donorprofile" && this.state.budgetType}
                                source={props.profileType == "donorprofile" ? props.selectedCountry.iso3 : ''}
                                unit={props.profileType == "recipientprofile" && props.selectedCountry.iso3}
                                data={projectList}
                                embed={true}
                                year={this.props.year}
                            />
                        </div> : null
                }

                {
                    props.profileType == "recipientprofile" ?
                        <section class={style.outerChartWrapper}>
                            <GenerateRecipientCharts
                                displaybudgetPercThemes={this.props.budgetPercThemes}
                                displaybudgetPercSdg={this.props.budgetPercSdg}
                                displaybudgetSources={this.props.budgetSources}
                                themeList={props.themeList}
                                themeBudget={themeBudget}
                                unitType={props.unitType}
                                setSector={(sector) => this.selectSector(sector)}
                                topBudgetSources={topBudgetSources}
                                countryDetails={props.selectedCountry}
                                windRose={windRose}
                                budgetVsExpense={budgetVsExpense}
                                yearList={this.props.yearList}
                                currentYear={this.props.year}
                                updateBarChartOnArcHover={this.props.updateBarChartOnArcHover}
                                budgetVsExpenseSdg={budgetVsExpenseSdg}
                                recepientSdg={recepientSdg}
                                embed={true}
                            />

                            {
                                this.props.docTable === 'true' ? <div class={style.recipientDocumentWrapper}>
                                  <div class={style.sectionTitle}>Documents</div>
                                    <ProjectDetailDocTable
                                        loading={this.props.documentListLoading}
                                        clearFilter={() => this.clearCategoryFilter()}
                                        categorySelect={(value) => this.selectCategory(value)}
                                        data={recipientDocumentList}
                                        all={'false'}
                                        embed={true}
                                    />
                                </div> : null
                            }
                        </section> : 
                        <GenerateDonorCharts
                            topRecipientOffices={topRecipientOffices}
                            countryDetails={props.selectedCountry}
                            donutBudget={regularAndOthers}
                            donutModality={fundModlaitySplitUp}
                            contributionToRegular={contributionToRegular}
                            otherResourcesContributions={otherResourcesContributions}
                            displayRecepientOffices={this.props.recepientOffices}
                            displayfundModality={this.props.fundModality}
                            displayContributionSplit={this.props.contributionSplit}
                            embed={true}/>
                             
                }

            </div>
        )
    }
}







const mapStateToProps = (state) => {
    // Donor Profile
    const donorBasicDetails = state.donorProfile.basicDetails ?
        state.donorProfile.basicDetails : [],
        topRecipientOffices = state.donorProfile.topRecipientOffices.data ?
            state.donorProfile.topRecipientOffices.data : [],
        regularAndOthers = state.donorProfile.regularAndOthers.data.country ?
            state.donorProfile.regularAndOthers.data.country : [],
        contributionToRegular = state.donorProfile.regularAndOthers.data.country ?
            state.donorProfile.regularAndOthers.data.country : [],
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
        budgetVsExpense = state.recipientProfile.budgetVsExpense ? state.recipientProfile.budgetVsExpense : [],
        budgetVsExpenseSdg = state.recipientProfile.budgetVsExpenseSdg,
        yearList = state.yearList;

    const { recipientMapData, donorProfileMapData } = state.mapData

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
        yearList

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
        updateBarChartOnArcHover: (data) => dispatch(updateBarChartOnArcHover(data)),
        loadOutputsMapData: (year, unit, sector, source, project_id, budget_type) => dispatch(loadOutputsMapData(year, unit, sector, source, project_id, budget_type)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage)
