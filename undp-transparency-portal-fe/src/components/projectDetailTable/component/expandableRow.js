import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import style from './style';
import { Scrollbars } from 'react-custom-scrollbars';
import { BootstrapTable, TableHeaderColumn, SizePerPageDropDown } from 'react-bootstrap-table';
import {
    numberToDollarFormatter,
    numberToCommaFormatter
} from '../../../utils/numberFormatter';
import { aboutUsInfo } from '../../../assets/json/undpAboutUsData';


class ScrollSection extends Component {
    constructor() {
        super();
        this.state = {
            overflow: false
        }
    }

    renderSubLevels = (data) => {
        let sectionData = data.map((subdata,index)=>{
            if ( typeof (subdata.sublevel) !=='undefined'){
               return( <ul key = {index} class={style.sub_section_container}>
                    <span class={style.sub_header}>{subdata.title}</span>
                    {this.renderSubLevels(subdata.sublevel)}
                </ul>
               )
            } else{
                return (
                    <li class = {style.sub_section} key = {subdata.title+index}>
                        <img src="/assets/icons/bullets.svg" alt="\2022" class={style.bullet} />
                        {subdata.title}
                    </li>
                )
            }  
        })
        return sectionData;
    }

  componentDidMount(){
        if(this['sublevelWrapper'+this.props.index].clientHeight > 145){
            this.setState({overflow:true})
        }
    }


    renderVerticalTrack(props){
        if(this.state.overflow){
            return <section {...props} class={style.track_vertical}/>
        }
        else{
            return <section  {...props}/> 
        }
    }

    render(){
        return (
        <Scrollbars class = {style.sub_level} 
            renderTrackVertical= {props =>this.renderVerticalTrack(props)}
            renderThumbVertical={props => <section {...props} class={style.thumb_vertical}/>}
            renderThumbHorizontal={props => <section {...props} class={style.thumb_horizontal}/>}
        >
            
               <section ref={refs => this['sublevelWrapper'+this.props.index] = refs} > 
                    {this.renderSubLevels(this.props.marker.sublevel)}
                </section> 
        </Scrollbars>)
    }
}


 class ExpandableRow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: undefined
        }
    }
    cellTextItem = (data) => {
        return (
            <div class={style.cellElement}>
                <span class={style.marker}>
                </span>
                <span>
                    {data}
                </span>
            </div>

        )
    }

    budgetSourcesFormatter = (cell) => {
        let dataArray = cell.map((data) => {
            return this.cellTextItem(data)
        })
        return (
            <div>
                {dataArray}
            </div>
        )
    }

    renderbudgetUtilizationYear = (cell, row) => {
        let dataArray = cell.map((data) => {
            return (
                <div class={style.budgetInnerWrapper}>
                    <div class={style.yearColumn}>
                        <span>{data.year}</span>
                    </div>
                </div>
            )
        })
        return (
            <div class={style.budgetUtiWrapper}>
                {dataArray}
            </div>
        )
    }

    renderbudgetUtilizationBudget = (cell, row) => {
        let dataArray = cell.map((data) => {
            return (
                <div class={style.budgetInnerWrapper}>
                    <div class={style.yearColumn}>
                        <div class={style.priceColumn}>{numberToDollarFormatter(data.total_budget)}</div>
                    </div>
                </div>
            )
        })
        return (
            <div class={style.budgetUtiWrapper}>
                {dataArray}
            </div>
        )
    }

    renderbudgetUtilizationExpense = (cell) => {
        let dataArray = cell.map((data) => {
            return (
                <div class={style.budgetInnerWrapper}>
                    <div class={style.yearColumn}>
                        <div class={style.priceColumn}>{numberToDollarFormatter(data.total_expense)}</div>
                    </div>
                </div>
            )
        })
        return (
            <div class={style.budgetUtiWrapper}>
                {dataArray}
            </div>
        )
    }


    renderMarkers = (data) =>{
        return (
            <section class={style.markerSection}>
            {data.map((marker,index)=>{
                let imageSrc = _.find(aboutUsInfo.data,(element) => {
                                    return element.title === marker.title;
                                });
                imageSrc = imageSrc? imageSrc.image_2 : '';     
                return (
                    <section  key={'marker'+index} class={style.parentMarkers} >
                        <section class={style.level}>
                            <section class={style.imageSection}>
                                <img class={style.headerImage} src={imageSrc} />
                            </section>
                            <section class={style.textSection}>
                                <span class={style.marker_header}>
                                    {marker.title}
                                </span>
                            </section>
                        </section>
                        <ScrollSection marker={marker} index = {index}/>
                    </section>
                    ) 
                })}
            </section>
        );
    }

    render({ data }, state) {
        return (
            <div class={style.parent}>
                {this.props.data &&
                    <section class={style.container}>
                        <section class={style.marker_container}>
                            
                            <section class={style.parent_container}>
                                <section class={style.table_container}>
                                    <div class={style.budget_container}>
                                        <div class={style.child_item}>
                                            <div class={style.item_title}>Donors</div>
                                            <div class={style.budgetBackground}>
                                                {this.budgetSourcesFormatter(this.props.data.budget_sources)}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section class={style.table_container}>
                                    <div class={style.card_container}  >
                                        <div class={style.child_item}>
                                            <div class={`${style.item_title} ${style.textCenter}`} >Year</div>
                                                <span>
                                                    {this.renderbudgetUtilizationYear(this.props.data.budget_utilization)}
                                                </span>
                                            </div>
                                        <div class={style.child_item}>
                                            <div class={`${style.item_title} ${style.textCenter}`} >Budget</div>
                                            <span>
                                                {this.renderbudgetUtilizationBudget(this.props.data.budget_utilization)}
                                            </span>
                                        </div>
                                        <div class={style.child_item}>
                                            <div class={`${style.item_title} ${style.textCenter}`} >Expense</div>
                                                <span>
                                                    {this.renderbudgetUtilizationExpense(this.props.data.budget_utilization)}
                                                </span>
                                        </div>
                                    </div>
                                </section>
                                <section class={style.table_container}>
                                    {
                                        this.props.data.sector ? 
                                            <section class={style.subTables}>
                                                <div class={style.budget_container}>
                                                    <div class={style.child_item}>
                                                        <div class={style.item_title}>Our Focus</div>
                                                        <div class={style.budgetBackground}>
                                                            <section class ={style.cellElement}>
                                                                <span> {this.props.data.sector} </span>
                                                            </section>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        :   null 
                                    }
                                    {
                                        this.props.signatureSol ?
                                        <section class={style.subTables}>
                                            <div class={style.budget_container}>
                                                <div class={style.child_item}>
                                                    <div class={style.item_title}>Signature Solutions</div>
                                                    <div class={style.budgetBackground}>
                                                        <section class={style.cellElement}>
                                                            <span > {this.props.signatureSol} </span>
                                                        </section>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    :   null
                                    }
                                    {this.props.data.policy_significance ? 
                                        <div class={style.budget_container}>
                                            <div class={style.child_item}>
                                                <div class={style.item_title}>Policy Marker</div>
                                                <div class={style.budgetBackground}>
                                                    <section class ={style.cellElement}>
                                                        <span class ={style.policyMarker}> {this.props.data.policy_marker} : </span>
                                                        <span> {this.props.data.policy_significance} </span>
                                                    </section>
                                                </div>
                                            </div>
                                        </div>
                                    :   null
                                    }
                                </section>
                            </section>
                            <section class={style.parent_container}>
                                {(this.props.marker.data[this.props.index])?
                                    <div class={style.child}>
                                        {
                                            (this.props.marker.data[this.props.index].length>0)?
                                            <div class={style.item_title}>Our Approaches</div>
                                            :null
                                        }
                                        <div >
                                            {this.renderMarkers(this.props.marker.data[this.props.index])}
                                        </div>
                                    </div>
                                    :null
                                }
                            </section>
                        </section>
                        
                    </section>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        marker: state.markerDetails.output_list_markers
    }
}

export default connect(mapStateToProps)(ExpandableRow);