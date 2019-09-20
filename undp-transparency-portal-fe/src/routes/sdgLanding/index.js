/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/****************** Custom Components Files ********************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import EmbedSection from '../../components/EmbedSection';
import EmbedModal from '../../components/embedModal';
import ExportPopup from '../../components/exportPopup';
import SDGLandingPage from '../../components/sdgLandingPage';
import Footer from '../../components/footer';
import  commonConstants  from '../../utils/constants';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/*********************** Action Files  **************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import { downLoadDonorsDetailsCsv,downLoadProjectListCsv } from '../../shared/actions/downLoadCSV';
import { updateSDG } from './action';

/*********************** Common Utility Files *********************/
import { getFormmattedDate } from '../../utils/dateFormatter';

/*********************** Style Files  **************************/
import style from './style';
class SdgLanding extends Component {
	openEmbedModal = () => {								//Embed Modal
		this.setState({
			displayEmbedModal: true
		});
	}

	handleClose = (callbk) => {
		this.setState({ displayEmbedModal: false }, () => {
			callbk();
		});
	}
	setPageHeader() {
		const title = 'Sustainable Development Goals';
		this.props.onChangeRoute(title);
		this.props.setPageHeader({
			title,
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title
				}
			]
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
	constructor(props) {
		super(props);
		this.baseUrl = window.location.origin +'/embed/sustainable-development-goals?';
		this.state = {
			displayEmbedModal: false,
			selectionListUrl: window.location.origin + '/embed/sustainable-development-goals?',
			checkList: [
				{
					flag: true,
					label: 'Title',
					key: 'title'
				},
				{
					flag: true,
					label: 'Summary',
					key: 'summary'
				}
			],
			showExportModal: false
		};
	}
	
	getFilteObjectValue = (obj) =>{
		this.setState({
			filterObj:obj
		},()=>{
		})
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.updateSDG('');
		this.setPageHeader();
	}
	hideExportModal() {
		this.setState({ showExportModal: false })
	}
	showExportModal() {
		this.setState({ showExportModal: true });
	}
	renderExportPopup() {

		let data = {
			title: 'Sustainable Development Goals',
			chartData: this.props.sdgSunburstData ,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
			sdg_code_selected: this.props.sdgSelected.sdg_code_selected
		};

		let loading = 	false,
			templateType = "sdgChart";
		return (
			<ExportPopup
				templateType={templateType}
				data={data}
				loading={loading}
				usePuppeteer={'true'}
				onCloseModal={() => this.hideExportModal()}
				downloadCsv={()=>{this.props.downLoadProjectListCsv(this.props.currentYear,'','','','',this.props.sdgSelected.sdg_code_selected,'','','')}}
			/>
		)
	}
	render({ router }, { currentYear }, {donorData}) {
		const title = 'SDG | UNDP Transparency Portal',
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.',
			filterUrl = `year=${this.props.currentYear}`;
		return (
			<div >
				{
					this.state.showExportModal ?
						this.renderExportPopup()
						: null
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
			<CommonHeader active="sdg" title={'Sustainable development goals'} enableSearch enableBanner />
			<div class={style.breadCrumbWrapper}>
				<UrlBreadCrumb />
				<EmbedSection
					onClickEmbed={this.openEmbedModal}
					showExportModal={() => this.showExportModal()}
					startYear={commonConstants.SDG_YEAR}
					hideExport={'true'}
				 />
			</div>
			<SDGLandingPage
				displayEmbedModal={this.state.displayEmbedModal}
				yearList={this.props.yearList} 
				handleClose={this.handleClose}
				getEmbedModalState={this.getEmbedModalState}
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
			</div >
		);
	}

}
const mapStateToProps = (state) => ({
	router: state.router,
	sdgSunburstData: state.sdgSunburstData,
	currentYear: state.yearList.currentYear,
	sdgSelected: state.sdgSelected,
	lastUpdatedDate: state.lastUpdatedDate
});

const mapDispatchToProps = (dispatch) => ({
	setPageHeader: data => dispatch(setPageHeader(data)),
	onChangeRoute: (title) => dispatch(onChangeRoute(title)),
	updateSDG: (sdgCode) => dispatch(updateSDG(sdgCode)),
	downLoadProjectListCsv: (year,keyword,source,sectors,units,sdgs,type,signatureSolution,target,markerId,markerSubType,l2marker) => dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs,type,signatureSolution,target,markerId,markerSubType,l2marker)),
	downLoadDonorsDetailsCsv: (year,fundType,fundStream,donorType) => dispatch(downLoadDonorsDetailsCsv(year,fundType,fundStream,donorType))
});


export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(SdgLanding);
