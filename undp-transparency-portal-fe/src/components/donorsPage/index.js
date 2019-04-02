import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';
import DropDown from '../../components/filter';
import PreLoader from '../preLoader';
import { numberToCurrencyFormatter, numberToDollarFormatter } from '../../utils/numberFormatter';
import StackedBarChart2 from '../../components/stackedBarChart2';
import { connect } from 'preact-redux'
import { donorFetchData, donorTypesFetchData, fundStreamsFetchData } from './actions';
import EmbedModal from '../../components/embedModal';

import NoData from '../no-data-template'

const TAB_OTHER = "Other Resources",
TAB_REGULAR = "Regular Resources",
TAB_TOTAL = "";

//Other Resources

class DonorsPage extends Component {
constructor(props) {
    super(props);
    this.map = {
        donorType: 'Donor Type',
        fundStream: 'Fund Stream'
    }

    this.state = {
        showtooltip: '',
		tooltipData: '',
		tooltipPosition:[0, 0],
        filterObj: {
            year: this.props.yearList.list[0],
            donorType: {
                value: '',
                label: ""
            },
            fundType: "",
            fundStream: {
                value: '',
                label: ""
            }
        },
        fundStream: {
            value: '',
            label: ""
        },
        total: {

        },
        regular: {

        },
        others: {

        },
        currentTab: "total",
        tabSelected: "",
        accordionSelected: '',
        selectionListUrl: window.location.origin + '/embed/donors?',
        baseUrl: window.location.origin + '/embed/donors?',
        checkList: [
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
                label: 'Total',
                key: 'total'
            },
            {
                flag: false,
                label: 'Regular',
                key: 'regular'
            },
            {
                flag: false,
                label: 'Others',
                key: 'others'
            },

        ],
        displayEmbedModal: false
    }
    this.initialChecklist = {
        title: true,
        summary: true,
        stats:true,
        total: true,
        regular: false,
        others: false
    }
}

/// ------------------------------------- >>>>>>>>> Embed Modal ------------------ >>>>>>>>>>>>
onSelectType = (type, value) => {

    if (type == 'fundStream') {
        this.setState({
            fundStream: {
                ...this.state.fundStream,
                value: value.value ? value.value : "",
                label: value.label ? value.label : ""
            }
        })
    }
    this.setState({
        filterObj: {
            ... this.state.filterObj,
            [type]: {
                ...this.state.filterObj[type],
                value: value.value ? value.value : "",
                label: value.label ? value.label : ""
            }
        }
    }, () => {
        this.props.getFilteObjectValue && this.props.getFilteObjectValue(this.state.filterObj);
        
        this.props.donorFetchData(this.state.filterObj, this.state.tabSelected)
    })
}

createCheckList = (callbk) => {
    let newUrl = this.state.baseUrl
    this.state.checkList.forEach((item, index) => {
        if (index == 0) {
            newUrl = newUrl + item.key + "=" + item.flag
        } else {
            newUrl = newUrl + "&" + item.key + "=" + item.flag
        }
    })
    this.setState({
        selectionListUrl: newUrl
    }, () => {

        if (callbk !== undefined) {
            callbk();
        }
    })
}

handleOnSelect = (e, data) => {
    let selectedList = this.state.checkList.map((item) => {
        return item.key == data.key ? {
            flag: e.target.checked,
            label: item.label,
            key: item.key
        } : item
    })
    this.setState({
        checkList: selectedList
    }, () => {
        this.createCheckList();
    })
}

clearSelect = () => {
    let clearedList = this.state.checkList.map((item) => {
        return {
            flag: this.initialChecklist[item.key],
            label: item.label,
            key: item.key
        }
    });

    this.setState({
        checkList: clearedList
    })
}

handleClose = () => {
    this.props.handleClose(this.clearSelect);
}

/// -------------------------------- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

componentWillReceiveProps(nextProps) {
    if (this.props.yearList.currentYear !== nextProps.yearList.currentYear) {
        this.setState({
            filterObj: {
                ...this.state.filterObj,
                year: nextProps.yearList.currentYear
            }
        }, () => {
            this.props.donorFetchData(this.state.filterObj, this.state.tabSelected)
        })
    }
}

componentWillUnmount() {
    document.body.className = '';
}

accordionClick = (accordion) => {
    if (this.state.accordionSelected == accordion) {
        document.body.className = '';
        this.setState({ accordionSelected: '' })
    }
    else {
        document.body.className = style.accordionScroll;
        this.setState({ accordionSelected: accordion })
        this.tabClick(accordion)
    }
}

tabClick = (tab) => {
    this.setState({
        tabSelected: tab,
        filterObj: {
            ...this.state.filterObj,
            fundType: tab,
            fundStream: {
                ...this.state.fundStream,
                value: tab !== TAB_OTHER ? "" : this.state.fundStream.value,
                label: tab !== TAB_OTHER ? "" : this.state.fundStream.label
            }
        }
    }, () => {
        this.props.getDataTabClick && this.props.getDataTabClick(this.state.filterObj);
        this.props.donorFetchData(this.state.filterObj, this.state.tabSelected)
    });
}

tooltipHover = (e, data) =>  {
    let widthOfDevice = window.outerWidth;
    let x = e.clientX;
    let y = e.clientY
    if(x + 220 > widthOfDevice) {
        x = widthOfDevice - 245
    }
	this.setState({ showtooltip: true, tooltipData:data, tooltipPosition:[x, y] });
}

tooltipOut = (data) =>  {
	this.setState({ showtooltip: false });
}

componentWillMount() {
    this.props.donorTypesFetchData();
    this.props.fundStreamsFetchData();
    this.props.donorFetchData(this.state.filterObj, this.state.tabSelected)
}
render(props, { tabSelected, filterObj }) {
    const filterUrl = `&year=${filterObj.year}&donorType=${filterObj.donorType.value}&donorTypelabel=${filterObj.donorType.label}&fundType=${filterObj.fundType}&fundStream=${filterObj.fundStream.value}&fundStreamlabel=${filterObj.fundStream.label}`

    const { donorData } = props,
        { data } = donorData;

    const regularPercent = data && data.regular_percentage ? data.regular_percentage : 50,
        otherPercent = data && data.other_percentage ? data.other_percentage : 50,
        totalContributions = data && data.total_contributions ? data.total_contributions : 0,
        regularContribution = data && data.regular_contribution ? data.regular_contribution : 0,
        otherContributions = data && data.other_contributions ? data.other_contributions : 0,
        regularTooltip = 'voluntary, non-earmarked contributions',
        otherTooltip = 'Contributions earmarked for specific programmes, projects, or thematic areas',
        displayContryDetail = data && data.regular_percentage && data.other_percentage
            && data.regular_percentage != 0 && data.other_percentage != 0;

    var flag = data != undefined &&
        data.contributions != undefined &&
        data.contributions.length > 0;
    return (
        <div>
            {
                donorData.loading && <PreLoader />
            }
            <div style={displayContryDetail ? { display: 'block' } : { display: 'none' }}>
                <div class={style.detailViewWrapper}>
                    <div class={style.detailView}>
                        <div class={style.statsWrapper}>
                            <span class={style.stats}>
                                Total Contribution:
                                    <span>
                                    {numberToDollarFormatter(totalContributions)}
                                </span>
                            </span>
                        </div>
                        <div class={style.contributionBarWrapper}>
                            <div class={style.barTextWrapper}>
                                <div class={`${style.tooltipContainer} ${style.barTextLeft}`}>
                                    <div class={style.textLabel}> 
                                    Regular
                                    </div>
                                    <span class={`${style.tooltipDonors} ${style.regularTooltip}`}>voluntary, non-earmarked contributions</span>
                                </div>
                                <div  class={`${style.tooltipContainer} ${style.barTextRight}`}>
                                    <div class={style.textLabel}>
                                    Other
                                    </div>
                                    <span class={`${style.tooltipDonors} ${style.otherTooltip}`}>Contributions earmarked for specific programmes, projects, or thematic areas</span>
                                </div>
                            </div>
                            <div class={style.barContainer}>
                                <span 
                                class={`${style.contributionBar} ${style.leftTooltip}`}
                                style={{ width: regularPercent + '%', backgroundColor: '#16537d' }}
                                onMouseOver={(e)=> this.tooltipHover(e, regularTooltip)}
                                onMouseOut={()=> this.tooltipOut()}
                                >
                                </span>
                                <span 
                                class={`${style.contributionBar} ${style.rightTooltip}`}
                                style={{ width: otherPercent + '%', backgroundColor: '#52abe9' }}
                                onMouseOver={(e)=> this.tooltipHover(e, otherTooltip)}
                                onMouseOut={()=> this.tooltipOut()}
                                ></span>
                                <span 
                                class={this.state.showtooltip ? style.totalOther: style.noTooltip}
                                style={{top: `${this.state.tooltipPosition[1]}px`, left: `${this.state.tooltipPosition[0]}px`}}
                                >
                                    {this.state.tooltipData}
                                </span>
                            </div>
                            <div class={style.barTextWrapper}>
                                <div class={style.barTextLeft}>
                                
                                    {numberToCurrencyFormatter(regularContribution, 2)}
                                </div>

                                <div class={style.barTextRight}>
                                    {numberToCurrencyFormatter(otherContributions, 2)}
                                </div>
                            </div>
                            <div class={style.barTextWrapper}>
                                <div class={`${style.barTextLeft} ${style.textPerc}`}>
                                    ({regularPercent}%)
                                    </div>
                                <div class={`${style.barTextRight} ${style.textPerc}`}>
                                    ({otherPercent}%)
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class={style.dropdowndonorWrapper}>

                    <div class={style.dropdowndonorInnerWrapper}>
                        <div class={style.donorType}>
                            <DropDown
                                label="Donor Type"
                                filterClass={style.filter}
                                labelStyle={{ display: 'block', marginLeft: 0, marginBottom: 5, color: '#2d2d2d', fontWeight: 400 }}
                                dropDownClass={style.donorTypeDropdown}
                                options={this.props.donorTypes.data}
                                handleClick={(value) => { this.onSelectType('donorType', value) }}
                                placeHolder="Select" />
                        </div>
                        <div
                            class={tabSelected === TAB_OTHER ? `${style.fundCategory}` : `${style.displayNone}`}
                        >
                            <DropDown
                                label="Fund Category"
                                filterClass={style.filter}
                                labelStyle={{ display: 'block', marginLeft: 15, marginBottom: 5, color: '#2d2d2d' }}
                                dropDownClass={style.dropdown}
                                options={this.props.fundStreams.data}
                                handleClick={(value) => { this.onSelectType('fundStream', value) }}
                                placeHolder="Select" />
                        </div>
                    </div>
                </div>
                <div class={style.wrapper}>
                    <div class={style.desktop}>
                        <div class={style.btnListWrapper}>
                            <ul class={style.btnList}>
                                <li>
                                    <button class={tabSelected == "" && style.active} onClick={() => this.tabClick(TAB_TOTAL)}>Total</button>
                                </li>
                                <li class={`${style.tooltipContainer} ${style.tabTooltip}`}>
                                    <button class={tabSelected == TAB_REGULAR && style.active} onClick={() => this.tabClick(TAB_REGULAR)}>Regular</button>
                                    <span class={`${style.tooltipDonors} ${style.tabTooltip}`}>voluntary, non-earmarked contributions</span>
                                </li>
                                <li class={`${style.tooltipContainer} `}>
                                    <button class={tabSelected == TAB_OTHER && style.active} onClick={() => this.tabClick(TAB_OTHER)}>Other</button>
                                    <span class={`${style.tooltipDonors} ${style.tabTooltip}`}>Contributions earmarked for specific programmes, projects, or thematic areas</span>
                                </li>
                            </ul>
                        </div>
                        <section class={style.chartWrapper}>
                            { 
                                donorData.data && donorData.data.data && donorData.data.data.country && donorData.data.data.country.length !== 0 && donorData.data.data.key ?
                                    <StackedBarChart2 data={donorData.data.data.country} donors={'true'} />
                                    :
                                    <NoData />
                            }
                        </section>
                        <div class={style.disclaimer}>
                            {'*Funding from financial institutions/development banks shown here only include direct contributions to UNDP, and excludes indirect contributions through government financing funded from financial institution/development bank loans or grants'}
                        </div>

                    </div>
                    <div class={style.mobile}>
                        <div class={style.accordion}>
                            <div class={style.accordionItem}>
                                <div class={this.state.accordionSelected == "" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => this.accordionClick(TAB_TOTAL)}>
                                    <h3 class={style.accordionHead}>Total</h3>
                                </div>
                                <div class={style.accordionContent} >
                                    {
                                        this.state.accordionSelected == ""
                                            ?
                                            <section class={style.chartWrapper}>
                                                {
                                                    donorData.data && donorData.data.data && donorData.data.data.country && donorData.data.data.country.length !== 0 && donorData.data.data.key ?
                                                        <StackedBarChart2 data={donorData.data.data.country} donors={'true'}/>
                                                        :
                                                        <NoData />
                                                }
                                            </section>
                                            : null
                                    }
                                </div>
                            </div>
                            <div class={style.accordionItem}>
                                <div class={this.state.accordionSelected == TAB_REGULAR ? `${style.accordionTitle} ${style.accordionSelected} ${style.tooltipContainer}` : `${style.accordionTitle} ${style.tooltipContainer}`} onClick={() => this.accordionClick(TAB_REGULAR)} >
                                    <h3 class={style.accordionHead}>Regular</h3>
                                    <span class={`${style.tooltipDonors} ${style.tabTooltip}`}>voluntary, non-earmarked contributions</span>
                                </div>
                                <div class={style.accordionContent} >
                                    {
                                        this.state.accordionSelected == TAB_REGULAR
                                            ?
                                            <section class={style.chartWrapper}>
                                                {
                                                    donorData.data && donorData.data.data && donorData.data.data.country && donorData.data.data.country.length !== 0 && donorData.data.data.key ?
                                                        <StackedBarChart2 data={donorData.data.data.country} />
                                                        :
                                                        <NoData />
                                                }
                                            </section>
                                            : null
                                    }
                                </div>
                            </div>
                            <div class={style.accordionItem}>
                                <div class={this.state.accordionSelected == TAB_OTHER ? `${style.accordionTitle} ${style.accordionSelected} ${style.tooltipContainer}` : `${style.accordionTitle} ${style.tooltipContainer}`} onClick={() => this.accordionClick(TAB_OTHER)}>
                                    <h3 class={style.accordionHead}>Others</h3>
                                    <span class={`${style.tooltipDonors} ${style.tabTooltip}`}>Contributions earmarked for specific programmes, projects, or thematic areas</span>
                                </div>
                                <div class={style.accordionContent} >
                                    {
                                        this.state.accordionSelected == TAB_OTHER
                                            ?
                                            <section class={style.chartWrapper}>
                                                {
                                                    donorData.data && donorData.data.data && donorData.data.data.country && donorData.data.data.country.length !== 0 && donorData.data.data.key ?
                                                        <StackedBarChart2 data={donorData.data.data.country} />
                                                        :
                                                        <NoData />
                                                }
                                            </section>
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={displayContryDetail || donorData.loading ? { display: 'none' } : { display: 'block' }} >
                <NoData />
            </div>
            <EmbedModal
                display={this.props.displayEmbedModal}
                checkList={this.state.checkList}
                modifiedUrl={this.state.selectionListUrl+filterUrl}
                handleClose={this.handleClose}
                getselectedItem={this.getselectedItem}
                handleOnSelect={this.handleOnSelect}
            />
        </div>
    )
}
}

const mapStateToProps = (state) => {
return {
    donorData: state.donorData,
    donorTypes: state.donorTypes,
    fundStreams: state.fundStreams,

}
}

const mapDispatchToProps = (dispatch) => {
return {
    donorFetchData: (data, tabSelected) => dispatch(donorFetchData(data, tabSelected)),
    onSwitchTab: data => dispatch(onSwitchTab(data)),
    donorTypesFetchData: () => dispatch(donorTypesFetchData()),
    fundStreamsFetchData: () => dispatch(fundStreamsFetchData())
}
}


export default connect(mapStateToProps, mapDispatchToProps,null, { withRef: true })(DonorsPage)


