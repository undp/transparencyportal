import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import PreLoader from '../../../components/preLoader';
import { fetchSignatureSliderData } from '../../../components/themeSlider/actions/signatureDonor';
import { loadSignatureMapData } from '../../../shared/actions/mapActions/signatureMapData';
import Map from '../../../components/map';
import { updateProjectList } from '../../../shared/actions/getProjectList';
import BootTable from '../../../components/bootstraptable';
import BudgetExpenseLegend from '../../../components/budget-expense-legend';
import GroupedbarChart from '../../../components/grouped-bar-chart';          // Themes Top Budget Sources, Top Recipient Offices
import NoDataTemplate from '../../../components/no-data-template';
import { fetchSignatureOutcome } from '../../../components/themeSlider/actions/signatureOutcome';
import DonutChart from '../../../components/donutChart';
import {
    numberToDollarFormatter,
    numberToCurrencyFormatter,
    numberToCommaFormatter
} from '../../../utils/numberFormatter';
import { updateSignatureSolution } from '../../../components/sideBar/action/updateSS';

import style from './style';


class EmbedSignatureView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectListArr: [],
            totalDataSize: 0,
            links: {},
            themeSliderData: {},    // Theme Slider Data object
            signatureMapData: {},       // Theme Map Data object
            projectList: {},
            outcomeChartData : {}
        }
    }

    componentWillMount() {
        this.props.fetchSignatureSliderData(this.props.year, this.props.themes);
        this.props.loadSignatureMapData(this.props.year, this.props.themes);
        this.props.fetchSignatureOutcome(this.props.themes, this.props.year);
        this.props.updateSignatureSolution(this.props.themes);
    }

    componentWillReceiveProps(nextProps) {

        if (Object.keys(nextProps.themeSliderData.data).length) {
            this.setState({
                themeSliderData: nextProps.themeSliderData
            })
        }
        if (Object.keys(nextProps.signatureMapData.data).length) {
            this.setState({
                signatureMapData: nextProps.signatureMapData
            })
        }
        if (Object.keys(nextProps.projectList.projectList.data).length) {
            this.setState({
                projectList: nextProps.projectList
            })
        }
        
        if (Object.keys(nextProps.outcomeChartData.data).length) {
            this.setState({
                outcomeChartData: nextProps.outcomeChartData
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
                    item.total_budget = item.budget == null ? 0 : item.budget;
                    item.total_expense = item.expense == null ? 0 : item.expense;
                })
                return data;
            }
            this.setState({
                projectListArr: parseData(data),
                totalDataSize: nextProps.projectList.projectList.count,
                links: nextProps.projectList.projectList.links
            })
        }
    }

    render(props, {
    projectListArr,
        totalDataSize,
        links,
        projectList,
        signatureMapData,
        themeSliderData,
        outcomeChartData
    }) {
        const {
        } = props;

 

        
        var isNonEmpty = Object.keys(this.state.themeSliderData).length,
            isMapDataNonEmpty = Object.keys(this.state.signatureMapData).length,
            isOutcomeNonEmpty = Object.keys(this.state.outcomeChartData).length,
            isProjectListNonEmpty = (this.state.projectList &&
                this.state.projectList.projectList) ?
                Object.keys(this.state.projectList.projectList).length : 0,

            aggregate = isNonEmpty ? (themeSliderData.data && themeSliderData.data.aggregate) : {},
            budgetSources = isNonEmpty ? (themeSliderData.data && themeSliderData.data.budget_sources) : {},
            recepientOffices = isNonEmpty ? (themeSliderData.data && themeSliderData.data.top_recipient_offices) : {},
            mapData = isMapDataNonEmpty ? (signatureMapData && signatureMapData.data) && signatureMapData : {},
            outcomeChartData = isMapDataNonEmpty && this.state.outcomeChartData ? this.state.outcomeChartData : {}
            
            return (
            <div>

                {
                    this.props.title === 'true' ?
                        <div>
                            <div class={style.titleWrapper}> SIGNATURE SOLUTIONS </div>
                            <div class={style.titleWrapper}> {this.props.themes} - {this.props.themesLabel}</div>
                        </div>
                        : null
                }
                <div class={style.wrapper}>
                    {
                         this.props.themeSliderData.loading ?
                            <div style={{ position: "relative", height: 83 }}>
                                <PreLoader />
                            </div>
                            :this.props.stats === 'true' ?
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
                            :null
                    }
                </div>
                {this.props.map === 'true' ?
                    <div class={style.mapContainer} style={{ position: 'relative', display: 'block' }}>
                        
                        {isMapDataNonEmpty ?
                            <Map
                                mapData={mapData}
                                yearSelected={this.props.year}
                                signatureSolution={'true'}
                            />
                            : <PreLoader />
                        }
                        {isMapDataNonEmpty ?
                            <div class={style.disclaimer}>
                                 <ul><li> The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.</li><li> References to Kosovo* shall be understood to be in the context of UN Security Council resolution 1244 (1999)</li>
    </ul>
                            </div> :
                            null}
                    </div>
                    : null}
                {this.props.projectTable === 'true' ?
                    <BootTable count={totalDataSize}
                    yearSelected={this.props.year}
                    theme= {''}
                    data={projectListArr}
                    signatureSolution = {this.props.themes}
                     />
                    : null}
                {this.props.ourFocus === 'true' ?
                    <div class={`${style.wrapper} ${style.chartWrapper}`}>
                        <div class={style.top_budget_sources_wrapper}>
                            <span class={style.chartHead}>
                                <span>Our Focus</span>
                            </span>

                            {
                                (outcomeChartData && outcomeChartData.data && outcomeChartData.loading) ?
                                    <div style={{ position: "relative", height: 344 }}>
                                        <PreLoader />
                                    </div>
                                    :
                                    <div>
                                        { (outcomeChartData && outcomeChartData.data &&  outcomeChartData.data.country.length) > 0 ?
                                            <div class={`${style.outcome_chart_wrapper} ${style.outcome_resources_modality}`}>
                                                <DonutChart
                                                    donor_wrapper_styles={style.outcome_wrapper_styles}
                                                    donut_styles={style.donut_styles}
                                                    legend_styles={style.legend_styles}
                                                    textWrapperStyle={style.textWrapperStyle}
                                                    textFieldStyle={style.textFieldStyle}
                                                    data={outcomeChartData.data.country}
                                                    legendData={outcomeChartData.data.total}
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
                : null}
                {this.props.budgetSources === 'true' ?
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
                                            budgetSources.length > 0 ?
                                                <div class={style.budget_sources_wrapper}>
                                                    <GroupedbarChart
                                                        chart_id="themes_embed_budget_sources"
                                                        width={1250}
                                                        height={500}
                                                        min_height={540}
                                                        data={budgetSources}
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
                    : null}
                {this.props.recepientOffices === 'true' ?
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
                                            recepientOffices.length > 0 ?
                                                <div class={style.budget_sources_wrapper}>
                                                    <GroupedbarChart
                                                        chart_id="themes_embed_top_recipient_offices"
                                                        width={1250}
                                                        height={500}
                                                        min_height={540}
                                                        data={recepientOffices}
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
                    : null}
            </div>
        )
    }

}

const mapStateToProps = (state) => {
    const themeSliderData = state.themeSliderData,
        { signatureMapData } = state.mapData,
        projectList = state.projectList,
        outcomeChartData = state.signatureOutcome;
    return {
        themeSliderData,
        signatureMapData,
        projectList,
        outcomeChartData
    } 
};

const mapDispatchToProps = (dispatch) => ({
    fetchSignatureSliderData: (year, sector) => dispatch(fetchSignatureSliderData(year, sector)),
    loadSignatureMapData: (year, sector) => dispatch(loadSignatureMapData(year, sector)),
    updateSignatureSolution: (signatureSolCode) => dispatch(updateSignatureSolution(signatureSolCode)),
    updateProjectList: (year, unit, source, theme, keyword, limit, offset, budget_type) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budget_type)),
    fetchSignatureOutcome: (code, year) => dispatch(fetchSignatureOutcome(code, year))
});

export default connect(mapStateToProps, mapDispatchToProps)(EmbedSignatureView);
