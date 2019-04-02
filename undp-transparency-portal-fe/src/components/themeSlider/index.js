import { h, Component } from 'preact';
import style from './style';
import { Scrollbars } from 'react-custom-scrollbars';
import GroupedbarChart from '../grouped-bar-chart';
import {
    numberToCurrencyFormatter,
    numberToCommaFormatter
} from '../../utils/numberFormatter';
import BudgetExpenseLegend from '../budget-expense-legend';
import NoDataTemplate from '../no-data-template';
import PreLoader from '../preLoader';
import DonutChart from '../donutChart';
import { budgetSource } from '../../assets/json/legendData';
import { getAPIBaseUrRl } from '../../utils/commonMethods';
import commonConstants from '../../utils/constants';
export default class ThemeSlider extends Component {

    generateHeaderList = (data) => {
        return (
            <ul class={style.summarySection}>
                <li class={style.summaryDetails}>
                    <span class={style.summaryHeading}>
                        {'Budget'}</span>
                    <span class={style.expense}>
                        {numberToCurrencyFormatter(data.budget_amount, 2)}
                    </span>
                </li>
                <li class={style.summaryDetails}>
                <span class={style.summaryHeading}>
                        {'Expense'}</span>
                    <span class={style.expense}>
                        {numberToCurrencyFormatter(data.expense_amount, 2)}
                    </span>
                </li>
                <li class={style.summaryDetails}>
                <span class={style.summaryHeading}>
                        {'Projects'}</span>
                    <span class={style.expense}>
                        {numberToCommaFormatter(data.projects)}
                    </span>
                </li>
                <li class={style.summaryDetails}>
                <span class={style.summaryHeading}>
                        {'Donors'}</span>
                    <span class={style.expense}>
                        {numberToCommaFormatter(data.budget_sources)}
                    </span>
                </li>
                <li class={style.summaryDetails}>
                <span class={style.summaryHeading}>
                        {'Countries'}</span>
                    <span class={style.expense}>
                        {numberToCommaFormatter(data.countries)}
                    </span>
                </li>
            </ul>
        )
    }


    render() {
        var isNonEmpty = (Object.keys(this.props.data)).length > 0,
            data = this.props.data,
            isLoading = this.props.loading,
            tabSelected = this.props.tab,
            outcomeChartData = this.props.outcomeData.resourcesModalityContribution;
            // signatureSolutionChartData=null;
        return (
            <div>
                {!isLoading&&isNonEmpty ?
                    <div class={style.themeSlider}>
                        <div class={style.headingWrapper}>
                        {tabSelected === 'themes' ? 
                            <a href= {`/themes/${data.aggregate.sector}/${data.aggregate.sector_name}`}
                            class={style.countryName}>{data.aggregate.sector_name}</a>
                        :
                            <div>
                                <div class={style.imageWrapper}>
                                    <img class={style.ssIcon} src={data.aggregate.ss_id === '0' ? '/assets/icons/placeHolder.svg': getAPIBaseUrRl()+'/media/ss-icons/SS-'+data.aggregate.ss_id+'.svg'} alt="Signature Solutions image"/>
                                </div>
                                <a href={`/signature/${data.aggregate.sector}/${data.aggregate.sector_name}`}
                                    class={ data.aggregate.sector_name.length > 50 ? `${style.countryName} ${style.ssLong}`: `${style.countryName} ${style.ssa}`}>
                                        {data.aggregate.sector_name}
                                </a>
                                <span class={style.closeSlider} onClick={() => this.props.closeSlider()}>
                                </span>
                           </div>
                        }
                           {tabSelected === 'themes' ? <span class={style.closeSlider}
                                onClick={() => this.props.closeSlider()}>
                            </span>:null}
                            
                        </div>
                        <div class={style.scrollSection}>
                            <Scrollbars>
                                <div class={style.year}>{data.aggregate.year}
                                </div>
                                {this.generateHeaderList(data.aggregate)}
                                <div class={tabSelected === 'signature' ? style.theme_slider_wrapper : style.display_none} >
                                    <div class={style.theme_slider_title}>
                                        <span>Our Focus</span>
                                    </div>
                                    {outcomeChartData.data.country.length > 0 ?
                                        <div class={`${style.outcome_chart_wrapper} ${style.outcome_resources_modality}`}>
                                            <DonutChart
                                                donor_wrapper_styles={style.outcome_wrapper_styles}
                                                donut_styles={style.donut_styles}
                                                legend_styles={style.legend_styles}
                                                textWrapperStyle={style.textWrapperStyle}
                                                legendLabel={style.legendLabel}
                                                data={outcomeChartData.data.country}
                                                legendData={outcomeChartData.data.total}
                                                textFieldStyle={style.textFieldStyle}
                                                donutCenterText={style.donutCenterText}
                                                dollor={style.dollor}
                                                chartWidth={560}
                                                chartHeight={400} chart_id={'outcomes_chart'} />
                                        </div>
                                        :
                                        <NoDataTemplate />
                                    }
                                </div>
                                <div class={tabSelected === 'themes' && data.aggregate.year >= commonConstants.SIGNATURE_SOLUTION_YEAR ? style.theme_slider_wrapper : style.display_none} >
                                    <div class={style.theme_slider_title}>
                                        <span>Signature Solutions</span>
                                    </div>
                                    {outcomeChartData.loading ?
                                        <div style={{ position: "relative", height: 200 }}>
                                            <PreLoader />
                                        </div> 
                                        : 
                                        outcomeChartData.data.country.length > 0 ?
                                            <div class={`${style.outcome_chart_wrapper} ${style.outcome_resources_modality}`}>
                                                <DonutChart
                                                    donor_wrapper_styles={style.outcome_wrapper_styles}
                                                    donut_styles={style.donut_styles}
                                                    legend_styles={style.legend_styles}
                                                    textWrapperStyle={style.textWrapperStyle}
                                                    legendLabel={style.legendLabel}
                                                    data={outcomeChartData.data.country}
                                                    legendData={outcomeChartData.data.total}
                                                    textFieldStyle={style.textFieldStyle}
                                                    donutCenterText={style.donutCenterText}
                                                    dollor={style.dollor}
                                                    chartWidth={560}
                                                    chartHeight={400} chart_id={'signatureSolution_chart'} />
                                            </div>
                                        :
                                        <NoDataTemplate />
                                    }
                                </div>
                                <div class={style.theme_slider_wrapper}>
                                    <div class={style.theme_slider_title}>
                                        <span>Top 5 Donors</span>
                                        <BudgetExpenseLegend />
                                    </div>
                                    <div class={style.grouped_bar_chart}>
                                        {data.budget_sources.length > 0 ?
                                            <GroupedbarChart
                                                chart_id='budget_sources'
                                                width={1200}
                                                height={600}
                                                slice_limit ={5}
                                                translate_xaxis={60}
                                                translate_yaxis={100}
                                                translate_graph={80}
                                                data={data.budget_sources}
                                                label={'short_name'}
                                                min_height={650}
                                                tspanSize={'28px'}
                                                textSize={'28px'}
                                            />
                                            :
                                            <NoDataTemplate />
                                        }
                                    </div>
                                </div>
                                <div class={style.theme_slider_wrapper}>
                                    <div class={style.theme_slider_title}>
                                        <span>Top 5 Recipient Offices</span>
                                        <BudgetExpenseLegend />
                                    </div>
                                    <div class={style.grouped_bar_chart}>
                                        {data.top_recipient_offices.length > 0 ?
                                            <GroupedbarChart
                                                chart_id='recipient_offices'
                                                width={1200}
                                                height={600}
                                                slice_limit ={5}
                                                translate_xaxis={60}
                                                translate_yaxis={100}
                                                translate_graph={80}
                                                data={data.top_recipient_offices}
                                                label={'iso3'}
                                                recipientLabel = {'name'}
                                                min_height={650}
                                                tspanSize={'28px'}
                                                textSize={'28px'}
                                                />
                                            :
                                            <NoDataTemplate />
                                        }
                                    </div>
                                </div>
                            </Scrollbars>
                        </div>
                    </div>
                    :
                    <div style={{ position: "relative", height: 544 }}>
                  <PreLoader />
              </div>
                }</div>
        )
    }
}