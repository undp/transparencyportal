import { h, Component } from 'preact';
import style from './style';
import { BootstrapTable, TableHeaderColumn, SizePerPageDropDown } from 'react-bootstrap-table';
import OutputResults from './component/outputResults';
import ExpandableRow from './component/expandableRow';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'preact-redux';
import NoDataTemplate from '../no-data-template'
import PreLoader from '../preLoader';
import {aboutUsInfo} from '../../assets/json/undpAboutUsData'
import { fetchProjectOutputDetail } from '../../shared/actions/projectDetailActions/outputDetailActions';
import { fetchmarkerDetail } from '../../shared/actions/projectDetailActions/markerDetailsAction';
import { fetchProjectOutputResults } from '../../shared/actions/projectDetailActions/outputResultsActions'
import { outputResults } from '../../assets/json/ourputResults'
import { outputDetailData } from '../../assets/json/outputDetailData'
import ReactGA from 'react-ga';
import Cards from '../nestedCards'




class ProjectOutputTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalState: false,
            resultIndex: undefined,
            modalData: {},
            data: [
                {
                    heading: 'Indicators',
                    sub: [
                        {
                            id: 1,
                            text: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.'
                        }, {
                            id: 2,
                            text: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.'
                        }, {
                            id: 3,
                            text: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.'
                        },
                    ]
                }, {
                    heading: 'Baseline',
                    sub: [
                        {
                            id: 1,
                            text: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.'
                        }, {
                            id: 2,
                            text: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.'
                        }, {
                            id: 3,
                            text: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.'
                        },
                    ]
                }
            ],
            years: [
                {
                    id: 1,
                    year: 2015,
                    active: true
                }, {
                    id: 2,
                    year: 2016,
                    active: false
                },
            ],
            popupFooterContent: [
                {
                    id: 1,
                    heading: 'Target',
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet.'
                }, {
                    id: 2,
                    heading: 'Result',
                    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet.'
                }
            ]
        }
    }
    
    imageFormatter = (cell, row)=>{
        let imgSrc =[];
        if(cell){
            if(typeof(cell[0])==='number'){
                let currentMarker;
                cell.forEach((element)=> {
                    currentMarker= _.find(aboutUsInfo.data,(marker) => {
                        return marker.id === element
                    });
                    imgSrc.push(currentMarker?{ src:currentMarker.image_2,alt:currentMarker.title,type:1 }:{src:'',alt:'',type:1});
                })
            } else if(typeof(cell[0])==='string') {
                cell.forEach((element)=> {
                    imgSrc.push({src:`/assets/icons/${element}.svg`,alt:element,type:2})
                })
            }
        }
        return <section class={style.markerImageSection}>
                    {   
                        imgSrc.map((element)=> {
                        return <img style={{ width: element.type===1?25:40,marginLeft: 10, marginBottom: 20}} src={element.src} alt={element.alt}/>
                    })}
                </section>
      }
      

    onCloseModal = () => {
        this.setState({ modalState: false, resultIndex: undefined })
    }
    onRowClick = (row, cell, rowIndex) => {
        this.props.fetchProjectOutputDetail(row.output_id, rowIndex);
        this.props.fetchmarkerDetail(row.output_id, rowIndex);
    }
    renderViewDetail = (cell, row, enumObject, rowIndex) => {
        return (
            <span className={style.viewDetail} onClick={() => {
                ReactGA.ga('send', 'event', 'Output Results', 'Output ID', row.output_id)
                if (row.has_result) {
                    this.props.fetchProjectOutputResults(row.output_id, rowIndex)
                    if (!this.state.modalState) {
                        this.setState({ modalState: true, resultIndex: rowIndex });
                        // this.setState({ modalState: true, resultIndex:rowIndex, modalData: row.output_results });
                    }
                }

            }}>
                {cell &&
                    <span class={style.view_results}></span>}
            </span>
        )
    }

    renderViewDetailPhone = (cell, row, enumObject, rowIndex) =>{
        ReactGA.ga('send', 'event', 'Output Results', 'Output ID', row.output_id)
        if (row.has_result) {
            this.props.fetchProjectOutputResults(row.output_id, rowIndex)
            if (!this.state.modalState) {
                this.setState({ modalState: true, resultIndex: rowIndex });
                // this.setState({ modalState: true, resultIndex:rowIndex, modalData: row.output_results });
            }
        }

    }



    renderThemeColumn = (cell, row) => {
        return <span>{cell}</span>
    }

    isExpandableRow = (row) => {
        return true
    }

    expandComponent = (row) => {
        if (row.output_detail) {
            return (
                <ExpandableRow data={row.output_detail} index={row.id} signatureSol={row.signature_solution} />
            );
        }
        else return <div class={style.preloaderWrapper}><PreLoader /></div>
    }

    expandComponentStyle = (row, rowIndex, isExpanding) => {
        if (!isExpanding) { //collapsed
            return null
        } else {
            return style.selectedRow
        }
    }

    generateCardList = (dataArray) => {
        if (dataArray.length) {
            return dataArray.map((item,index) => {
                return <Cards
                    data={item}
                    index={index}
                    fetchProjectOutputResults={this.props.fetchProjectOutputResults}
                    fetchProjectOutputDetail={this.props.fetchProjectOutputDetail}
                    fetchmarkerDetail={this.props.fetchmarkerDetail}
                    renderViewDetailPhone={this.renderViewDetailPhone}
                />

            })
        } else {
            return []
        }
    }
    getSDGColumnWidth(){
        if(!this.props.projectDetail.output_list.loading){
            let maxLenItem = _.max(this.props.projectDetail.output_list.data, function(o) {
                 return o.sdg.length; 
            });
            if (maxLenItem.sdg.length >= 3)
                return '15%';
            else if (maxLenItem.sdg.length === 2)
                return '10%';
            else
                return '7%';
        }  
    }
    render({ data }, state) {
        const { data: outputs } = this.props.projectDetail.output_list
        const { loading } = this.props.projectDetail.output_list;
        const options = {
            expandBy: 'column',
            expandBodyClass: this.expandComponentStyle,
            onRowClick: this.onRowClick,
            noDataText: loading ? <div class={style.preloaderWrapper}><PreLoader /></div> : <NoDataTemplate />

        };
        let tableData = loading ? [] : this.props.projectDetail.output_list.data;
        (tableData.length !=0 ) ? tableData = tableData.map((element,index)=> { element.id = index; return  element }):[]

        return (
            <div class={style.projectList}>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" />

                <div class={style.tableOuterWrapper}>
                     
                    <BootstrapTable
                        options={options}
                        
                        expandableRow={(row) => this.isExpandableRow(row)}
                        expandComponent={(row) => this.expandComponent(row)}
                        data={loading ? [] : tableData}
                        striped
                        bordered={true}
                        version='4'
                        headerContainerClass={style.headerContainerClass}
                        headerStyle={{ borderTop: '#337ab7 3px solid', borderBottom: 0, background: '#fffff' }}
                        bodyStyle={{ height: 'auto', background: '#000', marginBottom: 0, paddingRight: 0 }}
                        tableBodyClass={style.tableBodyClass}
                        bodyContainerClass={style.bodyContainerClass}
                    >
                      
                        <TableHeaderColumn width='10%' className={style.idClass} dataField='output_id' isKey={true}>ID</TableHeaderColumn>
                        <TableHeaderColumn width='12%' className={style.outputClass} dataField='title'>Output Title</TableHeaderColumn>
                        <TableHeaderColumn width='30%' className={style.descriptionClass} dataField='description'>Output Description</TableHeaderColumn>
                        <TableHeaderColumn
                            width={this.getSDGColumnWidth()}
                            dataFormat={this.imageFormatter} className={style.policySignificanceClass}
                            dataField='sdg'>SDG</TableHeaderColumn>
                        <TableHeaderColumn width='12%' className={style.policySignificanceClass} dataField="markers"  dataFormat={this.imageFormatter} >Our Approaches</TableHeaderColumn>
                        <TableHeaderColumn
                            width='10%'
                            expandable={false}
                            dataFormat={this.renderViewDetail}
                            className={style.hideClass} dataField='has_result'>Results</TableHeaderColumn>
                    </BootstrapTable>
                </div>

                <div class={style.cardListOuterWrapper}>

                    {
                        this.generateCardList(this.props.projectDetail.output_list.data? this.props.projectDetail.output_list.data:[])
                    }

                </div>


                <div class={style.modalWrapper}>
                    {
                        (this.state.modalState && state.resultIndex >= 0) &&
                        // outputs[state.resultIndex].output_results
                        // && Object.keys(outputs[state.resultIndex].output_results).length > 0) &&
                        <OutputResults onCloseModal={this.onCloseModal} data={outputs[state.resultIndex].output_results} />
                    }
                    {/* <Modal onCloseModal={this.onCloseModal} visible={this.state.modalState}>
                        {this.renderModal()}
                    </Modal> */}
                </div>
            </div>

        );
    }
}
const mapStateToProps = (state) => {
    return {
        projectDetail: state.projectDetail
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchProjectOutputDetail: (output_id, index) => dispatch(fetchProjectOutputDetail(output_id, index)),
        fetchmarkerDetail: (output_id, index) => dispatch(fetchmarkerDetail(output_id, index)),
        fetchProjectOutputResults: (output_id, index) => dispatch(fetchProjectOutputResults(output_id, index))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectOutputTable)