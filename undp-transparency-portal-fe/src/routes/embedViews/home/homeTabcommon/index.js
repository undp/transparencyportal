import { h, Component } from 'preact';
import BootTable from '../../../../components/bootstraptable'
import Map from '../../../../components/map';
import Sankey from '../../../../components/sankey';
import PreLoader from '../../../../components/preLoader';
import { connect } from 'preact-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import {
	numberToDollarFormatter,
	numberToCurrencyFormatter,
	numberToCommaFormatter
} from '../../../../utils/numberFormatter';
import { loadProjectListMapData } from '../../../../shared/actions/mapActions/projectListMapData';
import { fetchSdgListData } from '../../../../shared/actions/sdgAggregate'
import { fetchDonorFundListData } from '../../../../shared/actions/getDonorFundAggrList'
import { onTabSwitch } from '../../../../components/TabSection/actions'
import List from '../../../../components/listView';
import SideBarItem from '../../../../components/sideBarItem';
import SideBarDonorItem from '../../../../components/sideBarItemDonors';

import NoDataTemplate from '../../../../components/no-data-template';
import {
	updateYearList,
	setCurrentYear
} from "../../../../shared/actions/getYearList";
import { fetchBudgetFinancialFlow } from '../../../../components/sankey/actions/budgetFinancialFlowActions'
import { fetchExpenseFinancialFlow } from '../../../../components/sankey/actions/expenseFinancialFlowActions'
import { loadGlobalMapData } from '../../../../shared/actions/mapActions/globalMapData';
import { fetchRecipientCountry, fetchGlobalData } from '../../../../shared/actions/countryData';
import { loadSdgMapData } from '../../../../shared/actions/mapActions/sdgMapData';
import { loadThemesMapData } from '../../../../shared/actions/mapActions/themesMapData';
import { loadSignatureMapData } from '../../../../shared/actions/mapActions/signatureMapData';
import { loadDonorsMapData } from '../../../../shared/actions/mapActions/donorsMapData';
import { fetchThemeSummaryData, fetchSignatureSummaryData } from '../../../../components/YearSummary/actions';
import style from './style';
import {getAPIBaseUrRl} from '../../../../utils/commonMethods';

class EmbedHomeTabs extends Component {
	constructor(props) {
		super(props);
		this.state = {
		}
		this.mapTitle = {
			themes:"Our Focus",
			sdg:"SDG",
			donors:"Donors",
			signature:"Signature Solutions",
		}
		this.mapFinancialType = {
			budget:'Budget',
			expense:'Expense'
		}
	}
    mapLabelToValue = (value, list) => {
    	if (list.length) {
    		let label = list.filter((item) => {
    			return item.value == value
    		})
    		if (label.length) {
    			return label[0].label
    		} else {
    			return '';
    		}
    	} else {
    		return '';
    	}
    }

    componentWillMount() {
    	const { year,
    		financialFlowYear,
    		financialFlowType,
    		budgetSources,
    		operatingUnits,
    		sdg,
    		themes
    	} = this.props;
    	this.props.onTabSwitch(this.props.type);
		financialFlowType === 'budget' ? this.props.fetchBudgetFinancialFlow(financialFlowYear) : this.props.fetchExpenseFinancialFlow(financialFlowYear)
    	switch (this.props.type) {
			case 'themes':
    			this.props.fetchThemeSummaryData(year, budgetSources, operatingUnits);
				this.props.loadThemesMapData(year, themes, operatingUnits, budgetSources);
				break;
    		case 'donors':
    			this.props.fetchDonorFundListData(year, operatingUnits, budgetSources, themes, sdg);
				this.props.loadDonorsMapData(year, operatingUnits, themes, budgetSources, sdg)
				break;
				
    		case 'sdg':
    			this.props.loadSdgMapData(year, sdg, operatingUnits, budgetSources,"sdg")
				this.props.fetchSdgListData(year, operatingUnits, budgetSources)
				
				break;
			case 'signature':
    			this.props.fetchSignatureSummaryData(year, budgetSources, operatingUnits);
				this.props.loadSignatureMapData(year, themes, operatingUnits, budgetSources);
				break;	
    		default:
    	}
    }

    renderRow = (item, index) => this.props.type === 'themes' || this.props.type === 'signature' || this.props.type === 'sdg' ?
    	<SideBarItem data={item.item}
    		tabSelected={this.props.type}
    		index={index}
			embed={true}
			apiBase={getAPIBaseUrRl()}
    	/>
    	:
    	<SideBarDonorItem data={item.item}
    		index={index}
    		embed={true}
    	/>


    renderMapdata = () => {
		let mapData = [];
		
    	switch (this.props.type) {
    		case 'themes':
				mapData = this.props.themesMapData;
				break;
    		case 'donors':
				mapData = this.props.donorsMapData;
				break;
    		case 'sdg':
				mapData = this.props.sdgMapData;
				break;
			case 'signature':
				mapData = this.props.signatureMapData;
				break;
				
    		default:
    	}
    	return mapData
    }
	getSignatureName = (array) => {
		let filterArray = [],
			signatureName = '';
		if (array.length)
			filterArray = this.filterArray(array);
		
		if (filterArray.length)
			signatureName = filterArray[0].label;

		return signatureName;
	}
	filterArray = (array) => {
		const keyMap = {
			themes: {
				key: 'sector',
				typeKey: 'themes'
			},
			donors: {
				key: 'level_3_code',
				typeKey: 'budgetSources'
			},
			sdg: {
				key: 'sdg_code',
				typeKey: 'sdg'
			}
		}
		
		let typKey = this.props.type === 'signature' ? 'themes' : this.props.type;
		if (this.props[keyMap[typKey].typeKey] === '') {
			return array;
		}
		else {
			return array.filter((item) => {
				if (item[keyMap[typKey].key] === this.props[keyMap[typKey].typeKey]) {
					return true
				}
			})
		}
	}
    render({
    	year, globalMapData, financialFlowYear, financialFlowType, sdg, tabData,
    	themes, country, operatingUnits, operatingUnitsLabel, countryLabel, budgetSources, budgetSourcesLabel }, state) {
    	const operatingUnitsSidebar = operatingUnits ? operatingUnits : '',
    		budgetSourcesSidebar = budgetSources ? budgetSources : '',
    		themesSidebar = themes ? themes : "",
    		sdgSidebar = sdg ? sdg : "",
    		yearSidebar = year ? year : "",
    		countrySidebar = country ? country : "";
    	const array = tabData.themes && tabData.themes.data && (tabData.themes.data.data || tabData.themes.data.sector || tabData.themes.data.sdg) ? (tabData.themes.data.data || tabData.themes.data.sector || tabData.themes.data.sdg) : [],
			isEmpty = array.length === 0 ? true : false;
		
    	return (
    		<div>
    			{
    				this.props.title === 'true' ?
    					<div class={style.titleWrapper}>
    						{this.mapTitle[this.props.type]}
    					</div>
    					: null
    			}
    			{
    				this.props.summary === 'true' ?
    					<div>
    						<div class={style.filterTextWrapper}>
    							<div class={style.filterText}>
    								<span class={style.filterHighlight}>
    									{
    										`${this.props.budgetSourcesLabel} `
    									}
    								</span>
    								{`contribution`}
    								{
    									this.props.operatingUnitsLabel != '' ?
    										<span>
    											{` to `}
    											<span class={style.filterHighlight}>
    												{
    													`${this.props.operatingUnitsLabel}`
    												}
    											</span>
    										</span> :
    										<span class={style.filterHighlight}>
    											{
    												`${this.props.operatingUnitsLabel}`
    											}
    										</span>
    								}
    								{
    									themes ?
    										<span>
    											{` for `}
    											<span class={style.filterHighlight}>

    												{this.props.type === 'signature' ? this.getSignatureName(array) : this.mapLabelToValue(themes, this.props.masterThemeList)}

    											</span>
    										</span> : ' '
    								}
    								{
    									sdg ?
    										<span>
    											{` for `}
    											<span class={style.filterHighlight}>
    												{this.mapLabelToValue(sdg, this.props.masterSdgList)}
    											</span>
    										</span> : ''
    								}
    								{' in '}
    								<span class={style.filterHighlight}>
    									{
    										`${this.props.year}`
    									}
    								</span>
    							</div>
    						</div>
    					</div>
    					: null}
    			{this.props.map === 'true' ?
    				<div class={style.mapContainer}>
    					<div style={{ height:500 }}>
    						 <Map mapData={this.renderMapdata()}
    							preventResetMap
    							code={operatingUnitsSidebar}
    							yearSelected={yearSidebar}
    							embed={true}
    							sector={this.props.type === "signature"?'':themesSidebar}
    							sdg={sdgSidebar}
								source={budgetSourcesSidebar}
								signatureSolution={this.props.type === "signature" ? 'true': 'false'}
								sigTab={this.props.type === "signature" ? themesSidebar : null}
    						/>
    						<div class={style.disclaimer}>
							<ul><li> The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.</li><li> References to Kosovo* shall be understood to be in the context of UN Security Council resolution 1244 (1999)</li>
    </ul>
    						</div>
    					</div>
    					<div class={style.sidebarWrapper}>

    						<Scrollbars
    							renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
    							{
    								this.props.themesLoading || this.props.donorsLoading || this.props.sdgLoading ?
    									<PreLoader />
    									: !isEmpty ?
    										<List
    											data={array.length?this.filterArray(array):[]}
    											renderItem={this.renderRow}
    										/>
    										:
    										<NoDataTemplate />
    							}
    						</Scrollbars>
    					</div>
    				</div>
    				: null}
    			{
					(this.props.budgetSourcesLabel === '' ||
					this.props.operatingUnitsLabel === '') &&
					this.props.financialFlow === 'true' ?
    				<div>
    					<span class={style.subtitleWrapper}>{`Financial Flow - ${this.mapFinancialType[financialFlowType]} - ${financialFlowYear}`}</span>
    					<Sankey
    						embed={true}
    						financialFlowYear={financialFlowYear}
    						financialFlowType={financialFlowType}
    					/>
    				</div>
    				: null}
    		</div>
    	)
    }
}
const mapStateToProps = (state) => {
	const { mapCurrentYear } = state.mapData.yearTimeline,
		{ projectListMapData } = state.mapData,
		{
			loading,
			error,
			projectList
		} = state.projectList

	const { globalMapData, themesMapData, donorsMapData, sdgMapData, signatureMapData } = state.mapData,
		countryData = state.countryData,
		tabData = state.tabData

	return {
		router: state.router,
		mapCurrentYear,
		masterSdgList: state.sdgData.masterSdgList,
		masterThemeList: state.themeList.masterThemeList,
		themesLoading: state.themeSummary.loading,
		donorsLoading: state.donorFundList.loading,
		sdgLoading: state.sdgAggregate.loading,
		projectListMapData,
		projectList,
		loading,
		globalMapData,
		countryData,
		tabData,
		themesMapData,
		donorsMapData,
		sdgMapData,
		signatureMapData
	}
}
const mapDispatchToProps = (dispatch) => {
	return {
		loadProjectListMapData: (year, sector, unit, source, sdg) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg)),
		setCurrentYear: year => dispatch(setCurrentYear(year)),
		fetchBudgetFinancialFlow: (year) => dispatch(fetchBudgetFinancialFlow(year)),
		fetchExpenseFinancialFlow: (year) => dispatch(fetchExpenseFinancialFlow(year)),
		loadGlobalMapData: (year, unit) => dispatch(loadGlobalMapData(year, unit)),
		fetchGlobalData: (year) => dispatch(fetchGlobalData(year)),
		fetchThemeSummaryData: (year, source, operatingUnit) => dispatch(fetchThemeSummaryData(year, source, operatingUnit)),
		fetchSignatureSummaryData: (year, source, operatingUnit) => dispatch(fetchSignatureSummaryData(year, source, operatingUnit)),
		fetchSdgListData: (year, recipentCountry, donor) => dispatch(fetchSdgListData(year, recipentCountry, donor)),
		fetchDonorFundListData: (year, recipentCountry, donor, themes, sdg) => dispatch(fetchDonorFundListData(year, recipentCountry, donor, themes, sdg)),
		onTabSwitch: (type) => dispatch(onTabSwitch(type)),
		loadSdgMapData: (year, sdg, unit, source, tab) => dispatch(loadSdgMapData(year, sdg, unit, source, tab)),
		loadThemesMapData: (year, sector, unit, source) => dispatch(loadThemesMapData(year, sector, unit, source)),
		loadDonorsMapData: (year, unit, sector, budgetSource, sdg) => dispatch(loadDonorsMapData(year, unit, sector, budgetSource, sdg)),
		loadSignatureMapData: (year, sector, unit, source) => dispatch(loadSignatureMapData(year, sector, unit, source))
	}
}


//

export default connect(mapStateToProps, mapDispatchToProps)(EmbedHomeTabs)

