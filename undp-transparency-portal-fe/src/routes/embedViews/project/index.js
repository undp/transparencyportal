import { h, Component } from 'preact';
import BootTable from '../../../components/bootstraptable'
import Map from '../../../components/map';
import { connect } from 'preact-redux';
import { loadProjectListMapData } from '../../../shared/actions/mapActions/projectListMapData';
import {
    updateYearList,
    setCurrentYear
} from "../../../shared/actions/getYearList";
import style from './style';
// http://localhost:8080/embed/projects?title=false&summary=false&map=false&projectTable=false&country=&sources=&themes=&sdg=



//title=false&summary=false&map=false&projectTable=false&country=&countryLabel=&sources=&sourcesLabel=&themes=&themesLabel=&sdg=&sdgLabel=&year=2018'}width={300}></frame>



// Projects <Budget Source> contributed in <Recipient Country Office / Operating Unit> for <year> under <No Poverty>


class EmbedProjectView extends Component {

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

        this.props.setCurrentYear(this.props.year)

        if (this.props.map === 'true') {
            this.props.loadProjectListMapData(this.props.mapCurrentYear,
                this.props.themes,
                this.props.country,
                this.props.sources,
                this.props.sdg
            )
        }
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
        return (
            <div class={style.container}>
                {
                    this.props.title === 'true' ? <div class={style.titleWrapper}>
                        Projects - {this.props.year}
                    </div> : null
                }

                {
                    this.props.summary === 'true' ?
                        <div class={style.filterTextWrapper}>
                            <div class={style.filterText}>
                                <span class={style.filterHighlight}>
                                    {
                                        `${this.props.sourcesLabel} `
                                    }
                                </span>
                                {`contribution`}
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
                                {
                                    this.props.themesLabel !== '' ?
                                        <span>
                                            {` for `}
                                            <span class={style.filterHighlight}>
                                                {
                                                    `${this.props.themesLabel}`
                                                }
                                            </span>
                                        </span> : ' '
                                }
                                {
                                    this.props.sdgLabel !== '' ?
                                        <span>
                                            {` for `}
                                            <span class={style.filterHighlight}>
                                                {
                                                    `${this.props.sdgLabel}`
                                                }
                                            </span>
                                        </span> : ''
                                }
                                { ' in ' }
                                <span class={style.filterHighlight}>
                                    {
                                        `${this.props.year}`
                                    }
                                </span>
                            </div>
                        </div>

                        : null
                }

                {this.props.map === 'true' ?
                    <div class={style.mapWrapper}>
                        <Map sector={this.props.themes}
                            sdg={this.props.sdg}
                            source={this.props.sources}
                            mapData={this.props.projectListMapData}
                            enableTimeline={false}
                            embed={true}
                        />
                        <div class={style.disclaimer}>
                            {'* The boundaries and names shown and the designations used on this map do not imply official endorsement or acceptance by the United Nations'}
                        </div>
                    </div>
                    : null
                }
                {this.props.projectTable === 'true' ?
                    <div class={style.projectListWrapper}>
                        <BootTable data={projectList}
                            loading={this.props.loading}
                            theme={this.props.themes}
                            unit={this.props.country}
                            keyword={this.state.keyword}
                            source={this.props.source}
                            count={totalDataSize}
                            sdg={this.props.sdg}
                            links={links}
                            embed={true}
                            handleFilterChange={(type, value) => this.handleFilterChange(type, value)}
                        />
                    </div>
                    : null
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
        } = state.projectList


    return {
        router: state.router,
        mapCurrentYear,
        projectListMapData,
        projectList,
        loading

    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onChangeRoute: (url) => dispatch(onChangeRoute(url))
        loadProjectListMapData: (year, sector, unit, source, sdg) => dispatch(loadProjectListMapData(year, sector, unit, source, sdg)),
        setCurrentYear: year => dispatch(setCurrentYear(year)),


    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedProjectView)



