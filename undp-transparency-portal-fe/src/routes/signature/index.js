/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/************************* Custom Component Files ************************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import EmbedSection from '../../components/EmbedSection';
import SignaturePage from '../../components/signaturePage';
import Footer from '../../components/footer';
import EmbedModal from '../../components/embedModal';
import ExportPopup from '../../components/exportPopup';
/************************* Redux Action Files ************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import {downLoadProjectListCsv} from '../../shared/actions/downLoadCSV';
import { getFormmattedDate } from '../../utils/dateFormatter';

/**********************  Third party libraries x**********************/
import Helmet from 'preact-helmet';
/************************* Style Files ************************/
import style from './style';

class Signature extends Component {
	setPageHeader(type) {
		const title = 'Signature Solutions';
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
					label: 'Our Focus',
					key: 'ourFocus'
				}
			],
			selectionListUrl: window.location.origin + '/embed/signature?',
			showExportModal: false

		};
		this.baseUrl = window.location.origin + '/embed/signature?';

		this.initialChecklist = {
			title: true,
			map: true,
			projectTable: false,
			budgetSources: false,
			recepientOffices: false,
			ourFocus: false
		};
	}

	componentDidMount = () => {
		window.scrollTo(0, 0);
		this.setPageHeader(this.props.type);
	}
	renderExportPopup() {
		let data, loading, templateType;

		const year = this.props.mapCurrentYear,
			  signatureSolution = this.props.code,
			  source = '',
			  units = '',
			  keyword = '',
			  sdgs = '',
			  sectors = '';
		data = {
			year: this.props.themeSliderData.data.aggregate.year,
			aggregate: this.props.themeSliderData.data.aggregate,
			budget_sources: this.props.themeSliderData.data.budget_sources,
			top_recipient_offices: this.props.themeSliderData.data.top_recipient_offices,
			outcomeData: this.props.outcomeData.resourcesModalityContribution,
			mapData: this.props.outputData.data,
			title: this.props.themeSliderData.data.aggregate.sector_name,
			projectList: this.props.projectList.projectList,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
		};

		loading = this.props.projectList.loading || this.props.themeSliderData.loading || this.props.outputData.loading ;
		templateType = 'profile_sector';
		return (
			<ExportPopup
				templateType={templateType}
				data={data}
				loading={loading}
				downloadCsv={()=>{this.props.downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs,'',signatureSolution)}}
				onCloseModal={() => this.hideExportModal()}
			/>
		);
	}
	render({ router }) {
		const title = this.state.pageTitle,
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.',
			filterUrl = `&year=${this.props.currentYear}&themes=${this.props.code}&themesLabel=${this.props.type}`;

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
				<CommonHeader title={this.props.type} enableSearch enableBanner/>
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb />
					<EmbedSection
						showExportModal={() => this.showExportModal()}
						onClickEmbed={this.openEmbedModal}
					/>
				</div>
				<SignaturePage
					sector_code={this.props.code}
					currentYear={this.props.currentYear}
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
	outcomeData : state.donorProfile
});

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	downLoadProjectListCsv :(year,keyword,source,sectors,units,sdgs,type,signatureSolution) => dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs,type,signatureSolution))
	
});

export default connect(mapStateToProps, mapDispatchToProps)(Signature);
