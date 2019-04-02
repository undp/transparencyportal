import style from './style';
import GroupedbarChart from '../../grouped-bar-chart'
import NoDataTemplate from '../../no-data-template'
import BudgetExpenseLegend from '../../budget-expense-legend'


const generateDonorCharts = ({
    topRecipientOffices,
    embed,
    displayRecepientOffices
}) => {
    return (
        // Donor Profile  start
        <section>
            {/* Donor Profile Third Row start*/}
            {
                (embed && displayRecepientOffices && displayRecepientOffices === 'true') || !embed ?
                    <div class={`${style.wrapper} ${style.chartWrapper}`}>
                        {/* Donor Profile -  Top Recipient Offices start*/}
                        <div class={style.top_budget_sources_wrapper}>
                            <span class={style.chartHead}>
                                <span>{'Top 10 Recipient Offices'}</span>
                                <BudgetExpenseLegend />
                            </span>
                            {
                                topRecipientOffices.length > 0 ?
                                    <div class={style.budget_sources_wrapper}>
                                        <GroupedbarChart
                                            chart_id="donor_profile_top_recipient_offices"
                                            width={1250}
                                            height={500}
                                            min_height={540}
                                            data={topRecipientOffices}
                                            label={'iso3'}
                                            tspanSize={'14px'}
                                            textSize={'14px'} />
                                    </div>
                                    :
                                    <NoDataTemplate />
                            }
                        </div>
                        {/* Donor Profile -   Top Recipient Offices end*/}
                    </div>
                    : null
            }
            {/* Donor Profile Third Row end*/}
        </section>
        // Donor Profile  end
    )
}
export default generateDonorCharts
