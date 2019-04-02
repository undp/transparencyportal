import style from './style';
import DonorDonutChart from '../../../components/donorDonutChart';
import GroupedbarChart from '../../grouped-bar-chart'
import ContributionIndicator from '../../contribution-indicator'
import DonorContributionChart from '../../donor-contribution-chart'
import NoDataTemplate from '../../no-data-template'
import BudgetExpenseLegend from '../../budget-expense-legend'
import { isAllPercentageZero } from '../../../utils/commonActionUtils'
import { budgetSource } from '../../../assets/json/legendData'
import { regularAndOthersSplitter } from '../helper'
import PreLoader from '../../preLoader';
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter';

const generateDonorSummary = ({
    countryDetails,
    donutBudget,
    donutModality,
    otherResourcesContributions,
    embed,
    displayContributionSplit,
    displayfundModality,
    donorBasicDetails,
    baseURL,
    donorUrl,
    listStyle,
    labelStyle,
    valueStyle
}) => {
    const countryDetailName = countryDetails && countryDetails.name ? countryDetails.name : "";
    let result = {
        isChanged: false,
        data: []
    }
    let totalContribution
    if (donutBudget.length &&
        donutModality.length &&
        result.isChanged === false) {
        let regular = JSON.parse(JSON.stringify(donutBudget)),
            others = JSON.parse(JSON.stringify(donutModality));
        result = regularAndOthersSplitter(regular, others)
    }
    if (donutBudget.length) {
        totalContribution = donutBudget.map(item => item.total_contribution).reduce((prev, next) => prev + next);
    }
    let iso3 = countryDetails.level_3_code ? countryDetails.level_3_code : countryDetails.iso3;
    
    return (
        // Donor Profile  start
        <section>
            <div>
                {!donorBasicDetails.loading && !embed ? <img class={style.flagIcon} onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}} src={countryDetails.unit_type !== 'OTH' ? baseURL + '/media/flag_icons/' + iso3 + '.svg' : donorUrl} /> : null}
                {
                    donorBasicDetails.loading ?
                        <div style={{ position: "relative", height: 83 }}>
                            <PreLoader />
                        </div>
                        :
                        <ul class={`${style.list} ${style.ulWithFlag} ${listStyle}`}>
                            <li>
                                <span class={`${style.value} ${valueStyle}`}>{totalContribution ? numberToCurrencyFormatter(totalContribution, 2) : numberToCurrencyFormatter(0)}</span>
                                <span class={`${style.label} ${labelStyle}`}> Total Contribution</span>
                            </li>

                        </ul>
                }
            </div>
            {/* Donor Profile First Row start*/}
            {
                (embed &&
                    (displayContributionSplit
                        && displayContributionSplit === 'true') ||
                    (displayfundModality
                        && displayfundModality === 'true')) || !embed ?
                    <div class={`${style.wrapper} ${style.chartWrapper}`}>
                        <section class={`${style.contribution_other_resource_wrapper}`}>
                            {/* Donor Profile Contribution to Regular and Other Resources start*/}
                            {(embed && displayContributionSplit && displayContributionSplit === 'true') || !embed ?
                                <div class={`${style.chartSmall}`}>
                                    <span class={style.chartHead}>
                                        {countryDetailName}'s Contribution to Regular and Other Resources
                                    </span>
                                    {(result.data.length == 0 || isAllPercentageZero('percentage', result.data)) ?
                                        <NoDataTemplate /> :
                                        <DonorDonutChart
                                            regularOtherData={donutBudget}
                                            donor_wrapper_styles={style.donor_wrapper_styles}
                                            donut_styles={style.donut_styles}
                                            legend_styles={style.legend_styles}
                                            data={result.data}
                                            legendData={[...budgetSource, ...otherResourcesContributions]}
                                            chartWidth={456}
                                            chartHeight={456}
                                            textFieldStyle={style.textFieldStyle}
                                            chart_id={'country_contribution'}
                                            textWrapperStyle={style.textWrapperStyle}
                                            perc={embed ? style.perc:''}
                                            dollor={embed ? style.dollor:''}
                                        />
                                    }
                                </div> : null
                            }
                            {(embed && displayfundModality && displayfundModality === 'true') || !embed ?
                                <div class={`${style.chartSmall}`}>
                                    <span class={style.chartHead}>
                                        Contribution - {countryDetailName} vs All Donors
                                    </span>
                                    {
                                        otherResourcesContributions.length ?
                                            <div class={style.progress}>
                                                <DonorContributionChart
                                                    data={otherResourcesContributions}
                                                    country={countryDetailName} />

                                            </div>
                                            : <NoDataTemplate />
                                    }
                                </div> : null}
                        </section>
                    </div>
                    : null
            }
            {/* Donor Profile First Row end*/}
        </section>
    )
}
export default generateDonorSummary
