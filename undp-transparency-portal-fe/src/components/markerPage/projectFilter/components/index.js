import { h, Component } from 'preact';
import style from './style';
import DropDown from '../../../filter';
import NestedDropList from '../../../nestedDropList';
import {getAPIBaseUrRl} from '../../../../utils/commonMethods';
export default class ProjectFilter extends Component {


    handleKeyPress = (e) => {
        if (e.keyCode == 13) {
            this.searchFilter('search', this.props.searchAllResult.searchText);
        }
    }

    handleOnCloseFilterElements = (item) => {
        this.props.removeItemFromFilter(item)
    }

    handleCloseSearch = () => {
        // this.setState({ searchText: '' }, () => {
        //     this.searchFilter('search', this.state.searchText);
        // });
        this.props.updateSearchText('')
        this.searchFilter('search', '');
    }



    filterChange = (type, value) => {

        this.props.handleFilterChange(type, value)
    }
    searchFilter = (type, value) => {
        this.props.searchFilterChange(type, value)
    }
    constructor(props) {
        super(props);
        this.state = {
            filterOpened: false,
            searchText: this.props.searchAllResult.searchText
        }

        this.map = {
            country: 'Recipient Country',
            sources: 'Budget Sources',
            year: 'Year'
        }

    }
    render() {
        
        let { searchResult, searchAllResult, filterElements, countries, themeList, yearList, sdgData } = this.props;
        return (
            <div class={style.filterCollection} >
                        <div class={style.wrapper}>
                            <div class={style.filterIconWrapper}>
                                <img alt="filter" class={style.fitlerIcon} onClick={() => this.setState({ filterOpened: !this.state.filterOpened })} src="/assets/icons/filter-mobile.png" />
                            </div>
                            <div class={this.state.filterOpened ? style.filterWrapper : `${style.filterWrapper} ${style.filterHidden}`}>
                                {/* <div class={style.filterWrapper}> */}
                                <NestedDropList
                                    label="Recipient Country / Region"
                                    countryFilter
                                    theme={this.props.theme}
                                    sdg={this.props.sdg}
                                    donor={this.props.source}
                                    year={this.props.currentYear}
                                    handleClick={() =>()=>{}}
                                    handleClickBoth={(label,value) => this.filterChange('country', {value:value,label:label})}

                                    filterClass={style.filters}
                                    labelStyle={style.labelStyle}
                                    dropDownClass={style.dropDownWrapper}
                                    placeHolder="Select"
                                    selectedValue={this.props.unit}
                                    selectedLabel={this.props.unitLabel}
                                    baseURL={getAPIBaseUrRl()}
                                />
                            </div>
                        </div>
                    </div>
        );
    }
}
