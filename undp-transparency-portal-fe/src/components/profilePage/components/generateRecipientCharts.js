import DropDown from '../../../components/filter';
import style from './style';
import WindRoseChart from '../../../components/windRoseChart';
import GroupedbarChart from '../../grouped-bar-chart';
import NoDataTemplate from '../../no-data-template';
import PreLoader from '../../preLoader';
import BudgetExpenseLegend from '../../budget-expense-legend';
import DonutBarChart from '../../donutBarChart';

const generateRecipientCharts = (
	{ countryDetails,
		unitType,
		themeList,
		themeBudget,
		topBudgetSources,
		setSector,
		budgetVsExpense,
		windRose,
		yearList,
		currentYear,
		updateBarChartOnArcHover,
		budgetVsExpenseSdg,
		recepientSdg,
		displaybudgetPercThemes,
		displaybudgetPercSdg,
		displaybudgetSources,
		embed
	})=>  {
	return (
		// Recipient Profile  start
		<section>
			
			{/* Recipient Profile first Row start */}
			<div class={`${style.wrapper} ${style.chartWrapper}`}>

				{/* Recipient Profile Themes section start */}
				{
					!displaybudgetPercThemes || (displaybudgetPercThemes && displaybudgetPercThemes === 'true') ?
						<div class={style.recipient_themes_wrapper}>
							{/* Themes(% of Budget) section start */}
							<div>
								<span class={`${style.chartHead} ${style.chartHead_themes}`}>
									<span class={style.budget_percent}>Our Focus</span>
									<span class={style.budgetExpense} />
								</span>

								<DonutBarChart
									donutData={themeBudget}
									barChartData={budgetVsExpense}
									donutChartId={'country_contribution'}
									recipientProfile={'true'}
								/>


							</div>
							{/* Themes(% of Budget) section end */}
							{/* Themes Budget - Expense start*/}
							<div />
							{/* Themes Budget - Expense end*/}
						</div> : null
				}
				
				{
					!displaybudgetPercSdg || (displaybudgetPercSdg && displaybudgetPercSdg === 'true') ?
						<div class={`${style.recipient_themes_wrapper} ${style.recipient_sdg_wrapper}`}>
							{/* Themes(% of Budget) section start */}
							
							<div>
								<span class={`${style.chartHead} ${style.chartHead_themes}`}>
									<span class={style.budget_percent}>SDG</span>
									<span class={style.budgetExpense} />
									<span class={style.sdgDisclaimer}>
										<span class={style.sdgbuttons}><b>About SDG Data</b></span>
										<span class={style.sdgDisclaimerText}>
											{/* <strong>About SDG data</strong> */}
											<span class={style.textsdg}>
											UNDP’s SDG data is based on the mapping of project outputs to SDG targets.  Each project output can be mapped to maximum three SDG targets to capture UNDP’s multidimensional approaches to complex development challenges.  Financial figures are divided equally to the mapped SDG targets.
										</span>
										</span>
									</span>
								</span>

								<DonutBarChart
									donutData={recepientSdg}
									donutChartId={'sdg_country_contribution'}
									barChartData={budgetVsExpenseSdg}
									sdg={'true'}
									recipientProfile={'true'}
								/>
							</div>
							{/* Themes(% of Budget) section end */}
							{/* Themes Budget - Expense start*/}
							<div />
							{/* Themes Budget - Expense end*/}
						</div> : null
				}
				{/* Recipient Profile Themes section end */}
				
			</div>
			{/* Recipient Profile first Row end */}
			{/* Recipient Profile second Row start */}
			<div class={style.wrapper}>
				{
					!embed && unitType !== 1 ?
					
						<div class={`${style.wrapper} ${style.chartWrapper} ${style.windroseWrapper}`}>
							{/* UNDP Strategic Plan IRRF Indicators Start */}
							<div class={style.wind_rose_wrapper}>
								<span class={style.chartHead}>UNDP Strategic Plan IRRF Indicators</span>
								<span class={style.filterWrapper}>
									<DropDown
										label="Choose Our Focus"
										dropDownClass={style.dropDownWrapper}
										options={themeList.themes}
										handleClick={(value) => setSector(value)}
										placeHolder={windRose.initialSector === '' ? 'Select' : windRose.initialSector}
									/>
								</span>
								{
									windRose.loading ?
										<div style={{ position: 'relative', height: 344 }}>
											<PreLoader />
										</div>
										:
										<div>
											<WindRoseChart data={windRose.data} sectorColor={windRose.sectorColor} />
											{currentYear !== parseInt(windRose.year) ? 
											<div class={style.disclaimerText}>
												{`* Current year data unavailable. Showing figures from ${windRose.year}`}
											</div>
											: null}
										</div>
								}
							</div>
							{/* UNDP Strategic Plan IRRF Indicators End */}
						</div> : null
				}
				{/* Top Budget Sources start*/}

				{

					!displaybudgetSources || (displaybudgetSources && displaybudgetSources === 'true') ? <div class={`${style.wrapper} ${style.chartWrapper}`}>
						<div class={style.top_budget_sources_wrapper}>
							<span class={style.chartHead}>
								<span>Top 10 Donors</span>
								<BudgetExpenseLegend />
							</span>
							{
								topBudgetSources.loading ?
									<div style={{ position: 'relative', height: 344 }}>
										<PreLoader />
									</div>
									:
									topBudgetSources.length > 0 ?
										<div class={style.budget_sources_wrapper}>
											<GroupedbarChart
												chart_id="budget_sources"
												width={1250}
												height={500}
												min_height={540}
												data={topBudgetSources}
												label={'type_level_3'}
												profileLabel={'org_name'}
												tspanSize={'14px'}
												textSize={'14px'}
											/>
										</div>
										:
										<NoDataTemplate />
							}
					</div>
					</div> : null
				}

				{/* Top Budget Sources end*/}
			</div>
			{/* Recipient Profile second Row start */}
		</section>
		// Recipient Profile  end
	);
}
export default generateRecipientCharts;
