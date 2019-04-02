import { h, Component } from 'preact';
import style from './style';
import FilterCollection from '../../filterCollection';
import SideBar from '../../sideBar';
import DropDown from '../../filter';
import GroupedbarChart from '../../grouped-bar-chart';
import PreLoader from '../../preLoader';
import NestedList from '../../nestedList';
import NoDataTemplate from '../../no-data-template';
import { numberToCurrencyFormatter, numberToCommaFormatter, hasNumber } from '../../../utils/numberFormatter';
import { aggregateCalculator } from '../../../utils/commonMethods';
import BudgetExpenseLegend from '../../budget-expense-legend';
import EmbedSection from '../../EmbedSection';
import DonutChart from '../../donutChart';
import Map from '../../map';
import DonorsExportTemplate from '../../donorsExportTemplate';
import ExportPopup from '../../exportPopup';
import { Scrollbars } from 'react-custom-scrollbars';
import EmbedModal from '../../../components/embedModal';
import { getFormmattedDate } from '../../../utils/dateFormatter';
import { connect } from 'preact-redux';
import commonConstants from '../../../utils/constants';
import Api from '../../../lib/api';

class Tabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabSelected: 'country',
            accordionSelected: '',
            resetMap: false,
            yearSelected: null,
            filterOpened: false,
            showMapMobile: false,
            themeData: this.props.data ? this.props.data.themes : [],
            selectedDonor: "",
            selectedTheme: "",
            selectedSdg: "",
            toggleDropDown: false,
            enableSearchIcon: true,
            searchValue: '',
            slider: false,
            selected: false,
            resize: false,
            showHideMapCard: false,
            showExportModal: false,
            displayEmbedModal: false,
            checkList: {},
            selectionListUrl: {
                "country": `${window.location.origin}/embed/home/recipientCountry?`,
                "donors": `${window.location.origin}/embed/home/donors?`,
                "themes": `${window.location.origin}/embed/home/themes?`,
                "sdg": `${window.location.origin}/embed/home/sdg?`,
                "signature": `${window.location.origin}/embed/home/signature?`
            },
        };
        this.baseUrl = {
            "country": `${window.location.origin}/embed/home/recipientCountry?`,
            "donors": `${window.location.origin}/embed/home/donors?`,
            "themes": `${window.location.origin}/embed/home/themes?`,
            "sdg": `${window.location.origin}/embed/home/sdg?`,
            "signature": `${window.location.origin}/embed/home/signature?`
        };
        this.initialChecklist = {
            country: {
                title: true,
                summary: true,
                stats: true,
                map: true,
                financialFlow: false
            },
            donors: {
                title: true,
                summary: true,
                map: true,
                financialFlow: false
            },
            themes: {
                title: true,
                summary: true,
                map: true,
                financialFlow: false
            },
            sdg: {
                title: true,
                summary: true,
                map: true,
                financialFlow: false
            }
        };
        this.masterCheckList = {
            "country": [
                {
                    flag: true,
                    label: 'Title',
                    key: 'title'
                },
                {
                    flag: true,
                    label: 'Summary',
                    key: 'summary'
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
                    label: 'Financial Flow',
                    key: 'financialFlow'
                }
            ],
            "donors": [
                {
                    flag: true,
                    label: 'Title',
                    key: 'title'
                },
                {
                    flag: true,
                    label: 'Summary',
                    key: 'summary'
                },
                {
                    flag: true,
                    label: 'Map and Donor List',
                    key: 'map'
                },
                {
                    flag: false,
                    label: 'Financial Flow',
                    key: 'financialFlow'
                }
            ],
            "themes": [
                {
                    flag: true,
                    label: 'Title',
                    key: 'title'
                },
                {
                    flag: true,
                    label: 'Summary',
                    key: 'summary'
                },
                {
                    flag: true,
                    label: 'Map and Our Focus List',
                    key: 'map'
                },
                {
                    flag: false,
                    label: 'Financial Flow',
                    key: 'financialFlow'
                }
            ],
            "sdg": [
                {
                    flag: true,
                    label: 'Title',
                    key: 'title'
                },
                {
                    flag: true,
                    label: 'Summary',
                    key: 'summary'
                },
                {
                    flag: true,
                    label: 'Map and SDG List',
                    key: 'map'
                },
                {
                    flag: false,
                    label: 'Financial Flow',
                    key: 'financialFlow'
                }
            ],
            "signature": [
                {
                    flag: true,
                    label: 'Title',
                    key: 'title'
                },
                {
                    flag: true,
                    label: 'Summary',
                    key: 'summary'
                },
                {
                    flag: true,
                    label: 'Map and Signature Solutions List',
                    key: 'map'
                },
                {
                    flag: false,
                    label: 'Financial Flow',
                    key: 'financialFlow'
                }
            ]
        };
        this.selectedSSFilter = { budgetSources: '', budgetSourcesLabel: '', operatingUnits: '', operatingUnitsLabel: '', selectedTheme: undefined };
        this.selectedThemseFilter = { budgetSources: '', budgetSourcesLabel: '', operatingUnits: '', operatingUnitsLabel: '', selectedTheme: undefined };
    }
    //  Embed Modal Methods /////////////////////////---------------------------------------------------------->>>>>>>>>>

    openEmbedModal = () => {
        let tempChecklist = { ...this.masterCheckList };
        if(this.props.tabSelected === 'country') {
            if(this.props.countryRegionFilter.country.name && this.props.countryRegionFilter.country.name !== '') {
                    tempChecklist[this.props.tabSelected] = this.masterCheckList[this.props.tabSelected].filter( item => 
                    item.key !== 'financialFlow'
                )
            }
        }
        else if(this.props.tabSelected === 'donors') {
            if((this.props.donorFilter.budgetSources && this.props.donorFilter.budgetSources !== '') ||
                (this.props.donorFilter.operatingUnits && this.props.donorFilter.operatingUnits !== '') ||
                (this.props.donorFilter.sdg && this.props.donorFilter.sdg !== '') || 
                (this.props.donorFilter.themes && this.props.donorFilter.themes !== '')) {
                        tempChecklist[this.props.tabSelected] = this.masterCheckList[this.props.tabSelected].filter( item => 
                        item.key !== 'financialFlow'
                    )
            }
        }
        else if(this.props.tabSelected === 'themes') {
            if((this.props.themeFilter.budgetSources && this.props.themeFilter.budgetSources !== '') ||
             (this.props.themeFilter.operatingUnits && this.props.themeFilter.operatingUnits !== '' ) || 
             (this.props.themeFilter.selectedTheme && this.props.themeFilter.selectedTheme !== '')) {
                    tempChecklist[this.props.tabSelected] = this.masterCheckList[this.props.tabSelected].filter( item => 
                    item.key !== 'financialFlow'
                )
            }
        }
        else if(this.props.tabSelected === 'signature') {
            if((this.props.themeFilter.budgetSources && this.props.themeFilter.budgetSources !== '') ||
             (this.props.themeFilter.operatingUnits && this.props.themeFilter.operatingUnits !== '' ) || 
             (this.props.themeFilter.selectedTheme && this.props.themeFilter.selectedTheme !== '')) {
                    tempChecklist[this.props.tabSelected] = this.masterCheckList[this.props.tabSelected].filter( item => 
                    item.key !== 'financialFlow'
                )
            }
        }
        else if(this.props.tabSelected === 'sdg') {
            if((this.props.sdgFilter.operatingUnits && this.props.sdgFilter.operatingUnits !== '') ||
             (this.props.sdgFilter.budgetSources && this.props.sdgFilter.budgetSources !== '' ) ||
              (this.props.sdgFilter.selectedSdg && this.props.sdgFilter.selectedSdg !== '')) {
                    tempChecklist[this.props.tabSelected] = this.masterCheckList[this.props.tabSelected].filter( item => 
                    item.key !== 'financialFlow'
                )
            }
        }
        this.setState({
            checkList: {...tempChecklist}
        }, () => {
            this.createCheckList(
                this.setState({
                    displayEmbedModal: true
                })
            );
        })
    }

    handleClose = () => {
        this.setState({ displayEmbedModal: false }, () => {
            this.clearSelect();
        });
    }

    createCheckList = (callbk) => {
        let newUrl = this.baseUrl[this.props.tabSelected];
        this.state.checkList[this.props.tabSelected].forEach((item, index) => {
            if (index == 0) {
                newUrl = newUrl + item.key + "=" + item.flag;
            } else {
                newUrl = newUrl + "&" + item.key + "=" + item.flag;
            }

        });
        this.setState({
            selectionListUrl: {
                ...this.state.selectionListUrl,
                [this.props.tabSelected]: newUrl
            }
        }, () => {
            if (callbk !== undefined) {
                callbk();
            }
        });
    }

    handleOnSelect = (e, data) => {
        let selectedList = this.state.checkList[this.props.tabSelected].map((item) => {
            return item.key == data.key ? {
                flag: e.target.checked,
                label: item.label,
                key: item.key
            } : item;
        });
        this.setState({
            checkList: {
                ...this.state.checkList,
                [this.props.tabSelected]: selectedList
            }
        }, () => {
            this.createCheckList();
        });
    }

    clearSelect = () => {
        let clearedList = this.state.checkList[this.props.tabSelected].map((item) => {
            return {
                flag: this.initialChecklist[this.props.tabSelected][item.key],
                label: item.label,
                key: item.key
            };
        });
        this.setState({
            checkList: {
                ...this.state.checkList,
                [this.props.tabSelected]: clearedList
            }
        });
    }

    //////////////////////////////////---------------------------------------------------------->>>>>>>>>>

    handleClickOutside = (e) => {
        if (this.state.toggleDropDown && !this.searchNode.contains(e.target)) {
            this.setState({ toggleDropDown: false })
        }
    }
    componentWillReceiveProps(nextProps) {
       
        this.setState({
            themeData: nextProps.data.themes,
        });

        if (nextProps.countryData.data.country_name != this.props.countryData.data.country_name &&
            nextProps.countryData.data.country_name != "Global" && nextProps.countryData.data.type != 1)
            this.props.updateProjectList(nextProps.mapCurrentYear, nextProps.countryData.data.country_iso3);

        if (this.props.countryData.data != nextProps.countryData.data) {
            if (nextProps.countryData.data.country_name != "Global") {
               
                this.props.fetchThemesBudget(nextProps.mapCurrentYear, nextProps.countryData.data.country_iso3, );
                this.props.fetchBudgetSources(nextProps.mapCurrentYear, nextProps.countryData.data.country_iso3);
            }
            else {
                this.props.fetchThemesBudget(nextProps.mapCurrentYear);
                this.props.fetchBudgetSources(nextProps.mapCurrentYear);
                this.props.updateProjectList(nextProps.mapCurrentYear, nextProps.countryData.data.country_iso3);
            }
        }
        if (this.props.mapCurrentYear != nextProps.mapCurrentYear) {
            if(this.props.tabSelected === 'themes')
                this.selectedThemseFilter.selectedTheme = '';
            
            if(this.props.tabSelected === 'signature')   
                this.selectedSSFilter.selectedTheme = '';

            this.props.onUpdateYear(nextProps.mapCurrentYear);
            if (!Object.keys(this.props.countryRegionFilter.country).length)
                this.props.fetchGlobalData(nextProps.mapCurrentYear);
            else {
                this.props.fetchRecipientCountry(this.props.countryRegionFilter.country.name, this.props.countryRegionFilter.country.iso3, nextProps.mapCurrentYear, this.props.countryRegionFilter.country.iso2);
            }
            this.setState({ yearSelected: nextProps.mapCurrentYear });
            if (nextProps.countryData.data.country_name != "Global" && nextProps.countryData.data.type != 1)
                this.props.updateProjectList(nextProps.mapCurrentYear, nextProps.countryData.data.country_iso3);
            switch (this.props.tabSelected) {
                case "country": this.props.loadGlobalMapData(nextProps.mapCurrentYear, nextProps.countryRegionFilter.country.iso3);
                    break;
                case "themes":
                    this.props.loadThemesMapData(nextProps.mapCurrentYear,
                        undefined,
                        nextProps.themeFilter.operatingUnits,
                        nextProps.themeFilter.budgetSources);
                    this.props.fetchThemeSummaryData(nextProps.mapCurrentYear);
                    break;
                case "donors":
                    this.props.loadDonorsMapData(nextProps.mapCurrentYear,
                        nextProps.donorFilter.operatingUnits,
                        nextProps.donorFilter.themes,
                        nextProps.donorFilter.budgetSources,
                        nextProps.donorFilter.sdg);
                    this.props.fetchDonorFundListData(nextProps.mapCurrentYear);
                    break;
                case "sdg":
                    this.props.loadSdgMapData(nextProps.mapCurrentYear,
                        '',
                        nextProps.sdgFilter.operatingUnits,
                        nextProps.sdgFilter.budgetSources,
                        "sdg"); 
                    this.props.fetchSdgListData(nextProps.mapCurrentYear);
                    break;
                case "signature":
                    if(nextProps.mapCurrentYear >= commonConstants.SIGNATURE_SOLUTION_YEAR){
                        this.props.loadSignatureMapData(nextProps.mapCurrentYear,
                            undefined,
                            nextProps.themeFilter.operatingUnits,
                            nextProps.themeFilter.budgetSources);
                        this.props.fetchSignatureSummaryData(nextProps.mapCurrentYear);
                    }else{
                        this.tabClick('country');
                    }    
                    break;
                    
            }
        }
        if (this.props.countryRegionFilter.country != nextProps.countryRegionFilter.country) {
            this.props.loadGlobalMapData(nextProps.mapCurrentYear, nextProps.countryRegionFilter.country.iso3);
        }
        if (this.props.donorFilter.operatingUnits != nextProps.donorFilter.operatingUnits ||
            this.props.donorFilter.themes != nextProps.donorFilter.themes ||
            this.props.donorFilter.sdg != nextProps.donorFilter.sdg ||
            this.props.donorFilter.budgetSources != nextProps.donorFilter.budgetSources
        ) {
            this.props.loadDonorsMapData(nextProps.mapCurrentYear,
                nextProps.donorFilter.operatingUnits,
                nextProps.donorFilter.themes,
                nextProps.donorFilter.budgetSources,
                nextProps.donorFilter.sdg);
        }
        if (this.props.themeFilter.operatingUnits != nextProps.themeFilter.operatingUnits ||
            this.props.themeFilter.budgetSources != nextProps.themeFilter.budgetSources 
            || this.props.themeFilter.selectedTheme !== nextProps.themeFilter.selectedTheme
        ) {
            if(this.props.tabSelected !== 'signature'){
                let selTheme = typeof(nextProps.themeFilter.selectedTheme) === 'string' ? nextProps.themeFilter.selectedTheme : this.selectedThemseFilter.selectedTheme;
                this.props.loadThemesMapData(nextProps.mapCurrentYear,
                    selTheme,
                    nextProps.themeFilter.operatingUnits,
                    nextProps.themeFilter.budgetSources);
                this.props.updateSearchThemes(nextProps.themeFilter.selectedTheme);
                this.props.searchOperatingUnitsListData(null, null);
            }
            
        } 
        if (this.props.themeFilter.operatingUnits != nextProps.themeFilter.operatingUnits ||
            this.props.themeFilter.budgetSources != nextProps.themeFilter.budgetSources 
            || this.props.themeFilter.selectedTheme !== nextProps.themeFilter.selectedTheme
        ) {
            if(this.props.tabSelected === 'signature'){
                let selSS = typeof(nextProps.themeFilter.selectedTheme) === 'string' ? nextProps.themeFilter.selectedTheme : this.selectedSSFilter.selectedTheme;
                this.props.loadSignatureMapData(nextProps.mapCurrentYear,
                    selSS,
                    nextProps.themeFilter.operatingUnits,
                    nextProps.themeFilter.budgetSources);
                this.props.updateSearchThemes(nextProps.themeFilter.selectedTheme);
                this.props.searchOperatingUnitsListData(null, null);
            }
        }
        if (this.props.sdgFilter.operatingUnits != nextProps.sdgFilter.operatingUnits ||
            this.props.sdgFilter.budgetSources != nextProps.sdgFilter.budgetSources 
            || this.props.sdgFilter.selectedSdg != nextProps.sdgFilter.selectedSdg
        ) {
            this.props.loadSdgMapData(nextProps.mapCurrentYear,
                nextProps.sdgFilter.selectedSdg,
                nextProps.sdgFilter.operatingUnits,
                nextProps.sdgFilter.budgetSources,
                "sdg");
            this.props.updateSearchSgd(nextProps.sdgFilter.selectedSdg);
            this.props.searchOperatingUnitsListData(null, null);
        }
        if (nextProps.countryRegionFilter.country.name && this.props.countryRegionFilter.country.name != nextProps.countryRegionFilter.country.name &&
            nextProps.countryRegionFilter.country.name != "") {
            if (nextProps.countryRegionFilter.country.name)
                this.setState({ searchValue: nextProps.countryRegionFilter.country.name, enableSearchIcon: false });
            else
                this.setState({ searchValue: "", enableSearchIcon: true });
        }
    } 

    componentWillMount() {
        if (!Object.keys(this.props.countryRegionFilter.country).length)
            this.props.fetchGlobalData(this.props.mapCurrentYear);
        else {
            this.props.fetchRecipientCountry(this.props.countryRegionFilter.country.name, this.props.countryRegionFilter.country.iso3, this.props.mapCurrentYear, this.props.countryRegionFilter.country.iso2);
        }
        this.props.onUpdateYear(this.props.mapCurrentYear);
        switch (this.props.tabSelected) {
            case "country":
                this.props.loadGlobalMapData(this.props.mapCurrentYear, this.props.countryRegionFilter.country.iso3);
                break;
            case "themes":
                this.props.loadThemesMapData(this.props.mapCurrentYear,
                    this.props.themeFilter.selectedTheme,
                    this.props.themeFilter.operatingUnits,
                    this.props.themeFilter.budgetSources);
                this.props.fetchThemeSummaryData(this.props.mapCurrentYear);
                break;
            case "donors":
                this.props.loadDonorsMapData(this.props.mapCurrentYear, this.props.donorFilter.operatingUnits,
                    this.props.donorFilter.themes,
                    this.props.donorFilter.budgetSources,
                    this.props.donorFilter.sdg);
                this.props.fetchDonorFundListData(this.props.mapCurrentYear);

                break;
            case "sdg":
                this.props.loadSdgMapData(this.props.mapCurrentYear,
                    this.props.sdgFilter.selectedSdg,
                    this.props.sdgFilter.operatingUnits,
                    this.props.sdgFilter.budgetSources,
                    "sdg");
                this.props.fetchSdgListData(this.props.mapCurrentYear);
                break;
            case "signature":
                this.props.loadSignatureMapData(this.props.mapCurrentYear,
                    this.props.themeFilter.selectedTheme,
                    this.props.themeFilter.operatingUnits,
                    this.props.themeFilter.budgetSources);
                this.props.fetchSignatureSummaryData(this.props.mapCurrentYear);
                break;
        }
    }
    componentDidMount() {
        if (this.props.countryRegionFilter.country.name) {
            this.setState({ searchValue: this.props.countryRegionFilter.country.name, enableSearchIcon: false });
        }
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('touchstart', this.handleClickOutside);
    }
    componentWillUnmount() {
        document.body.className = '';
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('touchstart', this.handleClickOutside);
    }
    selectMap() {
        this.setState({ showMapMobile: true });
    }
    mapcloseClick() {
        this.setState({ showMapMobile: !this.state.showMapMobile });
    }
    accordionClick = (accordion,event) => {
        if(!event || event.target.getAttribute('name') !== 'info_btn'){
            if (this.state.accordionSelected == accordion) {
                document.body.className = '';
                this.setState({ accordionSelected: '', showMapMobile: false });
            }
            else {
                document.body.className = style.accordionScroll;
                this.setState({ accordionSelected: accordion });
                this.tabClick(accordion);
            }
        }
    }
    updateSSThemesFilterTabClick(lastTab){
        if(Object.keys(lastTab.themeFilter).length){
            switch (lastTab.tabSelected) {
                case "themes":
                    this.selectedThemseFilter.budgetSources = lastTab.themeFilter.budgetSources ? lastTab.themeFilter.budgetSources : '';
                    this.selectedThemseFilter.budgetSourcesLabel = lastTab.themeFilter.budgetSourcesLabel ? lastTab.themeFilter.budgetSourcesLabel : '';
                    this.selectedThemseFilter.operatingUnits = lastTab.themeFilter.operatingUnits ? lastTab.themeFilter.operatingUnits : '';
                    this.selectedThemseFilter.operatingUnitsLabel = lastTab.themeFilter.operatingUnitsLabel ? lastTab.themeFilter.operatingUnitsLabel : '';  
                break;
                case "signature":
                    this.selectedSSFilter.budgetSources = lastTab.themeFilter.budgetSources ? lastTab.themeFilter.budgetSources : '';
                    this.selectedSSFilter.budgetSourcesLabel = lastTab.themeFilter.budgetSourcesLabel ? lastTab.themeFilter.budgetSourcesLabel : '';
                    this.selectedSSFilter.operatingUnits = lastTab.themeFilter.operatingUnits ? lastTab.themeFilter.operatingUnits : '';
                    this.selectedSSFilter.operatingUnitsLabel = lastTab.themeFilter.operatingUnitsLabel ? lastTab.themeFilter.operatingUnitsLabel : '';   
                break;
            }
        }
    }

    updateSSThemesFilter(tabSelected, value){
        switch (tabSelected) {
            case "themes":
                this.selectedThemseFilter.selectedTheme = value;
            break;
            case "signature":
                this.selectedSSFilter.selectedTheme = value;
            break;
        }
    }
    tabClick = (tab) => {
        this.updateSSThemesFilterTabClick(this.props.tabData);
        const tabData = this.props.tabData,
            { donorFilter,
                sdgFilter,
                themeFilter
            } = tabData;

            let country = "",
            themes = "",
            sdg = "",
            donor;

        switch (tab) {
            case "country":
                this.props.loadGlobalMapData(this.props.mapCurrentYear, this.props.countryRegionFilter.country.iso3);
                break;
            case "themes":
                this.props.themeFilter.selectedTheme = this.selectedThemseFilter.selectedTheme;
                country = this.selectedThemseFilter.operatingUnits ? this.selectedThemseFilter.operatingUnits: "";
                themes = this.selectedThemseFilter.selectedTheme;
                sdg="";
                donor = this.selectedThemseFilter.budgetSources ? this.selectedThemseFilter.budgetSources: "";
            
                this.props.upDateBudgetSourceField(themes,sdg,country);
                this.props.updateThemeFilter("operatingUnits", this.selectedThemseFilter.operatingUnits);
                this.props.updateThemeFilter("operatingUnitsLabel", this.selectedThemseFilter.operatingUnitsLabel);
                this.props.updateThemeFilter("budgetSources", this.selectedThemseFilter.budgetSources);
                this.props.updateThemeFilter("budgetSourcesLabel", this.selectedThemseFilter.budgetSourcesLabel);
                this.props.loadThemesMapData(this.props.mapCurrentYear,
                themes,
                country,
                donor);
                this.props.fetchThemeSummaryData(this.props.mapCurrentYear);
                this.props.updateSearchText('');
                this.props.searchOperatingUnitsListData(null, null);
                break;
            case "donors":
                this.props.loadDonorsMapData(this.props.mapCurrentYear,
                this.props.donorFilter.operatingUnits,
                this.props.donorFilter.themes,
                this.props.donorFilter.budgetSources,
                this.props.donorFilter.sdg);
                this.props.fetchDonorFundListData(this.props.mapCurrentYear);
                break;

            case "sdg":
                country = sdgFilter.operatingUnits ? sdgFilter.operatingUnits : "";
                themes = "";
                sdg = sdgFilter.selectedSdg !=="" && sdgFilter.selectedSdg ? sdgFilter.selectedSdg : "";
                this.props.upDateBudgetSourceField(themes,sdg,country);

                let sdgYear = this.props.mapCurrentYear;
                if(sdgYear != this.props.currentYearSelected){
                    sdgYear = this.props.currentYearSelected;
                    this.props.setMapCurrentYear(sdgYear);
                } 

                this.props.loadSdgMapData(sdgYear,
                sdg,
                this.props.sdgFilter.operatingUnits,
                this.props.sdgFilter.budgetSources,
                "sdg");
                this.props.fetchSdgListData(sdgYear);
                this.props.updateSearchCountryField(sdgFilter.operatingUnits ? sdgFilter.operatingUnits : '');
                this.props.searchOperatingUnitsListData(null, null);
                break;
            case "signature":
                this.props.themeFilter.selectedTheme = this.selectedSSFilter.selectedTheme;    
                var signatureYear = this.props.mapCurrentYear;
                if(signatureYear != this.props.currentYearSelected){
                    signatureYear = this.props.currentYearSelected;
                    this.props.setMapCurrentYear(signatureYear);
                }  
                this.props.updateThemeFilter("operatingUnits", this.selectedSSFilter.operatingUnits);
                this.props.updateThemeFilter("operatingUnitsLabel", this.selectedSSFilter.operatingUnitsLabel);
                this.props.updateThemeFilter("budgetSources", this.selectedSSFilter.budgetSources);
                this.props.updateThemeFilter("budgetSourcesLabel", this.selectedSSFilter.budgetSourcesLabel);
                country = this.selectedSSFilter.operatingUnits?this.selectedSSFilter.operatingUnits:"";
                themes = this.selectedSSFilter.selectedTheme;
                sdg="";
                donor = this.selectedSSFilter.budgetSources ? this.selectedSSFilter.budgetSources: "";
                this.props.upDateBudgetSourceField(themes,sdg,country);
                this.props.loadSignatureMapData(signatureYear,
                themes,
                country,
                donor);
                this.props.fetchSignatureSummaryData(signatureYear);
                this.props.updateSearchText('');
                this.props.searchOperatingUnitsListData(null, null);
            break;
        }
        this.props.onTabSelection(tab);
    }

    doParentToggle = () => {
        this.setState({ slider: true });
    }
    handleSearchChange = (event) => {
        this.setState({ toggleDropDown: true, searchValue: event.target.value });
        this.props.searchCountryRegionsListData(event.target.value);
        if (event.target.value == '') {
            this.setState({ enableSearchIcon: true });
        }
        else
            this.setState({ enableSearchIcon: false });
    }
    handleSearchClick = (country) => {
        this.setState({ toggleDropDown: false, searchValue: country.name, enableSearchIcon: false });
        let countryItem = {
            name: country.name,
            iso3: country.code,
            iso2: country.iso2,
            type: country.type
        };
        this.props.updateCountryRegionFilter("country", countryItem);
        this.props.fetchRecipientCountry(country.name, country.code, this.props.mapCurrentYear, country.iso2, country.type);
    }
    checkSearchKeyword = (event) => {
        if (event.target.value == '') {
            this.clearSearch();
        }
    }
    clearSearchFieldOnly() {
        this.setState({ searchValue: '', enableSearchIcon: true });
    }
    clearSearch() {
        this.setState({ searchValue: '', enableSearchIcon: true });
        this.props.updateCountryRegionFilter("country", {});
        this.props.loadGlobalMapData(this.props.mapCurrentYear, "");
        this.props.fetchGlobalData(this.props.mapCurrentYear);
    }
    selectThemeSdg(value, type) {
        if (type == "themes" || type == "sector" || type == "signature") {
            this.props.updateThemeFilter("selectedTheme", "");
            this.setState({ selectedTheme: value });
        }
        else if (type == "sdg") {
            this.props.updateSdgFilter("selectedSdg", "");
            this.setState({ selectedSdg: value });
        }
        else {
            this.props.updateDonorFilter("budgetSources", "");
            this.props.updateDonorFilter("budgetSourcesLabel", "");
            this.setState({ selectedDonor: value });
        }
    }
    selectDonor(donorCode) {
        this.setState({ selectedDonor: donorCode });
        this.props.loadDonorsMapData(this.props.mapCurrentYear,
            this.props.donorFilter.operatingUnits,
            this.props.donorFilter.themes,
            donorCode,
            this.props.donorFilter.sdg
        );
    }
    searchCountry(countryCode) {
        this.props.loadGlobalMapData(this.props.mapCurrentYear, countryCode);
    }
    onCountrySelect(country) {
        if(this.props.tabSelected == "country") {
            let countryItem = {
                name: country.country_name,
                iso3: country.country_iso3,
                iso2: country.country_iso2,
                unit_type: country.unit_type,
                type: 2
            }
            this.props.updateCountryRegionFilter("country", countryItem);
        }
        else if (this.props.tabSelected == "donors") {
            this.props.updateDonorFilter("operatingUnits", country.country_iso3);
            this.props.updateDonorFilter("operatingUnitsLabel", country.country_name)
            this.props.fetchDonorFundListData();
        }
        else if (this.props.tabSelected == "themes") {
            this.props.updateThemeFilter("operatingUnits", country.country_iso3);
            this.props.updateThemeFilter("operatingUnitsLabel", country.country_name);
            this.props.updateSearchCountryField(country.country_iso3)
            this.props.fetchThemeSummaryData();
        }
        else if (this.props.tabSelected == "signature") {
            this.props.updateThemeFilter("operatingUnits", country.country_iso3);
            this.props.updateThemeFilter("operatingUnitsLabel", country.country_name);
            this.props.updateSearchCountryField(country.country_iso3)
            this.props.fetchSignatureSummaryData();
        }
        else {
            this.props.updateSdgFilter("operatingUnits", country.country_iso3);
            this.props.updateSdgFilter("operatingUnitsLabel", country.country_name);
            this.props.updateSearchCountryField(country.country_iso3)
            this.props.fetchSdgListData();
        }
    }
    onMaximize = () => {
        this.setState({
            resize: true
        });
    }
    handleMinimizeCard = () => {
        this.setState({
            resize: false
        });
    }
    mapLabelToValue = (value, list) => {
        if (list.length) {
            let label = list.filter((item) => {
                return item.value == value;
            });
            if (label.length) {
                return label[0].label;
            } else {
                return '';
            }
        } else {
            return '';
        }
    }
    findSelectedItemDetails = (dataList, code) => {
        let selectedItem;
        dataList.forEach((item, index) => {
            if (this.props.tabSelected == "donors" && (item.level_3_code == code || item.ref_id == code)) {
                selectedItem = item
                return true
            }
            else if (this.props.tabSelected == "themes" && (item.sector == code)) {
                selectedItem = item
                return true
            }
            else if (this.props.tabSelected == "signature" && (item.sector == code)) {
                selectedItem = item
                return true
            }
            else if (this.props.tabSelected == "sdg" && (item.sdg_code == code)) {
                selectedItem = item
                return true
            }
        })
        return selectedItem
    }
    renderExportPopup() {
        let data, loading, templateType, mapData, recipient,targetData,signatureSolution;
        data = {
            year: this.props.mapCurrentYear
        }
        const { countryList, countryRegionFilter, sdgData, themeSummary, themeList, donorFilter, themeFilter, sdgFilter, tabSelected, mapCurrentYear,
            sankeyYear, bugetType } = this.props;

        let source = '',
            year = this.props.mapCurrentYear,
            units = '',
            keywords = '',
            sectors = '',
            sdgs = '';


        switch (this.props.tabSelected) {
            case 'country':

                units = countryRegionFilter.country && countryRegionFilter.country.iso3 ? countryRegionFilter.country.iso3 : "",
                templateType = "home_countries"
                data = {
                    ...data,
                    title: 'Recipient Country / Region',
                    selected: this.props.countryData.data.country_name,
                    themesBudget: this.props.themesBudget.data,
                    themesBudgetAggregate: aggregateCalculator(this.props.themesBudget.data, 'theme_budget'),
                    budgetSources: this.props.budgetSources.data,
                    aggregate: this.props.countryData.data,
                    projectList: this.props.projectList.projectList.data.slice(0, 10),
                    lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
                };
                loading = this.props.themesBudget.loading || this.props.budgetSources.loading || this.props.countryData.loading;
                if (this.props.countryData.data.country_name != "Global" && this.props.countryData.data.type != 1) {
                    data = {
                        ...data,
                        mapData: this.props.outputMapData.data,
                        recipientSdg: this.props.recepientSdg.data,
                        reicpientSdgAggregate: aggregateCalculator(this.props.recepientSdg.data, 'sdg_budget'),
                        projectList: this.props.projectList.projectList.data.slice(0, 10)
                    }
                    loading = this.props.themesBudget.loading ||
                        this.props.budgetSources.loading ||
                        this.props.countryData.loading ||
                        this.props.projectList.loading ||
                        this.props.recepientSdg.loading ||
                        this.props.outputMapData.loading;
                }
                break;
            case 'donors':
                units = donorFilter && donorFilter.operatingUnits ? donorFilter.operatingUnits : "",
                sdgs = donorFilter && donorFilter.sdg ? donorFilter.sdg : "",
                sectors = donorFilter && donorFilter.themes ? donorFilter.themes : "",
                source = donorFilter && donorFilter.budgetSources ? donorFilter.budgetSources : "";
                // mapData = this.props.donorsMapData.data.length == 1 ? this.props.outputMapData.data : undefined
                mapData = this.props.donorsMapData.data.length >0 ? this.props.donorsMapData.data.length == 1? this.props.donorOutputData.data:this.props.donorsMapData.data : [];
                recipient = this.props.donorsMapData.data.length == 1 ? 1 : undefined
                templateType = "home_donors"
                data = {
                    ...data,
                    title: "Donors",
                    mapData: mapData,
                    recipient: recipient
                }
                if ((!this.props.donorFilter.budgetSourcesLabel || this.props.donorFilter.budgetSourcesLabel == "")
                ) {
                    data = {
                        ...data,
                        donorList: this.state.themeData,
                        regularOther: this.props.donorProfile.regularAndOthers.data,
                        regularOtherAggregate: aggregateCalculator(this.props.donorProfile.regularAndOthers.data.total, 'total_contribution'),
                        resourcesModalityContribution: this.props.donorProfile.resourcesModalityContribution.data,
                        resourcesModalityContributionAggregate: aggregateCalculator(this.props.donorProfile.resourcesModalityContribution.data.total, 'total_contribution'),
                        donorSelected: this.props.donorFilter.budgetSourcesLabel ? this.props.donorFilter.budgetSourcesLabel : "",
                        unitSelected: this.props.donorFilter.operatingUnitsLabel ? this.props.donorFilter.operatingUnitsLabel : "",
                        sectorSelected: this.mapLabelToValue(this.props.donorFilter.themes ? this.props.donorFilter.themes : "", this.props.themeList.masterThemeList),
                        sdgSelected: this.mapLabelToValue(this.props.donorFilter.sdg ? this.props.donorFilter.sdg : "", this.props.sdgData.masterSdgList),
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
                        sdgNumber: this.props.donorFilter.sdg ? this.props.donorFilter.sdg: "" ,
                        projectList: this.props.projectList.projectList.data.slice(0, 10) 
                    }
                    loading = this.props.donorFundList.loading ||
                        this.props.donorProfile.regularAndOthers.loading ||
                        this.props.donorProfile.resourcesModalityContribution.loading ||
                        this.props.projectList.loading;
                }
                else {
                    const basicDetails = this.state.themeData.data.data.filter((item)=>{
                        return (this.props.donorFilter.budgetSources == item.level_3_code ||
                            this.props.donorFilter.budgetSources == item.ref_id
                        )
                    })
                    data = {
                        ...data,
                        summaryDetails: this.findSelectedItemDetails(this.state.themeData.data.data, this.props.donorFilter.budgetSources),
                        selected: this.props.donorProfile.basicDetails.data && this.props.donorProfile.basicDetails.data.donor_name,
                        regularOther: this.props.donorProfile.regularAndOthers.data,
                        regularOtherAggregate: aggregateCalculator(this.props.donorProfile.regularAndOthers.data.country, 'total_contribution'),
                        resourcesModalityContribution: this.props.donorProfile.resourcesModalityContribution.data,
                        resourcesModalityContributionAggregate: aggregateCalculator(this.props.donorProfile.resourcesModalityContribution.data.country, 'total_contribution'),
                        basicDetails: basicDetails[0],
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        budgetSources: this.props.donorProfile.budgetSources.data.slice(0, 20),
                        donorSelected: this.props.donorFilter.budgetSourcesLabel ? this.props.donorFilter.budgetSourcesLabel : "",
                        sectorSelected: this.mapLabelToValue(this.props.donorFilter.themes ? this.props.donorFilter.themes : "", this.props.themeList.masterThemeList),
                        sdgSelected: this.mapLabelToValue(this.props.donorFilter.sdg ? this.props.donorFilter.sdg : "", this.props.sdgData.masterSdgList),
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
                        sdgNumber: this.props.donorFilter.sdg ? this.props.donorFilter.sdg: ""
                    }
                    if (this.props.donorFilter.budgetSourcesLabel && this.props.donorFilter.budgetSourcesLabel != ""
                        && (this.props.donorFilter.operatingUnitsLabel && this.props.donorFilter.operatingUnitsLabel != "")
                    ) {
                        data = {
                            ...data,
                            recipient: 1,
                            projectList: this.props.projectList.projectList.data.slice(0, 10),
                            
                            unitSelected: this.props.donorFilter.operatingUnitsLabel ? this.props.donorFilter.operatingUnitsLabel : "",
                        }
                        loading = this.props.donorProfile.basicDetails.loading ||
                            this.props.donorProfile.regularAndOthers.loading ||
                            this.props.donorProfile.budgetSources.loading ||
                            this.props.donorFundList.loading ||
                            this.props.donorProfile.resourcesModalityContribution.loading ||
                            this.props.outputMapData.loading || 
                            this.props.projectList.loading;
                    }
                    else {
                        data = {
                            ...data,
                            recipientOffices: this.props.donorProfile.topRecipientOffices.data
                        }
                        loading = this.props.donorProfile.basicDetails.loading ||
                            this.props.donorProfile.regularAndOthers.loading ||
                            this.props.donorProfile.budgetSources.loading ||
                            this.props.donorFundList.loading ||
                            this.props.outputMapData.loading ||
                            this.props.donorProfile.resourcesModalityContribution.loading ||
                            this.props.donorProfile.topRecipientOffices.loading;
                    }
                }
                break;

            case 'themes':
                
                source = themeFilter && themeFilter.budgetSources ? themeFilter.budgetSources : "";
                units = themeFilter && themeFilter.operatingUnits ? themeFilter.operatingUnits : "";
                sectors = themeFilter && themeFilter.selectedTheme ? themeFilter.selectedTheme : "";
                mapData = this.props.themesMapData.data.length == 1 ? this.props.outputMapData.data : undefined
                recipient = this.props.themesMapData.data.length == 1 ? 1 : undefined
                data = {
                    ...data,
                    title: "Our Focus",
                    mapData: mapData,
                    recipient: recipient,
                    donorSelected: this.props.themeFilter.budgetSourcesLabel && this.props.themeFilter.budgetSourcesLabel != "" ? this.props.themeFilter.budgetSourcesLabel : undefined,
                    unitSelected: this.props.themeFilter.operatingUnitsLabel && this.props.themeFilter.operatingUnitsLabel != "" ? this.props.themeFilter.operatingUnitsLabel : undefined
                }
                templateType = "home_sectors"
                if (this.props.themeFilter.selectedTheme || this.props.themeFilter.selectedTheme == "0") {
                    data = {
                        ...data,
                        summaryDetails: this.findSelectedItemDetails(this.state.themeData.data.sector, this.props.themeFilter.selectedTheme),
                        aggregate: this.props.themeSliderData.data.aggregate,
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        selected: this.props.themeSliderData.data.aggregate && this.props.themeSliderData.data.aggregate.sector_name,
                        budgetSources: this.props.themeSliderData.data.budget_sources ? this.props.themeSliderData.data.budget_sources : [],
                        recipientOffices: this.props.themeSliderData.data.top_recipient_offices ? this.props.themeSliderData.data.top_recipient_offices : [],
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
                    }
                    loading = this.props.themeSliderData.loading || this.props.themeSummary.loading || this.props.outputMapData.loading;
                }
                else {
                    data = {
                        ...data,
                        themeList: this.state.themeData,
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
                    }
                    loading = this.props.themeSummary.loading || this.props.outputMapData.loading || this.props.projectList.loading;
                }
                break;
            case 'signature':
                
                source = themeFilter && themeFilter.budgetSources ? themeFilter.budgetSources : "";
                units = themeFilter && themeFilter.operatingUnits ? themeFilter.operatingUnits : "";
                signatureSolution = themeFilter && themeFilter.selectedTheme ? themeFilter.selectedTheme : "";
                mapData = this.props.signatureMapData.data.length == 1 ? this.props.outputMapData.data : undefined
                recipient = this.props.signatureMapData.data.length == 1 ? 1 : undefined
                data = {
                    ...data,
                    title: "Signature Solutions",
                    mapData: mapData,
                    recipient: recipient,
                    donorSelected: this.props.themeFilter.budgetSourcesLabel && this.props.themeFilter.budgetSourcesLabel != "" ? this.props.themeFilter.budgetSourcesLabel : undefined,
                    unitSelected: this.props.themeFilter.operatingUnitsLabel && this.props.themeFilter.operatingUnitsLabel != "" ? this.props.themeFilter.operatingUnitsLabel : undefined
                }
                templateType = "home_sectors"
                if (this.props.themeFilter.selectedTheme || this.props.themeFilter.selectedTheme == "0") {
                    data = {
                        ...data,
                        summaryDetails: this.findSelectedItemDetails(this.state.themeData.data.sector, this.props.themeFilter.selectedTheme),
                        aggregate: this.props.themeSliderData.data.aggregate,
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        selected: this.props.themeSliderData.data.aggregate && this.props.themeSliderData.data.aggregate.sector_name,
                        budgetSources: this.props.themeSliderData.data.budget_sources ? this.props.themeSliderData.data.budget_sources : [],
                        recipientOffices: this.props.themeSliderData.data.top_recipient_offices ? this.props.themeSliderData.data.top_recipient_offices : [],
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
                    }
                    loading = this.props.themeSliderData.loading || this.props.themeSummary.loading || this.props.outputMapData.loading;
                }
                else {
                    data = {
                        ...data,
                        themeList: this.state.themeData,
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
                    }
                    loading = this.props.themeSummary.loading || this.props.outputMapData.loading || this.props.projectList.loading;
                }
                break;
            case "sdg":
                units = sdgFilter && sdgFilter.operatingUnits ? sdgFilter.operatingUnits : "";
                source = sdgFilter && sdgFilter.budgetSources ? sdgFilter.budgetSources : "";
                sdgs = sdgFilter && sdgFilter.selectedSdg ? sdgFilter.selectedSdg : "";
                mapData = this.props.sdgMapData.data.length == 1 ? this.props.outputMapData.data : undefined
                recipient = this.props.sdgMapData.data.length == 1 ? 1 : undefined
                targetData= this.props.sdgTargetSliderData.data.percentage? this.props.sdgTargetSliderData.data.percentage : []
                data = { 
                    ...data,
                    title: "Sustainable Development Goals",
                    mapData: mapData,
                    recipient: recipient,
                    donorSelected: this.props.sdgFilter.budgetSourcesLabel && this.props.sdgFilter.budgetSourcesLabel != "" ? this.props.sdgFilter.budgetSourcesLabel : undefined,
                    unitSelected: this.props.sdgFilter.operatingUnitsLabel && this.props.sdgFilter.operatingUnitsLabel != "" ? this.props.sdgFilter.operatingUnitsLabel : undefined,
                }
                templateType = "home_sdgs"
                if (this.props.sdgFilter.selectedSdg || this.props.selectedSdg == "0") {
                    data = {
                        ...data,
                        summaryDetails: this.findSelectedItemDetails(this.state.themeData.data.sdg, this.props.sdgFilter.selectedSdg),
                        selected: 'Goal ' + (this.props.sdgSliderData.data.aggregate && this.props.sdgSliderData.data.aggregate.sdg) + ': ' + (this.props.sdgSliderData.data.aggregate && this.props.sdgSliderData.data.aggregate.sdg_name),
                        aggregate: this.props.sdgSliderData.data.aggregate,
                        budgetSources: this.props.sdgSliderData.data.budget_sources,
                        recipientOffices: this.props.sdgSliderData.data.top_recipient_offices,
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date),
                        targetData
                    }
                    loading = this.props.sdgSliderData.loading || this.props.sdgList.loading || this.props.outputMapData.loading
                }
                else {
                    data = {
                        ...data,
                        sdgList: this.state.themeData.data,
                        projectList: this.props.projectList.projectList.data.slice(0, 10),
                        lastUpdatedDate: getFormmattedDate(this.props.lastUpdatedDate.data.last_updated_date)
                    }
                    loading = this.props.sdgList.loading || this.props.outputMapData.loading || this.props.projectList.loading 
                }
                break;
        }
        
        return ( 
            <ExportPopup
                templateType={templateType}
                data={data}
                downloadCsv={() => {
                    this.props.downLoadProjectListCsv(year, keywords, source, sectors, units, sdgs,'',signatureSolution)
                }
                }
                loading={loading}
                onCloseModal={() => this.hideExportModal()}
            >
            </ExportPopup>
        );
    }
    showExportModal() {
        this.setState({ showExportModal: true })
        if (this.props.tabSelected == "donors") {
            this.props.updateProjectList(this.props.mapCurrentYear, this.props.donorFilter.operatingUnits, this.props.donorFilter.budgetSources, this.props.donorFilter.themes,"","","","", this.props.donorFilter.sdg);
            this.props.getDonorDetails(this.props.donorFilter.budgetSources == "" ? null : this.props.donorFilter.budgetSources, this.props.mapCurrentYear)
        }
        else if (this.props.tabSelected == "themes") {
            if(this.props.themeFilter.selectedTheme && this.props.themeFilter.selectedTheme != "") {
                this.props.fetchThemeSliderData(this.props.mapCurrentYear, this.props.themeFilter.selectedTheme && this.props.themeFilter.selectedTheme != "" ? this.props.themeFilter.selectedTheme : null)
            }
            else {
                this.props.updateProjectList(this.props.mapCurrentYear, this.props.themeFilter.operatingUnits,this.props.themeFilter.budgetSources,"","","","","");               
            }
        }
        else if (this.props.tabSelected == "signature") {
            if(this.props.themeFilter.selectedTheme && this.props.themeFilter.selectedTheme != "") {
                this.props.fetchSignatureSliderData(this.props.mapCurrentYear, this.props.themeFilter.selectedTheme && this.props.themeFilter.selectedTheme != "" ? this.props.themeFilter.selectedTheme : null)
            }
            else {
                this.props.updateProjectList(this.props.mapCurrentYear, this.props.themeFilter.operatingUnits,this.props.themeFilter.budgetSources,"","","","","");               
            }
        } 
        else if (this.props.tabSelected == "sdg") {
            this.props.updateProjectList(this.props.mapCurrentYear, this.props.sdgFilter.operatingUnits,this.props.sdgFilter.budgetSources,"","","","","");          
            this.props.fetchSdgSliderData(this.props.mapCurrentYear, this.props.sdgFilter.selectedSdg && this.props.sdgFilter.selectedSdg != "" ? this.props.sdgFilter.selectedSdg : null)
        }
        else {
            if (this.props.countryData.data.country_name != "Global" && this.props.countryData.data.type != 1) {
                this.props.fetchRecipientSdg(this.props.countryData.data.country_iso3, this.props.mapCurrentYear)
            }
        }
    }
    hideExportModal() {
        this.setState({ showExportModal: false });
    }
    onMinimize = () => {
        this.handleMinimizeCard();
    }
    onCloseCard = () => {
        this.setState({ resetMap: !this.state.resetMap });
        this.props.updateCountryRegionFilter("country", {});
        this.props.fetchGlobalData(this.props.mapCurrentYear);
        this.handleMinimizeCard();
    }
    showHideMapCard = () => {
        this.setState({ showHideMapCard: !this.state.showHideMapCard });
    }
    getFlagURL = (country) => {
        return Api.API_BASE+'/media/flag_icons/'+country.country_iso3+'.svg';  
    }
    render({ countryList, countryRegionFilter, sdgData, themeSummary, themeList, donorFilter, themeFilter, sdgFilter, tabSelected, mapCurrentYear,
        sankeyYear, bugetType
    }, state) {
        const ISCOUNTRY_REGION = (tabSelected === "donors" || tabSelected === "themes" || tabSelected === "sdg" || tabSelected === "signature") ? true : false,
            country = this.props.countryData.data && this.props.countryData.data.country_iso3 ? this.props.countryData.data.country_iso3 : "",
            countryLabel = this.props.countryData.data && this.props.countryData.data.country_name ? this.props.countryData.data.country_name : "",
            operatingUnits = donorFilter && donorFilter.operatingUnits ? donorFilter.operatingUnits : "",
            operatingUnitsLabel = donorFilter && donorFilter.operatingUnits && donorFilter.operatingUnitsLabel ? donorFilter.operatingUnitsLabel : "",
            operatingUnitsUnitType = donorFilter && donorFilter.operatingUnitsUnitType ? donorFilter.operatingUnitsUnitType : "",
            sdg = donorFilter && donorFilter.sdg ? donorFilter.sdg : "",
            themes = donorFilter && donorFilter.themes ? donorFilter.themes : "",
            budgetSourcesDonor = donorFilter && donorFilter.budgetSources ? donorFilter.budgetSources : "",
            budgetSourcesLabelDonor = donorFilter && donorFilter.budgetSources && donorFilter.budgetSourcesLabel ? donorFilter.budgetSourcesLabel : "",
            budgetSources = themeFilter && themeFilter.budgetSources ? themeFilter.budgetSources : "",
            budgetSourcesLabel = themeFilter && themeFilter.budgetSources && themeFilter.budgetSourcesLabel ? themeFilter.budgetSourcesLabel : "",
            operatingUnitstheme = themeFilter && themeFilter.operatingUnits ? themeFilter.operatingUnits : "",
            operatingUnitsLabeltheme = themeFilter && themeFilter.operatingUnits && themeFilter.operatingUnitsLabel ? themeFilter.operatingUnitsLabel : "",
            sectorstheme = themeFilter && themeFilter.selectedTheme ? themeFilter.selectedTheme : "",
            budgetSourcesSdg = sdgFilter && sdgFilter.budgetSources ? sdgFilter.budgetSources : "",
            budgetSourcesLabelSdg = sdgFilter && sdgFilter.budgetSources && sdgFilter.budgetSourcesLabel ? sdgFilter.budgetSourcesLabel : "",
            operatingUnitsSdg = sdgFilter && sdgFilter.operatingUnits ? sdgFilter.operatingUnits : "",
            operatingUnitsLabelSdg = sdgFilter && sdgFilter.operatingUnits && sdgFilter.operatingUnitsLabel ? sdgFilter.operatingUnitsLabel : "",
            sdgSdg = sdgFilter && sdgFilter.selectedSdg ? sdgFilter.selectedSdg : "",
            filterUrl = {
                country: `&year=${mapCurrentYear}&country=${country}&countryLabel=${countryLabel}&financialFlowYear=${sankeyYear}&financialFlowType=${bugetType}`,
                donors: `&year=${mapCurrentYear}&operatingUnits=${operatingUnits}&sdg=${sdg}&themes=${themes}&operatingUnitsLabel=${operatingUnitsLabel}&budgetSources=${budgetSourcesDonor}&budgetSourcesLabel=${budgetSourcesLabelDonor}&financialFlowYear=${sankeyYear}&financialFlowType=${bugetType}`,
                themes: `&year=${mapCurrentYear}&operatingUnits=${operatingUnitstheme}&operatingUnitsLabel=${operatingUnitsLabeltheme}&budgetSources=${budgetSources}&budgetSourcesLabel=${budgetSourcesLabel}&themes=${sectorstheme}&financialFlowYear=${sankeyYear}&financialFlowType=${bugetType}`,
                sdg: `&year=${mapCurrentYear}&operatingUnits=${operatingUnitsSdg}&operatingUnitsLabel=${operatingUnitsLabelSdg}&budgetSources=${budgetSourcesSdg}&budgetSourcesLabel=${budgetSourcesLabelSdg}&sdg=${sdgSdg}&financialFlowYear=${sankeyYear}&financialFlowType=${bugetType}`,
                signature: `&year=${mapCurrentYear}&operatingUnits=${operatingUnitstheme}&operatingUnitsLabel=${operatingUnitsLabeltheme}&budgetSources=${budgetSources}&budgetSourcesLabel=${budgetSourcesLabel}&themes=${sectorstheme}&financialFlowYear=${sankeyYear}&financialFlowType=${bugetType}`,
            };   
            

            return (
            <section id="explore_section">
                {
                    this.state.showExportModal ?
                        this.renderExportPopup()
                        : null
                }
                <div class={style.desktop}>
                    <div>
                        <ul class={this.props.currentYearSelected >= commonConstants.SIGNATURE_SOLUTION_YEAR ? style.list_with_signature : style.list}>
                            <li>
                                <button class={this.props.tabSelected == "country" && style.active} onClick={(e) => this.tabClick('country')}>RECIPIENT COUNTRY / REGION</button>
                            </li>
                            <li>
                                <button class={this.props.tabSelected == "donors" && style.active} onClick={(e) => this.tabClick('donors')}>DONORS</button>
                            </li>
                            <li>
                                <button class={this.props.tabSelected == "themes" && style.active} onClick={() => this.tabClick('themes')}>OUR FOCUS</button>
                            </li>
                            <li style={this.props.currentYearSelected >= commonConstants.SIGNATURE_SOLUTION_YEAR ? { display: 'inline-block' } : { display: 'none' }}>
                                <button class={this.props.tabSelected == "signature" && style.active} onClick={() => this.tabClick('signature')}>SIGNATURE SOLUTIONS</button>
                            </li>
                            <li>
                                <button class={this.props.tabSelected == "sdg" && style.active} onClick={() => this.tabClick('sdg')}>SDGs</button>
                            </li>
                        </ul>
                        <FilterCollection
                            openEmbedModal={this.openEmbedModal}
                            themeSummary={themeList}
                            countryList={countryList}
                            sdgList={sdgData}
                            countryRegionSearchText={this.props.countryRegionSearchText}
                            showExportModal={() => this.showExportModal()}
                            donorFilter={donorFilter}
                            themeFilter={themeFilter}
                            sdgFilter={this.props.sdgFilter}
                            countryRegionFilter={this.props.countryRegionFilter}
                            data={this.props.data.themes}
                            updateDonorFilter={this.props.updateDonorFilter}
                            updateThemeFilter={this.props.updateThemeFilter}
                            updateCountryRegionFilter={this.props.updateCountryRegionFilter}
                            updateSdgFilter={this.props.updateSdgFilter}
                            searchCountry={(code) => this.searchCountry(code)}
                            tabSelected={this.props.tabSelected}
                            fetchSdgListData={this.props.fetchSdgListData}
                            fetchThemeSummaryData={this.props.fetchThemeSummaryData}
                            fetchSignatureSummaryData={this.props.fetchSignatureSummaryData}
                            fetchDonorFundListData={this.props.fetchDonorFundListData}
                            baseURL={Api.API_BASE}
                            
                        />
                    </div>
                    <section class={style.mainWrapper}>

                        {!ISCOUNTRY_REGION &&
                            <div>
                                <div class={this.state.showHideMapCard ? style.hideMapCard : style.mapCard}>
                                    <div class={style.titleBar}>
                                        {
                                            this.props.countryData.data.country_name == "Global" ?
                                                <span class={style.titleName}>{this.props.countryData.data.country_name}</span>
                                                :
                                                <span class={style.titleName}>
                                                    <img class={style.flagIcon} onError={(e)=>{ e.target.src = '/assets/images/Empty.svg'}} src={this.getFlagURL(this.props.countryData.data)}/>
                                                    <a class={style.activeTitleName} href={`/profile/${this.props.countryData.data.type == 1 ? this.props.countryData.data.country_iso3 : this.props.countryData.data.country_iso2}/recipientprofile`}>{this.props.countryData.data.country_name}</a>
                                                </span>
                                        }
                                        <span class={style.yearWrapper}>
                                            <span class={style.yearLabel}>Year:</span>
                                            <span class={style.yearText}>{this.props.mapCurrentYear}</span>
                                        </span>
                                        {this.state.resize ?
                                            <span class={style.minimizeCard}
                                                onClick={() => this.onMinimize()}></span>
                                            :
                                            <span class={style.maximizeCard}
                                                onClick={() => this.onMaximize()}></span>
                                        }
                                        {this.props.countryData.data.country_name != 'Global' &&
                                            <span class={style.closeCard}
                                                onClick={() => this.onCloseCard()}></span>
                                        }
                                    </div>
                                    <div class={`${style.tableContentStyles}
                                ${this.state.resize ? style.maximizedTableContentWrapperStyles : style.minimizedTableContentWrapperStyles}`} >
                                        <Scrollbars
                                            renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                            <section>

                                                <div class={style.tableWrapper}>
                                                    <span class={style.tableItem}>
                                                        <span class={style.tableItemLabel}>Budget</span>
                                                        <span class={style.tableItemValue}>{numberToCurrencyFormatter(this.props.countryData.data.total_budget, 2)}</span>
                                                    </span>
                                                    <span class={style.tableItem}>
                                                        <span class={style.tableItemLabel}>Expense</span>
                                                        <span class={style.tableItemValue}>{numberToCurrencyFormatter(this.props.countryData.data.total_expense, 2)}</span>
                                                    </span>
                                                    <span class={style.tableItem}>
                                                        <span class={style.tableItemLabel}>Projects</span>
                                                        <span class={style.tableItemValue}>{numberToCommaFormatter(this.props.countryData.data.project_count)}</span>
                                                    </span>
                                                    <span class={style.tableItem}>
                                                        <span class={style.tableItemLabel}>Donors</span>
                                                        <span class={style.tableItemValue}>{numberToCommaFormatter(this.props.countryData.data.donor_count)}</span>
                                                    </span>
                                                </div>
                                            </section>
                                            <section class={this.state.resize ?
                                                style.maximizedtableContentStyles
                                                : style.minimizedTableContentStyles}>
                                                <section class={style.themeWrapper}>
                                                    <div class={style.themeTitleWrapper}>
                                                        <span class={style.themeItemLabel}>{'Our Focus'}</span>
                                                        <span class={style.themeItemValue}>{'% of Budget'}</span>
                                                    </div>
                                                    <div class={style.no_content}>
                                                        {
                                                            this.props.themesBudget.loading ?
                                                                <PreLoader />
                                                                : this.props.themesBudget.data.length > 0 ?
                                                                    <div class={style.donutChartWrapper}>
                                                                        <DonutChart data={this.props.themesBudget.data} chart_id={"donut1_mobile"}
                                                                            chartWidth={456}
                                                                            chartHeight={456}
                                                                            legendData={this.props.themesBudget.data}
                                                                            textWrapperStyle={style.textWrapperStyle}
                                                                            donor_wrapper_styles={style.donutWrapperThemes}
                                                                            textFieldStyle={style.textFieldStyle}
                                                                            displayLegend={'false'}
                                                                            displayRegularLegend={'false'}
                                                                            svgIe={style.svgIe}
                                                                            percDiv={style.percDiv}
                                                                        />
                                                                    </div>
                                                                    : <NoDataTemplate />
                                                            
                                                        }
                                                    </div>
                                                </section>
                                                <section class={style.theme_slider_wrapper}>
                                                    <div class={style.theme_slider_title}>
                                                        <span>Top 5 Donors</span>
                                                        <BudgetExpenseLegend />
                                                    </div>
                                                    <div class={style.grouped_bar_chart}>
                                                        {
                                                            this.props.budgetSources.loading ?
                                                                <PreLoader />
                                                                : this.props.budgetSources.data.length > 0 ?
                                                                    <GroupedbarChart
                                                                        chart_id="budget_sources_mobile"
                                                                        width={1250}
                                                                        height={500}
                                                                        min_height={540}
                                                                        slice_limit={5}
                                                                        translate_xaxis={60}
                                                                        translate_yaxis={100}
                                                                        translate_graph={80}
                                                                        data={this.props.budgetSources.data}
                                                                        label={'type_level_3'}
                                                                        tspanSize={'28px'}
                                                                        textSize={'28px'} />
                                                                    : <NoDataTemplate />
                                                        }

                                                    </div>
                                                </section>
                                            </section>
                                        </Scrollbars>
                                    </div>
                                </div>
                                <span class={this.state.showHideMapCard ? style.hideCardIcon : style.showCardIcon}
                                    onClick={() => this.showHideMapCard()}>
                                </span>
                            </div>
                        }

                        <div class={style.wrapper}>
                            {ISCOUNTRY_REGION &&
                                <div class={style.sideBar}>
                                    <SideBar
                                        themeSummary={themeSummary}
                                        data={this.state.themeData}
                                        handleClick={this.handleClick}
                                        searchCountryListData={(donor) => this.props.searchCountryListData(donor)}
                                        selectThemeSdg={(value, type) => this.selectThemeSdg(value, type)}
                                        selectDonor={(donorCode) => this.selectDonor(donorCode)}
                                        tabSelected={this.props.tabSelected}
                                        budgetSourceSearch={this.props.budgetSourceSearch}
                                        searchResult={this.props.searchResult}
                                        updateDonorFilter={this.props.updateDonorFilter}
                                        updateSdgFilter={this.props.updateSdgFilter}
                                        updateThemeFilter={this.props.updateThemeFilter}
                                        fetchDonorFundListData={this.props.fetchDonorFundListData}
                                        updateSearchDonorsText={this.props.updateSearchDonorsText}
                                        donorFilter={this.props.donorFilter}
                                        updateSSThemesFilter={(tab, value) => this.updateSSThemesFilter(tab, value)}
                                    />
                                </div>
                            }
                            <div class={style.map}>
                                {
                                    this.props.tabSelected == "country" ?
                                        <Map onCountrySelect={(country) => this.onCountrySelect(country)} mapData={this.props.globalMapData} code={this.props.countryRegionFilter.country.iso3} unit_type={this.props.countryRegionFilter.country.unit_type} yearSelected={this.state.yearSelected} resetMap={this.state.resetMap} homeMap regionMap enableTimeline />
                                        : <Map
                                            onCountrySelect={(country) => this.onCountrySelect(country)}
                                            mapData={this.props.tabSelected != "themes" ?
                                                this.props.tabSelected == "sdg" ? this.props.sdgMapData : this.props.tabSelected != "signature" ? 
                                                this.props.donorsMapData: this.props.signatureMapData : this.props.themesMapData}
                                            enableTimeline
                                            section = { this.props.tabSelected === "donors" ? 'donorTab' :false }
                                            noZoom ={ this.props.tabSelected === "donors" ? true : false }
                                            yearSelected={this.state.yearSelected}
                                            operatingUnitsUnitType={operatingUnitsUnitType}
                                            sdg={this.props.tabSelected == "donors" ? this.props.donorFilter.sdg : 
                                            this.props.tabSelected == "sdg" ? this.state.selectedSdg : undefined}
                                            sector={this.props.tabSelected == "donors" ? this.props.donorFilter.themes : 
                                            this.props.tabSelected == "themes" ? this.state.selectedTheme :undefined}
                                            startYear ={this.props.tabSelected === 'sdg' ? commonConstants.SDG_YEAR : (this.props.tabSelected==='signature'? commonConstants.SIGNATURE_SOLUTION_YEAR :undefined) }
                                            signatureSolution = {this.props.tabSelected ==='signature' ? 'true' :'false'}
                                            source={this.props.tabSelected != "donors" ?
                                            this.props.tabSelected == "sdg" ? this.props.sdgFilter.budgetSources : this.props.themeFilter.budgetSources : this.props.donorFilter.budgetSources}
                                        />

                                }
                                <div class={style.disclaimer}>
                                    {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div class={style.mobile}>
                    <div class={style.accordion}>
                        <div class={this.state.accordionSelected == "country" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "country" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => { this.accordionClick('country'); }}>
                                <h3 class={style.accordionHead}>RECIPIENT COUNTRY / REGION</h3>
                            </div>
                            {
                                this.state.accordionSelected == "country"
                                    ?
                                    <div class={style.accordionContent} >
                                        <div class={style.embedCountrySection}>
                                            <div class={style.embedChildSection}>
                                                <EmbedSection
                                                    onClickEmbed={this.openEmbedModal}
                                                    showExportModal={() => this.showExportModal()} />

                                            </div>
                                        </div>
                                        <div class={style.searchWrapper}>
                                            <span class={style.searchLabel}>{'Search for Countries'}</span>
                                            <div class={style.searchItems} ref={(node) => this.searchNode = node}>
                                                <div class={style.countrySearch}
                                                >
                                                    <input
                                                        type="text"
                                                        name="search"
                                                        class={style.searchField}
                                                        value={this.state.searchValue}
                                                        onkeyup={(event) => this.checkSearchKeyword(event)}
                                                        onInput={(event) => this.handleSearchChange(event)}
                                                        onTouchStart={() => this.setState({ toggleDropDown: true })}
                                                        onMouseDown={() => this.setState({ toggleDropDown: true })}
                                                        placeholder="Enter country name"
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
                                                        dataList={this.props.countryRegionsearchResult}
                                                        wrapperClass={style.dropDowncountry}
                                                        baseURL={Api.API_BASE}
                                                    />
                                                }
                                            </div>
                                        </div>
                                        <div class={style.mapCard}>
                                            <div class={style.titleBar}>
                                                {
                                                    this.props.countryData.data.country_name == "Global" ?
                                                        <span class={style.titleName}>{this.props.countryData.data.country_name}</span>
                                                        :
                                                        <div>
                                                            <img class={style.flagIcon} src={Api.API_BASE+'/media/flag_icons/'+this.props.countryData.data.country_iso3+'.svg'}/>
                                                            <a class={style.activeTitleName} href={`/profile/${this.props.countryData.data.type == 1 ? this.props.countryData.data.country_iso3 : this.props.countryData.data.country_iso2}/recipientprofile`}>{this.props.countryData.data.country_name}</a>
                                                        </div>
                                                }
                                                <span class={style.yearWrapper}>
                                                    <span class={style.yearLabel}>Year:</span>
                                                    <span class={style.yearText}>{this.props.mapCurrentYear}</span>
                                                </span>
                                                {this.state.resize ?
                                                    <span class={style.minimizeCard}
                                                        onClick={() => this.onMinimize()}></span>
                                                    :
                                                    <span class={style.maximizeCard}
                                                        onClick={() => this.onMaximize()}></span>
                                                }
                                                {this.props.countryData.data.country_name != 'Global' &&
                                                    <span class={style.closeCard}
                                                        onClick={() => this.onCloseCard()}></span>
                                                }

                                            </div>

                                            <div class={`${style.tableContentStyles}
                                ${this.state.resize ? style.maximizedTableContentWrapperStyles : style.minimizedTableContentWrapperStyles}`} >
                                                <Scrollbars
                                                    renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}>
                                                    <section>

                                                        <div class={style.tableWrapper}>
                                                            <span class={style.tableItem}>
                                                                <span class={style.tableItemLabel}>Budget</span>
                                                                <span class={style.tableItemValue}>{numberToCurrencyFormatter(this.props.countryData.data.total_budget, 2)}</span>
                                                            </span>
                                                            <span class={style.tableItem}>
                                                                <span class={style.tableItemLabel}>Expense</span>
                                                                <span class={style.tableItemValue}>{numberToCurrencyFormatter(this.props.countryData.data.total_expense, 2)}</span>
                                                            </span>
                                                            <span class={style.tableItem}>
                                                                <span class={style.tableItemLabel}>Projects</span>
                                                                <span class={style.tableItemValue}>{numberToCommaFormatter(this.props.countryData.data.project_count)}</span>
                                                            </span>
                                                            <span class={style.tableItem}>
                                                                <span class={style.tableItemLabel}>Donors</span>
                                                                <span class={style.tableItemValue}>{numberToCommaFormatter(this.props.countryData.data.donor_count)}</span>
                                                            </span>
                                                        </div>
                                                    </section>
                                                    <section class={this.state.resize ?
                                                        style.maximizedtableContentStyles
                                                        : style.minimizedTableContentStyles}>
                                                        <section class={style.themeWrapper}>
                                                            <div class={style.themeTitleWrapper}>
                                                                <span class={style.themeItemLabel}>{'Our Focus'}</span>
                                                                <span class={style.themeItemValue}>{'% of Budget'}</span>
                                                            </div>
                                                            <div class={style.no_content}>
                                                                {
                                                                    this.props.themesBudget.loading ?
                                                                        <PreLoader />
                                                                        : this.props.themesBudget.data.length > 0 ?
                                                                            <div class={style.donutChartWrapper}>
                                                                                <DonutChart data={this.props.themesBudget.data} chart_id={"donut1"}
                                                                                    chartWidth={456}
                                                                                    chartHeight={456}
                                                                                    legendData={this.props.themesBudget.data}
                                                                                    textWrapperStyle={style.textWrapperStyleHome}
                                                                                    donor_wrapper_styles={style.donutWrapperThemes}
                                                                                    svgIe={style.svgIe}
                                                                                    textFieldStyle={style.textFieldStyle}
                                                                                    displayLegend={'false'}
                                                                                    displayRegularLegend={'false'}
                                                                                    percDiv={style.percDiv}
                                                                                />
                                                                            </div>
                                                                            : <NoDataTemplate />
                                                                }
                                                            </div>
                                                        </section>
                                                        <section class={style.theme_slider_wrapper}>
                                                            <div class={style.theme_slider_title}>
                                                                <span class={style.theme_text}>Top 5 Donors</span>
                                                                <BudgetExpenseLegend />
                                                            </div>
                                                            <div class={style.no_contentMobile}>
                                                                {
                                                                    this.props.budgetSources.loading ?
                                                                        <PreLoader />
                                                                        : this.props.budgetSources.data.length > 0 ?
                                                                            <GroupedbarChart
                                                                                chart_id="budget_sources"
                                                                                width={1250}
                                                                                height={500}
                                                                                min_height={540}
                                                                                slice_limit={5}
                                                                                translate_xaxis={60}
                                                                                translate_yaxis={100}
                                                                                translate_graph={80}
                                                                                data={this.props.budgetSources.data}
                                                                                label={'type_level_3'}
                                                                                tspanSize={'28px'}
                                                                                textSize={'28px'} />
                                                                            : <NoDataTemplate />
                                                                }

                                                            </div>
                                                        </section>
                                                    </section>
                                                </Scrollbars>
                                            </div>
                                        </div>
                                        <div class={style.map}>
                                            <Map
                                                mapId="mobile-map"
                                                mapData={this.props.globalMapData}
                                                resetMap={this.state.resetMap}
                                                regionMap enableTimeline={false}
                                            />
                                        </div>
                                        <div class={style.disclaimer}>
                                            {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={this.state.accordionSelected == "donors" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "donors" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => { this.accordionClick('donors'); }}>
                                <h3 class={style.accordionHead}>DONORS</h3>
                            </div>
                            {
                                this.state.accordionSelected == "donors" && ISCOUNTRY_REGION
                                    ? this.state.showMapMobile ?
                                        <div class={style.mobileMapSection}>
                                            <Map mapData={this.props.donorsMapData}
                                                mapId="mobile-map"
                                                enableTimeline={false}
                                                sector={this.props.donorFilter.themes}
                                                source={this.state.selectedDonor}
                                                noZoom = {true}
                                            />
                                            <button class={style.mapClose} onClick={() => { this.mapcloseClick(); }}></button>
                                            <div class={style.disclaimer}>
                                                {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                                            </div>
                                        </div>
                                        : <div class={style.accordionContent}>
                                            <div class={style.commonIcons}>
                                                <img alt="filter" onClick={() => this.setState({ filterOpened: !this.state.filterOpened })} class={style.filterIcon} src="/assets/icons/filter-mobile.png" />
                                                <div class={style.exportSection}>
                                                    <EmbedSection
                                                        onClickEmbed={this.openEmbedModal}
                                                        showExportModal={() => this.showExportModal()} />
                                                </div>
                                            </div>
                                            <div class={style.scrollWrapper}>
                                                <div class={style.accordioncontentScroll}>
                                                    {
                                                        <div style={this.state.filterOpened ? { display: 'inline-block' } : { display: 'none' }}>
                                                            <FilterCollection
                                                                openEmbedModal={this.openEmbedModal}
                                                                themeSummary={themeList}
                                                                countryList={countryList}
                                                                donorFilter={donorFilter}
                                                                themeFilter={themeFilter}
                                                                countryRegionFilter={this.props.countryRegionFilter}
                                                                sdgList={sdgData}
                                                                data={this.props.data.themes}
                                                                updateDonorFilter={this.props.updateDonorFilter}
                                                                updateThemeFilter={this.props.updateThemeFilter}
                                                                updateCountryRegionFilter={this.props.updateCountryRegionFilter}
                                                                updateSdgFilter={this.props.updateSdgFilter}
                                                                searchCountry={(code) => this.searchCountry(code)}
                                                                tabSelected={this.props.tabSelected}
                                                                fetchSdgListData={this.props.fetchSdgListData}
                                                                fetchThemeSummaryData={this.props.fetchThemeSummaryData}
                                                                fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                baseURL={Api.API_BASE}
                                                            />
                                                        </div>
                                                    }
                                                    <div class={style.sideBar}>
                                                        <SideBar
                                                            themeSummary={themeSummary}
                                                            data={this.state.themeData}
                                                            selectMap={() => this.selectMap()}
                                                            searchCountryListData={(donor) => this.props.searchCountryListData(donor)}
                                                            handleClick={this.handleClick}
                                                            selectThemeSdg={(value, type) => this.selectThemeSdg(value, type)}
                                                            selectDonor={(donorCode) => this.selectDonor(donorCode)}
                                                            tabSelected={this.props.tabSelected}
                                                            budgetSourceSearch={this.props.budgetSourceSearch}
                                                            searchResult={this.props.searchResult}
                                                            updateDonorFilter={this.props.updateDonorFilter}
                                                            fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                            updateSearchDonorsText={this.props.updateSearchDonorsText}
                                                            donorFilter={this.props.donorFilter}
                                                            updateThemeFilter={this.props.updateThemeFilter}
                                                            updateSSThemesFilter={(tab, value) => this.updateSSThemesFilter(tab, value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    : null
                            }

                        </div>
                        <div class={this.state.accordionSelected == "themes" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "themes" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => { this.accordionClick('themes'); }}>
                                <h3 class={style.accordionHead}>OUR FOCUS</h3>
                            </div>
                            {
                                this.state.accordionSelected == "themes" && ISCOUNTRY_REGION
                                    ? this.state.showMapMobile ?
                                        <div class={style.mobileMapSection}>
                                            <Map mapData={this.props.themesMapData}
                                                mapId="mobile-map"
                                                enableTimeline={false}
                                                sector={this.state.selectedTheme}
                                                source={this.props.themeFilter.budgetSources}
                                            />
                                            <button class={style.mapClose} onClick={() => { this.mapcloseClick(); }}></button>
                                            <div class={style.disclaimer}>
                                                {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                                            </div>
                                        </div>
                                        :
                                        <div class={style.accordionContent}>
                                            <div class={style.commonIcons}>
                                                <img alt="filter" onClick={() => this.setState({ filterOpened: !this.state.filterOpened })} class={style.filterIcon} src="/assets/icons/filter-mobile.png" />
                                                <div class={style.exportSection}>
                                                    <EmbedSection
                                                        onClickEmbed={this.openEmbedModal}
                                                        showExportModal={() => this.showExportModal()} />
                                                </div>
                                            </div>
                                            <div class={style.scrollWrapper}>
                                                <Scrollbars>
                                                    <div class={style.accordioncontentScroll}>
                                                        {
                                                            <div style={this.state.filterOpened ? { display: 'inline-block' } : { display: 'none' }}>
                                                                <FilterCollection
                                                                    openEmbedModal={this.openEmbedModal}
                                                                    themeSummary={themeSummary}
                                                                    sdgList={sdgData}
                                                                    countryList={countryList}
                                                                    donorFilter={donorFilter}
                                                                    themeFilter={themeFilter}
                                                                    countryRegionFilter={this.props.countryRegionFilter}
                                                                    data={this.props.data.themes}
                                                                    updateDonorFilter={this.props.updateDonorFilter}
                                                                    updateThemeFilter={this.props.updateThemeFilter}
                                                                    tabSelected={this.props.tabSelected}
                                                                    fetchThemeSummaryData={this.props.fetchThemeSummaryData}
                                                                    fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                    baseURL={Api.API_BASE}
                                                                />
                                                            </div>
                                                        }
                                                        <div class={style.sideBar}>
                                                            <SideBar
                                                                themeSummary={themeSummary}
                                                                data={this.state.themeData}
                                                                selectMap={() => this.selectMap()}
                                                                handleClick={this.handleClick}
                                                                selectThemeSdg={(value, type) => this.selectThemeSdg(value, type)}
                                                                selectDonor={(donorCode) => this.selectDonor(donorCode)}
                                                                tabSelected={this.props.tabSelected}
                                                                budgetSourceSearch={this.props.budgetSourceSearch}
                                                                searchResult={this.props.searchResult}
                                                                updateDonorFilter={this.props.updateDonorFilter}
                                                                fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                updateSearchDonorsText={this.props.updateSearchDonorsText}
                                                                donorFilter={this.props.donorFilter}
                                                                updateThemeFilter={this.props.updateThemeFilter}
                                                                updateSSThemesFilter={(tab, value) => this.updateSSThemesFilter(tab, value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </Scrollbars>
                                            </div>

                                        </div>
                                    : null
                            }
                        </div>
                        <div class={this.props.currentYearSelected >= commonConstants.SIGNATURE_SOLUTION_YEAR ? this.state.accordionSelected == "signature" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem : style.displayNone}>
                            <div class={this.state.accordionSelected == "signature" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={(event) => { this.accordionClick('signature',event); }}>
                                <h3 class={style.accordionHead}>SIGNATURE SOLUTIONS
                                    <span class={style.sdgbuttons} name='info_btn' >
                                        <img alt="Signature Solution disclaimer" src="/assets/icons/Disclimer icon.svg" name='info_btn' />
                                        <span class={style.sdgDisclaimerText} name='info_btn' >
                                            <span class={style.textsdg} name='info_btn' >
                                            Six Signature Solutions offer UNDP’s integrated responses to complex development challenges: poverty, governance, resilience, environment, energy, gender equality. Each Solution will include a mix of policy advice, technical assistance, finance and programmes, tailored to country needs, to accelerate progress towards the Sustainable Development Goals.
                                            </span>
                                        </span>
                                    </span>
                                </h3>
                            </div>
                            {
                                this.state.accordionSelected == "signature" && ISCOUNTRY_REGION
                                    ? this.state.showMapMobile ?
                                        <div class={style.mobileMapSection}>
                                            <Map mapData={this.props.signatureMapData}
                                                mapId="mobile-map"
                                                enableTimeline={false}
                                                sector={this.state.selectedTheme}
                                                source={this.props.themeFilter.budgetSources}
                                            />
                                            <button class={style.mapClose} onClick={() => { this.mapcloseClick(); }}></button>
                                            <div class={style.disclaimer}>
                                                {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                                            </div>
                                        </div>
                                        :
                                        <div class={style.accordionContent}>
                                            <div class={style.commonIcons}>
                                                <img alt="filter" onClick={() => this.setState({ filterOpened: !this.state.filterOpened })} class={style.filterIcon} src="/assets/icons/filter-mobile.png" />
                                                <div class={style.exportSection}>
                                                    <EmbedSection
                                                        onClickEmbed={this.openEmbedModal}
                                                        showExportModal={() => this.showExportModal()} />
                                                </div>
                                            </div>
                                            <div class={style.scrollWrapper}>
                                                <Scrollbars>
                                                    <div class={style.accordioncontentScroll}>
                                                        {
                                                            <div style={this.state.filterOpened ? { display: 'inline-block' } : { display: 'none' }}>
                                                                <FilterCollection
                                                                    openEmbedModal={this.openEmbedModal}
                                                                    themeSummary={themeSummary}
                                                                    sdgList={sdgData}
                                                                    countryList={countryList}
                                                                    donorFilter={donorFilter}
                                                                    themeFilter={themeFilter}
                                                                    countryRegionFilter={this.props.countryRegionFilter}
                                                                    data={this.props.data.themes}
                                                                    updateDonorFilter={this.props.updateDonorFilter}
                                                                    updateThemeFilter={this.props.updateThemeFilter}
                                                                    tabSelected={this.props.tabSelected}
                                                                    fetchSignatureSummaryData={this.props.fetchSignatureSummaryData}
                                                                    fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                    baseURL={Api.API_BASE}
                                                                />
                                                            </div>
                                                        }
                                                        <div class={style.sideBar}>
                                                            <SideBar
                                                                themeSummary={themeSummary}
                                                                data={this.state.themeData}
                                                                selectMap={() => this.selectMap()}
                                                                handleClick={this.handleClick}
                                                                selectThemeSdg={(value, type) => this.selectThemeSdg(value, type)}
                                                                selectDonor={(donorCode) => this.selectDonor(donorCode)}
                                                                tabSelected={this.props.tabSelected}
                                                                budgetSourceSearch={this.props.budgetSourceSearch}
                                                                searchResult={this.props.searchResult}
                                                                updateDonorFilter={this.props.updateDonorFilter}
                                                                fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                updateSearchDonorsText={this.props.updateSearchDonorsText}
                                                                donorFilter={this.props.donorFilter}
                                                                updateThemeFilter={this.props.updateThemeFilter}
                                                                updateSSThemesFilter={(tab, value) => this.updateSSThemesFilter(tab, value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </Scrollbars>
                                            </div>

                                        </div>
                                    : null
                            }
                        </div>
                        <div class={this.state.accordionSelected == "sdg" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "sdg" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={(event) => { this.accordionClick('sdg',event); }}>
                                <h3 class={style.accordionHead}>
                                    SDG
                                    <span class={style.sdgbuttons} name='info_btn' >
                                        <img alt="sdg disclaimer" src="/assets/icons/Disclimer icon.svg" name='info_btn'  />
                                        <span class={style.sdgDisclaimerText} name='info_btn' >
                                            <span class={style.textsdg} name='info_btn' >
                                                UNDP’s SDG data is based on the mapping of project outputs to SDG targets.  Each project output can be mapped to maximum three SDG targets to capture UNDP’s multidimensional approaches to complex development challenges.  Financial figures are divided equally to the mapped SDG targets.
                                            </span>
                                        </span>
                                    </span>
                                </h3>
                            </div>
                            {
                                this.state.accordionSelected == "sdg" && ISCOUNTRY_REGION
                                    ? this.state.showMapMobile ?
                                        <div class={style.mobileMapSection}>
                                            <Map mapData={this.props.sdgMapData}
                                                mapId="mobile-map"
                                                enableTimeline={false}
                                                sdg={this.state.selectedSdg}
                                                source={this.props.sdgFilter.budgetSources}
                                            />
                                            <button class={style.mapClose} onClick={() => { this.mapcloseClick(); }}></button>
                                            <div class={style.disclaimer}>
                                                {'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                                            </div>
                                        </div>
                                        :
                                        <div class={style.accordionContent}>
                                            <div class={style.commonIcons}>
                                                <span class={style.filter}>
                                                    <img alt="filter" onClick={() => this.setState({ filterOpened: !this.state.filterOpened })} class={style.filterIcon} src="/assets/icons/filter-mobile.png" />
                                                </span>
                                                <div class={style.exportSection}>
                                                    <EmbedSection
                                                        onClickEmbed={this.openEmbedModal}
                                                        showExportModal={() => this.showExportModal()} />
                                                </div>
                                            </div>
                                            <span class={style.SDGdisclaimer}>
                                                *Data under the Sustainable Development Goals (SDGs) and Our Focus is based on the Strategic Plan 2014-2017 and corporate-level mapping to the SDGs.  Data will be updated to the Strategic Plan 2018-2021 and country-level SDG mapping from December 2018
                                            </span>
                                            <div class={style.scrollWrapper}>
                                                <Scrollbars>
                                                    <div class={style.accordioncontentScroll}>
                                                        {
                                                            <div style={this.state.filterOpened ? { display: 'inline-block' } : { display: 'none' }}>
                                                                <FilterCollection
                                                                    openEmbedModal={this.openEmbedModal}
                                                                    themeSummary={themeSummary}
                                                                    sdgList={sdgData}
                                                                    countryList={countryList}
                                                                    donorFilter={donorFilter}
                                                                    countryRegionFilter={this.props.countryRegionFilter}
                                                                    themeFilter={themeFilter}
                                                                    data={this.props.data.themes}
                                                                    updateDonorFilter={this.props.updateDonorFilter}
                                                                    updateThemeFilter={this.props.updateThemeFilter}
                                                                    updateSdgFilter={this.props.updateSdgFilter}
                                                                    tabSelected={this.props.tabSelected}
                                                                    fetchSdgListData={this.props.fetchSdgListData}
                                                                    fetchThemeSummaryData={this.props.fetchThemeSummaryData}
                                                                    fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                    baseURL={Api.API_BASE}
                                                                />
                                                            </div>
                                                        }
                                                        <div class={style.sideBar}>
                                                            <SideBar
                                                                themeSummary={themeSummary}
                                                                data={this.state.themeData}
                                                                selectMap={() => this.selectMap()}
                                                                handleClick={this.handleClick}
                                                                selectThemeSdg={(value, type) => this.selectThemeSdg(value, type)}
                                                                selectDonor={(donorCode) => this.selectDonor(donorCode)}
                                                                tabSelected={this.props.tabSelected}
                                                                budgetSourceSearch={this.props.budgetSourceSearch}
                                                                searchResult={this.props.searchResult}
                                                                updateDonorFilter={this.props.updateDonorFilter}
                                                                fetchDonorFundListData={this.props.fetchDonorFundListData}
                                                                updateSearchDonorsText={this.props.updateSearchDonorsText}
                                                                donorFilter={this.props.donorFilter}
                                                                updateThemeFilter={this.props.updateThemeFilter}
                                                                updateSSThemesFilter={(tab, value) => this.updateSSThemesFilter(tab, value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </Scrollbars>
                                            </div>

                                        </div>
                                    : null
                            }
                        </div>
                    </div>
                </div>

                <EmbedModal
                    display={this.state.displayEmbedModal}
                    checkList={this.state.checkList[this.props.tabSelected]}
                    modifiedUrl={this.state.selectionListUrl[this.props.tabSelected] + filterUrl[this.props.tabSelected]}
                    handleClose={this.handleClose}
                    getselectedItem={this.getselectedItem}
                    handleOnSelect={this.handleOnSelect}
                />
            </section>

        );
    }
}
const mapStateToProps = (state) => ({
    lastUpdatedDate: state.lastUpdatedDate,
    sdgTargetSliderData: state.sdgTargetSliderData,
    donorOutputData: state.mapData.donorOutputData
});


export default connect(mapStateToProps)(Tabs);