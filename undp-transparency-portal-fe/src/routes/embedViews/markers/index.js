import { h, Component } from 'preact';
import { connect } from 'preact-redux';         // Themes Top Budget Sources, Top Recipient Offices
import GroupedbarChart from '../../../components/grouped-bar-chart';
import BudgetExpenseLegend from '../../../components/budget-expense-legend';
import NoDataTemplate from '../../../components/no-data-template';
import PreLoader from '../../../components/preLoader';
import { fetchMarkerBarChartData } from '../../../components/markerPage/actions/barchartDataFetch';
import style from './style';
import { aboutUsInfo } from '../../../assets/json/undpAboutUsData';
import { fetchMarkerDescriptionData } from '../../../components/markerPage/actions/typeAndDesc';
import { Scrollbars } from 'react-custom-scrollbars';
import BootTable from '../../../components/bootstraptable';
import { fetchMarkerData } from '../../../components/markerPage/actions';
import { fetchmarkerSubType } from '../../../components/markerPage/actions/markerSubTypes';
import { fetchMarkerProjectList } from '../../../shared/actions/getProjectList';
import Map from '../../../components/map';
import { updateSearchCountryField } from '../../../components/nestedDropList/actions';
import { loadProjectListMapData } from '../../../shared/actions/mapActions/projectListMapData';
import { updateMarkerSubType } from '../../../components/bootstraptable/actions/setMarkerType';
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter';
import { setMapCurrentYear } from '../../../shared/actions/mapActions/yearTimeline';
import { setCurrentYear } from '../../../shared/actions/getYearList';

class EmbedMarkers extends Component {

    constructor(props) {
        super(props);
        this.state = {
			themeSelected: '',
			unitSelected: '',
			unitLabel: '',
			sourceSelected: '',
			sdgSelected: '',
			keyword: '',
			totalDataSize: 0,
			links: {},
        }
	}

	generateSubLevels(element){
		if (element.description_details === '') {
			let cellData = element.description_title.map((item)=> {
				return (
					<section>
						<span class={style.dataTitle}>
							<img src="../../../assets/icons/dot.png" class={style.bullet}/>
							<span class={style.titleText}>{item.level_two_marker_title}</span>
						</span> 
						<span class={style.dataDetails}> {item.level_two_marker_description}</span>
					</section>	
				);
			});
			return cellData;
		} else {
			return (<span class={style.dataDetails}>  {element.description_details}</span>);
		}
	}

	handleFilterChange = (type, value) => {
		this.setState({
			dropListFilterobj: {
				...this.state.dropListFilterobj,
				[type]: {
					...this.state.dropListFilterobj[type],
					value: value.value || value,
					label: value.label || ''
				}
			}
		}, () => {
		});
		switch (type) {
			case 'country':
				let countryVal = value.value;
				this.setState({
					unitSelected: countryVal,
					unitLabel: value.name || value.label
				});
				this.props.loadProjectListMapData(this.props.year,
					this.state.themeSelected,
					countryVal,
					this.state.sourceSelected,
					this.state.sdgSelected,
					this.props.marker,
					this.props.marker_id
				);


				this.props.updateSearchCountryField(countryVal);
				break;

			

			case 'search':
				this.setState({
					keyword: value
				});
				break;
			default:
				null;
		}

	}
	findImage(marker){
		const currentMarker = _.find(aboutUsInfo.data, (markerItem) => markerItem.id === parseInt(marker) );
		if (currentMarker){
			return currentMarker.image_2;
		}
		return '../../../assets/images/Empty.svg';
	}

    generateRows(data,marker){
		let rows = null;
		if (marker && data.type){
			if (marker.id==='2' ){
				rows = data.type.map((element,index) => {
					return ( 
					<section key={index} class={style.row}>
						<section class={style.cell}>
							<Scrollbars class={style.scroll} >
								<section class={style.data}>
									<section class={style.dataTitle}>
										<img src="../../../assets/icons/dot.png" class={style.bullet}/>
										<span class={style.titleText}>{element.type_title}</span>
									</section>
									<span class={style.dataDetails}>{element.type_details}</span>
								</section>
							</Scrollbars >
						</section>
						<section class={style.cell}>
							<Scrollbars class={style.scroll}>
								<section class={style.data}>
									{
										this.generateSubLevels(element)
									}
								</section>
							</Scrollbars>
						</section>
					</section>);
				});
			} else {
				rows = data.type.map((element,index) => {
					return (
						<section key={index} class={style.row}>
							<section class={style.cell}>
							<Scrollbars class={style.scroll2}>
								<section class={style.data}>
									<span class={style.dataTitle2}>{element.type_title}</span>
								</section>
							</Scrollbars>
							</section>
							<section class={style.cell}>
							<Scrollbars class={style.scroll2}>
								<section class={style.data}>
									{
									(element.description_details.constructor == Array)? 
										element.description_details.map((item) => {
											return (
												<section class={style.listSection}>
													<img src="../../../assets/icons/dot.png" class={style.bullet2} />
													<span class={style.textTitle2}>{item}</span>
												</section>
											)
										})
									 : (element.description_details ==="")?
									 		element.description_title.map((item) => {
												return (
												<section class={style.listSection}>
													<img src="../../../assets/icons/dot.png" class={style.bullet2} />
													<span class={style.textTitle2}>{item}</span>
												</section>
											)})
									 	:	<span class={style.textTitle2}> {element.description_details}</span>}
								</section>
							</Scrollbars>
							</section>
						</section>);
					
				});
			}
		}
		return rows;
	}

    componentWillMount() {

		this.props.updateMarkerSubType(this.props.marker_id);
		this.props.setMapCurrentYear(this.props.year);
		this.props.setCurrentYear(this.props.year);
		this.props.loadProjectListMapData(this.props.year,
			this.props.themes,
			this.props.country,
			this.props.sources,
			this.props.sdg,
			this.props.marker,
			this.props.marker_id
		);
		( this.props.country  !== '') ?
			this.props.fetchMarkerData(this.props.year,this.props.marker,this.props.country,this.props.marker_id  )
			:	this.props.fetchMarkerData(this.props.year,this.props.marker,'all',this.props.marker_id);
		this.props.fetchMarkerDescriptionData(this.props.year,this.props.marker,this.props.country,this.props.marker_id);
		this.props.fetchMarkerBarChartData(this.props.year,this.props.marker,this.props.country,this.props.marker_id);
		this.props.fetchmarkerSubType(this.props.marker,this.props.country);
		this.props.fetchMarkerProjectList(
			this.props.year,
			this.props.marker,
			'',
			10,
			0,
			this.props.country,
			this.props.isSSCMarker ? '':this.props.marker_id,
			this.props.l2country
		);
    }


    render(props, {	}) {
		
		const budgetSources = (this.props.chartData.data.budget_sources)?
								 this.props.chartData.data.budget_sources
							  :	 [];
		const topRecipientOffices = (this.props.chartData.data.top_recipient_offices)?
								 		this.props.chartData.data.top_recipient_offices
									  :	[];
		let optionData;
		let tableData =[];
		if (this.props.projectList.projectList){
			if (this.props.projectList.projectList.data.length !== 0){
				tableData = this.props.projectList.projectList.data.map((element) => {
					return {
						...element,
						country_name: element.country
					};
				});
			}
		}
		if (this.props.markerSubTypes.data && this.props.markerSubTypes.data[0]){
			optionData = this.props.markerSubTypes.data.map(element =>{
				return ({
					label: element.title,
					value: element.marker_type
				});
			}) ;
		} else {
			optionData = [];
		}
		
		return (
			<div>
				{
					(this.props.title === 'true') ?
						<div class={style.titleWrapper}>
                        Our Approaches - {this.props.year}
						</div>
                   	:	null
				}
				{
					(this.props.stats === 'true')?
						<section>
							{
								!(this.props.aggregate.loading) ?
									Object.keys(this.props.aggregate.data).length ?
										<div class={style.infoWrapper}>
											<div class={style.imageWrapper}>{this.props.marker ? <img class={style.marker_image} src={this.findImage(this.props.marker)} alt="sdg icon" />:null}</div>
											<div class={style.tableWrapper}>
												<ul class={style.list}>
													<li class={style.listItem}>
														<span class={style.value}>{this.props.aggregate.data.budget && numberToCurrencyFormatter(this.props.aggregate.data.budget, 2)}</span>
														<span class={style.label}>Budget</span>
													</li>
													<li class={style.listItem}>
														<span class={style.value}>{this.props.aggregate.data.expense && numberToCurrencyFormatter(this.props.aggregate.data.expense, 2)}</span>
														<span class={style.label}>Expense</span>
													</li>
													<li class={style.listItem}>
														<span class={style.value}>{this.props.aggregate.data.projects_count && numberToCommaFormatter(this.props.aggregate.data.projects_count)}</span>
														<span class={style.label}>Projects</span>
													</li>
													<li class={style.listItem}>
														<span class={style.value}>{this.props.aggregate.data.budget_sources && numberToCommaFormatter(this.props.aggregate.data.budget_sources)}</span>
														<span class={style.label}>Donors</span>
													</li>
												</ul>
											</div>
										</div>
										:
										<NoDataTemplate />
									:
									<div style={{ position: 'relative', height: 53, marginTop: 10, marginBottom: 10 }}>
										<PreLoader />
									</div>
							}
						</section>
						:	null
				}
			   {/* {   (this.props.title !== 'false') ? */}
			   {this.props.map==='true'&&	<div class={style.mapWrapper}>
					  
						{this.props.map==='true'&&<Map sector={this.state.themeSelected}
							sdg={this.state.sdgSelected}
							source={this.state.sourceSelected}
							mapData={this.props.mapData.projectListMapData}
							code={this.props.country}
                            embedCountryRegion={true}
                            embed={true}
							onCountrySelect={(country)=>this.handleFilterChange("country", {value:country.country_iso3, name:country.country_name})}
							newclass
							marker={this.props.marker}
							yearSelected={this.props.year}
						/>}
						{this.props.map==='true'&&<div class={style.disclaimer}>
						<ul><li> The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.</li><li> References to Kosovo* shall be understood to be in the context of UN Security Council resolution 1244 (1999)</li>
    </ul>
						</div>}
					</div>}
					{/* :null */}
			   {/* } */}
               {
                    (this.props.typesDescription ==='true') ?
                    <section class={style.table}>
						<section class={style.tableHeader} >
							<section class={style.tableHeaderSection}>
								<span class={style.tableHeaderData}> Type </span>
							</section>
							<section class={style.tableHeaderSection}>
								<span class={style.tableHeaderData}> Description </span>
							</section>
						</section>
						<section class={style.tableBody} >
							{
								!this.props.markerDescData.data.loading ?
									( this.props.markerDescData.data.type && this.props.markerDescData.data.type.length !==0) ? 
										this.generateRows(this.props.markerDescData.data,{ id: this.props.marker })
									:   <NoDataTemplate />
								:
								<div style={{ position: 'relative', height: 344 }}>
									<PreLoader />
								</div>
							}
						</section>
                    </section>
                    :null
                } 
					{
                        this.props.recipients === 'true' ?
                        <div class={style.chartWrapper}>
						    <div class={style.top_budget_sources_wrapper}>
							    <span class={style.chartHead}>
								    <span>Top 10 Recipients</span>
								    <BudgetExpenseLegend />
                                </span>
                                {!this.props.chartData.loading ?
								    (topRecipientOffices.length !== 0)?
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
                        : null
                    }
                {
                    this.props.donors === 'true' ?
                    <div class={style.chartWrapper}>
					    <div class={style.top_budget_sources_wrapper}>
						    <span class={style.chartHead}>
							    <span>Top 10 Donors</span>
							    <BudgetExpenseLegend />
                            </span>
                            {!this.props.chartData.loading ?
							    (budgetSources.length !== 0)?
							        <div class={style.budget_sources_wrapper}>
								        <GroupedbarChart
										    chart_id="sdg_profile_top_donors"
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
						    :
						        <div style={{ position: 'relative', height: 344 }}>
							        <PreLoader />
						        </div>				
                            }
                        </div>
                    </div>
                    : null
                }  
                {
                    (this.props.projectTable === 'true') ?
                    <div class={style.projectListWrapper}>
						<BootTable 
							data = {tableData}
							enableMarkerDropDown 
							// handleFilterChange={(type, value) => this.handleFilterChange(type, value)}
							getSearchParam={(param) => { this.setState({ searchText: param }); }}
							theme={this.state.themeSelected}
							unit={this.state.unitSelected}
							keyword={this.state.keyword}
							source={this.state.sourceSelected}
							// count={totalDataSize}
							// links={links}
							yearSelected= {this.props.year}
							marker={this.props.marker}
                    		optionData={optionData}
							country={this.props.country}
							loading = {this.props.projectList.loading}
							count={this.props.projectList.projectList.count}
						/>		
					</div>
                    : null
                }
                 
                </div>
        ) 
    }
} 


const mapStateToProps = (state) => {
    const  currentYear = state.yearList.currentYear,
           chartData = state.markerBarChartData,
		   markerSubTypes  = state.markerSubTypes,
		   projectList = state.projectList,
		   mapData = state.mapData,
		   aggregate =state.individualMarkerData,
           markerDescData = state.markerDescData;
	return {
        currentYear,
        chartData,
        markerDescData,
		markerSubTypes,
		mapData,
		aggregate,
		projectList
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchmarkerSubType: (marker,country) => dispatch(fetchmarkerSubType(marker,country)),
	setCurrentYear: (year) => dispatch(setCurrentYear(year)),
	setMapCurrentYear: (year) => dispatch(setMapCurrentYear(year)),
	updateMarkerSubType: (value) => dispatch(updateMarkerSubType(value)),
	fetchMarkerData: (year,marker,country,marker_id  ) => dispatch(fetchMarkerData(year,marker,country,marker_id  )),
	loadProjectListMapData: (year, sector, unit, source, sdg,marker,marker_id) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg,marker,marker_id)),
	updateSearchCountryField: (countryCode) => dispatch(updateSearchCountryField(countryCode)),
	fetchMarkerProjectList: (year, markerId,keyword,limit,offset,country,markerType) => dispatch(fetchMarkerProjectList(year, markerId,keyword,limit,offset,country,markerType)),
	fetchMarkerBarChartData: (year,marker,country,marker_id) => dispatch(fetchMarkerBarChartData(year,marker,country,marker_id)),
	fetchMarkerDescriptionData: (year,marker,country,marker_id) => dispatch(fetchMarkerDescriptionData(year,marker,country,marker_id))
});
 

export default connect(mapStateToProps, mapDispatchToProps)(EmbedMarkers);