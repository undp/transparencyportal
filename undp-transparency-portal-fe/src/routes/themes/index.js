/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/************************* Custom Component Files ************************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import EmbedSection from '../../components/EmbedSection';
import ThemesPage from '../../components/themesPage';
import Footer from '../../components/footer';
import EmbedModal from '../../components/embedModal';
import ExportPopup from '../../components/exportPopup';
/************************* Redux Action Files ************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import {downLoadProjectListCsv} from '../../shared/actions/downLoadCSV';
import { getFormmattedDate } from '../../utils/dateFormatter';
import { updateEndYear } from './actions/setEndYear';
import commonConstants from '../../utils/constants';

/**********************  Third party libraries x**********************/
import Helmet from 'preact-helmet';
/************************* Style Files ************************/
import style from './style';

class Themes extends Component {
	setPageHeader(type) {
		const title = 'Our Focus';
		this.props.setPageHeader({
			title,
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title: title + ' - ' + type
				}
			]
		});
		this.props.onChangeRoute(title + ' - ' + type);
		this.setState({
			pageTitle: title + ' - ' + type + ' | UNDP Transparency Portal'
		});
	}

	openEmbedModal = () => {
		this.createCheckList(
			this.setState({
				displayEmbedModal: true
			})
		);

	}

	handleClose = () => {
		this.setState({ displayEmbedModal: false }, () => {
			this.clearSelect();
		});
	}

	createCheckList = (callbk) => {
		let newUrl = this.baseUrl;
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
	showExportModal() {
		this.setState({ showExportModal: true });
	}
	hideExportModal() {
		this.setState({ showExportModal: false });
	}
	constructor(props, context) {

		super(props, context);
		this.setEndYear = false;
		this.state = {
			displayEmbedModal: false,
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
					label: 'Project List',
					key: 'projectTable'
				},
				{
					flag: false,
					label: 'Top Donors',
					key: 'budgetSources'
				},
				{
					flag: false,
					label: 'Top Recipient Offices',
					key: 'recepientOffices'
				},
				{
					flag: false,
					label: 'Signature Solutions',
					key: 'signatureSolutions'
				}
			],
			selectionListUrl: window.location.origin + '/embed/themes?',
			showExportModal: false

		};
		this.baseUrl = window.location.origin + '/embed/themes?';

		this.initialChecklist = {
			title: true,
			map: true,
			projectTable: false,
			budgetSources: false,
			recepientOffices: false
		};
	}


	componentDidMount = () => {
		window.scrollTo(0, 0);
		this.setPageHeader(this.props.type);
	}

	componentWillReceiveProps = (nextProps) => {
		if (nextProps.themeSliderData.data.aggregate  && !this.setEndYear){
			this.setEndYear = true;
			this.props.updateEndYear(nextProps.themeSliderData.data.aggregate.start_year, Math.min(nextProps.currentYear,nextProps.themeSliderData.data.aggregate.end_year));
			if ( nextProps.themeSliderData.data.aggregate.end_year < commonConstants.SIGNATURE_SOLUTION_YEAR){
				 _.remove(this.state.checkList, function(n) {
					return n.key  === 'signatureSolutions';
				});
			}
		}
	}

	renderExportPopup() {
		let data, loading, templateType;

		const year = this.props.mapCurrentYear,
			  sectors = this.props.code,
			  source = '',
			  units = '',
			  keyword = '',
			  sdgs = '';
				
		
		data = {
			year: this.props.themeSliderData.data.aggregate.year,
			aggregate: this.props.themeSliderData.data.aggregate,
			budget_sources: this.props.themeSliderData.data.budget_sources,
			top_recipient_offices: this.props.themeSliderData.data.top_recipient_offices,
			mapData: this.props.outputData.data.length === 0 ? this.props.themesMapData.data : this.props.outputData.data ,
			title: this.props.themeSliderData.data.aggregate.sector_name,
			projectList: { data: this.props.projectList.top10Projects },
			tabSelected: 'themes',
			donutChartData: this.props.donutChartData.resourcesModalityContribution,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
		};

		loading = this.props.projectList.loading || this.props.themeSliderData.loading || this.props.outputData.loading ;
		templateType = 'profile_sector';
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
	render({ router }) {
		const title = this.state.pageTitle,
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.',
			filterUrl = `&year=${this.props.startAndEndYears.endYear < this.props.currentYear ? this.props.startAndEndYears.endYear : this.props.currentYear}&themes=${this.props.code}&themesLabel=${this.props.type}`;
			

		return (
			<div>
				{
					this.state.showExportModal ?
						this.renderExportPopup() : null
				}
				<Helmet title={title}
					meta={[
						{ name: 'description', content: description },
						{ property: 'og:title', content: title },
						{ property: 'og:description', content: description },
						{ property: 'twitter:title', content: title },
						{ property: 'twitter:description', content: description }
					]}
				/>
				<CommonHeader title={this.props.type} enableSearch enableBanner />
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb />
					{
						this.props.startAndEndYears.startYear!=='' ?
							<section class={style.unhide } > 
								<EmbedSection
									showExportModal={() => this.showExportModal()}
									onClickEmbed={this.openEmbedModal}
									startYear = {this.props.startAndEndYears.startYear}
									endYear = {this.props.startAndEndYears.endYear}
									// section = {'themesSection'}
								/>
							</section>
						: null
					}
				</div>
				<ThemesPage
					sector_code={this.props.code}
					currentYear={this.props.currentYear}
					endYear={this.props.startAndEndYears.endYear}
				/>

				<EmbedModal
					display={this.state.displayEmbedModal}
					checkList={this.state.checkList}
					modifiedUrl={this.state.selectionListUrl + filterUrl}
					handleClose={this.handleClose}
					getselectedItem={this.getselectedItem}
					handleOnSelect={this.handleOnSelect}
				/>
				<Footer />
			</div>
		);
	}

}
const mapStateToProps = (state) => ({
	router: state.router,
	countryList: state.countryList,
	currentYear: state.yearList.currentYear,
	themeSliderData: state.themeSliderData,
	outputData: state.mapData.outputData,
	projectList: state.projectList,
	mapCurrentYear: state.mapData.yearTimeline.mapCurrentYear,
	lastUpdatedDate: state.lastUpdatedDate,
	startAndEndYears: state.startAndEndYears,
	donutChartData: state.donorProfile,
	themesMapData: state.mapData.themesMapData
});

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	updateEndYear: (startYear,endYear) => dispatch(updateEndYear(startYear,endYear)),
	downLoadProjectListCsv: (year,keyword,source,sectors,units,sdgs) => dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs))
	
});

export default connect(mapStateToProps, mapDispatchToProps)(Themes);
