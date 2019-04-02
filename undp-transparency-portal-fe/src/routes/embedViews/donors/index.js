import { h, Component } from 'preact';
import Map from '../../../components/map';
import { connect } from 'preact-redux';
import StackedBarChart2 from '../../../components/stackedBarChart2';
import { donorFetchData, donorTypesFetchData, fundStreamsFetchData } from '../../../components/donorsPage/actions';
import NoData from '../../../components/no-data-template'
import style from './style';
import PreLoader from '../../../components/preLoader';
import { numberToCurrencyFormatter, numberToDollarFormatter } from '../../../utils/numberFormatter';

const TAB_OTHER = "Other Resources",
    TAB_REGULAR = "Regular Resources",
    TAB_TOTAL = "";

class EmbedDonorsView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filterObj: {
                year: this.props.year,
                donorType: {
                    value: this.props.donorType,
                    label: ''
                },
                fundType: null,
                fundStream: {
                    value: this.props.fundStream,
                    label: ''
                }
            }
        }
    }

    componentWillMount() {
            this.props.donorFetchData(this.state.filterObj, TAB_TOTAL)

        if (this.props.regular === 'true') {
            this.props.donorFetchData(this.state.filterObj, TAB_REGULAR)
        }
        if (this.props.others === 'true') {
            this.props.donorFetchData(this.state.filterObj, TAB_OTHER)
        }
    }

    render({ donorData }, state) {
      const  { data } = donorData,
            regularPercent = data && data.regular_percentage ? data.regular_percentage : 50,
            otherPercent = data && data.other_percentage ? data.other_percentage : 50,
            totalContributions = data && data.total_contributions ? data.total_contributions : 0,
            regularContribution = data && data.regular_contribution ? data.regular_contribution : 0,
            otherContributions = data && data.other_contributions ? data.other_contributions : 0,

            displayContryDetail = data && data.regular_percentage && data.other_percentage
                && data.regular_percentage != 0 && data.other_percentage != 0,

         totalData = donorData.totalData && donorData.totalData.data && donorData.totalData.data.country ? donorData.totalData.data.country : [],
            regularData = donorData.regularData && donorData.regularData.data && donorData.regularData.data.country ? donorData.regularData.data.country : [],
            otherData = donorData.otherData && donorData.otherData.data && donorData.otherData.data.country ? donorData.otherData.data.country : [],
            year = this.props.year,
            donorTypelabel = this.props.donorTypelabel===''?'':`of donor type ${this.props.donorTypelabel}`,
            fundStreamlabel = this.props.fundStreamlabel ===''?'':`of fund stream ${this.props.fundStreamlabel}`;


        return (
            <div class={style.container}>
                {
                    donorData.totalDataLoading && <PreLoader />
                }
                <div style={displayContryDetail ? { display: 'block' } : { display: 'none' }}>
                    {
                        this.props.title === 'true' ? <div class={style.titleWrapper}>
                            Donors
                </div> : null
                    }
                    {
                        this.props.summary === 'true' ?
                            <div class={style.filterTextWrapper}>
                                <span class={style.filterTitle}>{`Donors for year ${year} ${donorTypelabel} ${fundStreamlabel}`}</span>
                                <div class={style.filterText}>
                                </div>
                            </div>

                            : null

                    }
                    {
                        this.props.stats === 'true' ? <div class={style.detailViewWrapper}>
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
                                        <div class={`${style.barTextLeft} ${style.textLabel}`}> Regular</div>
                                        <div class={`${style.barTextRight} ${style.textLabel}`}>Other</div>
                                    </div>
                                    <span class={style.contributionBar} style={{ width: regularPercent + '%', backgroundColor: '#16537d' }}></span>
                                    <span class={style.contributionBar} style={{ width: otherPercent + '%', backgroundColor: '#52abe9' }}>
                                    </span>
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
                        </div> : null
                    }

                    {
                        this.props.total === 'true' ? <div class={style.chartWrapper}>
                            {
                                donorData.totalDataLoading ? <div class={style.preLoaderWrapper}><PreLoader /></div> :

                                    donorData.totalData.data && donorData.totalData.data && donorData.totalData.data.country && donorData.totalData.data.country.length !== 0 ?
                                        <div>
                                            <p class={style.donorsourceTitle}>total</p>
                                            <StackedBarChart2 data={donorData.totalData.data.country} />
                                        </div>
                                        :
                                        <NoData />
                            }
                        </div> : null
                    }
                    {
                        this.props.regular === 'true' ? <div class={style.chartWrapper}>

                            {
                                donorData.regularDataLoading ? <div class={style.preLoaderWrapper}><PreLoader /></div> :
                                    donorData.regularData.data && donorData.regularData.data && donorData.regularData.data.country && donorData.regularData.data.country.length !== 0 ?
                                        <div>
                                            <p class={style.donorsourceTitle}>regular</p>
                                            <StackedBarChart2 data={donorData.regularData.data.country} />
                                        </div>
                                        :
                                        <NoData />
                            }
                        </div> : null
                    }
                    {
                        this.props.others === 'true' ? <div class={style.chartWrapper}>
                            {
                                donorData.otherDataLoading ? <div class={style.preLoaderWrapper}><PreLoader /></div> :
                                    donorData.otherData.data && donorData.otherData.data && donorData.otherData.data.country && donorData.otherData.data.country.length !== 0 ?
                                        <div>
                                            <p class={style.donorsourceTitle}>others</p>
                                            <StackedBarChart2 data={donorData.otherData.data.country} />
                                        </div>
                                        :
                                        <NoData />
                            }
                        </div> : null
                    }
                </div>
                <div style={displayContryDetail  || donorData.totalDataLoading? { display: 'none' } : { display: 'block' }} >
                    <NoData />
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(EmbedDonorsView)
