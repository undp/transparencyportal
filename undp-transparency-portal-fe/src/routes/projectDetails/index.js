/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/************************* Custom Component Files ************************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import ProjectDescription from '../../components/projectDescription';
import BudgetSource from '../../components/budgetSource';
import { route } from 'preact-router'
import ProjectDetailTable from '../../components/projectDetailTable';
import ProjectTab from '../../components/projectTab';
import PictureGallery from '../../components/PictureGallery';
import ProjectDetailDocTable from '../../components/projectDetailDocuTable';
import PurchaseOrderTable from '../../components/purchaseOrderTable';
import PreLoader from '../../components/preLoader';
import EmbedSection from '../../components/EmbedSection';
import EmbedModal from '../../components/embedModal';
import Footer from '../../components/footer';
import ExportPopup from '../../components/exportPopup';
import { getFormmattedDate } from '../../utils/dateFormatter';
/************************* Redux Action Files ************************/
import { fetchProjectDetailsOnSelection, clearProjectDetails } from '../../../src/shared/actions/projectDetailActions';
import { loadOutputsMapData } from '../../../src/shared/actions/mapActions/fetchMapOutputs';
import { updateProjectDocumentList } from '../../../src/shared/actions/projectDetailActions/documentListActions';
import { swapDocumentList } from '../../../src/shared/actions/projectDetailActions/documentListActions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { downLoadProjectDetailsCsv } from '../../shared/actions/downLoadCSV';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/************************* util Files ************************/
import { renderCustomMetaData } from '../../utils/commonActionUtils';

/************************* Style Files ************************/
import style from './style';
class ProjectDetails extends Component {
// ------------------------ Embed section methods  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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

	// -------------------------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	onCurrentTabSelected = (currentTab) => {
		this.setState({ currentTab });
		if (currentTab === 'Documents') {
			this.props.swapDocumentList();
		}
	}

	selectCategory = (category) => {
		this.setState({ projectDocCategory: category });
		category === '' ?
			this.props.swapDocumentList()
			: this.props.updateProjectDocumentList(this.state.projectId, category);
	}

	getSearchParam = (param) => {
		this.docSearchParam = param;
	}

	setPageHeader(projectId) {
		const title = projectId ? projectId : '';
		this.props.onChangeRoute(title);
		this.props.setPageHeader({
			title,
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 1,
					title: 'Projects',
					link: '/projects'
				}, {
					id: 2,
					title
				}
			]
		});
		this.setState({
			pageTitle: `${title} | UNDP Transparency Portal`
		});
	}


	switchTableOnTabSelect = (currentTab) => {
		let rendertable = <ProjectDetailTable />;
		switch (currentTab) {
			case 'Output/Results':
				rendertable = (<ProjectDetailTable
					loading={this.props.projectDetail.output_list.loading}
				/>);
				break;
			case 'Documents':
				rendertable = (<ProjectDetailDocTable
					getSearchParam={this.getSearchParam}
					loading={this.props.projectDetail.document_list_filtered.loading}
					categorySelect={(value) => this.selectCategory(value)}
					
					data={this.props.projectDetail && this.props.projectDetail.document_list_filtered &&
						this.props.projectDetail.document_list_filtered.data
						? this.props.projectDetail.document_list_filtered.data : []}
				/>);
				break;
			case 'Purchase Order':
				rendertable = (<PurchaseOrderTable
					loading={this.props.projectDetail.purchase_orders.loading}
					data={ this.props.projectDetail &&
						this.props.projectDetail.purchase_orders
						&& this.props.projectDetail.purchase_orders.data
						? this.props.projectDetail.purchase_orders.data 
						: []}
				/>
			);
				break;
			default:
				rendertable = null;
		}
		return rendertable;
	}
	showExportModal() {
		this.setState({ showExportModal: true });
	}
	hideExportModal() {
		this.setState({ showExportModal: false });
	}
	constructor(props) {
		super(props);
		this.state = {
			currentTab: 'Output/Results',
			projectId: '',
			projectTitle: '',
			flag: false,
			showMore : false,
			selectionListUrl: window.location.origin + '/embed/projects/' + this.props.id + '?',
			baseUrl: window.location.origin + '/embed/projects/' + this.props.id + '?',
			projectDocCategory: '',
			pageTitle: '',
			checkList: this.props.id.toString() === '00094616' ? [
				{
					flag: true,
					label: 'Title',
					key: 'title'
				},
				{
					flag: true,
					label: 'Description',
					key: 'description'
				},
				{
					flag: true,
					label: 'Map',
					key: 'map'
				},
				{
					flag: false,
					label: 'Satellite',
					key: 'satellite'
				},
				{
					flag: false,
					label: 'Project Info',
					key: 'projectinfo'
				},
				{
					flag: false,
					label: 'Donors',
					key: 'budgetSources'
				},
				{
					flag: false,
					label: 'Outputs / Results',
					key: 'outputTable'
				},
				{
					flag: false,
					label: 'Documents',
					key: 'docTable'
				},
				{
					flag: false,
					label: 'Purchase Orders',
					key: 'purchaseOrdrTable'
				}

			] : [
				{
					flag: true,
					label: 'Title',
					key: 'title'
				},
				{
					flag: true,
					label: 'Description',
					key: 'description'
				},
				{
					flag: true,
					label: 'Map',
					key: 'map'
				},
				{
					flag: false,
					label: 'Project Info',
					key: 'projectinfo'
				},
				{
					flag: false,
					label: 'Donors',
					key: 'budgetSources'
				},
				{
					flag: false,
					label: 'Outputs / Results',
					key: 'outputTable'
				},
				{
					flag: false,
					label: 'Documents',
					key: 'docTable'
				},
				{
					flag: false,
					label: 'Purchase Orders',
					key: 'purchaseOrdrTable'
				}

			],
			displayEmbedModal: false,
			showExportModal: false
		};
		this.docSearchParam = '';

		this.initialChecklist = {
			title: true,
			description: true,
			map: true,
			projectinfo: false,
			outputTable: false,
			docTable: false,
			purchaseOrdrTable: false,
			budgetSources: false
		};
	}
	componentWillMount() {
		this.props.clearProjectDetails();
		let url = window.location.href,
			id = url.substring(url.lastIndexOf('/') + 1);
		this.props.fetchProjectDetailsOnSelection(id);
		this.createCheckList();
	}
	componentDidMount = () => {
		window.scrollTo(0, 0);
		this.props.loadOutputsMapData(this.props.mapCurrentYear, '', '', '', this.props.id, '');
		this.setPageHeader();
		window.scrollTo(0, 0);
	}

	componentWillReceiveProps = (nextProps) => {
		let { id } = nextProps;
		if (nextProps.projectDetail &&
			nextProps.projectDetail.project && nextProps.projectDetail.project.title) {
			if (id === nextProps.projectDetail.project.project_id && !this.state.flag) {
				this.setState({
					...this.state,
					projectId: id,
					projectTitle: nextProps.projectDetail.project.title,
					flag: true
				}, () => {
					this.setPageHeader(this.state.projectTitle);
				});
			}
		}
	}
	renderExportPopup() {
		let data, loading, templateType;
		let hash = new Map();
		this.props.projectDetail.budget_utilization.budget_data.concat(this.props.projectDetail.budget_utilization.expense_data).forEach((obj) => {
			hash.set(obj.year, Object.assign(hash.get(obj.year) || {}, obj));
		});

		let projectId = this.props.projectDetail.project.project_id,
			item = "",
			search = "",
			category = "",
			fileName = "";

		switch (this.state.currentTab) {
			case 'Output/Results':
				item = 1;
				fileName = "output_results.csv";
				break;
			case 'Documents':
				item = 2;
				category = this.state.projectDocCategory;
				search = this.docSearchParam;
				fileName = "documents.csv";
				break;
			case 'Purchase Order':
				item = 3;
				fileName = "purchase_orders.csv";
				break;
			default:
				break;
		}


		let budget_utilization_merged = Array.from(hash.values());
		// Project TimeLine Calculation
		let start = new Date(this.props.projectDetail.time_line.start_date),
			end = new Date(this.props.projectDetail.time_line.end_date),
			today = new Date(),
			timeline_completed = Math.round(((today - start) / (end - start)) * 100),
			time_line = {
				start_date: getFormmattedDate(this.props.projectDetail.time_line.start_date),
				end_date: getFormmattedDate(this.props.projectDetail.time_line.end_date),
				timeline_completed
			};
		data = {
			year: this.props.mapCurrentYear,
			project_id: this.props.projectDetail.project.project_id,
			time_line,
			purchase_orders: this.props.projectDetail.purchase_orders.data,
			project: this.props.projectDetail.project,
			budget_source: this.props.projectDetail.budget_source,
			budget_utilization: budget_utilization_merged,
			document_list: this.props.projectDetail.document_list.data,
			output_list: this.props.projectDetail.output_list.data,
			mapData: this.props.outputData.data,
			title: this.props.projectDetail.project.title,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
		};

		loading = this.props.projectDetail.loading || this.props.outputData.loading;

		templateType = 'projects_selected';

		return (
			<ExportPopup
				templateType={templateType}
				data={data}
				loading={loading}
				onCloseModal={() => this.hideExportModal()}
				downloadCsv={() => { this.props.downLoadProjectDetailsCsv(projectId, item, search, category, fileName) }}
				type = {'projectDetails'}
			/>
		);
	}

	render({ router, projectDetail, projectDetailsMapData }, state) {
		
		const title = this.state.pageTitle;
		let satelliteData = !projectDetail.loading && projectDetail.project ? projectDetail.project.storyMap : [];
		
		return (
			<div class={style.wrapper}>
				{
					this.state.showExportModal ?
						this.renderExportPopup() : null
				}
				<Helmet title={title}
					meta={[
						{ property: 'og:title', content: title },
						{ property: 'twitter:title', content: title }
					]}
				/>
				<CommonHeader active="projects" title={this.props.projectDetail.project && this.props.projectDetail.project.title ? this.props.projectDetail.project.title : 'Project Details'} enableSearch enableBanner />
				<div class={style.breadCrumbWrapper}>
					<UrlBreadCrumb />
					<EmbedSection
						showExportModal={() => this.showExportModal()}
						disableDropdown onClickEmbed={this.openEmbedModal} />
				</div>
				<div class={style.projectSection}>
					<ProjectDescription satelliteData={satelliteData} projectId={this.props.id} />
					<BudgetSource data={this.props.projectDetail.budget_source} />
				</div>
				<div class={style.projectTablesection}>
					<ProjectTab selectCategory={(value) => this.selectCategory(value)}
						purchaseOrderData={this.props.projectDetail &&
							this.props.projectDetail.purchase_orders
							? this.props.projectDetail.purchase_orders.data : []}
						document_list_filtered={this.props.projectDetail && this.props.projectDetail.document_list_filtered
							? this.props.projectDetail.document_list_filtered.data : []}
						onCurrentTabSelected={(currentTab) => this.onCurrentTabSelected(currentTab)}
					/>
					<div class={style.desktopTable}> 
						{this.switchTableOnTabSelect(this.state.currentTab)}
					</div>
				</div>
				{
					projectDetail.picture_gallery.loading ?
						<PreLoader />
						: projectDetail.picture_gallery.data.length > 0 ?
							<div class={style.gallerOuter}>
								<span class={style.galleryHeading}>Project Photos ({projectDetail.picture_gallery.data.length})</span>
								<div class={style.galleryWrapper}>
									<PictureGallery pictureList={projectDetail.picture_gallery} />
								</div>
							</div>
							: null
				}
				<EmbedModal
					display={this.state.displayEmbedModal}
					checkList={this.state.checkList}
					modifiedUrl={this.state.selectionListUrl + '&projectCat=' + this.state.projectDocCategory}
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
	projectDetail: state.projectDetail,
	projectDetailMapData: state.mapData.projectDetailMapData,
	outputData: state.mapData.outputData,
	mapCurrentYear: state.mapData.yearTimeline.mapCurrentYear,
	lastUpdatedDate: state.lastUpdatedDate
});

const mapDispatchToProps = (dispatch) => ({
	setPageHeader: data => dispatch(setPageHeader(data)),
	fetchProjectDetailsOnSelection: (id) => dispatch(fetchProjectDetailsOnSelection(id)),
	clearProjectDetails: () => dispatch(clearProjectDetails()),
	updateProjectDocumentList: (id, category) => dispatch(updateProjectDocumentList(id, category)),
	swapDocumentList: () => dispatch(swapDocumentList()),
	onChangeRoute: (title) => dispatch(onChangeRoute(title)),
	loadOutputsMapData: (year, unit, sector, source, projectId, budgetType) => dispatch(loadOutputsMapData(year, unit, sector, source, projectId, budgetType)),
	downLoadProjectDetailsCsv: (projectId, item, search, category, fileName) => dispatch(downLoadProjectDetailsCsv(projectId, item, search, category, fileName))

});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDetails);
