import { h, Component} from 'preact';
import { connect } from 'preact-redux';
import style from './style';
import { Scrollbars } from 'react-custom-scrollbars';
import viewDetailsIcon from '../../assets/icons/View_Results_Icon.png'
import {aboutUsInfo} from '../../assets/json/undpAboutUsData'
import {
    numberToDollarFormatter,
} from '../../utils/numberFormatter'


class Card extends Component {

    constructor(props) {
        super(props);
        this.state = {
            genderState: false
        }
    }

    handleLessDetailsClick = () => {
        this.setState({
            genderState: !this.state.genderState
        }, () => {
            this.props.fetchProjectOutputDetail(this.props.data.output_id,this.props.index);
            this.props.fetchmarkerDetail(this.props.data.output_id,this.props.index);
        })
    }

    handleViewResultsClick = () =>{
        this.props.renderViewDetailPhone(this.props.data.has_result,this.props.data,null,this.props.index)
    }



    generateBudgetSourcesList = (data) => {
        if (data.length) {
            return data.map((item) => {
                return <li>{item}</li>
            })
        }
    }

    renderSubMarkers = (data) =>{
        let sectionData = data.map((subdata,index)=>{
            if ( typeof (subdata.sublevel) !=='undefined'){
               return( <ul key = {index} >
                    <li class={style.subheader}>{subdata.title}</li>
                    {this.renderSubMarkers(subdata.sublevel)}
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
        return (sectionData);
    }

    renderMarkers = (data) =>{
        let sectionData = data.map((subdata,index) => {
        let imageSrc = _.find(aboutUsInfo.data,(element) => {
            return subdata.title === element.title;
        });
        imageSrc = imageSrc ? imageSrc.image_2 : '';
            return (<ul key={index}>
                        <img src={imageSrc} style={{ width: 20, verticalAlign: 'top' }} />
                        <span  class={style.header}>{subdata.title}</span>
                        {this.renderSubMarkers(subdata.sublevel)}
                    </ul>);
        });
        return (<section>{sectionData}</section>);
    }

    generateTable = (data) => {
        return data.map((element) => {
            return (
                <tr>
                    <td>{element.year}</td>
                    <td>{numberToDollarFormatter(element.total_budget)}{}</td>
                    <td>{numberToDollarFormatter(element.total_expense)}</td>
                </tr>
            )
        })
    }


    render({ data, fields }, { genderState }) {
        return (
            <div class={style.container}>
                <div class={style.innerContainer}>
                 <div class={style.cardDetails}>
                    <div class={`${style.title}`}>{data.title}</div>
                </div>
                <div class={`${style.cardDetails}`}>
                    <div  class={`${style.projectId}`}>{`# ${data.output_id}`}</div>
                </div>
                <div class={style.cardDetails}>
                    <section style={{ marginTop: 20,marginBottom: 15 }} >
                        <span><b>SDGs: </b></span>
                        <span class={style.sdgData}>
                        {
                            data.sdg?
                                <span class={style.value}>{
                                    data.sdg.map((element) => {
                                    return <img style={{ width: 35, marginRight: 5 }} src={`/assets/icons/${element}.svg`} alt={element} />
                                    })
                                }</span>
                            :   null
                        }
                        </span>
                    </section>
                </div>
                <div class={style.cardDetails}>
                    <div>{data.description}</div>
                </div>

                <div class={style.cardDetails}>
                    <span><b>Markers: </b></span><span class={style.value}>{
                        data.markers.map((element) => {
                        let currentMarker= _.find(aboutUsInfo.data,(marker) => {
                            return marker.id === element;
                        });
                        return <img style={{ width: 35, marginRight: 5 }} src={currentMarker.img} />
                    })}</span>
                </div>

                <div class={style.cardDetails}>
                    <div class={style.resultsWrapper}>
                        <div class={style.results}>

                        {
                            this.props.data.has_result?  <div class={style.view_results}
                            onClick={()=>{
                                this.handleViewResultsClick()
                            }}
                            ></div>:null
                        }

                        </div>
                        <div onClick={() => { this.handleLessDetailsClick() }} class={style.lessDetails}>
                            <div class={ !genderState?`${style.moreDetailImage}`:` ${style.lessDetailImage} `} ></div>
                            <span class={style.lessDetailsText}>{genderState?'LESS DETAILS':'MORE DETAILS'}</span>
                        </div>
                    </div>
                </div>
                </div>



                <div class={style.genderEquality} style={genderState ? { display: 'block' } : { display: 'none' }}>
                    <div class={style.budgetSources}>
                        <div class={style.budgetSourcesHeading}>Donors</div>
                        <ul >
                            {
                                this.generateBudgetSourcesList(data.output_detail ? (data.output_detail.budget_sources ? data.output_detail.budget_sources : []) : [])

                            }
                        </ul>
                        <table class={style.budgetTable}>
                            <tr>
                                <th>Year</th>
                                <th>Budget</th>
                                <th>Expense</th>
                            </tr>
                            {
                                this.generateTable(data.output_detail ? (data.output_detail.budget_utilization ? data.output_detail.budget_utilization : []) : [])
                            }
                        </table>
                        {
                            data.sector ? 
                                <section>
                                    <section class={style.budgetSourcesHeading}> Our Focus</section>
                                    
                                    <section class = {style.policyMarkerSection}> 
                                        <span class ={style.policyMarker}> {data.sector}</span>
                                    </section>
                                </section>
                                
                            : null
                            
                        }

                        {
                            data.signature_solution ? 
                                <section>
                                    <section class={style.budgetSourcesHeading}> Signature Solutions</section>
                                    
                                    <section class = {style.policyMarkerSection}> 
                                        <span class ={style.policyMarker}> {data.signature_solution}</span>
                                    </section>
                                </section>
                                
                            : null
                            
                        }

                        {
                            data.policy_significance ? 
                                <section>
                                    <section class={style.budgetSourcesHeading}> Policy Marker</section>
                                    
                                    <section class = {style.policyMarkerSection}> 
                                        <span class ={style.policyMarker}> <span class={style.policyMarkerHeading}>{data.output_detail?data.output_detail.policy_marker : null}</span> : {data.output_detail? data.output_detail.policy_significance:null}</span>
                                    </section>
                                </section>
                                
                            : null
                            
                        }
                        {
                        (this.props.marker.data)?
                        <section>
                            <section class={style.budgetSourcesHeading}>Our Approaches</section>
                            <section>{this.renderMarkers(this.props.marker.data)}</section>
                        </section>
                        :null
                        }
                       
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        marker: state.markerDetails
    }
}

export default connect(mapStateToProps)(Card);