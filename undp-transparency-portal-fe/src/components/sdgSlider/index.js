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
import { getSDGImageFromCode } from '../../utils/commonActionUtils';
import PreLoader from '../preLoader';
import PercentageBarChart from '../../components/percentageBarChart';
export default class SdgSlider extends Component {

    generateHeaderList = (data) => {
        return (
            <ul class={style.summarySection}>
                <li class={style.summaryDetails}>
                    <span class={style.summaryHeading}>
                        {'Budget'}</span>
                    <span class={style.expense}>
                        {numberToCurrencyFormatter(data.total_budget, 2)}
                    </span>
                </li>
                <li class={style.summaryDetails}>
                <span class={style.summaryHeading}>
                        {'Expense'}</span>
                    <span class={style.expense}>
                        {numberToCurrencyFormatter(data.total_expense, 2)}
                    </span>
                </li>
                <li class={style.summaryDetails}>
                <span class={style.summaryHeading}>
                        {'Projects'}</span>
                    <span class={style.expense}>
                        {numberToCommaFormatter(data.total_projects)}
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
            sdg_src =data&& data.aggregate && data.aggregate.sdg && getSDGImageFromCode(data.aggregate.sdg),
            sdgTargetData = this.props.sdgTargetData;
        
        return (
            <div>
                {!isLoading&&isNonEmpty ?
                    <div class={style.themeSlider}>
                        <div class={style.headingWrapper}>
                            <div>
                               {data.aggregate.sdg && <div class={style.imageWrapper}><img class={style.sdg_image} src={`./../assets/icons/${sdg_src}`} alt="sdg icon"/></div>}

                                    <a href={`/sdg/${data.aggregate.sdg}/${data.aggregate.sdg_name}`}
                                        class={style.countryName}>{data.aggregate.sdg_name}</a>

                            <span class={style.closeSlider}
                                onClick={() => this.props.closeSlider()}>
                            </span>

                            </div>
                        </div>
                        <div class={style.scrollSection}>
                            <Scrollbars>
                                <div class={style.year}>{data.aggregate.year}
                                </div>
                                {this.generateHeaderList(data.aggregate)}
                                <div class={style.theme_slider_wrapper}>
                                    <div class={style.theme_slider_title}>
                                        <span>Targets</span>
                                    </div>
                                    {!sdgTargetData.loading ?
                                        Object.keys(sdgTargetData.data).length && sdgTargetData.data.percentage && sdgTargetData.data.percentage.length > 0 ?
                                        <div class={style.per_bar_chart}>
                                            <PercentageBarChart data={sdgTargetData.data.percentage} />
                                        </div>:
                                        <NoDataTemplate />
                                        :
                                        <div style={{ position: "relative", height: 544 }}>
                                            <PreLoader />
                                        </div>
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
                                                chart_id='budget_sources_sdg'
                                                width={1200}
                                                height={600}
                                                slice_limit ={5}
                                                translate_xaxis={60}
                                                translate_yaxis={100}
                                                translate_graph={80}
                                                data={data.budget_sources}
                                                label={'short_name'}
                                                fullLabel={'organisation_name'}
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
                                                chart_id='recipient_offices_sdg'
                                                width={1200}
                                                height={600}
                                                slice_limit ={5}
                                                translate_xaxis={60}
                                                translate_yaxis={100}
                                                translate_graph={80}
                                                data={data.top_recipient_offices}
                                                label={'iso3'}
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
                    </div>:
                       <div style={{ position: "relative", height: 544 }}>
                       <PreLoader />
                   </div>
                }</div>
        )
    }
}