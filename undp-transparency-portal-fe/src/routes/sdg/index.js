/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/************************* Custom Component Files ************************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import EmbedSection from '../../components/EmbedSection';
import SdgPage from '../../components/sdgPage';
import EmbedModal from '../../components/embedModal';
import Footer from '../../components/footer';
import ExportPopup from '../../components/exportPopup';
import  commonConstants  from '../../utils/constants';
/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/************************* Redux Action Files ************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import {downLoadProjectListCsv} from '../../shared/actions/downLoadCSV';
import { getFormmattedDate } from '../../utils/dateFormatter';


/************************* Style Files ************************/
import style from './style';
class Sdg extends Component {
	setPageHeader(type) {
		const title = 'SDG';
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
	//  Embed Modal Methods /////////////////////////
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
	//////////////////////////////////---------------------------------------------------------->>>>>>>>>>

	constructor(props, context) {
		super(props, context);
		this.state = {
			displayEmbedModal: false,
			selectionListUrl: window.location.origin + '/embed/sdg?',
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
					label: 'Targets',
					key: 'outcomes'
				},
				{
					flag: false,
					label: 'Top 10 Donors',
					key: 'topDonors'
				},
				{
					flag: false,
					label: 'Top 10 Recipient Offices',
					key: 'receipOffices'
				}
			],
			showExportModal: false
		};
		this.initialChecklist = {
			title: true,
			summary: true,
			map: true,
			projectTable: false,
			topDonors: false,
			receipOffices: false
		};
		this.baseUrl = window.location.origin + '/embed/sdg?';
	}


	componentDidMount = () => {
		window.scrollTo(0, 0);
		this.setPageHeader(this.props.type);
	}
	renderExportPopup() {

		const source = '',
		year = this.props.mapCurrentYear,
		units = '',
		keyword = '',
		sectors = '',
		sdgs = this.props.code;	


		let data, loading, templateType;
		data = {
			year: this.props.sdgSliderData.data.aggregate.year,
			aggregate: this.props.sdgSliderData.data.aggregate,
			budget_sources: this.props.sdgSliderData.data.budget_sources,
			top_recipient_offices: this.props.sdgSliderData.data.top_recipient_offices,
			mapData: this.props.outputData.data,
			title: 'Goal ' + (this.props.sdgSliderData.data.aggregate.sdg) + ': ' + (this.props.sdgSliderData.data.aggregate.sdg_name),
			projectList: this.props.projectList.projectList,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
		};

		loading = this.props.projectList.loading || this.props.sdgSliderData.loading || this.props.outputData.loading ;
		templateType = 'profile_sdg';
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
			filterUrl = `&year=${this.props.currentYear}&sdg=${this.props.code}&sdglabel=${this.props.type}`;
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
						startYear = {commonConstants.SDG_YEAR}
					/>
					<div class={style.sdgDisclaimer}>
						<span class={style.sdgbuttons}><b>About SDG Data</b></span>
						<span class={style.sdgDisclaimerText}>
							<span class={style.textsdg}>
								UNDP’s SDG data is based on the mapping of project outputs to SDG targets.  Each project output can be mapped to maximum three SDG targets to capture UNDP’s multidimensional approaches to complex development challenges.  Financial figures are divided equally to the mapped SDG targets.
							</span>
						</span>
					</div>
				</div>
				<SdgPage
					currentYear={this.props.currentYear}
					sdg_code={this.props.code}
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
	sdgSliderData: state.sdgSliderData,
	outputData: state.mapData.outputData,
	projectList: state.projectList,
	mapCurrentYear:state.mapData.yearTimeline.mapCurrentYear,
	lastUpdatedDate:state.lastUpdatedDate
	

});

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	downLoadProjectListCsv :(year,keyword,source,sectors,units,sdgs)=>dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs))	
});

export default connect(mapStateToProps, mapDispatchToProps)(Sdg);

