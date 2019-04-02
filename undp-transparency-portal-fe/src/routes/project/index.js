import {
	h, Component
} from 'preact';
import style from './style';
import CommonHeader from '../../components/commonHeader';
import Map from '../../components/map';
import ProjectFilter from '../../components/projectFilter';
import EmbedSection from '../../components/EmbedSection';
import BootTable from '../../components/bootstraptable';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import {
	connect
} from 'preact-redux';
import Footer from '../../components/footer';
import { getFormmattedDate } from '../../utils/dateFormatter';
import {
	updateProjectList
} from '../../shared/actions/getProjectList';
import {
	loadProjectListMapData
} from '../../shared/actions/mapActions/projectListMapData';
import {
	setPageHeader
} from '../../components/urlBreadCrumb/data/actions';
import {
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
import EmbedModal from '../../components/embedModal';
import ExportPopup from '../../components/exportPopup';
import { downLoadProjectListCsv } from '../../shared/actions/downLoadCSV';
import commonConstants from '../../utils/constants';

/****************** Third Party Components  ********************/

import Helmet from 'preact-helmet';

class Project extends Component {

	//  General Methods /////////////////////////---------------------------------------------------------->>>>>>>>>>
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
		let countryVal, themeVal, sourcesValue, sdgValue;
		switch (type) {
			case 'country':
				countryVal = value.value;
				this.setState({
					unitSelected: countryVal,
					unitLabel: value.name || value.label
				});
				this.props.loadProjectListMapData(this.props.mapCurrentYear,
					this.state.themeSelected,
					countryVal,
					this.state.sourceSelected,
					this.state.sdgSelected
				);

				this.props.updateFilters(countryVal,
					this.state.themeSelected,
					this.state.sdgSelected,
					this.state.sourceSelected,
					this.props.currentYear,
					this.appendOther);
				this.props.updateSearchCountryField(countryVal);
				this.props.searchOperatingUnitsListData(null, null);
				break;
			case 'themes':
				themeVal = value === '' ? value : parseInt(value.value);
				this.setState({
					themeSelected: themeVal
				});
				this.props.updateFilters(this.state.unitSelected,
					themeVal,
					this.state.sdgSelected,
					this.state.sourceSelected,
					this.props.currentYear,
					this.appendOther);
				this.props.loadProjectListMapData(this.props.mapCurrentYear,
					themeVal,
					this.state.unitSelected,
					this.state.sourceSelected,
					this.state.sdgSelected

				);
				this.props.updateSearchThemes(themeVal);
				this.props.searchOperatingUnitsListData(null, null);

				break;
			case 'sources':
				sourcesValue = value.value;

				this.setState({
					sourceSelected: sourcesValue
				});
				this.props.updateFilters(this.state.unitSelected,
					this.state.themeSelected,
					this.state.sdgSelected,
					sourcesValue,
					this.props.currentYear,
					this.appendOther);
				this.props.loadProjectListMapData(this.props.mapCurrentYear,
					this.state.themeSelected,
					this.state.unitSelected,
					sourcesValue,
					this.state.sdgSelected

				);
				break;

			case 'sdg':
				sdgValue = value === '' ? value : parseInt(value.value);
				this.setState({
					sdgSelected: sdgValue
				});
				this.props.updateFilters(this.state.unitSelected,
					this.state.themeSelected,
					sdgValue,
					this.state.sourceSelected,
					this.props.currentYear,
					this.appendOther);
				this.props.loadProjectListMapData(this.props.mapCurrentYear,
					this.state.themeSelected,
					this.state.unitSelected,
					this.state.sourceSelected,
					sdgValue

				);
				this.props.updateSearchSgd(sdgValue);
				this.props.searchOperatingUnitsListData(null, null);
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
		const title = 'Projects';
		this.props.onChangeRoute(title);
		this.props.setPageHeader({
			title,
			breadcrumb: [{
				id: 1,
				title: 'Home',
				link: '/'
			}, {
				id: 2,
				title
			}]
		});

	}

	//////////////////////////////////---------------------------------------------------------->>>>>>>>>>


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
			if (key === 'year' || key === 'searchText') {
				url = url + '&' + key + '=' + filterObj[key].value;
			}
			else {
				url = url + '&' + key + '=' + filterObj[key].value + '&' + key + 'Label=' + filterObj[key].label;
			}
		}
		this.setState({
			filterUrl: url
		}, () => {

		});
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


	//  Export Modal Methods /////////////////////////---------------------------------------------------------->>>>>>>>>>
	
	showExportModal() {
		this.setState({ showExportModal: true });
	}
	
	hideExportModal() {
		this.setState({ showExportModal: false });
	}

	//////////////////////////////////---------------------------------------------------------->>>>>>>>>>

	componentWillUnMount() {
		this.props.clearSearchCountryField();
	}

	constructor(props) {
		super(props);
		this.appendOther = 1;
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
			selectionListUrl: window.location.origin + '/embed/projects?',
			baseUrl: window.location.origin + '/embed/projects?',
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
			checkList: [{
				flag: true,
				label: 'Title',
				key: 'title'
			},
			{
				flag: true,
				label: 'Summary',
				key: 'summary'
			},
			{
				flag: true,
				label: 'Map',
				key: 'map'
			},
			
			{
				flag: false,
				label: 'Project List',
				key: 'projectTable'
			}
			],
			searchText: '',
			showExportModal: false

		};
		this.initialChecklist = {
			title: true,
			summary: true,
			map: true,
			projectTable: false
		};
	}

	componentWillMount() {
		this.props.clearSearchCountryField();
		this.props.searchOperatingUnitsListData(null, null);
		this.props.loadProjectListMapData(this.props.mapCurrentYear,
			this.state.themeSelected,
			this.state.unitSelected,
			this.state.sourceSelected,
			this.state.sdgSelected
		);
		this.createCheckList();
		this.generateFilterListUrl();
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.setPageHeader();
		this.props.loadProjectListMapData(undefined,
			this.state.themeSelected,
			this.state.unitSelected,
			this.state.sourceSelected,
			this.state.sdgSelected
		);
		this.props.updateFilters(this.state.unitSelected,
			this.state.themeSelected,
			this.state.sdgSelected,
			this.state.sourceSelected,
			this.props.currentYear,this.appendOther);
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

			this.props.searchOperatingUnitsListData(null, null);
			this.props.loadProjectListMapData(nextProps.mapCurrentYear,
				this.state.themeSelected,
				this.state.unitSelected,
				this.state.sourceSelected,
				this.state.sdgSelected

			);

		}
		if (this.props.currentYear !== nextProps.currentYear) {
			this.props.updateFilters(this.state.unitSelected,
				this.state.themeSelected,
				this.state.sdgSelected,
				this.state.sourceSelected,
				nextProps.currentYear,this.appendOther);

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
					item.total_budget = item.budget === null ? 0 : item.budget;
					item.total_expense = item.expense === null ? 0 : item.expense;
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
			sdgs,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
			title: 'Projects'
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

	render({
		projectListMapData,
		router
	}, {
		projectList,
		totalDataSize,
		links
	}) {

		const
			title = 'Projects | UNDP Transparency Portal',
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
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

				<CommonHeader active="projects"
					title="Projects"
					enableSearch
					enableBanner
				/>
 
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb />
					<EmbedSection showExportModal={() => this.showExportModal()}
						onClickEmbed={this.openEmbedModal}
						currentYear={this.props.currentYear}
					/>
				</div>

				<div class={style.wrapper}>
					<ProjectFilter theme={this.state.themeSelected}
						sdg={this.state.sdgSelected}
						source={this.state.sourceSelected}
						unit={this.state.unitSelected}
						unitLabel={this.state.unitLabel}
						handleFilterChange={(type, value) => this.handleFilterChange(type, value)}
						clearFilters={(type) => this.clearFilters(type)}
					/>
					<div class={style.mapWrapper}>
						<Map sector={this.state.themeSelected}
							sdg={this.state.sdgSelected}
							source={this.state.sourceSelected}
							mapData={projectListMapData}
							onCountrySelect={(country)=>this.handleFilterChange("country", {value:country.country_iso3, name:country.country_name})}
							enableTimeline
							startYear={commonConstants.PROJECTS_YEAR}
							projects={'true'}
						/>
						<div class={style.disclaimer}>
							{'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
						</div>
					</div>
				</div>

				<div class={style.projectListWrapper}>
					<BootTable data={projectList}
						handleFilterChange={(type, value) => this.handleFilterChange(type, value)}
						loading={this.props.loading}
						getSearchParam={(param) => { this.setState({ searchText: param }); }}
						enableSearch theme={this.state.themeSelected}
						unit={this.state.unitSelected}
						keyword={this.state.keyword}
						source={this.state.sourceSelected}
						count={totalDataSize}
						sdg={this.state.sdgSelected}
						links={links}
						
					/>
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
		lastUpdatedDate: state.lastUpdatedDate
	};
};

const mapDispatchToProps = (dispatch) => ({
	setPageHeader: data => dispatch(setPageHeader(data)),
	updateProjectList: year => dispatch(updateProjectList(year)),
	loadProjectListMapData: (year, sector, unit, source, sdg) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg)),
	updateSearchCountryField: (countryCode) => dispatch(updateSearchCountryField(countryCode)),
	searchOperatingUnitsListData: (searchParam, key) => dispatch(searchOperatingUnitsListData(searchParam, key)),
	clearSearchCountryField: () => dispatch(clearSearchCountryField()),
	searchResult: (searchParam, key) => dispatch(searchResult(searchParam, key)),
	updateFilters: (unit, themes, sdg, donor, year,appendOther) => dispatch(updateFilters(unit, themes, sdg, donor, year,appendOther)),
	updateSearchThemes: (themes) => dispatch(updateSearchThemes(themes)),
	updateSearchSgd: (sdg) => dispatch(updateSearchSgd(sdg)),
	onChangeRoute: (title) => dispatch(onChangeRoute(title)),
	downLoadProjectListCsv: (year,keyword,source,sectors,units,sdgs) => dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs))
});

export default connect(mapStateToProps, mapDispatchToProps)(Project);