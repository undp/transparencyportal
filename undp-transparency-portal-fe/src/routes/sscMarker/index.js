import {
	h, Component
} from 'preact';
import {
	Link
} from 'preact-router/match';
import style from './style.scss';
import CommonHeader from '../../components/commonHeader';
import Map from '../../components/map';
import ProjectFilter from '../../components/projectFilter';
import {
	projectListData
} from '../../assets/json/projectListData';
import EmbedSection from '../../components/EmbedSection';
import BootTable from '../../components/bootstraptable';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import {
	connect
} from 'preact-redux';
import {
	projectListApiRes
} from '../../assets/json/projectListApiResp';
import Footer from '../../components/footer';
import { getFormmattedDate } from '../../utils/dateFormatter';
import {
	fetchMarkerProjectList
} from '../../shared/actions/getProjectList';
import {
	loadProjectListMapData
} from '../../shared/actions/mapActions/projectListMapData';
import {
	setPageHeader
} from '../../components/urlBreadCrumb/data/actions';
import {
	fetchOperatingUnitsListData,
	updateFilters
} from '../../shared/actions/commonDataActions';
import {
	onChangeRoute
} from '../../shared/actions/routerActions';
import {
	updateSearchCountryField,
	searchOperatingUnitsListData,
	clearSearchCountryField,
	searchResult,
	updateSearchThemes,
	updateSearchSgd

} from '../../components/nestedDropList/actions';
import Api from '../../lib/api';
import EmbedModal from '../../components/embedModal';
import {
	renderCustomMetaData
} from '../../utils/commonActionUtils';
import ExportPopup from '../../components/exportPopup';
import {downLoadProjectListCsv} from '../../shared/actions/downLoadCSV';
/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';
import {selectSSCCountry} from '../../components/sscMarker/action/selectCountry';
import {selectL2Country} from '../../components/sscMarker/action/selectL2Country';
import {selectSSCMarkerType} from '../../components/sscMarker/action/selectMarkerType';
import { fetchOurApproachesData } from '../../components/sscMarker/action/ourApproaches';
import SscMarkerlegend from '../../components/sscMarkerlegend';
import VerticalFlagList from '../../components/verticalFlagList';
import PreLoader from '../../components/preLoader';
import NoDataTemplate from '../../components/no-data-template';
import { getAPIBaseUrRl } from '../../utils/commonMethods';
import { fetchMarkerBarChartData } from '../../components/markerPage/actions/barchartDataFetch';
import GroupedbarChart from '../../components/grouped-bar-chart';
import BudgetExpenseLegend from '../../components/budget-expense-legend';
import { fetchmarkerSubType } from '../../components/markerPage/actions/markerSubTypes';
import { fetchMarkerData } from '../../components/markerPage/actions';
import { fetchMarkerDescriptionData } from '../../components/markerPage/actions/typeAndDesc';
import { numberToCurrencyFormatter,numberToCommaFormatter } from '../../utils/numberFormatter';
import { aboutUsInfo } from '../../assets/json/undpAboutUsData';
import NestedDropList from '../../components/nestedDropList';
import DropDown from '../../components/filter';
import { fetchlevelTwoCountry } from '../../components/markerPage/actions/levelTwoCountry';
class SSCMarker extends Component {
	constructor(props) {
		super(props);
		this.state = {
			projectList: [],
			themeSelected: '',
			unitSelected: '',
			unitLabel: '',
			sourceSelected: '',
			sdgSelected: '',
			keyword: '',
			totalDataSize: 0,
			links: {},
			displayEmbedModal: false,
			selectionListUrl: window.location.origin + '/embed/our-approaches/ssc?',
			baseUrl: window.location.origin + '/embed/our-approaches/ssc?',
			filterUrl: '',
			dropListFilterobj: {
				country: {
					value: '',
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
					value: this.props.mapCurrentYear
				}

			},
			checkList: [
				{
				flag: true,
				label: 'Title',
				key: 'title'
				},
				{
					flag: true,
					label: 'Stats',
					key: 'stats'
				},
				{
					flag: true,
					label: 'Map',
					key: 'map'
				},
				{
					flag: false,
					label: 'Our Approaches',
					key: 'approaches'
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
				},
				{
					flag: false,
					label: 'Project List',
					key: 'projectTable'
				}
			],
			searchText: '',
			showExportModal: false,
			sscMarkerId: '3',
			showRecipientOffices: true,
			listSelected: false,
			showInfoMsg: false
		};
		this.initialChecklist = {
			title: true,
			map: true,
			approaches: false
		};
		this.selectedCountry;
		this.currentMarker = aboutUsInfo.data[_.findIndex(aboutUsInfo.data, {'id': Number(this.state.sscMarkerId)})];
		this.currentCountry_iso3 = '';
		this.currentL2Country_iso3 = '';
		this.currentL2Country_name = '';
		this.selectedMarkerSubtype = '';
		this.selectedMarkerSubLabel = '';
		this.currentUnitType = '';
		this.markerType = 2;
	}

	componentWillMount() {
		this.props.loadProjectListMapData(this.props.mapCurrentYear,'','','','',this.state.sscMarkerId);
		this.createCheckList();
		this.generateFilterListUrl();
		this.props.fetchOurApproachesData(this.currentCountry_iso3, this.currentL2Country_name, this.selectedMarkerSubtype);
		this.props.fetchMarkerBarChartData(this.props.mapCurrentYear, this.state.sscMarkerId, this.currentCountry_iso3, this.selectedMarkerSubtype, this.currentL2Country_name);
		this.props.fetchmarkerSubType(this.state.sscMarkerId, this.currentCountry_iso3);
		this.props.fetchMarkerData(this.props.mapCurrentYear, this.state.sscMarkerId, this.currentCountry_iso3 ? this.currentCountry_iso3 : 'all', this.selectedMarkerSubtype, this.currentL2Country_name ? this.currentL2Country_name: 'all');
		this.props.fetchlevelTwoCountry(this.currentCountry_iso3, this.selectedMarkerSubtype);
		if (window.outerWidth <= 767 )
			this.setState({ listSelected: true });
	}

	//  Embed Modal Methods /////////////////////////---------------------------------------------------------->>>>>>>>>>


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

	generateFilterListUrl = () => {
		let url = '';
		const filterObj = {
			...this.state.dropListFilterobj
		};
		for (let key in filterObj) {
			if (key == 'year') {
				url = url + '&' + key + '=' + filterObj[key].value;
			}
		}
		url = url + '&country=' + (this.currentCountry_iso3 ? this.currentCountry_iso3 : 'all') + '&markerSubType=' + (this.selectedMarkerSubtype ?  this.selectedMarkerSubtype :'')  + '&l2Country=' + (this.currentL2Country_iso3? this.currentL2Country_iso3 : '' ) + '&l2CountryName=' + (this.currentL2Country_name? this.currentL2Country_name : '' ) ;
		this.setState({
			filterUrl: url
		}, () => {

		});
	}


	handleOnSelect = (e, data) => {
		let selectedList = this.state.checkList.map((item) => item.key == data.key ? {
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
		//this.props.clearSearchCountryField();
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

	componentWillReceiveProps(nextProps) {
		if (this.props.mapCurrentYear != nextProps.mapCurrentYear) {
			this.props.fetchOurApproachesData(this.currentCountry_iso3, this.currentL2Country_name);
			this.props.fetchMarkerBarChartData(nextProps.mapCurrentYear, this.state.sscMarkerId, this.currentCountry_iso3, this.selectedMarkerSubtype,this.currentL2Country_name);
			this.props.fetchmarkerSubType(this.state.sscMarkerId, this.currentCountry_iso3);
			this.props.fetchMarkerData(nextProps.mapCurrentYear, this.state.sscMarkerId, this.currentCountry_iso3 ? this.currentCountry_iso3 : 'all', this.selectedMarkerSubtype, this.currentL2Country_name ? this.currentL2Country_name : 'all');
			this.props.fetchlevelTwoCountry(this.currentCountry_iso3, this.selectedMarkerSubtype);
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

		}
		if (nextProps.projectList != this.props.projectList) {
			let data = nextProps.projectList.data;
			let parseData = (data) => {
				data.forEach((item) => {
					item.country_name = item.country;
					item.probObj = {
						title: item.title,
						project_id: item.project_id
					};
					item.total_budget = item.budget == null ? 0 : item.budget;
					item.total_expense = item.expense == null ? 0 : item.expense;
				});
				return data;
			};
			this.setState({
				projectList: parseData(data),
				totalDataSize: nextProps.projectList.count,
				links: nextProps.projectList.links
			});
		}
		
	}
	componentDidMount() {
		window.scrollTo(0, 0);
		this.setPageHeader();
	}
	onSelectMarkerType = (type, l2Country) => {
		if (l2Country === 'l2Country'){
			this.currentL2Country_iso3 = type.code ? type.code : '';
			this.currentL2Country_name = type.label ? type.label : '';
			this.props.selectL2Country({
				country_iso3: type.code ? type.code : '',
				isSelected: 1,
				name: type.label ? type.label : ''
			});
		} else {
			this.selectedMarkerSubtype = type;
			if (type) {
				let selMarkerSub =_.filter(this.props.markerSubtypes.data, (o) => {
					return o.marker_type === type;
				});
				this.selectedMarkerSubLabel = selMarkerSub.length ? selMarkerSub[0].title.toString().trim() : '';
				this.markerType = type;
			} else {
				this.selectedMarkerSubLabel = '';
				this.markerType = 2;
			}
			this.props.selectSSCMarkerType( { type: type } );
		}
		this.generateFilterListUrl();
		this.fetchData();
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
			case 'l2Country':
				this.onSelectCountry(type, value)
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
	setPageHeader() {
		const title = 'SSC';
		this.props.onChangeRoute(title);
		this.props.setPageHeader({
			title,
			breadcrumb: [{
				id: 1,
				title: 'Home',
				link: '/'
			},
			{
				id: 1,
				title: 'Our Approaches',
				link: '/our-approaches'
			},
			{
				id: 2,
				title
			}]
		});

	}

	renderExportPopup() {

		const source = this.state.dropListFilterobj.sources.value,
		year = this.props.mapCurrentYear,
		units = this.state.dropListFilterobj.country.value,
		keyword = this.state.searchText,
		sectors = this.state.dropListFilterobj.themes.value,
		sdgs = this.state.dropListFilterobj.sdg.value;	

		let data, loading, templateType;
		data = {
			year: this.props.mapCurrentYear,
			unitSelected: this.state.dropListFilterobj.country.label,
			donorSelected: this.state.dropListFilterobj.sources.label,
			mapData: this.props.outputData.data,
			projectList: this.props.projectList,
			sectorSelected: this.state.dropListFilterobj.themes.label,
			sdgSelected: this.state.dropListFilterobj.sdg.label,
			sdgs: sdgs,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
			title: 'South-South and Triangular Cooperation'
		};

		loading = this.props.projectListMapData.loading || this.props.outputData.loading;
		templateType = 'projects_global';

		
		return (
			<ExportPopup
				templateType={templateType}
				data={data}
				loading={loading}
				downloadCsv={()=>{this.props.downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs)}}
				onCloseModal={() => this.hideExportModal()}
			/>
		);
	}
	showExportModal() {
		this.setState({ showExportModal: true });
	}
	hideExportModal() {
		this.setState({ showExportModal: false });
	}
	fetchData(unitType){
		this.props.fetchMarkerBarChartData(this.props.mapCurrentYear, this.state.sscMarkerId, this.currentCountry_iso3, this.selectedMarkerSubtype, this.currentL2Country_name);
		this.props.fetchMarkerData(this.props.mapCurrentYear, this.state.sscMarkerId, this.currentCountry_iso3 ? this.currentCountry_iso3 : 'all', this.selectedMarkerSubtype, this.currentL2Country_name ? this.currentL2Country_name : 'all');
		this.props.fetchOurApproachesData(this.currentCountry_iso3, this.currentL2Country_name, this.selectedMarkerSubtype);
		this.props.fetchlevelTwoCountry(this.currentCountry_iso3, this.selectedMarkerSubtype);
		this.props.fetchmarkerSubType(this.state.sscMarkerId, this.currentCountry_iso3);
		
		if(unitType === 'HQ')
			this.props.loadProjectListMapData(this.props.mapCurrentYear,'',this.currentCountry_iso3,'','',this.state.sscMarkerId);
		else if(this.currentUnitType === 'HQ')
			this.props.loadProjectListMapData(this.props.mapCurrentYear,'','','','',this.state.sscMarkerId);

		this.currentUnitType = unitType;
	}
	onSelectCountry = (type, value) => {
		switch (type) {
			case 'country':
				this.props.selectSSCCountry({
					country_iso3: value.label ? value.label : value.value ? value.value : '',
					isSelected: 1
				});
				let showOffice = true;
				showOffice = value.label || value.value ? false : true;
				this.setState({showRecipientOffices: showOffice});
				if(value.value)
					this.selectedCountry = value;
				else
					this.selectedCountry = {};
				
				if(value.label && this.currentCountry_iso3 != value.label || value.value && this.currentCountry_iso3 != value.value)
					this.currentCountry_iso3 = value.label ? value.label : value.value;
				else
					this.currentCountry_iso3 = '';
					
			break;
			case 'l2Country':
			
				this.props.selectL2Country({
					country_iso3: value.label ? value.label : '',
					isSelected: 1,
					name : value.value ? value.value: ''
				});
				if(value.value)
					this.selectedL2Country = value;
				else
					this.selectedL2Country = {};

				if(value.label && this.currentL2Country_iso3 != value.label)
					this.currentL2Country_iso3 = value.label ? value.label : '';
				else
					this.currentL2Country_iso3 = '';
				
				if(value.value && this.currentL2Country_name != value.value)
					this.currentL2Country_name = value.value ? value.value : '';
				else
					this.currentL2Country_name = '';
			break;
		}
		this.fetchData(value.unit_type);
	}
	getOurApproachesDataLength(data){
		let showApproaches = false;
		data.forEach((item) => {
			if (item.countries.length)
				showApproaches = true;
		});
		return showApproaches;
	}
	getMapImageVisibility(){
		let mapImageVisibility = false;
		if ( !this.currentCountry_iso3 && !this.currentL2Country_iso3 && this.props.projectListMapData.data.length)
			mapImageVisibility = true;
		else
			mapImageVisibility = false;
		
		return mapImageVisibility;
	}
	onClickMapImage(){
		let _this= this;
		this.setState({ showInfoMsg: true });
		setTimeout(function(){
			_this.setState({ showInfoMsg: false });
		}, 2000);
	}
	render({
		projectListMapData,
		router
	}, {
		projectList,
		totalDataSize,
		links
	}) {

		const
			title = 'Our Approaches | UNDP Transparency Portal',
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
			let optionData;
			if (this.props.markerSubtypes.data && this.props.markerSubtypes.data[0]){
				optionData = this.props.markerSubtypes.data.map(element =>{
					return {
						label: element.title,
						value: element.marker_type
					};
				}) ;
			} else {
				optionData = [];
			}
			let l2CountryData;
			if (this.props.levelTwoCountries.data && this.props.levelTwoCountries.data[0]){
				l2CountryData = this.props.levelTwoCountries.data.map(element =>{
					return {
						label: element.name,
						value: element.level_two_marker_id,
						level_3_code: element.level_3_code,
						unit_type: element.unit_type,
						code: element.code,
      			iso2: element.iso2,
      			donor_lvl: element.donor_lvl
					};
				}) ;
			} else {
				l2CountryData = [];
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
					}
					]}
				/>

				<CommonHeader active="our-approaches"
					title="South-South and Triangular Cooperation"
					enableSearch
					enableBanner
				/>

				<div class={style.breadCrumbWrapper}>
					<section class={style.firstRow}>
						<section class={style.breadcrumbSection}>
							<UrlBreadCrumb marker />
						</section>
						<section class={style.embedExport}>
							<EmbedSection   marker="embed&export" disableDropdown showExportModal={() => this.showExportModal()}
								onClickEmbed={this.openEmbedModal}
							/>
						</section>
					</section>
					<section class ={style.filterSectionWrapper}>
						
						
						<section class={`${style.menuItems} `}>
							<NestedDropList
								label=""
								handleClick={(label, value, unit_type) => {
									this.handleFilterChange('country', { label: label, value: value, unit_type: unit_type })
								}}
								countryFilter
								filterClass={style.filters}
								labelStyle={style.labelStyle}
								dropDownClass={style.dropDownWrapperSearch}
								placeHolder="Recipient Country / Region"
								preserve={'true'}
								baseURL={getAPIBaseUrRl()}
								selectedValue={this.selectedCountry ? this.selectedCountry.value : ''}
								selectedLabel={this.selectedCountry ? this.selectedCountry.name : ''}
								isSSC={'true'}
								dropRecCountryDownWrapper={style.dropRecCountryDownWrapper}
								dropRecCountryDownItem={style.dropRecCountryDownItem}
								markerType={this.state.sscMarkerId}
								markerId={this.selectedMarkerSubtype}
								levelTwoMarker={this.currentL2Country_name}
							/>
						</section>
						<section class={style.menuItems}>
							<DropDown 
							newclass
							label=""
							loading={this.props.markerSubtypes.loading}
							handleClick={(value) => this.onSelectMarkerType(value.value, '')}
							options={optionData}
							labelStyle={style.labelStyle}
							l2dropDownOuterWrapper={style.typeDropDownOuterWrapper}
							markerTypeLabel={style.markerTypeLabel}
							sscDropdown={'true'}
							preserve={'true'}
							selectedValue={this.selectedMarkerSubtype ? this.selectedMarkerSubtype: '' }
							selectedLabel={this.selectedMarkerSubLabel ? this.selectedMarkerSubLabel: ''}
							filters2={style.filters2}
							placeHolder="Select"/>
						</section>
						<section class={style.menuItems}>
							<DropDown 
							newclass
							label=""
							handleClick={(value) => this.onSelectMarkerType(value, 'l2Country')}
							options={l2CountryData}
							loading={this.props.levelTwoCountries.loading}
							labelStyle={style.labelStyle}
							l2dropDownOuterWrapper={style.l2dropDownOuterWrapper}
							markerTypeLabel={style.markerTypeLabel}
							sscDropdown={'true'}
							filters2={style.filters2}
							baseURL={getAPIBaseUrRl()}
							isCountry={'true'}
							placeHolder="Cooperating Country"/>
						</section>
						<section class={style.yearOnlyFilter}>
							<EmbedSection disableEmbedExport startYear={2018} marker showExportModal={() => this.showExportModal()}
								onClickEmbed={this.openEmbedModal}
							/>
						</section>
						
					</section>
				</div>
				<section>
					<span class={style.subTitle}>{this.currentMarker.desc}</span>
				</section>
				<div class={style.wrapper}>
				<section>
					{
							!this.props.aggregate.loading ?
								Object.keys(this.props.aggregate.data).length ?
									<div class={style.summaryWrapper}>
										{this.state.sscMarkerId ? <div class={style.imgDiv}><img class={style.marker_image} src={this.currentMarker.image_2} alt="ssc" /></div>:null}
										<ul class={`${style.list} ${style.ulWithFlag}`}>
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
						<div class={this.state.listSelected || this.getMapImageVisibility() ? style.hide : style.mapWrapper}>
							<Map source={this.state.sourceSelected}
								mapData={projectListMapData}
								isSSCMarker={'true'}
								mapId={'sscMap'}
								onCountrySelect={(country)=>this.handleFilterChange("country", {value:country.country_iso3, name:country.country_name})}
							/>
						</div>
						<div onClick={() => this.onClickMapImage()} class={this.state.listSelected || !this.getMapImageVisibility() ? style.hide : style.mapWrapper}>
							<img class={style.mapImg} style={this.getMapImageVisibility() ? 'display:block' : 'display:none'} src={'/assets/images/ssc/'+this.markerType+'.png'}/>
							<div class={!this.state.showInfoMsg ? style.infoMsg : style.infoMsgBg}>
								<div class={!this.state.showInfoMsg ?  style.text : style.infoTextOpacity}>Use filter to select the country</div>
							</div>
							
						</div>
						<SscMarkerlegend onSelectMarkerType={(value) => this.onSelectMarkerType(value, '')} />
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
							marker={this.state.sscMarkerId}
							optionData={optionData}
							isSSCMarker={'true'}
							country={this.currentCountry_iso3}
							l2country={this.currentL2Country_name}
							id={'markerMap'}
							selectedMarkerSubtype={this.selectedMarkerSubtype}
							/>
						</div>
					</section>
				</div>
				
				{this.props.sscApproachesData
				&& !this.props.sscApproachesData.loading ?
				this.props.sscApproachesData.data.length && this.getOurApproachesDataLength(this.props.sscApproachesData.data) ?
					<div class={ this.state.listSelected ? `${style.flagListWrapper}` : `${style.flagListWrapperTop}`}>
						<VerticalFlagList apiBase={getAPIBaseUrRl()} data={this.props.sscApproachesData.data} />
					</div>
					:
						<NoDataTemplate />
					:
					<div style={{ position: 'relative', height: 240 }}>
						<PreLoader />
					</div>
				}
				<div class={`${style.chartWrapper}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>Top 10 Donors</span>
							<BudgetExpenseLegend />
						</span>

						{
						!this.props.markerChartData.loading ?
							<div>
								{
								this.props.markerChartData.data.budget_sources && this.props.markerChartData.data.budget_sources.length?
								<div class={style.budget_sources_wrapper}>
									<GroupedbarChart
										chart_id="marker_budget_sources"
										width={1250}
										height={500}
										min_height={540}
										data={this.props.markerChartData.data.budget_sources}
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
				<div class={this.state.showRecipientOffices ? `${style.chartWrapper}` :`${style.displayNone}`}>
					<div class={style.top_budget_sources_wrapper}>
						<span class={style.chartHead}>
							<span>Top 10 Recipient Offices</span>
							<BudgetExpenseLegend />
						</span>
						{!this.props.markerChartData.loading ?
							(this.props.markerChartData.data.top_recipient_offices && this.props.markerChartData.data.top_recipient_offices.length)?
								<div class={style.budget_sources_wrapper}>
									<GroupedbarChart
										chart_id="sdg_profile_top_recipient_offices"
										width={1250}
										height={500}
										min_height={540}
										data={this.props.markerChartData.data.top_recipient_offices}
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
		themeList = state.themeList,
		sdgData = state.sdgData,
		countryList = state.countryList,
		masterDonorList = state.masterDonorList;
	const sscApproachesData = state.sscApproachesData,
		markerChartData = state.markerBarChartData,
		markerSubtypes = state.markerSubTypes,
		aggregate =state.individualMarkerData,
		levelTwoCountries = state.levelTwoCountries,
		sscMarkerPathData = state.sscMarkerPathData;
	return {
		router: state.router,
		loading,
		projectListMapData,
		error,
		projectList,
		currentYear,
		mapCurrentYear,
		themeList,
		sdgData,
		countryList,
		masterDonorList,
		outputData,
		lastUpdatedDate: state.lastUpdatedDate,
		sscApproachesData,
		markerChartData,
		markerSubtypes,
		aggregate,
		levelTwoCountries,
		sscMarkerPathData
	};
};

const mapDispatchToProps = (dispatch) => ({
	setPageHeader: data => dispatch(setPageHeader(data)),
	loadProjectListMapData: (year, sector, unit, source, sdg, marker) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg, marker)),
	searchOperatingUnitsListData: (searchParam, key) => dispatch(searchOperatingUnitsListData(searchParam, key)),
	searchResult: (searchParam, key) => dispatch(searchResult(searchParam, key)),
	onChangeRoute: (title) => dispatch(onChangeRoute(title)),
	downLoadProjectListCsv: (year,keyword,source,sectors,units,sdgs) => dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs)),
	selectSSCCountry: data => dispatch(selectSSCCountry(data)),
	selectL2Country: data => dispatch(selectL2Country(data)),
	fetchOurApproachesData: (country, lCountry, markerType) => dispatch(fetchOurApproachesData(country, lCountry, markerType)),
	fetchMarkerBarChartData: (year, markerId, country, markerType, lCountry) => dispatch(fetchMarkerBarChartData(year, markerId, country, markerType, lCountry)),
	fetchmarkerSubType: (markerId, country) => dispatch(fetchmarkerSubType(markerId, country)),
	fetchMarkerData: (year, markerId, country, markerType, lCountry ) => dispatch(fetchMarkerData(year, markerId, country, markerType, lCountry)),
	fetchMarkerProjectList: (year, markerId, keyword, limit, offset, country, markerType, lCountry) => dispatch(fetchMarkerProjectList(year, markerId, keyword, limit, offset, country, markerType, lCountry)),
	selectSSCMarkerType: data => dispatch(selectSSCMarkerType(data)),
	fetchlevelTwoCountry: ( country, markerId ) => dispatch(fetchlevelTwoCountry( country, markerId ))
});

export default connect(mapStateToProps, mapDispatchToProps)(SSCMarker);