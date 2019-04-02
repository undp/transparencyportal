/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/****************** Custom Components Files ********************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import EmbedSection from '../../components/EmbedSection';
import ExportPopup from '../../components/exportPopup';
import DonorsPage from '../../components/donorsPage';
import { getFormmattedDate } from '../../utils/dateFormatter';
import Footer from '../../components/footer';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/*********************** Action Files  **************************/
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../shared/actions/routerActions';
import { downLoadDonorsDetailsCsv } from '../../shared/actions/downLoadCSV';
/*********************** Style Files  **************************/
import style from './style';
class CountryProfile extends Component {
	openEmbedModal = () => {								//Embed Modal
		this.donorsPage.wrappedInstance.createCheckList();
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
		const title = 'Donors';
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
	constructor(props) {
		super(props);
		this.state = {
			displayEmbedModal: false,
			filterObj:{

			},
			tabSelected:"",
			tabName:['Regular', 'Other', 'Total' ]
		};
	}


	getDataTabClick = (tabData) =>{
		const tab= tabData.fundType,
		tabName = tab === "" ? ['Regular', 'Other', 'Total'] : tab === "Regular Resources" ? ['Regular'] : tab === "Other Resources" ? ['Other']:'';
		this.setState({
			tabName:tabName
		})
	}
	
	getFilteObjectValue = (obj) =>{
		this.setState({
			filterObj:obj
		},()=>{
		})
	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.setPageHeader();
	}
	hideExportModal() {
		this.setState({ showExportModal: false })
	}
	showExportModal() {
		this.setState({ showExportModal: true })
	}
	renderExportPopup() {

		const donorTypeValue = this.state.filterObj.donorType?this.state.filterObj.donorType.value:"",
			  fundStreamsValue = this.state.filterObj.fundStream ? this.state.filterObj.fundStream.value : "",
			  fundType = this.state.filterObj.fundType?this.state.filterObj.fundType:"";

	

		let data, loading, templateType, tempData;
		if(this.state.tabName.length>1) {
			tempData = this.props.donorData.totalData.contributions
		} else if(this.state.tabName[0]==='Regular') {
			tempData = this.props.donorData.regularData.contributions
		} else if (this.state.tabName[0]==='Other') {
			tempData = this.props.donorData.otherData.contributions
		}
		data = {
			title: 'Donors',
			year: this.props.yearList.currentYear,
			tabSelected:this.state.tabName,
			tabMapper: this.state.tabName.length>1 ? ['country', 'regular_contribution', 'other_contribution', 'total_contribution'] : ['country', 'total_contribution'],
			otherContribution: this.props.donorData.data.other_contributions,
			regularContribution: this.props.donorData.data.regular_contribution,
			totalContribution: this.props.donorData.data.total_contributions,
			OtherPercentage: this.props.donorData.data.other_percentage,
			regularPercentage: this.props.donorData.data.regular_percentage,
			donorType: this.state.filterObj.donorType ?this.state.filterObj.donorType.label  : "",
			fundStreams: this.state.filterObj.fundStream ? this.state.filterObj.fundStream.label : "",
			aggerateSummary: tempData,
			lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)

		}
		loading = 	this.props.donorData.data.contributions.loading ||
					this.props.fundStreams.loading ||
					this.props.donorData.data.regular_contribution.loading ||
					this.props.donorData.data.total_contributions.loading ||
					this.props.donorData.data.other_percentage.loading ||
					this.props.donorData.data.regular_percentage.loading ||
					this.props.donorTypes.loading;
		templateType = "donors"
	

		return (
			<ExportPopup
				templateType={templateType}
				data={data}
				loading={loading}
				onCloseModal={() => this.hideExportModal()}
				downloadCsv={()=>{
					this.props.downLoadDonorsDetailsCsv(data.year,fundType,fundStreamsValue,donorTypeValue)
				}}
			>
			</ExportPopup>
		)
	}
	render({ router }, { currentYear }, {donorData}) {
		const title = 'Donors | UNDP Transparency Portal',
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.';
		return (
			< div >
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
			<CommonHeader active="donors" title={'Donors'} enableSearch enableBanner/>
			<div class={style.breadCrumbWrapper}>
				<UrlBreadCrumb />
				<EmbedSection
					onClickEmbed={this.openEmbedModal}
					showExportModal={() => this.showExportModal()} />
			</div>
			<DonorsPage
				getFilteObjectValue={this.getFilteObjectValue}
				ref={(refs) => { this.donorsPage = refs; }}
				displayEmbedModal={this.state.displayEmbedModal}
				yearList={this.props.yearList}
				handleClose={this.handleClose}
				getEmbedModalState={this.getEmbedModalState}
				getDataTabClick={this.getDataTabClick}
			/>
			<Footer />
			</div >
		);
	}

}
const mapStateToProps = (state) => ({
		router: state.router,
		yearList: state.yearList,
		donorData: state.donorData,
        donorTypes: state.donorTypes,
		fundStreams: state.fundStreams,
		lastUpdatedDate:state.lastUpdatedDate

});



const mapDispatchToProps = (dispatch) => ({
	setPageHeader: data => dispatch(setPageHeader(data)),
	onChangeRoute: (title) => dispatch(onChangeRoute(title)),
	downLoadDonorsDetailsCsv: (year,fundType,fundStream,donorType) => dispatch(downLoadDonorsDetailsCsv(year,fundType,fundStream,donorType))
});


export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(CountryProfile);
