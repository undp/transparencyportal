import { h, Component } from 'preact';
import BootTable from '../../../../components/bootstraptable'
import Map from '../../../../components/map';
import Sankey from '../../../../components/sankey';
import PreLoader from '../../../../components/preLoader';
import { connect } from 'preact-redux';
import {
    numberToDollarFormatter,
    numberToCurrencyFormatter,
    numberToCommaFormatter
} from '../../../../utils/numberFormatter';
import { loadProjectListMapData } from '../../../../shared/actions/mapActions/projectListMapData';
import {
    updateYearList,
    setCurrentYear
} from "../../../../shared/actions/getYearList";
import { fetchBudgetFinancialFlow } from '../../../../components/sankey/actions/budgetFinancialFlowActions'
import { fetchExpenseFinancialFlow } from '../../../../components/sankey/actions/expenseFinancialFlowActions'
import { loadGlobalMapData } from '../../../../shared/actions/mapActions/globalMapData';
import { fetchRecipientCountry, fetchGlobalData } from '../../../../shared/actions/countryData';

import style from './_style';

class EmbedHomeRecipientCountry extends Component {

    constructor(props) {
        super(props);
        this.mapFinancialType = {
			budget:'Budget',
			expense:'Expense'
		}

    }

    mapData = () => {
        const array = this.props.globalMapData && this.props.globalMapData.data ? this.props.globalMapData.data : [];
        if (array.length) {
            let data = {
                total_budget: this.props.total_budget,
                total_expense: this.props.total_expense,
                project_count: this.props.project_count,
                donor_count: this.props.donor_count
            }
            return data
        }  else {
            return {}
        }
    }
    componentWillMount() {
        const { year, financialFlowYear, financialFlowType, country, countryLabel } = this.props;
        if (this.props.country === '') {
            this.props.fetchGlobalData(year);
        }
        this.props.loadGlobalMapData(year, country)
        financialFlowType === 'budget' ? this.props.fetchBudgetFinancialFlow(financialFlowYear) : this.props.fetchExpenseFinancialFlow(financialFlowYear)
    }
    render({ year, financialFlowYear, financialFlowType, country, countryData, countryLabel }, state) {
        const tempData = country === '' ? (this.props.countryData.data ? this.props.countryData.data : {}) : this.mapData()

        return (
            <div>
                {
                    this.props.title === 'true' ?
                        <div class={style.titleWrapper}>
                            Recipient Country / Territory / Region
                    </div>
                        : null
                }
                {
                    this.props.summary === 'true' ?
                        <div>
                            <div class={style.filterTextWrapper}>
                                <div class={style.filterText}>
                                    {`Contribution`}
                                    {
                                        this.props.countryLabel != '' ?
                                            <span>
                                                {` to `}
                                                <span class={style.filterHighlight}>
                                                    {
                                                        `${this.props.countryLabel}`
                                                    }
                                                </span>
                                            </span> :
                                            <span class={style.filterHighlight}>
                                                {
                                                    `${this.props.countryLabel}`
                                                }
                                            </span>
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
                {

                    this.props.stats === 'true' ? (
                        this.props.globalMapData.loading || this.props.countryData.loading ? <div class={style.loaderWrapper}><PreLoader /></div> :
                            <div class={style.wrapper}>
                                <ul class={style.list}>
                                    <li>
                                        <span class={style.value}>{tempData.total_budget && numberToCurrencyFormatter(tempData.total_budget, 2)}</span>
                                        <span class={style.label}>Budget</span>
                                    </li>
                                    <li>
                                        <span class={style.value}>{tempData.total_expense && numberToCurrencyFormatter(tempData.total_expense, 2)}</span>
                                        <span class={style.label}>Expense</span>
                                    </li>
                                    <li>
                                        <span class={style.value}>{tempData.project_count && numberToCommaFormatter(tempData.project_count)}</span>
                                        <span class={style.label}>Projects</span>
                                    </li>
                                    <li>
                                        <span class={style.value}>{tempData.donor_count && numberToCommaFormatter(tempData.donor_count)}</span>
                                        <span class={style.label}>Donors</span>
                                    </li>
                                </ul>
                            </div>) : null
                }
                {this.props.map === 'true' ?
                    <div class={style.mapContainer}>
                        <Map mapData={this.props.globalMapData}
                            code={country}
                            yearSelected={year}
                            embedCountryRegion={true}
                            embed={true}
                        />
                        <div class={style.disclaimer}>
                        <ul><li> The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.</li><li> References to Kosovo* shall be understood to be in the context of UN Security Council resolution 1244 (1999)</li>
    </ul>
                        </div>
                    </div>
                    : null}
                { this.props.financialFlow === 'true' ?
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

    const { globalMapData, themesMapData, donorsMapData, sdgMapData } = state.mapData,
        countryData = state.countryData




    return {
        router: state.router,
        mapCurrentYear,
        projectListMapData,
        projectList,
        loading,
        globalMapData,
        countryData

    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadProjectListMapData: (year, sector, unit, source, sdg) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg)),
        setCurrentYear: year => dispatch(setCurrentYear(year)),
        fetchBudgetFinancialFlow: (year) => dispatch(fetchBudgetFinancialFlow(year)),
        fetchExpenseFinancialFlow: (year) => dispatch(fetchExpenseFinancialFlow(year)),
        loadGlobalMapData: (year, unit) => dispatch(loadGlobalMapData(year, unit)),
        fetchGlobalData: (year) => dispatch(fetchGlobalData(year))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedHomeRecipientCountry)



