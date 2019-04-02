import { h, Component } from 'preact';
import Map from '../../../components/map';
import { connect } from 'preact-redux';
import { loadProjectListMapData } from '../../../shared/actions/mapActions/projectListMapData';
import {
    updateYearList,
    setCurrentYear
} from "../../../shared/actions/getYearList";
import style from './style';
import { fetchOurApproachesData } from '../../../components/sscMarker/action/ourApproaches';
import SscMarkerlegend from '../../../components/sscMarkerlegend';
import VerticalFlagList from '../../../components/verticalFlagList';
import { getAPIBaseUrRl } from '../../../utils/commonMethods';
import PreLoader from '../../../components/preLoader';
import NoDataTemplate from '../../../components/no-data-template';
import { fetchMarkerBarChartData } from '../../../components/markerPage/actions/barchartDataFetch';
import GroupedbarChart from '../../../components/grouped-bar-chart';
import BudgetExpenseLegend from '../../../components/budget-expense-legend';
import { fetchMarkerProjectList } from '../../../shared/actions/getProjectList';
import BootTable from '../../../components/bootstraptable';
import { fetchMarkerData } from '../../../components/markerPage/actions';
import { numberToCurrencyFormatter, numberToCommaFormatter } from '../../../utils/numberFormatter';
import { fetchmarkerSubType } from '../../../components/markerPage/actions/markerSubTypes';
import { selectSSCCountry } from '../../../components/sscMarker/action/selectCountry';
import { selectL2Country } from '../../../components/sscMarker/action/selectL2Country';
import { selectSSCMarkerType } from '../../../components/sscMarker/action/selectMarkerType';

// http://localhost:8080/embed/projects?title=false&summary=false&map=false&projectTable=false&country=&sources=&themes=&sdg=



//title=false&summary=false&map=false&projectTable=false&country=&countryLabel=&sources=&sourcesLabel=&themes=&themesLabel=&sdg=&sdgLabel=&year=2018'}width={300}></frame>



// Projects <Budget Source> contributed in <Recipient Country Office / Operating Unit> for <year> under <No Poverty>


class EmbedSSCMarkerView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            projectList: [],
            totalDataSize: 0,
            links: {},
            keyword: this.props.search,
            filterList: [
                {
                    displayLabel: 'Donors',
                    label: this.props.sourcesLabel,
                    text: ''

                },
                {
                    displayLabel: 'Recipient Country / Region',
                    label: this.props.countryLabel,
                    text: ''

                },
                {
                    displayLabel: 'Year',
                    label: this.props.year,
                    text: ''
                },

                {
                    displayLabel: 'Our Focus',
                    label: this.props.themesLabel,
                    text: ''

                },
                {
                    displayLabel: 'Sdg',
                    label: this.props.sdgLabel,
                    text: ''

                },
                {
                    displayLabel: 'Signature Solutions',
                    label: this.props.signatureLabel,
                    text: ''

                }
            ]
        }
		this.sscMarkerId = '3';
		this.currentCountry_iso3 = '';
		this.country = '',
		this.level2CountryIso3 = '',
		this.level2CountryName = '',
		this.markerSubType = '';
    }


    handleFilterChange = (type, value) => {
        if (this.props.projectTable === 'true') {
            if (type === 'search') {
                this.setState({ keyword: value })
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.projectTable === 'true') {
            if (nextProps.projectList != this.props.projectList) {
                let data = nextProps.projectList.data;
                let parseData = (data) => {
                    data.forEach((item) => {
                        item.country_name = item.country;
                        item.probObj = {
                            title: item.title,
                            project_id: item.project_id
                        }
                        item.total_budget = item.budget == null ? 0 : item.budget
                        item.total_expense = item.expense == null ? 0 : item.expense
                    })
                    return data
                }
                this.setState({ projectList: parseData(data), totalDataSize: nextProps.projectList.count, links: nextProps.projectList.links })
            }
        }
    }


    componentWillMount() {

        this.props.setCurrentYear(this.props.year);
        if(this.props.map === 'true')
            this.props.loadProjectListMapData(this.props.mapCurrentYear, '', '', '', '', this.sscMarkerId);
        
    	this.country = '',
    	this.level2CountryIso3 = '',
    	this.level2CountryName = '',
    	this.markerSubType = '';
        
    	if (this.props.country && this.props.country!== '' && this.props.country!== 'all' && this.props.country!== 'undefined' ) {
    		this.props.selectSSCCountry({
    			country_iso3: this.props.country,
		        isSelected: 1
    		});
    		this.country = this.props.country;
    	}

    	if ( this.props.l2Country  && this.props.l2Country !== '' && this.props.l2Country !== 'undefined' ){
    		this.level2CountryName = (this.props.l2CountryName && this.props.l2CountryName !== '' && this.props.l2CountryName!== 'undefined') ? this.props.l2CountryName : '' ;
    		this.level2CountryIso3 = this.props.l2Country;
    		this.props.selectL2Country({
    			country_iso3: this.level2CountryIso3,
    			isSelected: 1,
    			name: this.level2CountryName
    		});
    	}
            
    	if ( this.props.markerSubType && this.props.markerSubType!=='undefined' && this.props.markerSubType!== '' ){
    		this.props.selectSSCMarkerType({ type: parseInt(this.props.markerSubType) });
    		this.markerSubType = this.props.markerSubType;
    	}


    	if (this.props.approaches === 'true'){
    		this.props.fetchOurApproachesData(this.country,this.level2CountryName,this.markerSubType);
    	}

    	if (this.props.donors === 'true' || this.props.recipients === 'true')
    		this.props.fetchMarkerBarChartData(this.props.mapCurrentYear, this.sscMarkerId,this.country,this.markerSubType,this.level2CountryName);
        
    	if (this.props.projectTable === 'true'){
    		this.props.fetchmarkerSubType(this.sscMarkerId, '');
    		this.props.fetchMarkerProjectList(this.props.mapCurrentYear, this.sscMarkerId, '','','', this.country,this.markerSubType,this.level2CountryName);
    	}

    	if (this.props.stats === 'true')
    		this.props.fetchMarkerData(this.props.mapCurrentYear, this.sscMarkerId, this.country,this.markerSubType,this.level2CountryName );
    }

    generateFilteredList = () => {
        return this.state.filterList.map((item) => {
            if (item.label !== '') {
                return (
                    <span class={style.filterLabels}><strong>{item.displayLabel}</strong>: {item.label}
                    </span>
                )
            }
        })
    }

    render({ projectListMapData }, { links, projectList, totalDataSize }) {
        let optionData;
        if (this.props.markerSubtypes.data && this.props.markerSubtypes.data[0]){
            optionData = this.props.markerSubtypes.data.map(element => {
                return {
                    label: element.title,
                    value: element.marker_type
                };
            }) ;
        } else {
            optionData = [];
        }
        return (
            <div class={style.container}>
                {
                    this.props.title === 'true' ? 
                    <div class={style.titleWrapper}>
                        South-South And Triangular Cooperation - {this.props.year}
                    </div> : null
                }
                { this.props.stats === 'true' ?
                    <section>
					{
                        !this.props.aggregate.loading ?
                            Object.keys(this.props.aggregate.data).length ?
                                <div class={style.summaryWrapper}>
                                    {this.state.sscMarkerId ? <div class={style.imgDiv}><img class={style.marker_image} src={this.currentMarker.image_2} alt="ssc" /></div>:null}
                                    <ul class={`${style.list} ${style.ulWithFlag}`}>
                                        <li class={style.listItem}>
                                            <span class={style.value}>{this.props.aggregate.data.budget && numberToCurrencyFormatter(this.props.aggregate.data.budget, 2)}</span>
                                            <span class={style.label}>Budget</span>
                                        </li>
                                        <li class={style.listItem}>
                                            <span class={style.value}>{this.props.aggregate.data.expense && numberToCurrencyFormatter(this.props.aggregate.data.expense, 2)}</span>							
                                            <span class={style.label}>Expense</span>
                                        </li>
                                        <li class={style.listItem}>
                                            <span class={style.value}>{this.props.aggregate.data.projects_count && numberToCommaFormatter(this.props.aggregate.data.projects_count)}</span>
                                            <span class={style.label}>Projects</span>
                                        </li>
                                        <li class={style.listItem}>
                                            <span class={style.value}>{this.props.aggregate.data.budget_sources && numberToCommaFormatter(this.props.aggregate.data.budget_sources)}</span>
                                            <span class={style.label}>Donors</span>
                                        </li>
                                    </ul>
                                </div>
                                :
                                <NoDataTemplate />
                            :
                            <div style={{ position: 'relative', height: 53, marginTop: 10, marginBottom: 10 }}>
                                <PreLoader />
                            </div>
                        }
                    </section>
                : 
                null}
                { this.props.map === 'true' ? 
                    <div class={style.mapWrapper}>
                        <Map sector={this.props.themes}
                            sdg={this.props.sdg}
                            source={this.props.sources}
                            mapData={this.props.projectListMapData}
                            enableTimeline={false}
                            embed={true}
                            isSSCMarker={'true'}
                            selectedMarkerSubtype={this.props.markerSubType}
                        />
                        <SscMarkerlegend />
                    </div>  
                    :
                    null 
                }
                { this.props.approaches === 'true' ?
                    this.props.sscApproachesData
                    && !this.props.sscApproachesData.loading ?
                     this.props.sscApproachesData.data.length ? 
                    <div class={style.flagListWrapper}>
                        <VerticalFlagList apiBase={getAPIBaseUrRl()} data={this.props.sscApproachesData.data} />
                    </div>
                    :
                        <NoDataTemplate />
                    :
                    <div style={{ position: 'relative', height: 120 }}>
						<PreLoader />
                    </div> 
                    :
                    null
                }
                { this.props.donors === 'true' ?
                    <div  class={`${style.chartWrapper} ${style.paddingBottom}`}>
                        <div class={style.top_budget_sources_wrapper}>
                            <span class={style.chartHead}>
                                <span>Top 10 Donors</span>
                                <BudgetExpenseLegend />
                            </span>

                            {
                            !this.props.markerChartData.loading ?
                                <div>
                                    {
                                    this.props.markerChartData.data.budget_sources && this.props.markerChartData.data.budget_sources.length?
                                    <div class={style.budget_sources_wrapper}>
                                        <GroupedbarChart
                                            chart_id="marker_budget_sources"
                                            width={1250}
                                            height={500}
                                            min_height={540}
                                            data={this.props.markerChartData.data.budget_sources}
                                            label={'short_name'}
                                            tspanSize={'12px'}
                                            textSize={'12px'}
                                        />
                                    </div>
                                    :
                                    <NoDataTemplate />
                                    }
                                </div>
                                :
                                <div style={{ position: 'relative', height: 344 }}>
                                    <PreLoader />
                                </div>
                            }
                        </div>
                    </div>
                : null}
                { this.props.recipients === 'true' ? 
                    <div class={style.chartWrapper}>
                        <div class={style.top_budget_sources_wrapper}>
                            <span class={style.chartHead}>
                                <span>Top 10 Recipient Offices</span>
                                <BudgetExpenseLegend />
                            </span>
                            {!this.props.markerChartData.loading ?
                                (this.props.markerChartData.data.top_recipient_offices && this.props.markerChartData.data.top_recipient_offices.length)?
                                    <div class={style.budget_sources_wrapper}>
                                        <GroupedbarChart
                                            chart_id="sdg_profile_top_recipient_offices"
                                            width={1250}
                                            height={500}
                                            min_height={540}
                                            data={this.props.markerChartData.data.top_recipient_offices}
                                            label={'iso3'}
                                            tspanSize={'12px'}
                                            textSize={'12px'}
                                        />
                                    </div>
                                    :
                                    <NoDataTemplate />
                                :
                                <div style={{ position: 'relative', height: 344 }}>
                                    <PreLoader />
                                </div>
                            }
                        </div>
                    </div>
                    : 
                    null
                }
                {this.props.projectTable === 'true' ?
                    this.props.projectList.data.length ?
                        <div class={style.projectListWrapper}>
                            <BootTable data={this.props.projectList.data}
                                handleFilterChange={(type, value) => this.handleFilterChange(type, value)}
                                loading={this.props.loading}
                                getSearchParam={(param) => { this.setState({ searchText: param }); }}
                                theme={this.state.themeSelected}
                                unit={this.state.unitSelected}
                                keyword={this.state.keyword}
                                source={this.state.sourceSelected}
                                count={totalDataSize}
                                links={links}
                                enableMarkerDropDown
                                marker={this.sscMarkerId}
                                optionData={optionData}
                                selectedMarkerSubtype={this.markerSubType}
                                l2country= {this.level2CountryName}
                                country={this.country}
                                isSSCMarker={'true'}
                                embed={true}
                            />
                        </div>
                        :
                        null
                    : 
                    null
                }
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
        } = state.projectList;
    const sscApproachesData = state.sscApproachesData,
        markerChartData = state.markerBarChartData,
        aggregate =state.individualMarkerData,
        markerSubtypes = state.markerSubTypes;


    return {
        router: state.router,
        mapCurrentYear,
        projectListMapData,
        projectList,
        loading,
        sscApproachesData,
        markerChartData,
        aggregate,
        markerSubtypes

    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onChangeRoute: (url) => dispatch(onChangeRoute(url))
        loadProjectListMapData: (year, sector, unit, source, sdg, marker) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg, marker)),
        setCurrentYear: year => dispatch(setCurrentYear(year)),
        fetchOurApproachesData: (country,level2Marker,markerSubType) => dispatch(fetchOurApproachesData(country,level2Marker,markerSubType)),
        selectSSCCountry: data => dispatch(selectSSCCountry(data)),
        selectL2Country: data => dispatch(selectL2Country(data)),
        selectSSCMarkerType: data => dispatch(selectSSCMarkerType(data)),
        fetchMarkerBarChartData: (year, markerId, country,markerSubType,levelTwoMarker) => dispatch(fetchMarkerBarChartData(year, markerId, country,markerSubType,levelTwoMarker)),
        fetchMarkerProjectList: (year, markerId, keyword, limit, offset, country, markerType,level2Marker) => dispatch(fetchMarkerProjectList(year, markerId, keyword, limit, offset, country, markerType,level2Marker)),
        fetchMarkerData: (year, markerType, country,marker_id,level2Marker) => dispatch(fetchMarkerData(year, markerType, country,marker_id,level2Marker)),
        fetchmarkerSubType: (markerId, country) => dispatch(fetchmarkerSubType(markerId, country))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedSSCMarkerView)



