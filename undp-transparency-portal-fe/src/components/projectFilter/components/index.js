import { h, Component } from 'preact';
import style from './style';
import DropDown from '../../filter'
import NestedDropList from '../../nestedDropList';
import Api from '../../../lib/api'
import CascadedSelect from '../../cascadedSelect'
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
            themes: 'Theme',
            sources: 'Budget Sources',
            year: 'Year',
            sdgs: 'Sdg'
        }

    }
    render() {
        let { searchResult,
            searchAllResult,
            filterElements,
            sectorList,
            countries,
            themeList,
            yearList,
            sdgData,
            cascadedFocusFilter } = this.props;
        return (
            searchResult ? (
                <div class={style.filterCollectionSearchResults} >
                    <div class={style.wrapper}>
                        <div class={style.searchWrapper}>
                            <div class={style.searchContainer}>
                                <span class={style.searchLabel}>{'Search'}</span>
                                <div class={style.searchItems}>
                                    <input type="text" name="search"
                                        class={style.searchField} placeholder="Search"
                                        value={searchAllResult.searchText}
                                        onInput={(e) => {
                                            this.props.updateSearchText(e.target.value)
                                            // this.setState({ searchText: e.target.value }, () => {

                                            // })
                                        }}

                                        onKeyPress={(e) => { this.handleKeyPress(e) }}
                                    />
                                    {
                                        searchAllResult.searchText === '' ? <span class={style.searchIcon}></span> :
                                            <span onClick={() => {
                                                this.handleCloseSearch();
                                            }} class={style.closeIcon}></span>
                                    }
                                </div>
                            </div>
                        </div>
                        {/* <div class={style.filterIconWrapper}> */}
                        <img alt="filter" class={style.searchfitlerIcon} onClick={() => this.setState({ filterOpened: !this.state.filterOpened })} src="/assets/icons/filter-mobile.png" />
                        {/* </div> */}
                        <div class={this.state.filterOpened ? style.filterWrapper : `${style.filterWrapper} ${style.filterHidden}`}>

                            {/* <div class={style.searchWrapper}>
                                <div class={style.searchContainer}>
                                    <span class={style.searchLabel}>{'Search'}</span>
                                    <div class={style.searchItems}>
                                        <input type="text" name="search"
                                            class={style.searchField} placeholder="Search"
                                            value={this.state.searchText}
                                            onInput={(e) => {
                                                this.setState({ searchText: e.target.value }, () => {

                                                })
                                            }}

                                            onKeyPress={(e) => { this.handleKeyPress(e) }}
                                        />
                                        {
                                            this.state.searchText === '' ? <span class={style.searchIcon}></span> :
                                                <span onClick={() => {
                                                    this.handleCloseSearch();
                                                }} class={style.closeIcon}></span>
                                        }
                                    </div>
                                </div>
                            </div> */}
                            {
                                cascadedFocusFilter ?
                                    <CascadedSelect
                                        dropDownClass={style.dropDownWrapperSearch}
                                        filterClass={style.ourFocusFilters}
                                        labelStyle={style.ourFocusLabelStyle}
                                        label="Our Focus"
                                        placeHolder="Select"
                                        sectorFilter={(value) => this.searchFilter('themes', value)} /> 
                                :   null
                            }
                            <NestedDropList
                                label="Recipient Country / Region"
                                handleClick={(label, value) => {
                                    this.searchFilter('country', { label: label, value: value })
                                }}
                                countryFilter
                                filterClass={style.searchFilters}
                                labelStyle={style.labelStyle}
                                dropDownClass={style.dropDownWrapperSearch}
                                placeHolder="Select"
                                preserve={'false'}
                                baseURL={Api.API_BASE}
                            />
                            {/* <DropDown preserve={'false'} dropDownClass={style.dropDownWrapperSearch} filterClass={style.filters} handleClick={(value) => this.searchFilter('country', value)} options={countries} labelStyle={style.labelStyle} label="Recipient Country" placeHolder="Select" /> */}
                            <NestedDropList
                                label="Donors"
                                masterData={true}
                                handleClick={(label, value) => {
                                    this.searchFilter('sources', { label: label, value: value })
                                }}
                                filterClass={style.searchFilters}
                                labelStyle={style.labelStyle}
                                dropDownClass={style.dropDownWrapperSearch}
                                placeHolder="Select"
                                preserve={'false'}
                            />

                            <DropDown
                                preserve={'false'}
                                dropDownClass={style.dropDownWrapperSearch}
                                filterClass={style.searchFilters}
                                handleClick={(value) => this.searchFilter('year', value)}
                                options={yearList.data}
                                labelStyle={style.labelStyle}
                                label="Year"
                                placeHolder="Select" />
                            <DropDown preserve={'false'} dropDownClass={style.dropDownWrapperSearch} listIcons filterClass={style.searchFilters} handleClick={(value) => this.searchFilter('sdgs', value)} options={sdgData.data} labelStyle={style.labelStyle} label="SDG" placeHolder="Select" />
                            {
                                cascadedFocusFilter ?
                                    null
                                :   <DropDown preserve={'false'} dropDownClass={style.dropDownWrapperSearch} filterClass={style.searchFilters} handleClick={(value) => this.searchFilter('themes', value)} options={themeList.themes} labelStyle={style.labelStyle} label="Our Focus" placeHolder="Select" />
                            }
                        </div>
                    </div>



                    <div class={style.filterElements}>
                        {this.props.filterElements.length !== 0 && this.props.filterElements.map((filtEl, index) => {
                            return (
                                <span class={style.countryNames}>{this.map[filtEl.selectedGenre]}: {filtEl.selectedLabel}
                                    <span onClick={() => {
                                        this.handleOnCloseFilterElements(filtEl)
                                    }} class={style.closeBtn}>x</span>
                                </span>
                            )
                        })}
                    </div>
                </div>
            ) : (
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
                                    handleClick={() => () => { }}
                                    handleClickBoth={(label, value) => this.filterChange('country', { value: value, label: label })}

                                    filterClass={style.filters}
                                    labelStyle={style.labelStyle}
                                    dropDownClass={style.dropDownWrapper}
                                    placeHolder="Select"
                                    selectedValue={this.props.unit}
                                    selectedLabel={this.props.unitLabel}
                                    baseURL={Api.API_BASE}
                                />
                                {/* <DropDown dropDownClass={style.dropDownWrapper} filterClass={style.filters} handleClick={(value) => this.filterChange('country', value)} options={countries} labelStyle={style.labelStyle} label="Recipient Country" placeHolder="Select" /> */}
                                <NestedDropList
                                    label="Donors"
                                    handleClick={() => () => { }}
                                    handleClickBoth={(label, value) => this.filterChange('sources', { value: value, label: label })}

                                    filterClass={style.filters}
                                    labelStyle={style.labelStyle}
                                    dropDownClass={style.dropDownWrapper}
                                    placeHolder="Select"
                                />
                                {/* <DropDown filterClass={style.filters} clearValue={()=>this.handleClear('sources')} handleClick={(value)=>this.filterChange('sources',value)} labelStyle={style.labelStyle} label="Budget Source" placeHolder="Select" /> */}
                                {
                                    (!this.props.sdg && this.props.sdg!==0) || this.props.sdg === '' ? <DropDown key={'theme'} dropDownClass={style.dropDownWrapper} filterClass={style.filters} handleClick={(value) => this.filterChange('themes', value)} options={themeList.themes} loading={themeList.loading} labelStyle={style.labelStyle} label="Our Focus" placeHolder="Select" />
                                        : null
                                }
                                {
                                    (!this.props.theme && this.props.theme!==0) || this.props.theme === '' ? <DropDown key={'sdg'} dropDownClass={style.dropDownWrapper} filterClass={style.filters} listIcons handleClick={(value) => this.filterChange('sdg', value)} options={sdgData.data} loading={sdgData.loading} labelStyle={style.labelStyle} label="SDG" placeHolder="Select" />
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                )
        );
    }
}
