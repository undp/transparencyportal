/**************************** Preact files ******************************/
import { h, Component } from 'preact';
/**************************** Custom components *************************/
import Map from '../../../components/map';                      // Themes Map
import BootTable from '../../../components/bootstraptable';     // Themes Profile Projects Table
import BudgetExpenseLegend from '../../budget-expense-legend';   // Budget Expense Legend
import GroupedbarChart from '../../grouped-bar-chart';          // Themes Top Budget Sources, Top Recipient Offices
import NoDataTemplate from '../../no-data-template';            // No Data Template
import PreLoader from '../../preLoader';                         // No Data Template
import DonutChart from '../../donutChart';
/**************************** Util Actions *******************************/
import {
    numberToDollarFormatter,
    numberToCurrencyFormatter,
    numberToCommaFormatter
} from '../../../utils/numberFormatter';
/**************************** Style Files ********************************/
import style from './style';
/*************************************************************************/
import { getAPIBaseUrRl } from '../../../utils/commonMethods';

export default class SignaturePage extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            themeSliderData: {},    // Theme Slider Data object
            themesMapData: {},       // Theme Map Data object
            projectList: {},
            listSelected: false,
            totalDataSize: 0,
            links: '',
            projectListArr: []
        }
    }
    componentDidMount() {
        this.props.fetchSignatureSliderData(this.props.currentYear, this.props.sector_code);
        this.props.loadThemesMapData(this.props.currentYear, '','','',this.props.sector_code);
        this.props.fetchSignatureOutcome(this.props.sector_code, this.props.currentYear);
        this.props.updateSignatureSolution(this.props.sector_code);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.currentYear != this.props.currentYear) {
            this.props.fetchSignatureSliderData(nextProps.currentYear, this.props.sector_code);
            this.props.loadThemesMapData(nextProps.currentYear, '','','',this.props.sector_code);
            this.props.fetchSignatureOutcome(this.props.sector_code, this.props.currentYear);
        }
        if (Object.keys(nextProps.themeSliderData.data).length) {
            this.setState({
                themeSliderData: nextProps.themeSliderData
            })
        }
        if (Object.keys(nextProps.themesMapData.data).length) {
            this.setState({
                themesMapData: nextProps.themesMapData
            })
        }
        if (Object.keys(nextProps.projectList.projectList.data).length) {
            this.setState({
                projectList: nextProps.projectList
            })
        }
        if  (Object.keys(nextProps.outcomeData.resourcesModalityContribution.data).length)  {
            this.setState({
                outcomeChartData: nextProps.outcomeData
            })
        }
        
        if (nextProps.projectList.projectList != this.props.projectList.projectList) {
            let data = nextProps.projectList.projectList.data;
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
            this.setState({
                projectListArr: parseData(data),
                totalDataSize: nextProps.projectList.projectList.count,
                links: nextProps.projectList.projectList.links
            })
        }

    }


    render(props, { projectList,
        totalDataSize,
        themesMapData,
        themeSliderData,
        outcomeChartData,
        projectListArr }) {
        const {
         } = props;
        var isNonEmpty = Object.keys(this.state.themeSliderData).length,
            isMapDataNonEmpty = Object.keys(this.state.themesMapData).length,
            isProjectListNonEmpty = (this.state.projectList &&
                this.state.projectList.projectList) ?
                Object.keys(this.state.projectList.projectList).length : 0,

            aggregate = isNonEmpty ? (themeSliderData.data && themeSliderData.data.aggregate) : {},
            budget_sources = isNonEmpty ? (themeSliderData.data && themeSliderData.data.budget_sources) : {},
            top_recipient_offices = isNonEmpty ? (themeSliderData.data && themeSliderData.data.top_recipient_offices) : {},
            mapData = isMapDataNonEmpty ? (themesMapData && themesMapData.data) && themesMapData : {},
            themeSliderData = this.props.themeSliderData,
            outcomeChartData = this.props.outcomeData.resourcesModalityContribution;
        
        return (
            <div class={style.profile_page_container}>
                <div class={style.wrapper}>
                    <div>
                        {
                            themeSliderData.loading ?
                                <div style={{ position: "relative", height: 83 }}>
                                    <PreLoader />
                                </div>
                                :
                                <div class={style.infoWrapper}>
                                <div class={style.imageWrapper}>
                                    <img class={style.ss_image} src={aggregate.ss_id === '0' ? `/assets/icons/placeHolder.svg` : getAPIBaseUrRl()+'/media/ss-icons/SS-'+aggregate.ss_id+'.svg'} alt="ss icon" />
                                </div>
                                    <div class={style.tableWrapper}>    
                                        <ul class={style.list}>
                                            <li>
                                                <span class={style.value}>{aggregate.budget_amount && numberToCurrencyFormatter(aggregate.budget_amount, 2)}</span>
                                                <span class={style.label}>Budget</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{aggregate.expense_amount && numberToCurrencyFormatter(aggregate.expense_amount, 2)}</span>
                                                <span class={style.label}>Expense</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{aggregate.projects && numberToCommaFormatter(aggregate.projects)}</span>
                                                <span class={style.label}>Projects</span>
                                            </li>
                                            <li>
                                                <span class={style.value}>{aggregate.budget_sources && numberToCommaFormatter(aggregate.budget_sources)}</span>
                                                <span class={style.label}>Donors</span>
                                            </li>
                                        </ul>
                                    </div>
                            </div>
                        }
                    </div>
                </div>
                <div class={style.mapWrapper} style={this.state.listSelected && { height: 'auto' }}>
                    <span class={style.mapSwitchContainer}>
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
                    {   <div>
                            <div style={{ paddingTop: '9px', display: this.state.listSelected ? 'block' : 'none'  }}>
                                    <BootTable count={totalDataSize}
                                        currentYear={this.props.currentYear}
                                        theme= {''}
                                        data={projectListArr}
                                        signatureSolution = {this.props.sector_code}
                                         />
                            </div>
                            <div class={style.mapContainer} style={{ position:'relative',display: this.state.listSelected ? 'none' : 'block' }}>
                                {isMapDataNonEmpty ?
                                    <Map
                                        
                                        mapData={mapData} 
                                        signatureSolution={'true'}
                                    />:<PreLoader/>
                                }
                                {
						            !this.state.listSelected ? window.dispatchEvent(new Event('resize')) : null
					            }
                                {isMapDataNonEmpty ? <div class={style.disclaimer}>
                                {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                            </div>:null}


                            </div>
                        </div>
                    }
                </div>
                {/* Top Budget Sources start*/}
                <div class={`${style.wrapper} ${style.chartWrapper}`}>
                    <div class={style.top_budget_sources_wrapper}>
                        <span class={style.chartHead}>
                            <span>Our Focus</span>
                        </span>
                        { this.props.outcomeData.resourcesModalityContribution.loading ?
                        <div style={{ position: "relative", height: 344 }}>
                            <PreLoader />
                        </div>
                            :
                        <div>
                            {outcomeChartData.data.country.length > 0 ?
                                <div class={`${style.outcome_chart_wrapper} ${style.outcome_resources_modality}`}>
                                    <DonutChart
                                        donor_wrapper_styles={style.outcome_wrapper_styles}
                                        donut_styles={style.donut_styles}
                                        legend_styles={style.legend_styles}
                                        textWrapperStyle={style.textWrapperStyle}
                                        textFieldStyle={style.textFieldStyle}
                                        ourFocusLegendStyles={style.our_focus_legend_styles}
                                        legendLabel={style.legendLabel}
                                        data={outcomeChartData.data.country}
                                        legendData={outcomeChartData.data.total}
                                        svgIe={style.svgIe}
                                        chartWidth={560}
                                        chartHeight={400} chart_id={'outcomes_chart_signature'} />
                                </div>
                                :
                                <NoDataTemplate />
                            }
                        </div>
                    }
                    </div>
                </div>
                {/* Top Budget Sources end*/}
                {/* Top Budget Sources start*/}
                <div class={`${style.wrapper} ${style.chartWrapper}`}>
                    <div class={style.top_budget_sources_wrapper}>
                        <span class={style.chartHead}>
                            <span>Top 10 Donors</span>
                            <BudgetExpenseLegend />
                        </span>

                        {
                            themeSliderData.loading ?
                                <div style={{ position: "relative", height: 344 }}>
                                    <PreLoader />
                                </div>

                                :
                                <div>
                                    {
                                        budget_sources.length > 0 ?
                                            <div class={style.budget_sources_wrapper}>
                                                <GroupedbarChart
                                                    chart_id="themes_profile_budget_sources"
                                                    width={1250}
                                                    height={500}
                                                    min_height={540}
                                                    data={budget_sources}
                                                    label={'short_name'}
                                                    tspanSize={'12px'}
                                                    textSize={'12px'} />
                                            </div>
                                            :
                                            <NoDataTemplate />

                                    }
                                </div>
                        }
                    </div>
                </div>
                {/* Top Budget Sources end*/}
                {/* Top Recipient Offices start*/}
                <div class={`${style.wrapper} ${style.chartWrapper}`}>
                    <div class={style.top_budget_sources_wrapper}>
                        <span class={style.chartHead}>
                            <span>Top 10 Recipient Offices</span>
                            <BudgetExpenseLegend />
                        </span>
                        {
                            themeSliderData.loading ?
                                <div style={{ position: "relative", height: 344 }}>
                                    <PreLoader />
                                </div>

                                :
                                <div>
                                    {
                                        top_recipient_offices.length > 0 ?
                                            <div class={style.budget_sources_wrapper}>
                                                <GroupedbarChart
                                                    chart_id="themes_profile_top_recipient_offices"
                                                    width={1250}
                                                    height={500}
                                                    min_height={540}
                                                    data={top_recipient_offices}
                                                    label={'iso3'}
                                                    tspanSize={'12px'}
                                                    textSize={'12px'} />
                                            </div>
                                            :
                                            <NoDataTemplate />

                                    }
                                </div>
                        }
                    </div>

                </div>
                {/* Top Recipient Offices end*/}
            </div>
        )
    }
}
