/* eslint-disable no-case-declarations */
import {
	h, Component
} from 'preact';
import style from './style';
import BootTable from '../../components/bootstraptable';
import CommonHeader from '../../components/commonHeader';
import Map from '../../components/map';
import MarkerDetails from '../../components/markerPage/markerDetails';
import EmbedSection from '../../components/EmbedSection';
import NoDataTemplate from '../../components/no-data-template';
import PreLoader from '../../components/preLoader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import NestedDropList from '../../components/nestedDropList';
import Api from '../../lib/api';
import DropDown from '../../components/filter';
import ErrorPage from './../404Page';
import commonConstants from '../../utils/constants';

import {
	connect
} from 'preact-redux';
import Footer from '../../components/footer';
import { getFormmattedDate } from '../../utils/dateFormatter';
import {
	updateProjectList, fetchMarkerProjectList } from '../../shared/actions/getProjectList';
import {
	loadProjectListMapData
} from '../../shared/actions/mapActions/projectListMapData';
import {
	setPageHeader
} from '../../components/urlBreadCrumb/data/actions';

import {
	onChangeRoute
} from '../../shared/actions/routerActions';
import {
	updateSearchCountryField,
	clearSearchCountryField,
	searchResult

} from '../../components/nestedDropList/actions';

import { numberToCurrencyFormatter,numberToCommaFormatter } from '../../utils/numberFormatter';
import EmbedModal from '../../components/embedModal';
import ExportPopup from '../../components/exportPopup';
import { downLoadProjectListCsv } from '../../shared/actions/downLoadCSV';
import { aboutUsInfo } from '../../assets/json/undpAboutUsData';
import { fetchMarkerData } from '../../components/markerPage/actions';
import { fetchMarkerDescriptionData } from '../../components/markerPage/actions/typeAndDesc';
import { fetchMarkerBarChartData } from '../../components/markerPage/actions/barchartDataFetch';
import { fetchmarkerSubType } from '../../components/markerPage/actions/markerSubTypes';
import { updateMarkerSubType } from '../../components/bootstraptable/actions/setMarkerType';
import { updateCountrySelected } from '../../components/nestedDropList/actions/setCountryField';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';


class Marker extends Component {
	
	switchModalState = () => {
		this.setState(prevState => ({
			modalState: !prevState.modalState
		}));
	};

	openEmbedModal = () => {
		this.createCheckList(
			this.setState({
				displayEmbedModal: true
			}, () => {

			})
		);

	}

	handleClose = () => {
		this.setState({
			displayEmbedModal: false
		}, () => {
			this.clearSelect();
		});
	}

	createCheckList = (callbk) => {
		let newUrl = this.state.baseUrl;
		this.state.checkList.forEach((item, index) => {
			if (index === 0) {
				newUrl = newUrl + item.key + '=' + item.flag;
			}
			else {
				newUrl = newUrl + '&' + item.key + '=' + item.flag;
			}

		});
		this.setState({
			selectionListUrl: newUrl
		}, () => {
			if (callbk !== undefined) {
				callbk();
			}
		});
	}

		//  Embed Modal Methods /////////////////////////---------------------------------------------------------->>>>>>>>>>

		generateFilterListUrl = () => {
			let url = '';
			const filterObj = {
				...this.state.dropListFilterobj
			};
			for (let key in filterObj) {
				if (key === 'year' || key === 'searchText') {
					url = url + '&' + key + '=' + filterObj[key].value;
				}
				else {
					url = url + '&' + key + '=' + filterObj[key].value + '&' + key + 'Label=' + filterObj[key].label;
				}
			}
			url = url + '&marker=' + this.currentMarker.id+'&marker_id='+(this.props.currentMarkerSubType.markerSubType ? this.props.currentMarkerSubType.markerSubType : '');
			this.setState({
				filterUrl: url
			}, () => {
	
			});
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
				this.generateFilterListUrl();
			});
			switch (type) {
				case 'country':
					let countryVal = value.value ;
					this.countryName = value.name;
					this.props.updateSearchCountryField(this.countryName);
					this.props.loadProjectListMapData(this.props.mapCurrentYear,
						this.state.themeSelected,
						countryVal,
						this.state.sourceSelected,
						this.state.sdgSelected,
						this.currentMarker.id,
						this.props.currentMarkerSubType.markerSubType
	
					);
					this.props.updateCountrySelected(countryVal);
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
	
		handleOnSelect = (e, data) => {
			let selectedList = this.state.checkList.map((item) => item.key === data.key ? {
				flag: e.target.checked,
				label: item.label,
				key: item.key
			} : item);
			this.setState({
				checkList: selectedList
			}, () => {
				this.createCheckList();
			});
		}
	
		clearSelect = () => {
			let clearedList = this.state.checkList.map((item) => ({
				flag: this.initialChecklist[item.key],
				label: item.label,
				key: item.key
			}));
	
			this.setState({
				checkList: clearedList
			});
		}
	
		//////////////////////////////////---------------------------------------------------------->>>>>>>>>>
		componentWillUnMount() {
			this.props.clearSearchCountryField();
		}

		parseData = (data) => {
			data.forEach((item) => {
				item.country_name = item.country.name;
				item.probObj = {
					title: item.title,
					project_id: item.project_id
				};
			});
			return data;
		}

		setPageHeader() {
		
			const title = this.currentMarker.title;
			this.props.onChangeRoute(title);
			this.props.setPageHeader({
				title,
				breadcrumb: [{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title: 'Our Approaches',
					link: '/our-approaches'
				},{
					id: 3,
					title
				}]
			});
	
		}
	
		categorySelect = (value) => {
			let yearSelected =  this.props.currentYear;
			value = ((this.currentMarker.id === 4 ||  this.currentMarker.id === 5 ||  this.currentMarker.id === 6) && value) ? value.replace(/ /g,'+') :value;
			this.props.updateMarkerSubType(value);
			this.hideTable = value;
			this.props.loadProjectListMapData(this.props.mapCurrentYear,
				this.state.themeSelected,
				this.props.currentCountrySelected.countrySelected  ,
				this.state.sourceSelected,
				this.state.sdgSelected,
				this.currentMarker.id,
				value
			);
			this.selectedMarkerId = value;
			this.generateFilterListUrl();
			this.props.fetchMarkerDescriptionData(yearSelected,this.currentMarker.id,this.props.currentCountrySelected.countrySelected,value);
			this.props.fetchMarkerData(yearSelected, this.currentMarker.id, this.props.currentCountrySelected.countrySelected,value);
			this.props.fetchMarkerBarChartData(yearSelected,this.currentMarker.id,this.props.currentCountrySelected.countrySelected ,value);
		}

		showExportModal() {
			this.setState({ showExportModal: true });
		}

		hideExportModal() {
			this.setState({ showExportModal: false });
		}

		constructor(props) {
			super(props);
			this.renderMarkerSummary = 1;
			this.countryCode ='global';
			this.hideTable = false;
			this.state = {
				projectList: [],
				themeSelected: '',
				unitSelected: '',
				unitLabel: '',
				theme: '',
				unit: '',
				sdg: '',
				sourceSelected: '',
				sdgSelected: '',
				keyword: '',
				totalDataSize: 0,
				links: {},
				displayEmbedModal: false,
				selectionListUrl: window.location.origin + '/embed/our-approaches?',
				baseUrl: window.location.origin + '/embed/our-approaches?',
				filterUrl: '',
				dropListFilterobj: {
					country: {
						value: this.props.currentCountrySelected.countrySelected ,
						label: ''
					},
					sources: {
						value: '',
						label: ''
					},
					themes: {
						value: '',
						label: ''
					},
					sdg: {
						value: '',
						label: ''
					},
					year: {
						value: this.props.currentYear
					},
					markerFilter: {
						value: this.props.currentMarkerSubType.markerSubType
					}
				},
				checkList: [{
					flag: true,
					label: 'Title',
					key: 'title'
				},
				{
					flag: true,
					label: 'Map',
					key: 'map'
				},{
					flag: true,
					label: 'Marker Types and Description',
					key: 'typesDescription'
				},
				{
					flag: false,
					label: 'Project List',
					key: 'projectTable'
				},
				{
					flag: false,
					label: 'Top 10 Donors',
					key: 'donors'
				},
				{
					flag: false,
					label: 'Top 10 Recipient Offices',
					key: 'recipients'
				}],
				searchText: '',
				showExportModal: false
			};
			this.initialChecklist = {
				title: true,
				summary: true,
				map: true,
				projectTable: false
			};
			this.currentMarker = aboutUsInfo.data[_.findIndex(aboutUsInfo.data, { label: (this.props.code) })];
			this.selectedMarkerId = '';
		}
	
		componentWillMount() {
			this.props.clearSearchCountryField();
			//this.props.searchOperatingUnitsListData(null, null);
			this.props.loadProjectListMapData(this.props.mapCurrentYear,
				this.state.themeSelected,
				this.state.unitSelected,
				this.state.sourceSelected,
				this.state.sdgSelected,
				this.currentMarker.id
			);
			this.createCheckList();
			this.generateFilterListUrl();
			this.props.updateCountrySelected('');
			this.props.updateMarkerSubType('');
			this.props.fetchMarkerData(this.props.mapCurrentYear,this.currentMarker.id,'all');
			this.props.fetchMarkerDescriptionData(this.props.mapCurrentYear,this.currentMarker.id);
			this.props.fetchMarkerBarChartData(this.props.mapCurrentYear,this.currentMarker.id);
			this.props.fetchmarkerSubType(this.currentMarker.id,'');
		}

		componentDidMount() {
			window.scrollTo(0, 0);
			this.setPageHeader();
			this.props.loadProjectListMapData(undefined,
				this.state.themeSelected,
				this.state.unitSelected,
				this.state.sourceSelected,
				this.state.sdgSelected,
				this.currentMarker.id
			);
		}

		componentWillReceiveProps(nextProps) {
			if (this.props.mapCurrentYear !== nextProps.mapCurrentYear) {
				this.setState({
					dropListFilterobj: {
						...this.state.dropListFilterobj,
						year: {
							...this.state.dropListFilterobj.year,
							value: nextProps.mapCurrentYear
						}
					}
				}, () => {
					this.generateFilterListUrl();
				});

				this.props.loadProjectListMapData(nextProps.mapCurrentYear,
					this.state.themeSelected,
					this.state.unitSelected,
					this.state.sourceSelected,
					this.state.sdgSelected,
					this.currentMarker.id,
					nextProps.currentMarkerSubType.markerSubType
				);
			}
			if (this.props.currentYear !== nextProps.currentYear) {
				this.props.loadProjectListMapData(nextProps.currentYear,
					this.state.themeSelected,
					this.state.unitSelected,
					this.state.sourceSelected,
					this.state.sdgSelected,
					this.currentMarker.id,
					nextProps.currentMarkerSubType.markerSubType
				);
				( this.props.currentCountrySelected.countrySelected  !== '') ?
					this.props.fetchMarkerData(nextProps.currentYear,this.currentMarker.id,this.props.currentCountrySelected.countrySelected,nextProps.currentMarkerSubType.markerSubType  )
					:	this.props.fetchMarkerData(nextProps.currentYear,this.currentMarker.id,'all',nextProps.currentMarkerSubType.markerSubType);
			
				( this.props.currentCountrySelected.countrySelected  !== '' ) ?
					this.props.fetchMarkerBarChartData(nextProps.currentYear,this.currentMarker.id,this.props.currentCountrySelected.countrySelected,nextProps.currentMarkerSubType.markerSubType  )
					: 	this.props.fetchMarkerBarChartData(nextProps.currentYear,this.currentMarker.id,'',nextProps.currentMarkerSubType.markerSubType);
			
				(this.props.currentCountrySelected.countrySelected !=='') ?
					this.props.fetchMarkerDescriptionData(nextProps.currentYear,this.currentMarker.id,this.props.currentCountrySelected.countrySelected,nextProps.currentMarkerSubType.markerSubType )
					:this.props.fetchMarkerDescriptionData(this.props.currentYear,this.currentMarker.id,'',nextProps.currentMarkerSubType.markerSubType);
			}
			if (nextProps.projectList !== this.props.projectList) {
				let data = nextProps.projectList.data;
				let parseData = (data) => {
					data.forEach((item) => {
						item.country_name = item.country;
						item.probObj = {
							title: item.title,
							project_id: item.project_id
						};
						item.budget = item.budget === null ? 0 : item.budget;
						item.expense = item.expense === null ? 0 : item.expense;
					});
					return data;
				};
				this.setState({
					projectList: parseData(data),
					totalDataSize: nextProps.projectList.count,
					links: nextProps.projectList.links
				});
			}


			if (this.props.currentCountrySelected.countrySelected !== nextProps.currentCountrySelected.countrySelected ){
				if	(nextProps.currentCountrySelected.countrySelected  === ''){
					this.countryCode = 'global';
					this.countryName = 'Recipient Region /Country';
					this.props.fetchMarkerData(nextProps.currentYear,this.currentMarker.id,'all',nextProps.currentMarkerSubType.markerSubType); // Filter for type dropdown
					this.props.fetchMarkerDescriptionData(this.props.currentYear,this.currentMarker.id,'',nextProps.currentMarkerSubType.markerSubType);
					this.props.fetchMarkerBarChartData(this.props.currentYear,this.currentMarker.id,'',nextProps.currentMarkerSubType.markerSubType);
					this.props.fetchmarkerSubType(this.currentMarker.id,'');
				} else {
					this.countryCode = nextProps.currentCountrySelected.countrySelected ;
					this.props.fetchMarkerData(nextProps.currentYear,this.currentMarker.id,this.countryCode,nextProps.currentMarkerSubType.markerSubType); // Filter for type dropdown
					this.props.fetchMarkerDescriptionData(nextProps.currentYear,this.currentMarker.id,this.countryCode,nextProps.currentMarkerSubType.markerSubType);
					this.props.fetchMarkerBarChartData(this.props.currentYear,this.currentMarker.id,this.countryCode,nextProps.currentMarkerSubType.markerSubType);
					this.props.fetchmarkerSubType(this.currentMarker.id,this.countryCode);
				}
			}
		}
		renderExportPopup() {
	
			const source = this.state.dropListFilterobj.sources.value,
				year = this.props.currentYear,
				units = this.props.currentCountrySelected.countrySelected,
				keyword = this.state.searchText,
				sectors = this.state.dropListFilterobj.themes.value,
				sdgs = this.state.dropListFilterobj.sdg.value;
	
			let data, loading, templateType;
			data = {
				year: this.props.currentYear,
				unitSelected: this.props.currentCountrySelected.countrySelected,
				donorSelected: this.state.dropListFilterobj.sources.label,
				mapData: this.props.outputData.data,
				projectList: this.props.projectList,
				sectorSelected: this.state.dropListFilterobj.themes.label,
				sdgSelected: this.state.dropListFilterobj.sdg.label,
				lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
				title: this.currentMarker.title
			};
	
			loading = this.props.projectListMapData.loading || this.props.outputData.loading;
			templateType = 'projects_global';
	
			
			return (
				<ExportPopup
					templateType={templateType}
					data={data}
					loading={loading}
					downloadCsv={()=>{this.props.downLoadProjectListCsv(year,keyword,source,sectors,units,'','','','',this.currentMarker.id,this.props.currentMarkerSubType.markerSubType,'')}}
					onCloseModal={() => this.hideExportModal()}
				/>
			);
		}
	
		render({
			projectListMapData,
			router
		}, {
			projectList,
			totalDataSize,
			links
		}) {
		
			let optionData;
			const
				title = 'Our Approaches | UNDP Transparency Portal',
				description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
			if (this.props.markerSubtypes.data && this.props.markerSubtypes.data[0]){
				optionData = this.props.markerSubtypes.data.map(element => {
					return {
						label: element.title,
						value: this.currentMarker.id === 4 ||  this.currentMarker.id === 5 ||  this.currentMarker.id === 6 ? element.title : element.marker_type
					};
				}) ;
			} else {
				optionData = [];
			}
			if (this.props.code ==='sstc'){
				return ( <ErrorPage /> );
			}

			return (
				<div>
					{
						this.state.showExportModal ?
							this.renderExportPopup() : null
					}

					<Helmet title={title}
						meta={[{
							name: 'description',
							content: description
						},
						{
							property: 'og:title',
							content: title
						},
						{
							property: 'og:description',
							content: description
						},
						{
							property: 'twitter:title',
							content: title
						},
						{
							property: 'twitter:description',
							content: description
						}]}
					/>

					<CommonHeader active="our-approaches"
						title={this.currentMarker.title}
						enableSearch
						enableBanner
					/>

					<div class={style.breadCrumbWrapper}>
						<section class={style.breadcrumbSection}>
							<UrlBreadCrumb marker />
						</section>
					
						<section class={style.menuRow} >
							<section class={style.embedMenu}>
								<EmbedSection
									showExportModal={() => this.showExportModal()}
									onClickEmbed={this.openEmbedModal}
									marker={'embed&export'}
									disableDropdown
								/>
							</section>
						</section>
					</div>
					<section class={style.countryFilter}>
						<section class={style.markerTypeFilter}>
							<DropDown
								newclass
								handleClick={(value) => this.categorySelect(value.value)}
								options={optionData}
								labelStyle={style.labelStyle}
								placeHolder="Select"
								marker
								loading = {this.props.markerSubtypes.loading}
							/>
						</section>
						<NestedDropList
							countryFilter
							marker={this.currentMarker.id}
							year={this.props.currentYear}
							handleClick={() =>()=>{}}
							theme={this.props.theme}
							sdg={this.props.sdg}
							handleClickBoth={(label,value) => this.handleFilterChange('country', {value:value,label:label})}
							placeHolder={'Recipient Region /Country'}
							selectedValue={this.props.currentCountrySelected.countrySelected === '' ? '' :  this.countryName}
							selectedLabel={this.props.currentCountrySelected.countrySelected === '' ? '' :  this.countryName}
							baseURL={Api.API_BASE}
							countryName={this.props.currentCountrySelected.countrySelected  === '' ? 'Recipient Region /Country' : this.countryName}
							markerType={this.currentMarker.id}
							markerId={this.selectedMarkerId}
						/>
						<EmbedSection
							disableEmbedExport
							startYear={commonConstants.SIGNATURE_SOLUTION_YEAR}
							marker={'year'}
						/>
					</section>
					<section>
						<span class={style.subTitle}>{this.currentMarker.desc}</span>
					</section>
					<div class={style.wrapper}>
						<section>
							{
								!this.props.aggregate.loading ?
									Object.keys(this.props.aggregate.data).length ?
										<div class={style.infoWrapper}>
											<div class={style.imageWrapper}>{this.currentMarker ? <img class={style.marker_image} src={this.currentMarker.image_2} alt="sdg icon" />:null}</div>
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
						
						<section>
							<span class={style.mapSwitchContainer}>
								<span class={style.mapSwitch}>
									<button
										class={this.state.listSelected ? style.mapBtn : `${style.mapBtn} ${style.mapSelected}`}
										onClick={() => this.setState({ listSelected: false })}
									> Map </button>
									<button class={this.state.listSelected ? `${style.mapBtn} ${style.listSelected}` : style.mapBtn}
										onClick={() => this.setState({ listSelected: true })}
									>List</button>
								</span>
							</span>
							<div class={this.state.listSelected ? style.hide : style.mapWrapper}>
								<Map sector={this.state.themeSelected}
									sdg={this.state.sdgSelected}
									source={this.state.sourceSelected}
									mapData={projectListMapData}
									onCountrySelect={(country)=>this.handleFilterChange("country", {value:country.country_iso3, name:country.country_name})}
									marker={this.currentMarker.id}
									startYear={2018}
									mapId={'markerMap'}
								/>
								<div class={style.disclaimer}>
									{'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
								</div>
							</div>
							<div class={this.state.listSelected ? style.projectListWrapper : style.hide}>
								<BootTable data={projectList}
									handleFilterChange={(type, value) => this.handleFilterChange(type, value)}
									loading={this.props.loading}
									getSearchParam={(param) => { this.setState({ searchText: param }); }}
									theme={this.state.themeSelected}
									unit={this.state.unitSelected}
									keyword={this.state.keyword}
									source={this.state.sourceSelected}
									count={totalDataSize}
									links={links}
									enableMarkerDropDown
									marker={this.currentMarker.id}
									country={this.props.currentCountrySelected.countrySelected}
								/>
							</div>
						</section>
						
					</div>
					{
						(this.props.markerDescData && this.props.markerDescData.loading)?
							<div style={{ position: 'relative', height: 344 }}>
								<PreLoader />
							</div>
							:
							<section class={style.markerWrapper}>
								<MarkerDetails hideMarkerDescTable={this.hideTable} data={this.props.markerDescData.data} chartData={this.props.markerChartData} marker={this.currentMarker} country={this.countryCode} />
							</section>
					}
				
					<EmbedModal display={this.state.displayEmbedModal}
						checkList={this.state.checkList}
						modifiedUrl={this.state.selectionListUrl + this.state.filterUrl}
						handleClose={this.handleClose}
						getselectedItem={this.getselectedItem}
						handleOnSelect={this.handleOnSelect}
					/>

					<Footer />
				</div>
			);
		}
}


const mapStateToProps = (state) => {
	const {
			loading,
			error,
			projectList
		} = state.projectList,
		{
			mapCurrentYear
		} = state.mapData.yearTimeline,
		{ projectListMapData
		} = state.mapData,
		{
			outputData
		} = state.mapData,
		{
			currentYear
		} = state.yearList,
		countryList = state.countryList,
		masterDonorList = state.masterDonorList,
		aggregate =state.individualMarkerData,
		markerDescData = state.markerDescData,
		markerSubtypes = state.markerSubTypes,
		markerChartData = state.markerBarChartData,
		currentCountrySelected = state.countrySelected,
		currentMarkerSubType = state.markerSubTypeSelected;
	
	return {
		router: state.router,
		loading,
		currentCountrySelected,
		projectListMapData,
		error,
		projectList,
		currentYear,
		mapCurrentYear,
		countryList,
		masterDonorList,
		outputData,

		aggregate,
		markerDescData,
		markerChartData,
		markerSubtypes,
		currentMarkerSubType,
		lastUpdatedDate: state.lastUpdatedDate
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateMarkerSubType: value => dispatch(updateMarkerSubType(value)),
	updateCountrySelected: value => dispatch(updateCountrySelected(value)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	updateProjectList: year => dispatch(updateProjectList(year)),
	loadProjectListMapData: (year, sector, unit, source, sdg,marker,marker_id) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg,marker,marker_id)),
	updateSearchCountryField: (countryCode) => dispatch(updateSearchCountryField(countryCode)),
	clearSearchCountryField: () => dispatch(clearSearchCountryField()),
	searchResult: (searchParam, key) => dispatch(searchResult(searchParam, key)),
	onChangeRoute: (title) => dispatch(onChangeRoute(title)),
	downLoadProjectListCsv: (year,keyword,source,sectors,units,sdgs,type,signatureSolution,target,markerId,markerSubType,l2marker) => dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs,type,signatureSolution,target,markerId,markerSubType,l2marker)),
	fetchMarkerData: (year, markerType, country,markerId,level2Marker) => dispatch(fetchMarkerData(year, markerType, country,markerId,level2Marker)),
	fetchMarkerDescriptionData: (year,markerType,country,markerId) => dispatch(fetchMarkerDescriptionData(year,markerType,country,markerId)),
	fetchMarkerBarChartData: (year,markerId,country,marker_id) => dispatch(fetchMarkerBarChartData(year,markerId,country,marker_id)),
	fetchMarkerProjectList: (year, markerId,keyword,limit,offset,country,markerType) => dispatch(fetchMarkerProjectList(year, markerId,keyword,limit,offset,country,markerType)),
	fetchmarkerSubType: (markerId,country) => dispatch(fetchmarkerSubType(markerId,country))
	// fetchmarkerSubType: (markerId,country) => dispatch(fetchmarkerSubType(markerId,''))
});

export default connect(mapStateToProps, mapDispatchToProps)(Marker);