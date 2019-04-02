/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import { route } from 'preact-router';

/********************** Custom Components **********************/
import CommonHeader from '../../components/commonHeader';
import UrlBreadCrumb from '../../components/urlBreadCrumb';
import EmbedSection from '../../components/EmbedSection';
import PreLoader from '../../components/preLoader';
import ProfilePage from '../../components/profilePage';
import EmbedModal from '../../components/embedModal';
import Footer from '../../components/footer';
import ExportPopup from '../../components/exportPopup';
import { getFormmattedDate } from '../../utils/dateFormatter';

/****************** Third Party Components  ********************/
import Helmet from 'preact-helmet';

/********************** Redux Action Files *********************/
import { searchCountryRegionsListData } from '../../shared/actions/countryRegionSearch';
import { onChangeRoute } from '../../shared/actions/routerActions';
import { setPageHeader } from '../../components/urlBreadCrumb/data/actions';
import { downLoadProjectListCsv } from '../../shared/actions/downLoadCSV';
/********************** Utils *********************/
/************************ Style files  *************************/
import style from './style';
class CountryProfile extends Component {
	//  Embed Modal Methods /////////////////////////

	openEmbedModal = () => {
		this.createCheckList(
			this.setState({
				displayEmbedModal: true
			}, () => {
			})
		);
	}

	handleClose = () => {
		this.setState({ displayEmbedModal: false }, () => {
			this.clearSelect();
		});
	}

	createCheckList = (callbk) => {
		let newUrl = this.baseUrl[this.props.type];
		this.state.checkList[this.props.type].forEach((item, index) => {
			if (index === 0) {
				newUrl = newUrl + item.key + '=' + item.flag;
			}
			else {
				newUrl = newUrl + '&' + item.key + '=' + item.flag;
			}

		});
		this.setState({
			selectionListUrl: {
				...this.state.selectionListUrl,
				[this.props.type]: newUrl
			}
		}, () => {
			if (callbk !== undefined) {
				callbk();
			}
		});
	}


	handleOnSelect = (e, data) => {
		let selectedList = this.state.checkList[this.props.type].map((item) => item.key === data.key ? {
			flag: e.target.checked,
			label: item.label,
			key: item.key
		} : item);
		this.setState({
			checkList: {
				...this.state.checkList,
				[this.props.type]: selectedList
			}
		}, () => {
			this.createCheckList();
		});
	}

	clearSelect = () => {
		let clearedList = this.state.checkList[this.props.type].map((item) => ({
			flag: this.initialChecklist[this.props.type][item.key],
			label: item.label,
			key: item.key
		}));
		this.setState({
			checkList: {
				...this.state.checkList,
				[this.props.type]: clearedList
			}
		});
	}


	getDocCategory = (category) => {
		this.setState({
			docCategory: {
				...this.state.docCategory,
				'recipientprofile': category
			}
		});
	}

	getBudgetType = (type) => {
		this.setState({
			budgetType: type
		});
	}


	//////////////////////////////////

	//Export modal methods --------------->>>>>>>>>>>>>///


	showExportModal = () => {
		this.setState({
			showExportModal: true
		})
	}

	hideExportModal() {
		this.setState({ showExportModal: false })
	}

	renderExportPopup() {

		let source = '',
		year = this.props.mapCurrentYear,
		units = '',
		keyword = '',
		sectors = '',
		sdgs ='',
		type = '';

		let data, loading, templateType;

		switch (this.props.type) {
			case 'recipientprofile':
				const {
				basicDetails,
					budgetVsExpense,
					budgetVsExpenseSdg,
					documentList,
					recepientSdg,
					themeBudget,
					topBudgetSources
			} = this.props.recipientProfile,
					{ projectList: projects } = this.props.projectList

				units = this.state.selectedCountry.value;


				data = {
					recipientName: this.profileName,
					title: this.profileName,
					year: this.props.mapCurrentYear,
					basicDetails: basicDetails.data,
					budgetVsExpense: budgetVsExpense.data,
					budgetVsExpenseSdg: budgetVsExpenseSdg.data,
					recepientSdg: recepientSdg.data,
					themeBudget: themeBudget.data,
					topBudgetSources: topBudgetSources.data,
					projectList: projects && projects.data ? projects.data.slice(0, 10) : [],
					mapData: this.props.mapData.outputData.data ? this.props.mapData.outputData.data : [],
					themeAggregate: themeBudget.themeAggregate,
					sdgAggregate: recepientSdg.sdgAggregate,
					lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
				}
				loading = basicDetails.loading ||
					budgetVsExpense.loading ||
					budgetVsExpenseSdg.loading ||
					documentList.loading ||
					recepientSdg.loading ||
					themeBudget.loading ||
					topBudgetSources.loading ||
					this.props.projectList.loading ||
					this.props.mapData.outputData.loading ||
					(this.profileName === '');
				templateType = "profile_recipient"
				break;
			case 'donorprofile':

				source = this.state.selectedCountry.value;
				type = this.state.budgetType;
				const {
					basicDetails: basicDetail,
					budgetSources,
					regularAndOthers: regularAndOther,
					resourcesModalityContribution: resourcesModalityContri,
					topRecipientOffices
				} = this.props.donorProfile,
				{ projectList: donorProjects } = this.props.projectList;

				data = {
					donorName: this.profileName,
					title: this.profileName,
					year: this.props.mapCurrentYear,
					basicDetails: basicDetail.data,
					budgetSources: budgetSources.data,
					regularAndOthers: regularAndOther.data,
					resourcesModalityContribution: resourcesModalityContri.data,
					topRecipientOffices: topRecipientOffices.data,
					projectList: donorProjects && donorProjects.data ? donorProjects.data.slice(0, 10) : [],
					regularAndOthersCountryAggregate: regularAndOther.countryAggregate,
					resourcesModalityCountryAggregate: resourcesModalityContri.countryAggregate,
					lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
				}
				loading = basicDetail.loading ||
					budgetSources.loading ||
					regularAndOther.loading ||
					this.props.projectList.loading ||
					resourcesModalityContri.loading ||
					topRecipientOffices.loading || (this.profileName === '');
				templateType = "profile_donor"
				break;
		}
		return (
			<ExportPopup
				templateType={templateType}
				data={data}
				loading={loading}
				downloadCsv={()=>{this.props.downLoadProjectListCsv(year,keyword,source,sectors,units,sdgs,type)}}
				onCloseModal={() => this.hideExportModal()}
			/>
		)
	}

	//Export modal methods --------------->>>>>>>>>>>>>///

	setPageHeader(name, type) {
		const title = type;
		this.props.onChangeRoute(name + ' - ' + type);
		this.props.setPageHeader({
			title,
			breadcrumb: [
				{
					id: 1,
					title: 'Home',
					link: '/'
				}, {
					id: 2,
					title: name + ' - ' + type
				}
			]
		});
		this.setState({
			pageTitle: name + ' - ' + type + ' | UNDP Transparency Portal'
		});
	}
	constructor(props, context) {
		super(props, context);
		this.state = {
			projectList: [],
			unitType: '',
			selectedCountry: {
				name: '',
				iso2: '',
				iso3: '',
				email: '',
				web: ''
			},
			budgetType: 'direct',
			displayEmbedModal: false,
			showExportModal: false,
			selectionListUrl: {
				'recipientprofile': `${window.location.origin}/embed/profile/${this.props.code}/recipientprofile?`,
				'donorprofile': `${window.location.origin}/embed/profile/${this.props.code}/donorprofile?`
			},
			docCategory: {
				'recipientprofile': ''
			},
			checkList: {
				'recipientprofile': [
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
						label: 'Projects',
						key: 'projectTable'
					},

					{
						flag: false,
						label: 'Our Focus (% of Budget)',
						key: 'budgetPercThemes'
					},
					{
						flag: false,
						label: 'SDG (% of Budget)',
						key: 'budgetPercSdg'
					},
					{
						flag: false,
						label: 'Top 10 Donors',
						key: 'budgetSources'
					},
					{
						flag: false,
						label: 'Documents',
						key: 'docTable'
					}
				],
				'donorprofile': [
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
						label: 'Projects',
						key: 'projectTable'
					},
					{
						flag: false,
						label: 'Fund Modality',
						key: 'fundModality'
					},
					{
						flag: false,
						label: 'Top 10 Recipient Offices',
						key: 'recepientOffices'
					}
				]
			},
			pageTitle: ''
		};
		this.profileFound = false;
		this.profileName = '';
		this.profileType = 'Donor Profile';
		this.initialChecklist = {
			'recipientprofile': {
				title: true,
				map: true,
				projectTable: false,
				stats: true,
				budgetPercThemes: false,
				budgetPercSdg: false,
				budgetSources: false,
				docTable: false
			},
			'donorprofile': {
				title: true,
				stats: true,
				map: true,
				projectTable: false,
				contributionSplit: false,
				fundModality: false,
				recepientOffices: false
			}
		},
			this.baseUrl = {
				'recipientprofile': `${window.location.origin}/embed/profile/${this.props.code}/recipientprofile?`,
				'donorprofile': `${window.location.origin}/embed/profile/${this.props.code}/donorprofile?`
			};

	}

	componentDidMount() {
		window.scrollTo(0, 0);
		this.props.countryList.countries.forEach((item, index) => {
			if (item.iso2 === this.props.code || item.iso3 === this.props.code) {
				this.profileFound = true;
				this.setState({ unitType: 2, selectedCountry: item });
				this.profileName = item.name;
				this.setPageHeader(this.profileName, this.profileType);
			}
		});
		if (!this.profileFound) {
			this.props.searchResult.forEach((item, index) => {
				if (item.code === this.props.code) {
					item.iso3 = item.code;
					this.profileFound = true;
					this.setState({ unitType: 1, selectedCountry: item });
					this.profileName = item.name;
					this.setPageHeader(this.profileName, this.profileType);
				}
			});
		}
		if (this.props.type === 'recipientprofile') this.profileType = 'Recipient Profile';
		this.setPageHeader(this.profileName, this.profileType);
	}
	componentWillReceiveProps = (nextProps) => {
		if (nextProps.type !== this.props.type || nextProps.code !== this.props.code) {
			nextProps.type === 'recipientprofile' ? this.profileType = 'Recipient Profile' : this.profileType = 'Donor Profile';
			this.profileFound = false;
		}
		if (!this.profileFound && nextProps.countryList.countries.length) {
			nextProps.countryList.countries.forEach((item, index) => {
				if (item.iso2 === nextProps.code || item.iso3 === nextProps.code) {
					this.profileFound = true;
					this.setState({ unitType: 2, selectedCountry: item });		// Only Both Profiles
					this.profileName = item.name;
					this.setPageHeader(this.profileName, this.profileType);
				}
			});
		}

		if (!this.profileFound &&
			nextProps.masterDonorList.data !== undefined && !this.profileFound) {
			nextProps.masterDonorList.data.donors.forEach((item, index) => {
				if (item.code === this.props.code) {
					item.iso3 = item.code;
					this.profileFound = true;
					this.setState({ unitType: 3, selectedCountry: item });	// Only Donor Profile
					this.profileName = item.name;
					this.setPageHeader(this.profileName, this.profileType);

				}
			});
		}
		if (!this.profileFound &&
			nextProps.masterDonorList.data !== undefined && !this.profileFound) {
			nextProps.masterDonorList.data.donors.forEach((donor, index) => {
				donor.organisations.forEach((item, index) => {
					if (item.code === this.props.code) {
						item.iso3 = item.code;
						this.profileFound = true;
						this.setState({ unitType: 3, selectedCountry: item });	// Only Donor Profile
						this.profileName = item.name;
						this.setPageHeader(this.profileName, this.profileType);
					}
				});

			});
		}
		if (!this.profileFound && this.props.searchResult !== nextProps.searchResult) {
			nextProps.searchResult.forEach((item, index) => {
				if (item.code === this.props.code) {
					item.iso3 = item.code;
					this.profileFound = true;
					this.setState({ unitType: 1, selectedCountry: item });
					this.profileName = item.name;
					this.setPageHeader(this.profileName, this.profileType);
				}
			});
		}
		if (!this.profileFound &&
			nextProps.masterDonorList.data !== undefined && !this.profileFound) {
			nextProps.masterDonorList.data.donors.forEach((donor, index) => {
				donor.organisations.forEach((item, index) => {
					if (item.code === this.props.code) {
						item.iso3 = item.code;
						this.profileFound = true;
						this.setState({ unitType: 3, selectedCountry: item });	// Only Donor Profile
						this.profileName = item.name;
						this.setPageHeader(this.profileName, this.profileType);

					}
				});

			});
		}
	}

	render({ router }) {
		const title = this.state.pageTitle,
			description = 'At the request of the MoH, UNDP procures a range of medicines and medical products as an emergency measure, and builds the capacity needed to support a transparent, cost-effective procurement system for the Ministry.',
			filteredUrl = {
				recipientprofile: `&year=${this.props.currentYear}&docCategory=${this.state.docCategory[this.props.type]}`,
				donorprofile: `&year=${this.props.currentYear}&budgetType=${this.state.budgetType}`
			};

		if (this.props.type === 'recipientprofile' && this.profileFound) {
			this.state.selectedCountry.is_recipient ? null : route('/404');
		}
		else if (this.props.type === 'donorprofile' && this.profileFound) {
			this.state.selectedCountry.is_donor ? null : route('/404');
		}
		return (
			<div>
				{
					this.state.selectedCountry.name !== '' ?
						<div>
							<Helmet title={title}
								meta={[
									{ name: 'description', content: description },
									{ property: 'og:title', content: title },
									{ property: 'og:description', content: description },
									{ property: 'twitter:title', content: title },
									{ property: 'twitter:description', content: description }
								]}
							/>
							<CommonHeader title={this.profileName} enableSearch enableBanner/>
							<div class={style.breadCrumbWrapper}>
								<UrlBreadCrumb />
								<EmbedSection onClickEmbed={this.openEmbedModal}
									showExportModal={this.showExportModal}
								/>
							</div>
							<ProfilePage
								countries={this.state.unitType === 1 ? this.props.searchResult : this.props.countryList.countries}
								countryCode={this.props.code}
								selectedCountry={this.state.selectedCountry}
								unitType={this.state.unitType}
								profileType={this.props.type}
								getDocCategory={this.getDocCategory}
								getBudgetType={this.getBudgetType}

							/>
							
							<Footer />

							<EmbedModal

								display={this.state.displayEmbedModal}
								checkList={this.state.checkList[this.props.type]}
								modifiedUrl={this.state.selectionListUrl[this.props.type] + filteredUrl[this.props.type]}
								handleClose={this.handleClose}
								getselectedItem={this.getselectedItem}
								handleOnSelect={this.handleOnSelect}
							/>

							{
								this.state.showExportModal ?
									this.renderExportPopup()
									: null
							}

						</div>
						: <PreLoader />
				}
			</div>
		);
	}
}
const mapStateToProps = (state) => {
	const { list: searchResult } = state.countryRegionSearch,
		{ currentYear } = state.yearList,
		{ mapCurrentYear } = state.mapData.yearTimeline;
	return {
		router: state.router,
		countryList: state.countryList,
		masterDonorList: state.masterDonorList,
		recipientProfile: state.recipientProfile,
		mapData: state.mapData,
		projectList: state.projectList,
		donorProfile: state.donorProfile,
		searchResult,
		currentYear,
		mapCurrentYear,
		lastUpdatedDate:state.lastUpdatedDate
	};
};

const mapDispatchToProps = (dispatch) => ({
	onChangeRoute: (url) => dispatch(onChangeRoute(url)),
	setPageHeader: data => dispatch(setPageHeader(data)),
	searchCountryRegionsListData: () => dispatch(searchCountryRegionsListData()),
	downLoadProjectListCsv: (year, keyword, source, sectors, units, sdgs, type) => dispatch(downLoadProjectListCsv(year, keyword, source, sectors, units, sdgs, type))

});

export default connect(mapStateToProps, mapDispatchToProps)(CountryProfile);
