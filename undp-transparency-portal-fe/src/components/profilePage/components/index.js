/**************************** Preact files ******************************/
import { h, Component } from 'preact';
import { route } from 'preact-router';

/**************************** Custom components *************************/
import Map from '../../../components/map';// Recipient Profile Map
import BootTable from '../../../components/bootstraptable';// Recipient Profile Projects Table
import TabCollection from '../../../components/tabCollection';// Recipient Profile / Donor profile Tabs
import ProjectDetailDocTable from '../../../components/projectDetailDocuTable';// Recipient Profile Document Table
import GenerateRecipientCharts from './generateRecipientCharts';// Recipient Profile Charts
import GenerateDonorCharts from './generateDonorCharts';// Donor Profile Charts
import GenerateDonorSummary from './generateDonorSummary'
import PreLoader from '../../preLoader';
import { hasNumber } from '../../../utils/numberFormatter';


/**************************** Util Actions *******************************/
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter';

/* Style Files */
import style from './style';


export default class ProfilePage extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            listSelected: false,
            totalDataSize: 0,
            currentYear: '',
            budgetType: "direct",
            selectedCountry: {
                name: '',
                iso2: '',
                iso3: '',
                email: '',
                web: '',
                unit_type: ''
            },
            projectList: [],
        };
        this.sectorSelected = '';
        this.categorySelected = '';
        
    }

    generateAccessibilityDetails = () => {
        if (this.props.selectedCountry.web != '' &&
            this.props.selectedCountry.email != '')
            return <div class={style.accessibility}>
                <span>
                    {this.props.selectedCountry.web}
                </span>
                <span>
                    {this.props.selectedCountry.email}
                </span>
            </div>;
        else
            null;
    }
    selectCategory = (category) => {
        
        this.props.getDocCategory && this.props.getDocCategory(category);
        this.categorySelected = category;
        this.props.fetchDocuments(this.props.selectedCountry.iso3,
            this.props.currentYear,
            category);
    }

    selectSector = (sector) => {
        this.sectorSelected = sector.value;
        this.props.fetchWindRose(this.props.selectedCountry.iso3,
            this.props.currentYear,
            sector.value,
            this.categorySelected);
    }

    clearCategoryFilter = () => {
        this.props.swapDocumentList();
    }
    parseData = (data) => {
        data.forEach((item) => {
            item.country_name = item.country.name;
            item.probObj = {
                title: item.title,
                project_id: item.project_id
            };
        });
        return data;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.currentYear != this.props.currentYear) {
            this.setState({
                currentYear: nextProps.currentYear
            }, () => {
                if (nextProps.profileType === 'donorprofile') {
                    this.props.getDonorDetails(this.props.selectedCountry.iso3,
                        nextProps.currentYear);

                    this.props.loadDonorProfileMapData(nextProps.currentYear,
                        this.props.selectedCountry.iso3,
                        this.state.budgetType
                    );
                }
                else {
                    this.props.getRecipientDetails(this.props.selectedCountry.iso3,
                        nextProps.currentYear, this.sectorSelected);
                    this.props.unitType == 2 ?
                        this.props.loadOutputsMapData(nextProps.currentYear, this.props.selectedCountry.iso3)
                        : this.props.loadRecipientProfileMapData(nextProps.currentYear, this.props.selectedCountry.iso3);
                }
            }
            );
            this.props.fetchthemeListData(nextProps.selectedCountry.iso3,'',nextProps.currentYear,1);
        }
        if (nextProps.projectList != this.props.projectList) {
            let data = nextProps.projectList.data;
            let parseData = (data) => {
                data.forEach((item) => {
                    item.country_name = item.country;
                    item.probObj = {
                        title: item.title,
                        project_id: item.project_id
                    };
                    item.total_budget = item.budget == null ? 0 : item.budget;
                    item.total_expense = item.expense == null ? 0 : item.expense;
                });
                return data;
            };
            this.setState({ projectList: parseData(data), totalDataSize: nextProps.projectList.count, links: nextProps.projectList.links });
        }
        if (nextProps.selectedCountry != this.props.selectedCountry) {
            if (nextProps.profileType === 'donorprofile') {
                this.props.getDonorDetails(
                    nextProps.selectedCountry.iso3,
                    nextProps.currentYear);
                this.props.loadDonorProfileMapData(nextProps.currentYear,
                    nextProps.selectedCountry.iso3,
                    this.state.budgetType
                );
            }
            else {
                this.props.getRecipientDetails(
                    nextProps.selectedCountry.iso3,
                    nextProps.currentYear,
                    this.sectorSelected,
                    this.categorySelected);
                if (nextProps.unitType != 2) {
                    this.props.loadRecipientProfileMapData(nextProps.currentYear, nextProps.selectedCountry.iso3);
                }
                else
                    this.props.loadOutputsMapData(nextProps.currentYear, nextProps.selectedCountry.iso3);

            }

        }
    }
    onDonorProfileSelect = (countryCode) => {
        // route(`/profile/${countryCode}/donorprofile`);
        this.type ='Donor';
        this.props.getDonorDetails(this.props.selectedCountry.iso3, this.props.currentYear);
        this.props.loadDonorProfileMapData(this.props.currentYear,
            this.props.selectedCountry.iso3,
            this.state.budgetType
        );
    }
    onRecipientProfileSelect = (countryCode) => {
        // route(`/profile/${countryCode}/recipientprofile`);
        this.type ='Recipient';
        this.props.getRecipientDetails(this.props.selectedCountry.iso3,
            this.props.currentYear,
            this.sectorSelected);
        this.props.unitType == 2 ?
            this.props.loadOutputsMapData(this.props.currentYear, this.props.selectedCountry.iso3)
            : this.props.loadRecipientProfileMapData(this.props.currentYear,
                this.props.selectedCountry.iso3);
    }
    tabChange(value) {
        if (value == "Direct Funded Projects") {
            this.props.getBudgetType && this.props.getBudgetType('direct');
            this.setState({ budgetType: "direct" }, () => {
                this.props.loadDonorProfileMapData(this.props.currentYear, this.props.selectedCountry.iso3, this.state.budgetType);
            });
        }
        else {
            this.props.getBudgetType && this.props.getBudgetType('regular');
            this.setState({ budgetType: "regular" }, () => {
                this.props.loadDonorProfileMapData(this.props.currentYear, this.props.selectedCountry.iso3, this.state.budgetType);
            });
        }
    }
    componentWillMount() {
        let item;
        if (this.props.profileType === 'donorprofile') {
            this.props.getDonorDetails(this.props.selectedCountry.iso3,
                this.props.currentYear);
                this.type ='Donor';
            this.props.loadDonorProfileMapData(this.props.currentYear, this.props.selectedCountry.iso3, this.state.budgetType);
        }
        else {
            this.props.getRecipientDetails(this.props.selectedCountry.iso3,
                this.props.currentYear,
                this.sectorSelected);
                this.type ='Recipient';
            if (this.props.unitType != 2)
                this.props.loadRecipientProfileMapData(this.props.currentYear, this.props.selectedCountry.iso3);
            else
                this.props.loadOutputsMapData(this.props.currentYear, this.props.selectedCountry.iso3);
        }
        this.setState({ countryDetails: this.props.selectedCountry });
    }
    getDonorLogoURL(donor, baseURL){
        let url = baseURL + '/media/flag_icons/'+donor.iso3+'.svg';
        return url;
    }
    onCountrySelect(location) {
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
            recepientSdg,
            baseURL
        } = props;
        return (
            <div class={style.profile_page_container}>
                <div class={style.wrapper}>
                    {props.unitype == 2 && props.profileType == 'recipientprofile' && this.generateAccessibilityDetails()}
                    {
                        props.selectedCountry.is_donor && props.selectedCountry.is_recipient ?
                            <div class={style.btnListWrapper}>
                                <ul class={style.btnList}>
                                    <li onClick={() => this.onRecipientProfileSelect(props.countryCode)}>
                                        <a href={`/profile/${props.countryCode}/recipientprofile`} class={props.profileType == "recipientprofile" && style.active}
                                        >Recipient Profile</a>
                                    </li>
                                    <li onClick={() => this.onDonorProfileSelect(props.countryCode)}>
                                        <a href={`/profile/${props.countryCode}/donorprofile`} class={props.profileType == "donorprofile" && style.active}
                                        >Donor Profile</a>
                                    </li>
                                </ul>
                            </div> : <span></span>
                    }
                    {
                        props.profileType == "recipientprofile" ?
                            null :
                            <GenerateDonorSummary
                                donorBasicDetails={donorBasicDetails}
                                countryDetails={props.selectedCountry}
                                donutBudget={regularAndOthers}
                                donutModality={fundModlaitySplitUp}
                                contributionToRegular={contributionToRegular}
                                otherResourcesContributions={otherResourcesContributions}
                                donorUrl={this.getDonorLogoURL(this.props.selectedCountry, baseURL)}
                                baseURL={baseURL} />}
                    {
                        props.profileType == "recipientprofile" ?
                            <div>
                                {!recipientBasicDetails.loading ? <img class={style.flagIcon} src={this.props.selectedCountry.isRegion ? '/assets/images/Empty.svg' : this.props.selectedCountry.unit_type === 'CO' ? baseURL + '/media/flag_icons/' + this.props.selectedCountry.iso3 + '.svg' : hasNumber(this.props.selectedCountry.iso3) ? '/assets/images/Empty.svg':baseURL + '/media/flag_icons/' + this.props.selectedCountry.iso3 + '.svg'} /> : null}
                                {
                                    recipientBasicDetails.loading ?
                                        <div style={{ position: "relative", height: 83 }}>
                                            <PreLoader />
                                        </div>
 
                                        :
                                        <ul class={`${style.list} ${style.ulWithFlag}`}>
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
                                        <ul class={`${style.list}`}>
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
                    }
                </div>
                <div class={style.mapWrapper} style={this.state.listSelected && { height: 'auto' }}>
                    <span class={style.mapSwitchContainer}>
                        {
                            props.profileType == "donorprofile"
                            &&
                            <div class={style.mapProjectSwitch}>
                                <TabCollection
                                    listClass={style.mapProjectList}
                                    tabChange={(value) => this.tabChange(value)}
                                    elementClass={style.mapProjectButton}
                                    childClass={style.mapProjectItem}
                                    list={donorBasicDetails.data.show_regular_resources > 0 ? ['Direct Funded Projects', 'UNDP Regular Resources'] : ['Direct Funded Projects']}
                                />
                            </div>
                        }
                        <span class={style.mapSwitch}>
                            <button
                                class={this.state.listSelected ? style.mapBtn : `${style.mapBtn} ${style.mapSelected}`}
                                onClick={() => this.setState({ listSelected: false })}
                            >
                                Map
                            </button>
                            <button class={this.state.listSelected ? `${style.mapBtn} ${style.listSelected}` : style.mapBtn}
                                onClick={() => this.setState({ listSelected: true })}>
                                List
                            </button>
                        </span>
                    </span>
                    {<div>
                        <div style={{ paddingTop: '9px', display: this.state.listSelected ? 'block' : 'none' }}>
                            <BootTable count={totalDataSize}
                                loading={this.props.loading}
                                budgetType={props.profileType == "donorprofile" && this.state.budgetType}
                                source={props.profileType == "donorprofile" && props.selectedCountry.iso3}
                                unit={props.profileType == "recipientprofile" && props.selectedCountry.iso3}
                                data={projectList} /></div>

                        <div class={style.mapContainer} style={{ position: 'relative', display: this.state.listSelected ? 'none' : 'block' }}>
                           
                            <Map
                                clusterMode={this.props.selectedCountry.isRegion ? (this.props.outputData.data.length== 1?true: false) : this.props.unitType == 2 && props.profileType == "recipientprofile" ? true : false}
                                source={props.profileType == "donorprofile" && this.props.selectedCountry.iso3}
                                budgetType={props.profileType == "donorprofile" && this.state.budgetType}
                                mapData={
                                    this.props.selectedCountry.isRegion && this.props.outputData.data.length > 0 ? this.props.outputData : this.props.unitType == 1 ? props.profileType == "donorprofile" ?
                                        donorProfileMapData
                                        : recipientMapData
                                        : donorProfileMapData
                                } 
                                code={this.props.countryCode}
                                section={'profilePage'}
                                unit_type={this.props.selectedCountry.unit_type}
                                noZoom = {this.type == "Donor" ? true : false}
                                onCountrySelect = {this.onCountrySelect}
                                isRegion={this.props.selectedCountry.isRegion && this.props.outputData.data.length > 1 }
                                />
                            <div class={style.disclaimer3}>
                            <ul><li> The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.</li><li> References to Kosovo* shall be understood to be in the context of UN Security Council resolution 1244 (1999)</li>
    </ul>
                            </div>
                        </div>
                    </div>
                    }
                    { 
						!this.state.listSelected ? window.dispatchEvent(new Event('resize')) : null
					}
                </div>
                {
                    props.profileType == "recipientprofile" ?
                        <section> <GenerateRecipientCharts
                            themeList={props.themeList}
                            themeBudget={themeBudget}
                            unitType={props.unitType}
                            setSector={(sector) => this.selectSector(sector)}
                            topBudgetSources={topBudgetSources}
                            countryDetails={props.selectedCountry}
                            windRose={windRose}
                            budgetVsExpense={budgetVsExpense}
                            yearList={this.props.yearList}
                            currentYear={this.props.currentYear}
                            updateBarChartOnArcHover={this.props.updateBarChartOnArcHover}
                            budgetVsExpenseSdg={budgetVsExpenseSdg}
                            recepientSdg={recepientSdg}
                        /> 
                            <div class={style.recipientDocumentWrapper}>
                                <ProjectDetailDocTable
                                    loading={this.props.documentListLoading}
                                    clearFilter={() => this.clearCategoryFilter()}
                                    categorySelect={(value) => this.selectCategory(value)}
                                    data={recipientDocumentList}
                                    all={'false'}
                                />
                            </div>
                        </section>
                        : <GenerateDonorCharts
                            topRecipientOffices={topRecipientOffices}
                            countryDetails={props.selectedCountry}
                            donutBudget={regularAndOthers}
                            donutModality={fundModlaitySplitUp}
                            contributionToRegular={contributionToRegular}
                            otherResourcesContributions={otherResourcesContributions} />
                }
                {
                    (props.profileType == "recipientprofile") ?
                        <div class={style.disclaimer}>
                            {'Funding from financial institutions/development banks shown here only include direct contributions to UNDP, and excludes indirect contributions through government financing funded from financial institution/development bank loans or grants'}
                        </div>
                        : ((this.props.donorBasicDetails.data && this.props.donorBasicDetails.data.type_code === 9) ?
                            <div class={style.disclaimer2}>
                                {'*Funding from financial institutions/development banks shown here only include direct contributions to UNDP, and excludes indirect contributions through government financing funded from financial institution/development bank loans or grants'}
                            </div>
                            : null)

                }
            </div>
        );
    }
}
