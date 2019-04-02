import { h, Component } from 'preact';
import style from './style';
import { Scrollbars } from 'react-custom-scrollbars';
import DonutChart from '../donutChart';
import {
	numberToDollarFormatter, 
	numberToCurrencyFormatter,
	numberToCommaFormatter
} from '../../utils/numberFormatter';
import { route } from 'preact-router';
import ContributionIndicator from '../contribution-indicator';
import List from '../listView';
import NoDataTemplate from '../no-data-template';
import { totalContribution } from '../../assets/json/legendData';
import PreLoader from '../preLoader';
import { getAPIBaseUrRl } from '../../utils/commonMethods';
import DonorContributionChart from '../donor-contribution-chart';
export default class DonorSlider extends Component {

    renderRow = (item, index) => {
    	return (
    		<div class={style.tableRow}>
    			<a
    				href={`/profile/${item.item.ref_id}/donorprofile`}
    				class={style.projectName}>{item.item.org_name}</a>
    			<span class={style.expense}>{numberToDollarFormatter(item.item.total_budget)}</span>
    		</div>
    	);
    }

    render() {
    	var data = this.props.data,
    		basicDetails = data.basicDetails,
    		budgetSources = data.budgetSources,
    		regularAndOthers = data.regularAndOthers,
    		resourcesModalityContribution = data.resourcesModalityContribution,
    		topRecipientOffices = data.topRecipientOffices,
    		isLoading = basicDetails.loading ||
                budgetSources.loading ||
                regularAndOthers.loading ||
                resourcesModalityContribution.loading ||
                topRecipientOffices.loading
		const imgSrc = basicDetails.data.level_3_type ? `${getAPIBaseUrRl()}/media/flag_icons/${basicDetails.data.level_3_type}.svg`: '';
		return (
    		<div>
    			{
    				!isLoading ?
    					<div class={style.donorSlider}> 
    						<div class={style.headingWrapper}>
								<span class={style.closeSlider} onClick={() => this.props.closeSlider()}></span>
								<section class={style.dataSection}>
									<img src={imgSrc } 
										 onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}}
										 class={style.donorLogo} />
    								<a class={style.countryName}
    									href={`/profile/${basicDetails.data.code}/donorprofile`}
    								>{basicDetails.data.donor_name}</a>
								</section>
    						</div>
    						<div class={style.scrollSection}>
    							<Scrollbars>
    								{/* Donor details year start */}
    								<div class={style.year}>{basicDetails.data.year}</div>
    								{/* Donor details year end */}
    								{/* Donor details basic details start */}
    								<ul class={style.summarySection}>
    									<li class={style.summaryDetails}>
    										<span class={style.summaryHeading}>Budget</span>
    										<span>{basicDetails.data.budget ? numberToCurrencyFormatter(basicDetails.data.budget, 2) : numberToCurrencyFormatter(0)}</span>
    									</li>
    									<li class={style.summaryDetails}>
    										<span class={style.summaryHeading}>Expense</span>
    										<span>{basicDetails.data.expense ? numberToCurrencyFormatter(basicDetails.data.expense, 2) : numberToCurrencyFormatter(0)}</span>
    									</li>
    									<li class={style.summaryDetails}>
    										<span class={style.summaryHeading}>Direct Funded Projects</span>
    										<span>{basicDetails.data.direct_funded_projects ? numberToCommaFormatter(basicDetails.data.direct_funded_projects) : numberToCommaFormatter(0)}</span>
    									</li>
    									{basicDetails.data.show_regular_resources > 0 &&
                                            <li class={style.summaryDetails}>
                                            	<span class={style.summaryHeading}>UNDP Regular Resources</span>
                                            	<span>{basicDetails.data.regular_resources ? numberToCommaFormatter(basicDetails.data.regular_resources) : numberToCommaFormatter(0)}</span>
                                            </li>
    									}
    								</ul>
    								{/* Donor details basic details end */}
    								{/* Donor details charts start */}
    								<div class={style.donorWrapper}>
    									{/* Donor Contribution charts start */}
    									<div class={`${style.donorDetails} ${style.contributionDetails}`}>
    										<span class={style.donor_slider_title_bar}>{`${basicDetails.data.donor_name}’s Contribution`}</span>
    										{regularAndOthers.data.country.length > 0 ?
    											<div class={`${style.donor_chart_wrapper} ${style.donor_country_contribution}`}>

    												<DonutChart
														textWrapperStyle={style.textWrapperStyleOther}
														donutCenterText={style.donutCenterOther}
														dollor={style.dollor}
    													data={regularAndOthers.data.country}
    													legendData={totalContribution}
    													chartWidth={250} chartHeight={230}
    													chart_id={'country_contribution'} />
    											</div>
    											:
    											<NoDataTemplate />
    										}
    									</div>

    									{/* Donor Contribution charts end */}
    									{/* Donor Contribution to UNDP Regular Resources charts start */}
    									<div class={`${style.donorDetails} ${style.contributionDetails}`}>
    										<span class={style.donor_slider_title_bar}>{`${basicDetails.data.donor_name}'s Contribution to UNDP Regular Resources`}
    										</span>
    										{regularAndOthers.data.country.length > 0 ?
    											<div class={style.donor_chart_wrapper}>
    												<ContributionIndicator
    													contributionSliderWrapper={style.contributionSliderWrapper}
    													data={regularAndOthers.data.country}
    													legendText={`${basicDetails.data.donor_name}'s Contribution to UNDP Regular Resources`} />
    											</div>
    											:
    											<NoDataTemplate />
    										}
    									</div>
    									{/* Donor Contribution to UNDP Regular Resources charts end */}
    								</div>
    								{/* Donor details charts end */}
    								<div class={style.donorWrapper}>
    									{/* Contribution to Other Resources by Fund Category start */}
    									<div class={style.donorDetails}>
    										<span class={style.donor_slider_title_bar}>Contribution to Other Resources by Fund Category</span>
    										{resourcesModalityContribution.data.country.length > 0 ?
    											<div class={`${style.donor_chart_wrapper} ${style.donor_resources_modality}`}>
    												{/* <div class={style.donor_chart_wrapper}> */}
    												<DonutChart
    													donor_wrapper_styles={style.donor_wrapper_styles}
    													donut_styles={style.donut_styles}
    													legend_styles={style.legend_styles}
														textWrapperStyle={style.textWrapperStyle}
														donutCenterText={style.donutCenterText}
    													data={resourcesModalityContribution.data.country}
    													legendData={resourcesModalityContribution.data.total}
    													chartWidth={560}
    													chartHeight={400} chart_id={'resources_modality'} />
    											</div>
    											:
    											<NoDataTemplate />
    										}
    									</div>
    									{/* Contribution to Other Resources by Fund Category end */}
    								</div>
    								{/* Donor details charts end */}
									{/* Donor details charts start */}
									<div className={style.contributionSplitup}>
										<span className={style.contributionSplitupTitle}>{`Contribution - ${basicDetails.data.donor_name} vs All Donors`}</span>
										{	
										this.props.data.resourcesModalityContribution.data.country && this.props.data.resourcesModalityContribution.data.country.length>0?
											<div>
												<DonorContributionChart 
													data={this.props.data.resourcesModalityContribution.data.total}
													country={basicDetails.data.donor_name}
												/>
											</div>
										:	<NoDataTemplate />
										}
									</div>
    								<div class={style.donorWrapper}>
    									{/* Donor Budget Source start */}
    									<div class={style.donorDetails}>
    										<span class={`${style.donor_slider_title_bar} ${style.donor_slider_title_wrapper}`}>
    											<span class={style.budgetSources}>Donors</span>
    											<span class={style.budget}>Budget</span>
    										</span>
    										{data.budgetSources.data.length > 0 ?
    											<div class={style.budgetList}>
    												<List
    													rowClass={style.rowClass}
    													data={data.budgetSources.data}
    													renderItem={this.renderRow}
    												/>
    											</div>
    											:
    											<NoDataTemplate />
    										}
    									</div>
    									{/* Donor Budget Source end */}
    								</div>
    								{/* Donor details charts end */}
    							</Scrollbars>
    						</div>
    					</div> :
    					<div style={{ position: 'relative', height: 544 }}>
    						<PreLoader />
    					</div>
    			}
    		</div>
    	);
    }
}