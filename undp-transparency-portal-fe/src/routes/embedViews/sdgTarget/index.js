import { h, Component } from 'preact';
import Map from '../../../components/map';
import { connect } from 'preact-redux';
import BootTable from '../../../components/bootstraptable';     // Themes Profile Projects Table
import TopographyIconsLegend from '../../../components/topography-icons-legend';
import BudgetExpenseLegend from '../../../components/budget-expense-legend';
import NoDataTemplate from '../../../components/no-data-template';
import GroupedbarChart from '../../../components/grouped-bar-chart';           // Themes Top Budget Sources, Top Recipient Offices
import { fetchSdgSliderTargetData } from '../../../components/sdgSlider/actions/targetAction';
import { fetchDonorSliderData } from '../../../components/themeSlider/actions/index';
import { fetchSdgSliderData } from '../../../components/sdgSlider/actions/index';
import { loadThemesMapData } from '../../../shared/actions/mapActions/themesMapData';
import { loadSdgMapData } from '../../../shared/actions/mapActions/sdgMapData';
import { updateProjectList } from '../../../shared/actions/getProjectList';
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter';
import PreLoader from '../../../components/preLoader';
import HorizontalStackedBarChart from '../../../components/horizontalStackedBarChart';
import style from './style';
import { fetchSdgTargetData  } from '../../../components/sdgSlider/actions/index';
import { loadTargetMapData } from '../../../shared/actions/mapActions/sdgMapData';

class EmbedTargetSdgView extends Component {

	constructor(props) {
        super(props);
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

    
    componentWillMount() {
        // this.props.updateProjectList(this.props.year,'','','','','',)
        this.props.fetchSdgTargetData(this.props.year, this.props.target);
        this.props.fetchSdgSliderTargetData(this.props.year, this.props.target);
        this.props.loadTargetMapData(this.props.year,this.props.target, "", "", "sdg_target");
    }

    componentWillReceiveProps(nextProps) {

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

    render(props, {
        links,
        projectList,
        totalDataSize,
        themesMapData,
        themeSliderData,
        sdgSliderData,
        projectListArr

    }) {

        let isNonEmpty = Object.keys(this.state.themeSliderData).length,
            isMapDataNonEmpty = !this.props.sdgMapData.loading,
            aggregate = isNonEmpty ? (themeSliderData.data && themeSliderData.data.aggregate) : {},
            budgetSources = isNonEmpty ? (themeSliderData.data && themeSliderData.data.budget_sources) : {},
            topRecipientOffices = isNonEmpty ? (themeSliderData.data && themeSliderData.data.top_recipient_offices) : {},
            mapData = isMapDataNonEmpty ? this.props.sdgMapData : {};
            // sdgSrc = aggregate && aggregate.sdg && getSDGImageFromCode(aggregate.sdg);
            
            return (
            <div>
                {   
                    this.props.title === 'true' ?
                        <div class={style.titleWrapper}>
                            SDG - TARGET {this.props.target}
                        </div>
                        : null
                }
                <div class={style.wrapper}>
                    {
                        this.props.sdgSliderData.loading ?
                            <div style={{ position: 'relative', height: 83 }}>
                                <PreLoader />
                            </div>
                            :this.props.stats === 'true'?
                            <div class={style.infoWrapper}>
                                {/* <div class={style.imageWrapper}><img class={style.sdg_image} src={`../../../assets/icons/${sdgSrc}`} alt="sdg icon"/></div> */}
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
                            :null
                    }
                </div>


                


                {this.props.map === 'true' ?
                    <div class={style.mapContainer} style={{ position: 'relative', display: 'block' }}>

                        {/* {isMapDataNonEmpty ?
                            <TopographyIconsLegend /> : null} */}
                        {isMapDataNonEmpty ?
                            <Map
                                mapData={mapData}
                                sdgTarget={this.props.target}
                                yearSelected={this.props.year}
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
                    :null}
                {this.props.projectTable === 'true' ?
                <BootTable count={totalDataSize}
                    loading={this.props.projectList.loading}
                    keyword={''}
                    theme={''}
                    unit={''}
                    source={''}
                    yearSelected={this.props.year}
                    sdg={''}
                    data={projectListArr}
                    sdg_targets={this.props.target}
                    links={links}
                    embed={true}

                />
                :null}


                {this.props.topDonors === 'true' ?
                <div class={`${style.wrapper} ${style.chartWrapper}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>Top 10 Donors</span>
							<BudgetExpenseLegend />
						</span>

						{
							themeSliderData.loading ?
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>

								:
								<div>
									{
										budgetSources.length > 0 ?
											<div class={style.budget_sources_wrapper}>
												<GroupedbarChart
													chart_id="sdg_embed_budget_sources"
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
						}
					</div>
				</div>
                :null}
                {this.props.receipOffices === 'true' ?
                <div class={`${style.wrapper} ${style.chartWrapper}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>Top 10 Recipient Offices</span>
							<BudgetExpenseLegend />
						</span>
						{
							themeSliderData.loading ?
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>

								:
								<div>
									{
										topRecipientOffices.length > 0 ?
											<div class={style.budget_sources_wrapper}>
												<GroupedbarChart
													chart_id="sdg_embed_top_recipient_offices"
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
									}
								</div>
						}
					</div>
				</div>
                :null}
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    const themeSliderData = state.themeSliderData,
        sdgSliderData = state.sdgSliderData,
        sdgTargetSliderData = state.sdgTargetSliderData,
        { themesMapData, sdgMapData } = state.mapData,
        projectList = state.projectList,
        currentYear = state.yearList.currentYear;
    return {
        themeSliderData,
        themesMapData,
        projectList,
        currentYear,
        sdgTargetSliderData,
        sdgSliderData,
        sdgMapData
    };
};
const mapDispatchToProps = (dispatch) => ({
    fetchDonorSliderData: (year, sector) => dispatch(fetchDonorSliderData(year, sector)),
    loadThemesMapData: (year, sector) => dispatch(loadThemesMapData(year, sector)),
    loadSdgMapData: (year, sdg, unit, source, tab) => dispatch(loadSdgMapData(year, sdg, unit, source, tab)),
    fetchSdgSliderData: (year, sdg) => dispatch(fetchSdgSliderData(year, sdg)),
    fetchSdgTargetData: (year,target) => dispatch(fetchSdgTargetData(year,target)),
    loadTargetMapData: (year, target, unit, source, tab) => dispatch( loadTargetMapData(year, target, unit, source, tab)),
    fetchSdgSliderTargetData: (year,sdg) => dispatch(fetchSdgSliderTargetData(year,sdg))
});


export default connect(mapStateToProps, mapDispatchToProps)(EmbedTargetSdgView);
