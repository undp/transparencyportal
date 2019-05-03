import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';
import Select from 'react-select';
import Accordion from './component'
import 'react-select/dist/react-select.css';
import { connect } from 'preact-redux';
import NestedList from '../nestedList';
import { searchOperatingUnitsListData, searchResult, updateSearchResult } from './actions'
import { searchCountryRegionsListData, updateSearchText } from '../../shared/actions/countryRegionSearch'
import { Scrollbars } from 'react-custom-scrollbars';
const offSetWidth = 10;//for keeping

class NestedDropDown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedValue: this.props.selectedValue || '',
            labelValue: this.props.selectedLabel || '',
            showSelect: false,
            closeBtnActive: false,
            countryRegionList: [],
            showSelectWidth:0
        }
    }


    componentWillMount() {
        if (this.props.selectedValue !== '' && this.props.selectedValue !== undefined) {
            this.setState({
                closeBtnActive: true
            })
        }
    }

    handleOnInputChange = (e) => {
        if (!this.props.countryFilter)
            this.setState({ inputval: e.target.value }, () => {
                this.props.searchResult(this.state.inputval,"dropList",true)
            })
        else
            this.setState({ inputval: e.target.value }, () => {
                this.props.searchCountryRegionsListData(this.state.inputval,this.props.theme,this.props.sdg,this.props.donor,this.props.year, this.props.markerType, this.props.markerId, this.props.levelTwoMarker)
            })
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.showSelectWidth!=this.dropDownWrapper.offsetWidth){
            this.setState({
                showSelectWidth:this.dropDownWrapper.offsetWidth
            })
        }
    }
    componentWillReceiveProps(nextProps) {
        if(this.props.countryRegionSearch.searchResult != nextProps.countryRegionSearch.searchResult && nextProps.countryRegionSearch.searchText=="") {
            this.setState({countryRegionList: nextProps.countryRegionSearch.searchResult})
        }
        if(this.props.donor!=nextProps.donor ||
            this.props.sdg!=nextProps.sdg ||
            this.props.theme!=nextProps.theme
        ) {
            this.props.searchCountryRegionsListData("",nextProps.theme,nextProps.sdg,nextProps.donor, nextProps.year, nextProps.markerType, nextProps.markerId, nextProps.levelTwoMarker)
        }
        if(this.props.tabSelected!=nextProps.tabSelected && this.props.currentTab==nextProps.tabSelected) {
            this.props.searchCountryRegionsListData("",nextProps.theme,nextProps.sdg,nextProps.donor, nextProps.year, nextProps.markerType, nextProps.markerId, nextProps.levelTwoMarker)
        }
        if(this.props.year!=nextProps.year) {
            this.setState({countryRegionList: []})
        }
        if((nextProps.tabSelected == 'themes' || nextProps.tabSelected =='signature') && 
        nextProps.selectedValue == '')
        {
            this.setState({selectedValue: '', 
            labelValue: '',
            closeBtnActive: false})  
        }
        
        if(nextProps.selectedValue && this.props.selectedValue != nextProps.selectedValue && nextProps.selectedValue!='') {
            this.setState({selectedValue: nextProps.selectedValue, labelValue: nextProps.selectedLabel, showSelect: false, inputval: '', closeBtnActive: true})
        }
    }
    openSelect() {
        this.setState({ showSelect: true });
        
        if(this.props.countryFilter && !this.state.countryRegionList.length || this.props.markerType){
            this.props.searchCountryRegionsListData("",this.props.theme,this.props.sdg,this.props.donor,this.props.year, this.props.markerType, this.props.markerId, this.props.levelTwoMarker)
        }
            
        
        if (!this.state.closeBtnActive) {
            if (!this.props.countryFilter){
                this.setState({
                    inputval:''
                },()=>{
                    this.props.searchResult("", "dropList")
                })
            }else{
                this.props.searchResult("", "dropList")

            }
        }
    }

    renderList = (dataList, loading) => {
        if(this.props.countryFilter) {
            dataList = this.state.inputval==""?this.state.countryRegionList:dataList
        }
        return (
            <div class={style.dropDownlistWrapper} style={{ width: this.dropDownWrapper.offsetWidth - 2}}>
                <div class={style.searchWrapper}>
                    <div style={{ width: this.dropDownWrapper.offsetWidth, textAlign: 'center' }} >
                        <input class={style.searchBar} style={{ width: this.dropDownWrapper.offsetWidth - 40 }} id="mysearch" type="search" placeholder={"Search"} value={this.state.inputval} onInput={(e) => { this.handleOnInputChange(e) }} />
                    </div>
                    <NestedList
                        handleChange={this.handleChange} dataList={dataList}
                        initialLoading={!this.props.countryFilter?this.props.operationUnits.loading:loading}
                        loading={loading}
                        baseURL={this.props.baseURL} 
                        donor = {this.props.donor}/>
                </div>
            </div>
        )
    }

    handleChange = (newValue) => {
        this.setState({ closeBtnActive: true })
        this.props.handleClickBoth && this.props.handleClickBoth(newValue.name, newValue.code, newValue.unit_type)
        if(this.props.handleClick){
            this.props.preserve && this.props.preserve === 'false' ? this.props.handleClick(newValue.name, newValue.code, newValue.unit_type) : this.props.handleClick(newValue.code,this.props.isSSC === 'true' ? newValue.name : '',newValue.unit_type);

        }
        this.setState({ labelValue: newValue.name, selectedValue: newValue, showSelect: false, inputval: '', closeBtnActive: true });
    }

    componentDidMount() {
        this.setState({
            showSelectWidth:this.dropDownWrapper.offsetWidth
        });
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('touchstart', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('touchstart', this.handleClickOutside);
    }

    handleClickOutside = (e) => {
        if (this.state.showSelect && !this.filter.contains(e.target)) {
            this.setState({ showSelect: false });
        }
    }





    // ---------------------------------- preserve false for droplists in Search Page ----------------------------------->>>

    handleClickClose = () => {
        this.setState({
            labelValue: '',
            inputval: '',
            selectedValue: '',
            closeBtnActive: false
        }, () => {
            this.props.handleClickBoth && this.props.handleClickBoth('', '')

            if(this.props.handleClick){
                this.props.preserve && this.props.preserve === 'false' ? this.props.handleClick('', '') : this.props.handleClick('');
            }
        })
    }



    renderIcon = () => {
        if (this.state.closeBtnActive) {
            if (this.props.preserve && this.props.preserve == 'false') {
                return (
                    <div class={style.updownArrow}></div>
                )
            }
            else {
                return (
                    <div class={style.closetab} onClick={() => { this.handleClickClose() }}></div>
                )
            }
        } else {
            return (
                <div class={style.updownArrow}></div>
            )
        }
    }



    render({ currentTab, label, placeHolder, filterClass, dropDownClass, list, labelStyle, options }, state) {
        placeHolder = placeHolder ? placeHolder : 'select'
        const displayLabel = this.state.labelValue == '' ? placeHolder : this.state.labelValue;
        return (
            <div class={this.props.markerType ?`${style.markerPageFilter}` :`${style.filters} ${filterClass}`}>
                {label ? <span class={`${style.labelStyle} ${labelStyle}`} style={labelStyle}>{label}</span>:null}
                <div style={!label ? this.props.marker? { 'padding-top': '10px', 'margin-right': '1rem' }: { 'padding-top': '15px' }:''} class={`${style.dropDownOuterWrapper}`} ref={node => this.filter = node} >
                <div class={this.state.showSelect ? style.dropdownOverlay: null} style={{width:this.state.showSelectWidth}} ></div>
                    <div ref={node => this.dropDownWrapper = node} onClick={() => this.openSelect()} class={`${style.dropDownWrapper} ${dropDownClass} ${this.props.dropRecCountryDownWrapper} ${this.props.dropL2CountryDownWrapper}`} >
                        <span class={`${style.dropDownItem} ${this.props.dropRecCountryDownItem} ${this.props.dropL2CountryDownItem}`}>
                            {
                                this.props.preserve && this.props.preserve == 'false' ? placeHolder : displayLabel
                            }
                        </span>
                        {
                            this.renderIcon()
                        }
                    </div>
                    {
                        this.state.showSelect ?
                        !this.props.countryFilter?
                         this.renderList(this.props.budgetSourceSearch.searchResult, this.props.budgetSourceSearch.searchResultLoading)
                         : this.renderList(this.props.countryRegionSearch.searchResult, this.props.countryRegionSearch.loading)
                         : null

                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const { searchResult, loading: searchResultLoading } = state.countryRegionSearch;
    const {tabSelected} = state.tabData
    const {mapCurrentYear} = state.mapData.yearTimeline
    return {
        router: state.router,
        operationUnits: state.operationUnits,
        budgetSourceSearch: state.budgetSourceSearch,
        countryRegionSearch: state.countryRegionSearch,
        tabSelected,
        mapCurrentYear
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateSearchResult: data => dispatch(updateSearchResult(data)),
        searchResult: (data, key,flag) => dispatch(searchResult(data,key,flag)),
        searchOperatingUnitsListData: data => dispatch(searchOperatingUnitsListData(data)),
        searchCountryRegionsListData: (searchParam, theme, sdg, donor, year, markerType, markerId, levelTwoMarker) => dispatch(searchCountryRegionsListData(searchParam, theme, sdg, donor, year, markerType, markerId, levelTwoMarker))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NestedDropDown)





