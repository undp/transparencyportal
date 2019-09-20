/**************************** Preact files ******************************/
import { h, Component } from 'preact';

/**************************** Custom components *************************/
import Map from '../../../components/map';                      // Themes Map
import BootTable from '../../../components/bootstraptable';     // Themes Profile Projects Table
import BudgetExpenseLegend from '../../budget-expense-legend';   // Budget Expense Legend
import GroupedbarChart from '../../grouped-bar-chart';           // Themes Top Budget Sources, Top Recipient Offices
import NoDataTemplate from '../../no-data-template';             // No Data Template
import PreLoader from '../../preLoader';                         // No Data Template

/**************************** Util Actions *******************************/
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter';
import { getSDGImageFromCode } from '../../../utils/commonActionUtils';

/**************************** Style Files ********************************/
import style from './style';
import HorizontalStackedBarChart from '../../horizontalStackedBarChart';

/*************************************************************************/


export default class SdgPage extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			themeSliderData: {},    // Theme Slider Data object
			themesMapData: {},      // Theme Map Data object
			projectList: {},
			listSelected: false,
			totalDataSize: 0,
			links: '',
			projectListArr: []
		};
	}
 
	componentWillMount() {
		this.props.fetchSdgSliderTargetData(this.props.currentYear, this.props.sdg_code);
		(this.props.target_code)? this.props.fetchSdgTargetData(this.props.currentYear,this.props.target_code)
			: this.props.fetchSdgSliderData(this.props.currentYear, this.props.sdg_code);
		(this.props.target_code)? this.props.loadTargetMapData(this.props.currentYear, this.props.target_code, "", "", "sdg_target")
			: this.props.loadSdgMapData(this.props.currentYear, this.props.sdg_code, "", "", "sdg");
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.currentYear !== this.props.currentYear) {
			(this.props.target_code)? null : this.props.fetchSdgSliderTargetData(nextProps.currentYear, this.props.sdg_code);
			(this.props.target_code)? this.props.fetchSdgTargetData(nextProps.currentYear,this.props.target_code)
				: this.props.fetchSdgSliderData(nextProps.currentYear, this.props.sdg_code);
			
			(this.props.target_code)? this.props.loadTargetMapData(nextProps.currentYear, this.props.target_code, "", "", "sdg_target")
				: this.props.loadSdgMapData(nextProps.currentYear, this.props.sdg_code, "", "", "sdg");
		}
		if (Object.keys(nextProps.sdgSliderData.data).length) {
			this.setState({
				themeSliderData: nextProps.sdgSliderData
			});
		}

		if (Object.keys(nextProps.sdgMapData.data).length) {
			this.setState({
				themesMapData: nextProps.sdgMapData
			});
		}
		if (Object.keys(nextProps.projectList.projectList.data).length) {
			this.setState({
				projectList: nextProps.projectList
			});
		}
		if (nextProps.projectList.projectList !== this.props.projectList.projectList) {
			let data = nextProps.projectList.projectList.data;
			let parseData = (data) => {
				data.forEach((item) => {
					item.country_name = item.country;
					item.probObj = {
						title: item.title,
						project_id: item.project_id
					};
					item.total_budget = item.budget === null ? 0 : item.budget;
					item.total_expense = item.expense === null ? 0 : item.expense;
				});
				return data;
			};
			this.setState({
				projectListArr: parseData(data),
				totalDataSize: nextProps.projectList.projectList.count,
				links: nextProps.projectList.projectList.links
			});
		}

	}
	render(props, { projectList,
		totalDataSize,
		themesMapData,
		themeSliderData,
		sdgSliderData,
		projectListArr }) {
		const {
		} = props;
		let isNonEmpty = Object.keys(this.state.themeSliderData).length,
			isMapDataNonEmpty = Object.keys(this.state.themesMapData).length,
			aggregate = isNonEmpty ? (themeSliderData.data && themeSliderData.data.aggregate) : {},
			budgetSources = isNonEmpty ? (themeSliderData.data && themeSliderData.data.budget_sources) : {},
			topRecipientOffices = isNonEmpty ? (themeSliderData.data && themeSliderData.data.top_recipient_offices) : {},
			mapData = isMapDataNonEmpty ? (themesMapData && themesMapData.data) && themesMapData : {},
			sdgSrc = aggregate && aggregate.sdg && getSDGImageFromCode(aggregate.sdg),
			sdgMapData = this.props.sdgMapData;
		if ( this.props.target_code &&  Object.keys(aggregate).length )
			this.props.onUpdateSDG(aggregate);

		return (
			<div class={style.profile_page_container}>
				<div class={style.wrapper}>
					<div>
						{!this.props.target_code?
							null
							:
							<span class={style.SDGdisclaimer}>
								{Object.keys(this.props.sdgSliderData.data).length ? this.props.sdgSliderData.targetTitle :''}
							</span>
						}
						{   
							!this.props.sdgSliderData.loading ?
								Object.keys(aggregate).length && this.props.sdgSliderData.data.aggregate ?
									<div class={style.infoWrapper}>
										<div class={style.imageWrapper}>{sdgSrc ? <img class={style.sdg_image} src={`/assets/icons/${sdgSrc}`} alt="sdg icon" />:null}</div>
										<div class={style.tableWrapper}>
											<ul class={style.list}>
												<li>
													<span class={style.value}>{aggregate.total_budget && numberToCurrencyFormatter(aggregate.total_budget, 2)}</span>
													<span class={style.label}>Budget</span>
												</li>
												<li>
													<span class={style.value}>{aggregate.total_expense && numberToCurrencyFormatter(aggregate.total_expense, 2)}</span>
													<span class={style.label}>Expense</span>
												</li>
												<li>
													<span class={style.value}>{aggregate.total_projects && numberToCommaFormatter(aggregate.total_projects)}</span>
													<span class={style.label}>Projects</span>
												</li>
												<li>
													<span class={style.value}>{aggregate.budget_sources && numberToCommaFormatter(aggregate.budget_sources)}</span>
													<span class={style.label}>Donors</span>
												</li>
											</ul>
										</div>
									</div>
									:
									<NoDataTemplate />
								:
								<div style={{ position: 'relative', height: 53 }}>
									<PreLoader />
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
								onClick={() => this.setState({ listSelected: true })}
							>
								List
							</button>
						</span>
					</span>

					{
						<div>
							<div style={{ paddingTop: '9px', display: this.state.listSelected ? 'block' : 'none' }}>
								<BootTable count={totalDataSize}
									currentYear={this.props.currentYear}
									sdg={this.props.sdg_code}
									data={projectListArr}
									sdg_targets={this.props.target_code}
								/>
							</div>
							<div class={style.mapContainer} style={{ position: 'relative', display: this.state.listSelected ? 'none' : 'block' }}>

								{Object.keys(sdgMapData).length && !sdgMapData.loading ?
									<Map
									sdg={this.props.sdg_code}
									mapData={sdgMapData}
									sdgTarget={this.props.target_code}
									startYear ={this.props.target_code ? 2018: 2016}
									yearSelected={this.props.currentYear}
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
						</div>
					}
					{
						!this.state.listSelected ? window.dispatchEvent(new Event('resize')) : null
					}
				</div>
				{ !this.props.target_code ?
				<div class={`${style.wrapper} ${style.chartWrapper}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>{Object.keys(aggregate).length ? 'SDG '+aggregate.sdg+' Targets':''}</span>
							<BudgetExpenseLegend />
						</span>
						{
							!this.props.sdgTargetSliderData.loading ?
							<div>
								{this.props.sdgTargetSliderData.data.percentage && 
								this.props.sdgTargetSliderData.data.percentage.length ?
								<div class={style.budget_sources_wrapper}>
									<HorizontalStackedBarChart
									chart_id="sdg_target_outcome_chart"
									width={1250}
									height={this.props.sdgTargetSliderData.data.percentage.length * 50}
									data={this.props.sdgTargetSliderData.data.percentage}
									section ={'sdgPage'}
									/>
								</div>
								:
								<NoDataTemplate />
								}
							</div>
							:
							<div style={{ position: 'relative', height: 344 }}>
								<PreLoader />
							</div>
						}
					</div>
				</div>
				:
				null
				}
				<div class={`${style.wrapper} ${style.chartWrapper}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>Top 10 Donors</span>
							<BudgetExpenseLegend />
						</span>

						{
							!this.props.sdgSliderData.loading ?

								<div>
									{
										budgetSources.length > 0 && this.props.sdgSliderData.data.budget_sources?
											<div class={style.budget_sources_wrapper}>
												<GroupedbarChart
													chart_id="sdg_profile_budget_sources"
													width={1250}
													height={500}
													min_height={540}
													data={budgetSources}
													label={'short_name'}
													tspanSize={'12px'}
													textSize={'12px'}
												/>
											</div>
											:
											<NoDataTemplate />
									}
								</div>
								:
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>
						}
					</div>
				</div>
				<div class={`${style.wrapper} ${style.chartWrapper}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>Top 10 Recipient Offices</span>
							<BudgetExpenseLegend />
						</span>
						{
							!this.props.sdgSliderData.loading ?
								Object.keys(topRecipientOffices).length && this.props.sdgSliderData.data.top_recipient_offices?
									<div class={style.budget_sources_wrapper}>
										<GroupedbarChart
											chart_id="sdg_profile_top_recipient_offices"
											width={1250}
											height={500}
											min_height={540}
											data={topRecipientOffices}
											label={'iso3'} 
											tspanSize={'12px'}
											textSize={'12px'}
										/>
									</div>
									:
									<NoDataTemplate />
								:
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>
						}
					</div>
				</div>
			</div>


		);
	}
}
