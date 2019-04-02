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
/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/************************* Redux Action Files ************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import {downLoadProjectListCsv} from '../../shared/actions/downLoadCSV';
import { getFormmattedDate } from '../../utils/dateFormatter';
import  commonConstants  from '../../utils/constants';

/************************* Style Files ************************/
import style from './style';
class SDGTargets extends Component {
	setPageHeader(type, sdg, sdgName) {
		this.props.setPageHeader({
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				},
				{
					id: 1,
					title: 'SDG '+sdg,
					link: `/sdg/${sdg}/${sdgName}`
				}, 
				{
					id: 2,
					title: type
				}
			]
		});
		this.props.onChangeRoute('SDG-TARGETS -' + type);
		this.setState({
			pageTitle:'SDG-TARGETS -'  + type + ' | UNDP Transparency Portal'
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

	constructor(props, context) {
		super(props, context);
		this.titleValue ="";
		this.subTitleValue = "";
		this.state = {
			title: false,
			displayEmbedModal: false,
			selectionListUrl: window.location.origin + '/embed/sdg/targets?',
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
					label: 'Top 10 Donors',
					key: 'topDonors'
				},
				{
					flag: false,
					label: 'Top 10 Recipient Offices',
					key: 'receipOffices'
				}
			],
			showExportModal: false,
			isSetHeader: false
		};
		this.initialChecklist = {
			title: true,
			summary: true,
			map: true,
			projectTable: false,
			topDonors: false,
			receipOffices: false
		};
		this.baseUrl = window.location.origin + '/embed/sdg/targets?';
	}


	componentDidMount = () => {
		window.scrollTo(0, 0);
		
	}


	renderExportPopup() {
		
		const source = '',
		year = this.props.mapCurrentYear,
		units = '',
		keyword = '',
		sectors = '',
		target = this.props.target_id;	

		console.log(this.props)
		let data, loading, templateType;
		data = {
			year: this.props.sdgSliderData.data.aggregate.year,
			aggregate: this.props.sdgSliderData.data.aggregate,
			budget_sources: this.props.sdgSliderData.data.budget_sources,
			top_recipient_offices: this.props.sdgSliderData.data.top_recipient_offices,
			mapData: this.props.outputData.data,
			title: 'Goal ' + (this.props.sdgSliderData.data.aggregate.sdg) + ': ' + (this.props.sdgSliderData.data.aggregate.target),
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
				downloadCsv={()=>{this.props.downLoadProjectListCsv(year,keyword,source,sectors,units,'','','',target)}}
				onCloseModal={() => this.hideExportModal()}
			/>
		);
	}
	onUpdateSDG =(e) => {
		if(e.sdg_name && !this.state.isSetHeader){
			this.setState({
				isSetHeader: true
			});
			this.setPageHeader('TARGET ' + this.props.code + '.' + this.props.target_id, this.props.code, e.sdg_name);	
		}
	}
	render({ router }) {
		const title = this.state.pageTitle,
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.',
			filterUrl = `&year=${this.props.currentYear}&target=${this.props.code + '.' + this.props.target_id}`;
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
				<CommonHeader  title= { 'TARGET ' + this.props.code + '.' + this.props.target_id} enableSearch enableBanner />
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
								The methodology applied to map delivered resources and results against the SDGs is evolving. UNDP Projects generating results linked to SDG 8 (jobs) and SDG 10 (on inequality) have been captured against SDG 1 and SDG 16 portfolios. UNDP Projects with results associated to SDG 14 (on Oceans) have been captured under SDG-15.
							</span>
						</span>
					</div>
				</div>
				<SdgPage
					currentYear={this.props.currentYear}
					sdg_code={this.props.code}
					onUpdateSDG={this.onUpdateSDG}
					target_code={this.props.code.toString() + '.' + this.props.target_id}
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
const mapStateToProps = (state) => 
{
return(
	{
	router: state.router,
	countryList: state.countryList,
	currentYear: state.yearList.currentYear,
	sdgSliderData: state.sdgSliderData,
	outputData: state.mapData.outputData,
	projectList: state.projectList,
	mapCurrentYear:state.mapData.yearTimeline.mapCurrentYear,
	lastUpdatedDate:state.lastUpdatedDate
	
});
}
const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	downLoadProjectListCsv :(year,keyword,source,sectors,units,sdgs,type,signatureSolution,target)=>dispatch(downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs,type,signatureSolution,target))	
});

export default connect(mapStateToProps, mapDispatchToProps)(SDGTargets);
