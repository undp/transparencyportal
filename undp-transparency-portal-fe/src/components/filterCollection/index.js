import { h, Component } from 'preact';
import { connect } from 'preact-redux'
import { Link } from 'preact-router/match';
import style from './style';
import DropDown from '../filter';
import ExportPopup from '../exportPopup'
import { Scrollbars } from 'react-custom-scrollbars';
import NestedList from '../nestedList';
import { updateFilters } from '../../shared/actions/commonDataActions'
import { updateProjectList } from '../../shared/actions/getProjectList';
import { searchCountryRegionsListData, updateSearchText } from '../../shared/actions/countryRegionSearch'
import { fetchRecipientCountry, fetchGlobalData } from '../../shared/actions/countryData'
import { updateSearchCountryField, searchOperatingUnitsListData, CLEAR_SEARCH_COUNTRY_FIELD } from '../nestedDropList/actions';
import { loadDonorOutputs } from '../../shared/actions/mapActions/fetchMapOutputs';
import NestedDropList from '../nestedDropList';

class FilterCollection extends Component {
    constructor(props) {
        super(props);
        this.appendOthers = 1;
        this.state = {
            toggleDropDown: false,
            enableSearchIcon: true,
            searchValue: "",
            showExportModal: false
        }
    }

    handleSelectThemeDonors = (data) => {
        this.props.updateDonorFilter("themes", data.value);
        this.props.fetchDonorFundListData();
    }
    handleSelectOpUnitsDonors = (label, value, unit_type) => {
        this.props.updateDonorFilter("operatingUnits", value);
        this.props.updateDonorFilter("operatingUnitsLabel", label);
        this.props.updateDonorFilter("operatingUnitsUnitType", unit_type);
        this.props.fetchDonorFundListData();
        this.props.tabSelected==='donors' ? this.props.loadDonorOutputs(this.props.mapCurrentYear,value): null;
    }
    handleSelectSdgDonors = (data) => {
        this.props.updateDonorFilter("sdg", data.value || data);
        this.props.fetchDonorFundListData();
        
    }

    handleSelectOpUnitsThemes = (label, value, unit_type) => {
        this.props.updateThemeFilter("operatingUnits", value);
        this.props.updateThemeFilter("operatingUnitsLabel", label);
        this.props.updateDonorFilter("operatingUnitsUnitType", unit_type);
        this.props.updateSearchCountryField(value || label)
        this.props.searchOperatingUnitsListData(null, null);
        this.props.fetchThemeSummaryData();
        this.props.updateProjectList(this.props.mapCurrentYear, value, this.props.tabData.themeFilter ? this.props.tabData.themeFilter.budgetSources : '' , this.props.tabData.themeFilter ? this.props.tabData.themeFilter.selectedTheme : '', '', '', '', '','','', '')
    }
    handleSelectOpUnitsSignature = (label, value, unit_type) => {
        this.props.updateThemeFilter("operatingUnits", value);
        this.props.updateThemeFilter("operatingUnitsLabel", label);
        this.props.updateDonorFilter("operatingUnitsUnitType", unit_type);
        this.props.updateSearchCountryField(value || label)
        this.props.searchOperatingUnitsListData(null, null);
        this.props.fetchSignatureSummaryData();
        this.props.updateProjectList(this.props.mapCurrentYear, value, this.props.tabData.themeFilter ? this.props.tabData.themeFilter.budgetSources : '' , '', '', '', '', '','','', this.props.tabData.themeFilter ? this.props.tabData.themeFilter.selectedTheme : '');
    }

    handleSelectBdgtSourcesThemes = (label, value) => {
        this.props.updateThemeFilter("budgetSources", value);
        this.props.updateThemeFilter("budgetSourcesLabel", label);
        this.props.fetchThemeSummaryData();
        this.props.updateProjectList(this.props.mapCurrentYear,this.props.tabData.themeFilter ? this.props.tabData.themeFilter.operatingUnits : '' , value, this.props.tabData.themeFilter ? this.props.tabData.themeFilter.selectedTheme : '', '', '', '', '','','', '')

    }

    handleSelectBdgtSourcesSignature = (label, value) => {
        this.props.updateThemeFilter("budgetSources", value);
        this.props.updateThemeFilter("budgetSourcesLabel", label);
        this.props.fetchSignatureSummaryData();
        this.props.updateProjectList(this.props.mapCurrentYear, this.props.tabData.themeFilter ? this.props.tabData.themeFilter.operatingUnits : '', value , '', '', '', '', '','','', this.props.tabData.themeFilter ? this.props.tabData.themeFilter.selectedTheme : '');
    }

    handleSelectOpUnitsSdg = (label, value, unit_type) => {
        this.props.updateSdgFilter("operatingUnits", value);
        this.props.updateSdgFilter("operatingUnitsLabel", label);
        this.props.updateDonorFilter("operatingUnitsUnitType", unit_type);
        this.props.updateSearchCountryField(value || label)
        this.props.searchOperatingUnitsListData(null, null);
        this.props.fetchSdgListData();
        this.props.updateProjectList(this.props.mapCurrentYear, value, this.props.tabData.sdgFilter && this.props.tabData.sdgFilter.budgetSources ? this.props.tabData.sdgFilter.budgetSources : '' , '', '', '', '', '', this.props.tabData.sdgFilter && this.props.tabData.sdgFilter.selectedSdg  ? this.props.tabData.sdgFilter.selectedSdg : '','', '');
    }

    handleSelectBdgtSourcesSdg = (label, value) => {
        this.props.updateSdgFilter("budgetSources", value);
        this.props.updateSdgFilter("budgetSourcesLabel", label);
        this.props.fetchSdgListData();
        this.props.updateProjectList(this.props.mapCurrentYear, this.props.tabData.sdgFilter && this.props.tabData.sdgFilter.operatingUnits ? this.props.tabData.sdgFilter.operatingUnits : '' , value, '', '', '', '', '', this.props.tabData.sdgFilter && this.props.tabData.sdgFilter.selectedSdg  ? this.props.tabData.sdgFilter.selectedSdg : '','', '');
    }

    mapLabelToValue = (value, list) => {
        if (list.length) {
            let label = list.filter((item) => {
                return item.value == value
            })
            if (label.length) {
                return label[0].label
            } else {
                return ''
            }
        } else {
            return ''
        }
    }

    handleSearchChange = (event) => {
        this.setState({ toggleDropDown: true, searchValue: event.target.value })
        this.props.searchCountryRegionsListData(event.target.value, "", "", "", this.props.mapCurrentYear);
        if (event.target.value == '') {

            this.setState({ enableSearchIcon: true })
        }

        else
            this.setState({ enableSearchIcon: false })
    }
    handleClickOutside = (e) => {
        if (this.state.toggleDropDown && !this.searchNode.contains(e.target)) {
            this.setState({ toggleDropDown: false })
        }
    }
    handleSearchClick = (country) => {
        this.setState({ toggleDropDown: false, searchValue: country.name, enableSearchIcon: false });
        let countryItem = {
            name: country.name,
            iso3: country.code,
            iso2: country.iso2,
            type: country.type,
            unit_type: country.unit_type
        }
        this.props.updateCountryRegionFilter("country", countryItem);
        this.props.fetchRecipientCountry(country.name, country.code, this.props.mapCurrentYear, country.iso2, country.type)
    }
    checkSearchKeyword = (event) => {
        if (event.target.value == '') {
            this.clearSearch();
        }
    }
    openDropDown = () => {
        this.setState({ toggleDropDown: true })
        this.props.searchCountryRegionsListData(this.state.searchValue, "", "", "", this.props.mapCurrentYear);
    }
    clearSearch() {
        this.setState({ toggleDropDown: false, searchValue: '', enableSearchIcon: true })
        this.props.updateCountryRegionFilter("country", {});
        this.props.fetchGlobalData(this.props.mapCurrentYear);
    }
    componentWillReceiveProps(nextProps) {
        
        if (this.props.countryRegionFilter.country.name != nextProps.countryRegionFilter.country.name &&
            nextProps.countryRegionFilter.country.name != "") {
            if (nextProps.countryRegionFilter.country.name)
                this.setState({ searchValue: nextProps.countryRegionFilter.country.name, enableSearchIcon: false })
            else
                this.setState({ searchValue: "", enableSearchIcon: true })
        }
        if (this.props.donorFilter.budgetSources != nextProps.donorFilter.budgetSources ||
            this.props.donorFilter.themes != nextProps.donorFilter.themes ||
            this.props.donorFilter.operatingUnits != nextProps.donorFilter.operatingUnits ||
            this.props.mapCurrentYear != nextProps.mapCurrentYear ||
            this.props.donorFilter.sdg != nextProps.donorFilter.sdg
        ) {
            this.props.updateFilters(nextProps.donorFilter.operatingUnits,
                nextProps.donorFilter.themes,
                nextProps.donorFilter.sdg,
                nextProps.donorFilter.budgetSources,
                nextProps.mapCurrentYear,
                this.appendOthers)
        }
        
        // if(this.props.tabSelected !== nextProps.tabSelected && (nextProps.tabSelected ==='themes' || nextProps.tabSelected==='signature')){
        //         if (nextProps.tabSelected === 'themes' ) {
        //             this.props.updateThemeFilter("operatingUnits", '');
        //             this.props.updateThemeFilter("operatingUnitsLabel", '');
        //             this.props.updateDonorFilter("operatingUnitsUnitType", '');
        //             this.props.updateSearchCountryField(null)
        //             this.props.searchOperatingUnitsListData(null, null);
        //             this.props.fetchThemeSummaryData();
        //        } else if(nextProps.tabSelected==='signature' ){
        //             this.props.updateThemeFilter("operatingUnits", '');
        //             this.props.updateThemeFilter("operatingUnitsLabel", '');
        //             this.props.updateDonorFilter("operatingUnitsUnitType", '');
        //             this.props.updateSearchCountryField(null)
        //             this.props.searchOperatingUnitsListData(null, null);
        //             this.props.fetchSignatureSummaryData();
        //        }
        // }
    }
    componentDidMount() {
        if (this.props.countryRegionFilter.country.name) {
            this.setState({ searchValue: this.props.countryRegionFilter.country.name, enableSearchIcon: false })
        }
        this.props.updateFilters(this.props.donorFilter.operatingUnits,
            this.props.donorFilter.themes,
            this.props.donorFilter.sdg,
            this.props.donorFilter.budgetSources,
            this.props.mapCurrentYear,
            this.appendOthers)
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('touchstart', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('touchstart', this.handleClickOutside);
    }

    render({ donorFilter, themeFilter, sdgFilter, tabSelected, tabData, budgetSourceSearch }, state) {
        let aboutData;
        if(tabSelected === 'sdg') {
            aboutData = <div class={style.sdgDisclaimer}>
            <span class={style.sdgbuttons}><b>About SDG Data</b></span>
                <span class={style.sdgDisclaimerText}>
                    <span class={style.textsdg}>UNDP’s SDG data is based on the mapping of project outputs to SDG targets.  Each project output can be mapped to maximum three SDG targets to capture UNDP’s multidimensional approaches to complex development challenges.  Financial figures are divided equally to the mapped SDG targets.
                </span>
                </span>
            </div>
        } else if(tabSelected == 'signature') {
            aboutData = <div class={style.signatureDisclaimer}>
            <span class={style.sdgbuttons}><b class={style.bold}>About Signature Solution</b></span>
                <span class={style.sdgDisclaimerText}>
                    <span class={style.textsdg}>Six Signature Solutions offer UNDP’s integrated responses to complex development challenges: poverty, governance, resilience, environment, energy, gender equality.  Each Solution will include a mix of policy advice, technical assistance, finance and programmes, tailored to country needs, to accelerate progress towards the Sustainable Development Goals.
                </span>
                </span>
            </div>
            
        } else {
            null
        }
        return (
            <div>
                <div class={style.wrapper}>
                    {tabSelected === 'donors' || tabSelected === 'themes' || tabSelected === 'signature' || tabSelected === 'sdg' ?
                        <div class={style.filterWrapper}>
                            {
                                <div style={tabSelected === 'donors' ? { display: 'inline-block' } : { display: 'none' }}>
                                    <NestedDropList
                                        label="Recipient Country / Territory / Region:"
                                        filterClass={style.filter}
                                        countryFilter
                                        currentTab={'donors'}
                                        donor={tabData.donorFilter.budgetSources}
                                        year={this.props.mapCurrentYear}
                                        sdg={tabData.donorFilter.sdg}
                                        theme={tabData.donorFilter.themes}
                                        dropDownClass={style.dropDownWrapper}
                                        labelStyle={{ display: 'inline-block' }}
                                        placeHolder="Select"
                                        handleClickBoth={this.handleSelectOpUnitsDonors}
                                        handleClick={() => { }}
                                        selectedValue={tabData.donorFilter.operatingUnits ? tabData.donorFilter.operatingUnits : ""}
                                        selectedLabel={tabData.donorFilter.operatingUnitsLabel ? tabData.donorFilter.operatingUnitsLabel : ""}
                                        baseURL={this.props.baseURL}
                                    />
                                </div>
                            }

                            {
                                <div style={tabSelected === 'donors' ? { display: 'inline-block' } : { display: 'none' }}>
                                    {
                                        !donorFilter.themes || donorFilter.themes == "" ?
                                            <DropDown
                                                dropDownClass={style.dropDownWrapper}
                                                label="SDG:"
                                                listIcons
                                                placeHolder="Select"
                                                options={this.props.sdgList.data}
                                                loading={this.props.sdgList.loading}
                                                handleClick={this.handleSelectSdgDonors}
                                                selectedValue={tabData.donorFilter.sdg ? tabData.donorFilter.sdg : ""}
                                                selectedLabel={this.mapLabelToValue(tabData.donorFilter.sdg ? tabData.donorFilter.sdg : "", this.props.sdgList.data)}
                                            />
                                            : null
                                    }
                                </div>
                            }

                            {
                                <div style={(tabSelected === 'themes' ) ? { display: 'inline-block' } : { display: 'none' }}>
                                    <NestedDropList
                                        label="Recipient Country / Territory / Region:"
                                        filterClass={style.filter}
                                        countryFilter
                                        currentTab={'themes'}
                                        donor={tabData.themeFilter.budgetSources}
                                        theme={tabData.themeFilter.selectedTheme}
                                        year={this.props.mapCurrentYear}
                                        dropDownClass={style.dropDownWrapper}
                                        labelStyle={{ display: 'inline-block' }}
                                        placeHolder="Select"
                                        handleClickBoth={tabSelected === 'themes' ? this.handleSelectOpUnitsThemes : this.handleSelectOpUnitsSignature}
                                        handleClick={() => { }}
                                        selectedValue={tabData.themeFilter.operatingUnits ? tabData.themeFilter.operatingUnits : ""}
                                        selectedLabel={tabData.themeFilter.operatingUnitsLabel ? tabData.themeFilter.operatingUnitsLabel : ""}
                                        baseURL={this.props.baseURL}
                                    />
                                </div>

                            }

                            {
                                <div style={( tabSelected === 'signature') ? { display: 'inline-block' } : { display: 'none' }}>
                                    <NestedDropList
                                        label="Recipient Country / Territory / Region:"
                                        filterClass={style.filter}
                                        countryFilter
                                        currentTab={'themes'}
                                        donor={tabData.themeFilter.budgetSources}
                                        theme={tabData.themeFilter.selectedTheme}
                                        year={this.props.mapCurrentYear}
                                        dropDownClass={style.dropDownWrapper}
                                        labelStyle={{ display: 'inline-block' }}
                                        placeHolder="Select"
                                        handleClickBoth={tabSelected === 'themes' ? this.handleSelectOpUnitsThemes : this.handleSelectOpUnitsSignature}
                                        handleClick={() => { }}
                                        selectedValue={tabData.themeFilter.operatingUnits ? tabData.themeFilter.operatingUnits : ""}
                                        selectedLabel={tabData.themeFilter.operatingUnitsLabel ? tabData.themeFilter.operatingUnitsLabel : ""}
                                        baseURL={this.props.baseURL}
                                    />
                                </div>

                            }


                            {
                                <div style={tabSelected === 'sdg' ? { display: 'inline-block' } : { display: 'none' }}>
                                    <NestedDropList
                                        label="Recipient Country / Territory / Region:"
                                        filterClass={style.filter}
                                        countryFilter
                                        currentTab={'sdg'}
                                        year={this.props.mapCurrentYear}
                                        donor={tabData.sdgFilter.budgetSources}
                                        sdg={tabData.sdgFilter.selectedSdg}
                                        dropDownClass={style.dropDownWrapper}
                                        labelStyle={{ display: 'inline-block' }}
                                        placeHolder="Select"
                                        handleClickBoth={this.handleSelectOpUnitsSdg}
                                        handleClick={() => { }}
                                        selectedValue={tabData.sdgFilter.operatingUnits ? tabData.sdgFilter.operatingUnits : ""}
                                        selectedLabel={tabData.sdgFilter.operatingUnitsLabel ? tabData.sdgFilter.operatingUnitsLabel : ""}
                                        baseURL={this.props.baseURL}
                                    />
                                </div>

                            }

                            {/* <DropDown label="Recipient Country Office / Operating Unit:" placeHolder="Choose a Country" options={this.props.countryList.countries}/> */}
                            {
                                <div style={(tabSelected === 'themes' || tabSelected === 'signature') ? { display: 'inline-block' } : { display: 'none' }} >
                                    <NestedDropList
                                        label="Donor:"
                                        filterClass={style.filter}
                                        dropDownClass={style.dropDownWrapper}
                                        labelStyle={{ display: 'inline-block' }}
                                        placeHolder="Select"
                                        handleClickBoth={tabSelected === 'themes' ? this.handleSelectBdgtSourcesThemes : this.handleSelectBdgtSourcesSignature}
                                        handleClick={() => { }}
                                        selectedValue={tabData.themeFilter.budgetSources ? tabData.themeFilter.budgetSources : ""}
                                        selectedLabel={tabData.themeFilter.budgetSourcesLabel ? tabData.themeFilter.budgetSourcesLabel : ""}

                                    />
                                </div>
                            }
                            {
                                <div style={tabSelected === 'donors' ? { display: 'inline-block' } : { display: 'none' }} >
                                    {
                                        !donorFilter.sdg || donorFilter.sdg == "" ?
                                            <DropDown
                                                dropDownClass={style.dropDownWrapper}
                                                label="Our Focus:" placeHolder="Select" labelStyle={style.labelStyle}
                                                handleClick={this.handleSelectThemeDonors}
                                                options={this.props.themeSummary.themes}
                                                loading={this.props.themeSummary.loading}
                                                selectedValue={tabData.donorFilter.themes ? tabData.donorFilter.themes : ""}
                                                selectedLabel={this.mapLabelToValue(tabData.donorFilter.themes ? tabData.donorFilter.themes : "", this.props.themeSummary.themes)}
                                            />
                                            : null
                                    }
                                </div>
                            }
                            {
                                <div style={(tabSelected === 'sdg') ? { display: 'inline-block' } : { display: 'none' }} >
                                    <NestedDropList
                                        label="Donor:"
                                        filterClass={style.filter}
                                        dropDownClass={style.dropDownWrapper}
                                        labelStyle={{ display: 'inline-block' }}
                                        placeHolder="Select"
                                        handleClick={() => { }}
                                        handleClickBoth={this.handleSelectBdgtSourcesSdg}
                                        selectedValue={tabData.sdgFilter.budgetSources ? tabData.sdgFilter.budgetSources : ""}
                                        selectedLabel={tabData.sdgFilter.budgetSourcesLabel ? tabData.sdgFilter.budgetSourcesLabel : ""}
                                    />
                                </div>
                            }
                        </div>
                        :
                        <span class={style.searchWrapper}>
                            <div class={style.searchContainer}>
                                <span class={style.searchLabel}>{'Search for Countries and Territories'}</span>
                                <div class={style.searchItems} ref={(node) => this.searchNode = node}>
                                    <div class={style.countrySearch}>
                                        <input
                                            type="text"
                                            name="search"
                                            class={style.searchField}
                                            value={this.state.searchValue}
                                            onkeyup={(event) => this.checkSearchKeyword(event)}
                                            onInput={(event) => this.handleSearchChange(event)}
                                            onClick={() => this.openDropDown()}
                                            placeholder="Enter country/territory name"
                                            autocomplete="off"
                                        />
                                        {
                                            this.state.enableSearchIcon ?
                                                <span class={style.searchIcon}></span> :
                                                <span class={`${style.searchIcon} ${style.clearIcon}`} onClick={() => this.clearSearch()}></span>
                                        }
                                    </div>
                                    {
                                        this.state.toggleDropDown && <NestedList
                                            loading={this.props.searchResultLoading}
                                            handleChange={this.handleSearchClick}
                                            dataList={this.props.searchResult}
                                            wrapperClass={style.dropDowncountry}
                                            baseURL={this.props.baseURL}
                                        />
                                    }
                                    
                                </div>
                            </div>
                        </span>

                }
                <span class={style.buttonsWrapper}>
                    { 
                        aboutData
                    }
                    <span class={style.buttons} onClick={() => this.props.showExportModal()}>Export</span>
                    <span class={style.buttons} onClick={()=> this.props.openEmbedModal && this.props.openEmbedModal() } >Embed</span>
                </span>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { mapCurrentYear } = state.mapData.yearTimeline
    const { searchResult, loading: searchResultLoading, list: masterList } = state.countryRegionSearch;
    const { tabData } = state;
    const { budgetSourceSearch } = state

    return {
        mapCurrentYear,
        searchResult,
        searchResultLoading,
        tabData,
        projectList: state.projectList,
        countryData: state.countryData,
        masterList,
        budgetSourceSearch
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchRecipientCountry: (country_name, code, year, iso2Code, type) => dispatch(fetchRecipientCountry(country_name, code, year, iso2Code, type)),
        fetchGlobalData: (year) => dispatch(fetchGlobalData(year)),
        searchCountryRegionsListData: (searchParam, theme, sdg, donor, year) => dispatch(searchCountryRegionsListData(searchParam, theme, sdg, donor, year)),
        updateSearchText: (text) => dispatch(updateSearchText(text)),
        updateSearchCountryField: (countryCode) => dispatch(updateSearchCountryField(countryCode)),
        updateFilters: (unit, themes, sdg, donor, year,appendOthers) => dispatch(updateFilters(unit, themes, sdg, donor, year,appendOthers)),
        searchOperatingUnitsListData: (searchParam, key) => dispatch(searchOperatingUnitsListData(searchParam, key)),
        updateProjectList: (year,operatingUnit, budgetSource, themes, keyword, limit, offset, budgetType,sdg,target, signatureSolution) => dispatch(updateProjectList(year,operatingUnit, budgetSource, themes, keyword, limit, offset, budgetType,sdg,target, signatureSolution)),
        loadDonorOutputs: (year,unit) => dispatch(loadDonorOutputs(year,unit))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterCollection)