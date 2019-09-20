import { h, Component } from 'preact';
import List from '../../components/listView';
import SideBarItem from '../../components/sideBarItem';
import SideBarDonorItem from '../../components/sideBarItemDonors';
import PreLoader from '../../components/preLoader';
import { connect } from 'preact-redux';
import AllThemesBar from '../../components/allThemesBar';
import DonorSlider from '../DonorSlider';
import ThemeSlider from '../themeSlider';
import SdgSlider from '../sdgSlider';
import { Scrollbars } from 'react-custom-scrollbars';
import NestedList from '../nestedList';
import { fetchDonorSliderData } from '../themeSlider/actions/index';
import { fetchSignatureSliderData } from '../themeSlider/actions/signatureDonor';
import { fetchSignatureOutcome , fetchSignatureSolutionChartData } from '../themeSlider/actions/signatureOutcome';
import { fetchSdgSliderData } from '../sdgSlider/actions';
import donorProfile from '../profilePage/actions/donorActions';
import { updateProjectList } from '../../shared/actions/getProjectList';
import NoDataTemplate from '../no-data-template';
import style from './style';
import { updateSignatureSolution } from './action/updateSS'
import { fetchSdgSliderTargetData } from '../sdgSlider/actions/targetAction';
import { getAPIBaseUrRl } from '../../utils/commonMethods';
import commonConstants from '../../utils/constants';

class SideBar extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			donorSearch: '',
			selectedIndex: -1,
			slider: false,
			allThemesSelected: true,
			showSelect: false,
			selectedText: '',
			data: {}

		};
		this.selectedSSId = '';
		this.selectedThemesId = '';
		this.lastSelectedTab = 'country';
	}
	componentWillReceiveProps(nextProps) {
		this.setState({
			allThemesSelected: true,
			data: nextProps.data.data
		});
		if (this.props.mapCurrentYear !== nextProps.mapCurrentYear){
			if (nextProps.tabSelected === 'signature')
				this.selectedSSId = '';
			else if (nextProps.tabSelected === 'themes')
				this.selectedThemesId = '';
			else if (nextProps.tabSelected === 'sdg')
				nextProps.sdgFilter.selectedSdg = '';
		}		
			

		if (nextProps.tabSelected === 'donors') {
			this.setState({ selectedIndex: -1 });
			if (nextProps.data && nextProps.data.data && nextProps.data.data.data) {
				nextProps.data.data.data.forEach((item, index) => {
					if ((item.level_3_code !== '' && item.level_3_code === nextProps.donorFilter.budgetSources) ||
						(item.ref_id && item.ref_id === nextProps.donorFilter.budgetSources)) {
						this.setState({ selectedIndex: index });
						return;
					}
				});
			}
		}
		else if (nextProps.tabSelected == 'themes' ) {
			this.setState({ selectedIndex: -1 });
			if (nextProps.data && nextProps.data.data && nextProps.data.data.sector) {
				nextProps.data.data.sector.forEach((item, itemIndex) => {
					if ( this.selectedThemesId && (item.sector != '' && item.sector == this.selectedThemesId) ) {
						this.setState({ selectedIndex: itemIndex });
						return;
					}
				});
			}
		}
		else if (nextProps.tabSelected === 'signature' ) {
			this.setState({ selectedIndex: -1 });
			if (nextProps.data && nextProps.data.data && nextProps.data.data.sector) {
				nextProps.data.data.sector.forEach((item, itemIndex) => {
					if ( this.selectedSSId && (item.ss_id != '' && item.ss_id == this.selectedSSId) ) {
						this.setState({ selectedIndex: itemIndex });
						return;
					}
				});
			}
		}
		else if (nextProps.tabSelected == 'sdg') {
			this.setState({ selectedIndex: -1 });
			if (nextProps.data && nextProps.data.data && nextProps.data.data.sdg) {
				nextProps.data.data.sdg.forEach((item, index) => {
					if ((item.sdg_code != '' && item.sdg_code == nextProps.sdgFilter.selectedSdg)) {
						this.setState({ selectedIndex: index });
						return;
					}
				});
			}
		}
		if (this.props.donorFilter != nextProps.donorFilter) {
			if (nextProps.tabSelected == 'donors') {
				if (nextProps.donorFilter.budgetSourcesLabel == '') {
					this.setState({ slider: false });
				}
			}
			else {
				this.setState({ slider: false, selectedIndex: -1 });
			}
		}

		if (this.props.mapCurrentYear !== nextProps.mapCurrentYear || this.props.tabSelected !== nextProps.tabSelected) {
			this.setState({ slider: false });
		}
		if(this.lastSelectedTab !== nextProps.tabSelected)
			this.lastSelectedTab = nextProps.tabSelected;

	}
	selectRow = (item, index, type) => {
		if(this.props.tabSelected === 'themes' && this.props.themeFilter){
			this.props.updateProjectList(this.props.mapCurrentYear, this.props.themeFilter.operatingUnits, this.props.themeFilter.budgetSources, item, '', '', '', '', '','');
		}

		if(this.props.tabSelected === 'signature' && this.props.themeFilter){
			this.props.updateProjectList(this.props.mapCurrentYear, this.props.themeFilter.operatingUnits, this.props.themeFilter.budgetSources, '', '', '', '', '', '','',item);
		}
		if(this.props.tabSelected === 'sdg' && this.props.sdgFilter){
			this.props.updateProjectList(this.props.mapCurrentYear, this.props.sdgFilter.operatingUnits, this.props.sdgFilter.budgetSources, '', '', '', '', '', item,'','');
		}
		
		this.props.selectThemeSdg(item, type);
		this.props.updateSSThemesFilter(this.props.tabSelected, item);
		this.props.tabSelected === 'signature' ? 
			this.props.updateSignatureSolution(item)
		:	null;
		if (type == 'sector') {
			if (this.state.slider && this.props.tabSelected == 'themes') {
				this.props.fetchDonorSliderData(this.props.mapCurrentYear, item);
			}
			if(this.props.tabSelected == 'signature'){
				this.props.fetchSignatureSliderData(this.props.mapCurrentYear, item);
				this.props.fetchSignatureOutcome(item, this.props.mapCurrentYear);
			}
			if(this.props.tabSelected == 'themes' && this.props.mapCurrentYear >= commonConstants.SIGNATURE_SOLUTION_YEAR){
				this.props.fetchSignatureSolutionChartData(item, this.props.mapCurrentYear);
			}
			this.props.updateThemeFilter('selectedTheme', item);
			this.setState({
				selectedIndex: index,
				allThemesSelected: false
			});	
			this.updateSSThemesIndex(this.props.tabSelected, item);		
		}
		else {
			if (this.state.slider && this.props.tabSelected == 'sdg') {
				this.props.fetchSdgSliderData(this.props.mapCurrentYear, item);
				this.props.fetchSdgSliderTargetData(this.props.mapCurrentYear, item);
			}
			this.props.updateSdgFilter('selectedSdg', item);
			this.setState({
				selectedIndex: index
			});
		}
	}
	selectDonorRow = (index, level_3_code, donorName) => {
		if (this.state.slider && this.props.tabSelected == 'donors') {
			this.props.getDonorDetails(level_3_code, this.props.mapCurrentYear);
		}
		this.props.updateSearchDonorsText(donorName);
		this.props.updateDonorFilter('budgetSources', level_3_code);
		this.props.updateDonorFilter('budgetSourcesLabel', donorName);
		this.setState({
			selectedIndex: index,
			allThemesSelected: false
		});
		this.props.selectDonor(level_3_code);
	}
	selectAllThemes = () => {
		if (this.props.tabSelected !=='donors'){
			this.setState({
				selectedIndex: -1,
				allThemesSelected: true,
				slider: false
			},
			() => {
				this.props.updateSSThemesFilter(this.props.tabSelected, '');
				this.updateSSThemesIndex(this.props.tabSelected, '');
				this.props.selectThemeSdg(null, this.props.tabSelected);
			}
			);
		}

	}


	enableSlider = (flag) => {
		if (flag === this.state.slider) {
			this.setState({ slider: false });
		} else {
			this.setState({ slider: flag });
		}
	}

	handleLanguage = (flag) => {
		this.enableSlider(flag);
		this.setState({
			selectedIndex: -1,
			allThemesSelected: true
		});
	}

	renderRow = (item, index) => this.props.tabSelected === 'themes' || this.props.tabSelected === 'sdg' || this.props.tabSelected === 'signature' ?
		<SideBarItem data={item.item}
			tabSelected={this.props.tabSelected}
			index={index}
			apiBase={getAPIBaseUrRl()}
			selectMap={() => this.props.selectMap()}
			selected={(this.state.selectedIndex === index || this.state.selectedIndex == null ) ? true : false}
			selectRow={(item, index, type) => this.selectRow(item, index, type)}
			onSelectLanguage={this.handleLanguage}
		/>
		:
		<SideBarDonorItem data={item.item}
			mapCurrentYear={this.props.mapCurrentYear}
			index={index}
			selectMap={() => this.props.selectMap()} 
			selected={(this.state.selectedIndex === index || this.state.selectedIndex == null) ? true : false}
			selectRow={(item) => {
				let code = item.data.ref_id ? item.data.ref_id : item.data.level_3_code;
				let donorName = item.data.level_3_name;
				this.selectDonorRow(item.index, code, donorName);
			}
			}
			onSelectLanguage={this.handleLanguage}
		/>

	handleSearchClose = () => {
		this.setState({ showSelect: false, selectedIndex: -1 });
		this.props.selectThemeSdg(null, this.props.tabSelected);
		this.props.searchResult('', 'searcbar');
		this.props.updateDonorFilter('budgetSources', '');
		this.props.updateDonorFilter('budgetSourcesLabel', '');
		this.props.fetchDonorFundListData();
		this.props.updateSearchDonorsText('');
		this.props.searchCountryListData('');
	}

	handleOnInputChange = (e) => {
		if (this.props.donorFilter.budgetSourcesLabel) {
			this.props.updateDonorFilter('budgetSources', '');
			this.props.updateDonorFilter('budgetSourcesLabel', '');
		}

		this.props.updateSearchDonorsText(e.target.value);
		this.setState({
			donorSearch: e.target.value
		}, () => {
			if (this.state.donorSearch === '') {
				this.setState({ showSelect: false, selectedIndex: -1 });
				this.props.searchResult(this.state.donorSearch, 'searcbar');
				this.props.updateDonorFilter('budgetSources', '');
				this.props.fetchDonorFundListData();
			} else {
				this.setState({ showSelect: true });
				this.props.searchResult(this.state.donorSearch, 'searcbar');
				// this.props.fetchDonorFundListData(this.props.mapCurrentYear,this.props.donorFilter.operatingUnits);
			}
		});
	}

	handleSelectBudgetSourcesDonors = (data) => {
		this.setState({ showSelect: false, selectedText: data.name });
		this.props.searchCountryListData(data.code);
		this.props.updateDonorFilter('budgetSources', data.code);
		this.props.updateDonorFilter('budgetSourcesLabel', data.name);
		this.props.fetchDonorFundListData();
	}
	updateSSThemesIndex(tabSelected, item){
		switch (tabSelected) {
			case 'themes':
				this.selectedThemesId = item;
			break;
			case 'signature':
				this.selectedSSId = item;
			break;
		}
	}
	// searchDonorText
	render({ themeSummary, tabSelected, budgetSourceSearch, donorFilter }, state) {

		let isEmpty = (tabSelected === 'themes' || tabSelected === 'signature') ?
				(this.props.data && this.props.data.data && this.props.data.data.sector && this.props.data.data.sector.length !== 0) :
				((tabSelected === 'donors') ?
					this.props.data && this.props.data.data && this.props.data.data.data && this.props.data.data.data.length !== 0 :
					this.props.data && this.props.data.data && this.props.data.data.sdg && this.props.data.data.sdg.length !== 0
				),
			tabData = (tabSelected === 'themes' || tabSelected === 'signature') ?

				this.props.data.data.sector
				: (
					(tabSelected === 'donors') ? this.props.data.data.data
						: this.props.data.data.sdg
				);
 
		const searchDonorText = budgetSourceSearch.searchDonorText;
		
		return (
			<aside class={tabSelected === 'donors' ? `${style.theme_container} ${style.themedonor_container}` : style.theme_container}>
				{/* <aside class={style.theme_container}> */}
				{tabSelected === 'donors' &&
					<div class={style.searchContainer}>
						<span class={style.searchLabel}>{'Search for donors'}</span>
						<div class={style.donorSearch}>
							<div class={style.searchItems}>
								<input type="text" name="search"
									value={donorFilter.budgetSourcesLabel ? donorFilter.budgetSourcesLabel : budgetSourceSearch.searchDonorText}
									class={style.searchField}
									placeholder="Enter donor name"
									onInput={(e) => { this.handleOnInputChange(e); }}
									autocomplete="off"
								/>
								{
									searchDonorText === '' ? <span class={`${style.searchIcon} ${style.searchIconSearch}`}></span> :
										<span onClick={() => { this.handleSearchClose(); }} class={` ${style.searchIcon} ${style.searchIconClose} `}></span>
								}

							</div>

							{
								this.state.showSelect ? <NestedList
									loading={budgetSourceSearch.searchBarResultLoading}
									searchText={budgetSourceSearch.searchDonorText}
									handleChange={this.handleSelectBudgetSourcesDonors}
									dataList={this.props.budgetSourceSearch.searchResultSearchBar}
									wrapperStyle={{ left: 0, right: 0, top: 25, position: 'absolute', paddingTop: 35 }}
									donor = {tabSelected === 'donors' ? true : false} /> : null

							}
						</div>
					</div>
				}
				<Scrollbars
					renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
					<AllThemesBar data={this.state.data.project}
						tabSelected={tabSelected}
						selectRow={() => this.selectAllThemes()}
						selected={this.state.selectedIndex}
					/>

					
					{	
						this.props.themesLoading || this.props.donorsLoading || this.props.sdgLoading ?
							<PreLoader />

							: isEmpty ?
								<List
									data={tabData}
									renderItem={this.renderRow}
								/>
								:
								<NoDataTemplate />
					}

				</Scrollbars>
				<div class={this.state.slider && tabSelected === 'donors' ? `${style.sliderDonor} ${style.sliderVisible}` : ` ${style.sliderDonor}`} >
					<DonorSlider
						data={this.props.donorSliderData}
						donutBudget={this.state.donutBudget}
						donutModality={this.state.donutModality}
						slider={this.state.slider}
						closeSlider={() => this.setState({ slider: false })} />
				</div>

				<div class={this.state.slider && (tabSelected === 'themes' || tabSelected === 'signature') ? `${style.sliderDonor} ${style.sliderVisible}` : ` ${style.sliderDonor}`} >
					<ThemeSlider
						slider={this.state.slider}
						tab={tabSelected}
						closeSlider = {() => this.setState({ slider: false })}
						data={this.props.themeSliderData}
						loading={this.props.themeSliderLoading}
						outcomeData={this.props.donorSliderData}
					/>
				</div>

				<div class={this.state.slider && tabSelected === 'sdg' ? `${style.sliderDonor} ${style.sliderVisible}` : ` ${style.sliderDonor}`} >
					<SdgSlider
						slider={this.state.slider}
						closeSlider={() => this.setState({ slider: false })}
						data={this.props.sdgSliderData}
						loading={this.props.sdgSliderLoading}
						sdgTargetData={this.props.sdgTargetSliderData}
						baseURL={getAPIBaseUrRl()}
					/>
				</div>

			</aside>
		);
	}
}
const mapStateToProps = (state) => {
	const { mapCurrentYear } = state.mapData.yearTimeline;
	const { donorFilter, themeFilter, sdgFilter } = state.tabData;
	return {
		year: state.yearSummary.data.year,
		themeSliderData: state.themeSliderData.data,
		themeSliderLoading: state.themeSliderData.loading,
		donorSliderData: state.donorProfile,
		sdgSliderData: state.sdgSliderData.data,
		sdgSliderLoading: state.sdgSliderData.loading,
		mapCurrentYear,
		donorFilter,
		themeFilter,
		sdgFilter,
		themesLoading: state.themeSummary.loading,
		donorsLoading: state.donorFundList.loading,
		sdgLoading: state.sdgAggregate.loading,
		tabSelected: state.tabData.tabSelected,
		sdgTargetSliderData: state.sdgTargetSliderData,
		curState: state
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchDonorSliderData: (year, sector) => dispatch(fetchDonorSliderData(year, sector)),
	fetchSdgSliderData: (year, sdg) => dispatch(fetchSdgSliderData(year, sdg)),
	getDonorDetails: (code, year) => donorProfile(dispatch, code, year),
	fetchSignatureOutcome: (code, year) => dispatch(fetchSignatureOutcome(code, year)),
	updateSignatureSolution: (index) => dispatch(updateSignatureSolution(index)),
	fetchSignatureSolutionChartData: (code, year) => dispatch(fetchSignatureSolutionChartData(code, year)),
	fetchSignatureSliderData: (year, sector) => dispatch(fetchSignatureSliderData(year, sector)),
	updateProjectList: (year, unit, source, theme, keyword, limit, offset, budgetType, sdg,target,signatureSolution) => dispatch(updateProjectList(year, unit, source, theme, keyword, limit, offset, budgetType, sdg,target,signatureSolution)),
	fetchSdgSliderTargetData: (year, sdg) => dispatch(fetchSdgSliderTargetData(year, sdg))
});

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);