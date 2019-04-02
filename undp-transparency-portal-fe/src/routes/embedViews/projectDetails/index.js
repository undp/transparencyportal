import { h, Component } from 'preact';
import { connect } from 'preact-redux';
import { projectDetail } from '../../../assets/json/projectDetail';
import ProjectDescription from '../../../components/projectDescription';
import BudgetSource from '../../../components/budgetSource';
import ProjectDetailTable from '../../../components/projectDetailTable';
import PictureGallery from '../../../components/PictureGallery';
import PreLoader from '../../../components/preLoader';
import NoDataTemplate from '../../../components/no-data-template';
import ProjectDetailDocTable from '../../../components/projectDetailDocuTable';
import PurchaseOrderTable from '../../../components/purchaseOrderTable';
import { projectDetailOutputResult } from '../../../assets/json/projectDetailOutPutResults';
import { purchaseOrderData } from '../../../assets/json/projectDetailPurchaseOrderData';
import { projectDetailDocData } from '../../../assets/json/projectDetailDocuments';
import EmbedSection from '../../../components/EmbedSection';
import { fetchProjectDetailsOnSelection, clearProjectDetails } from '../../../../src/shared/actions/projectDetailActions';
import { loadOutputsMapData } from '../../../../src/shared/actions/mapActions/fetchMapOutputs';
import { updateProjectDocumentList } from '../../../../src/shared/actions/projectDetailActions/documentListActions';
import { swapDocumentList } from '../../../../src/shared/actions/projectDetailActions/documentListActions';
import { setPageHeader } from '../../../components/urlBreadCrumb/data/actions';
import { onChangeRoute } from '../../../shared/actions/routerActions';
import { renderCustomMetaData } from '../../../utils/commonActionUtils';
import AreaChartView from '../../../components/areaChart';
import ProjectTimeLine from '../../../components/project-timeline';
import Map from '../../../components/map'


import style from './style';

class EmbedProjectDetailsView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isInfo: false,
			prevLocation: { location: '', source: '' },
            currentLocation: { location: '', source: '' },
            nextLocation: { location: '', source: '' }
		}
		this.currentLocationIndex = 0;
        this.showNext = false;
		this.showPrev = false;
		this.isSetStoryMap = false;
	}

	componentWillMount() {
		this.props.fetchProjectDetailsOnSelection(this.props.id);
		this.props.loadOutputsMapData(this.props.currentYear, '', '', '', this.props.id, '');
	}

	selectCategory = (category) => {
		category == '' ?
			this.props.swapDocumentList()
			: this.props.updateProjectDocumentList(this.props.id, category);
	}



	onInfoLegendToggle = () => {
		this.setState({
			isInfo: !this.state.isInfo
		})
	}
	changeIframeSrc = (type) => {
        let source = '';
        switch (type) {
            case 'prev':
                if( this.currentLocationIndex > 0){
                    this.currentLocationIndex--;
                    if(this.props.projectDetail.project.storyMap[this.currentLocationIndex-1]){
                        this.setState({ prevLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex-1] });
                        this.showPrev = true;
                    }
                    else{
                        this.setState({ prevLocation: { location: '', source: '' } });
                        this.showPrev = false;
                    }  
                    this.setState({ currentLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex] });
                    this.setState({ nextLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex+1] });
                    source = this.state.currentLocation.source;
                }
                else{
                    this.setState({ prevLocation: { location: '', source: ''} });
                    this.showPrev = false;
                }
                if(this.state.nextLocation.source)
                    this.showNext = true;
                else
                    this.showNext = false; 
                
            break;
            case 'next':
                if(this.currentLocationIndex < this.props.projectDetail.project.storyMap.length-1){
                    this.setState({prevLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex]});
                    this.currentLocationIndex++;
                    this.setState({currentLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex]});
                    this.setState({nextLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex+1]})
                    source = this.state.currentLocation.source;
                    this.showNext = true;
                    if(this.currentLocationIndex === this.props.projectDetail.project.storyMap.length-1){
                        this.setState({nextLocation: { location: '', source: ''}});
                        this.showNext = false;
                    } 
                }else{
                    this.setState({nextLocation: { location: '', source: ''}});
                    this.showNext = false;
                }            
                if(this.state.prevLocation.source)
                    this.showPrev = true;
                else
                    this.showPrev = false;
            break;
        }
    }
	changeSatelliteSrc(currentLocationIndex){
		this.currentLocationIndex = currentLocationIndex;
		if (this.props.projectDetail.project.storyMap && this.props.projectDetail.project.storyMap.length){
			if(this.currentLocationIndex === 0){
                this.setState({ prevLocation: { location: '', source: ''} } );
                this.showPrev = false;
            } else{
                this.setState({ prevLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex-1] });
                this.showPrev = true;
            }
			this.setState({ currentLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex] });
			if ( this.props.projectDetail.project.storyMap.length > 1 && this.currentLocationIndex !== this.props.projectDetail.project.storyMap.length-1) {
                this.setState({ nextLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex+1] });
                this.showNext = true;
            }else{
                this.showNext = false;
            }
		}
    }
	render() {
		
		const org_name =  	this.props.projectDetail.project &&
							this.props.projectDetail.project.organisation &&
							this.props.projectDetail.project.organisation.org_name ?
							this.props.projectDetail.project.organisation.org_name :
							''
		const satelliteData = this.props.satellite === 'true' && this.props.projectDetail.project &&
							this.props.projectDetail.project.storyMap ?
							this.props.projectDetail.project.storyMap :
							[];
		
		if(this.props.satellite === 'true' && satelliteData.length && !this.isSetStoryMap){
			this.setState({ prevLocation: { location: '', source: '' } } );
			this.setState({ currentLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex] });
			if ( this.props.projectDetail.project.storyMap.length > 1 ) {
				this.setState({ nextLocation: this.props.projectDetail.project.storyMap[this.currentLocationIndex+1] });
				this.showNext = true;
			} else {
				this.showNext = false;
			}
			this.isSetStoryMap = true;	
		}
		
		return (
			<div class={style.container}>
				{
					this.props.title === 'true' ? <div class={style.titleWrapper}>
						{this.props.projectDetail.project.title}
					</div>
						: null

				}
				{
					this.props.description === 'true' ? <div class={style.filterTextWrapper}>
						<div class={style.filterText}>
							{
								this.props.projectDetail.project.description
							}
						</div>
					</div> : null
				}

				{
					this.props.map === 'true' ? <div class={style.projectMap}>
						<Map 
							clusterMode
							projectId={this.props.id}
							mapData={this.props.projectDetailMapData}
							embed={true}
						/>
						<div class={style.disclaimer}>
                    		{'* The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.'}
                    	</div>
					</div> : null
				}
				{
					this.props.satellite === 'true' ? 
						<div class={style.satelliteWrapper}>
							 {this.props.projectDetail.loading ? <PreLoader/> : 
							 satelliteData.length ?
							 <div>
								<iframe id="satelliteIframe" src={this.state.currentLocation.source} class={style.satellite}  />
								<div class={style.satellite_btn_container}>
									<span style={!this.showPrev ? 'opacity:0':''} class={`${style.locationText} ${style.leftBtn}`}>
										<div onClick= {()=> this.changeIframeSrc('prev') } className={style.accordion__arrow__left}></div>
										<span style={!this.showPrev ? 'display:none':'display:inline-block'} class={style.buttonMode} onClick= {()=> this.changeIframeSrc('prev') }>Previous: {this.state.prevLocation.location}</span>
									</span>
									<span class={`${style.locationText} ${style.centerBtn}`}>{this.state.currentLocation.location}</span>
									<span style={!this.showNext ? 'opacity:0':''} class={`${style.locationText} ${style.rightBtn}` }><span style={!this.showNext ? 'display:none':'display:inline-block'} class={style.buttonMode} onClick= {()=> this.changeIframeSrc('next') } >Next: {this.state.nextLocation.location}</span></span><div onClick= {()=> this.changeIframeSrc('next') } style={!this.showNext ? 'opacity:0':''} className={style.accordion__arrow__right}></div>
								</div>
							</div>
							:
							<NoDataTemplate/>
							 }
						</div>
					: null 
				}
				{
					this.props.projectinfo === 'true' ?
					<div  class={style.projectstatusWrapper}>
						<div class={style.heading}>
                    		<p class={style.source}>Implementing Organisation</p>
							<p>{org_name}</p>
                    	</div>
						<ProjectTimeLine data={this.props.projectDetail.time_line} />
						<div className={style.arealChart}>
							<div className={style.areaHeaderWrapper}>
								<div className={style.titleWrapper}>
									<span>Budget Utilisation</span>
								</div>
								<div className={style.legendWrapper}>

									<div className={style.legendItemOuterWrapper}>

										<div className={style.legendItemInnerWrapper}>
											<div className={style.itemAlignmentWrapper}>
												<span class={`${style.legend} ${style.budgetLegend} `} />
												<span>Budget</span>
											</div>
										</div>
										<div className={style.legendItemInnerWrapper}>
											<div className={style.itemAlignmentWrapper}>
												<span class={`${style.legend} ${style.revenueLegend} `} />
												<span>Expense</span>
											</div>

										</div>
									</div>
								</div>
							</div>
							<AreaChartView />
						</div>
						</div>
					: null
				}
				{
					this.props.budgetSources === 'true' ?
						<div class={style.budgetSourceWrapper}>
							<BudgetSource data={this.props.projectDetail.budget_source} embed={true} />
						</div>
						: null
				}

				{
					this.props.outputTable === 'true' ?
						<div>
							<div class={style.table_title}>
								{'OUTPUTS / RESULTS'}
							</div>
							<ProjectDetailTable data={projectDetailOutputResult}
								loading={this.props.projectDetail.output_list.loading}
								embed={true}
							/>
						</div> : null
				}

				{
					this.props.docTable === 'true' ?
						<div>
							<div class={style.table_title}>
								{'DOCUMENTS'}
							</div>
							<ProjectDetailDocTable
								loading={this.props.projectDetail.document_list_filtered.loading}
								embed
								categorySelect={(value) => this.selectCategory(value)}
								data={this.props.projectDetail && this.props.projectDetail.document_list_filtered && this.props.projectDetail.document_list_filtered.data
									? this.props.projectDetail.document_list_filtered.data : []} />
						</div> : null
				}

				{
					this.props.purchaseOrdrTable === 'true' ?
						<div>
							<div class={style.table_title}>{'PURCHASE ORDERS'}
							</div><PurchaseOrderTable
								loading={this.props.projectDetail.purchase_orders.loading}
								data={this.props.projectDetail &&
									this.props.projectDetail.purchase_orders && this.props.projectDetail.purchase_orders.data
									? this.props.projectDetail.purchase_orders.data : []} /> </div>
						: null
				}

			</div>
		)
	}
}

const mapStateToProps = (state) => {
	const { projectDetailMapData } = state.mapData,
	currentYear = state.yearList.currentYear;
	
	return {
		router: state.router,
		projectDetail: state.projectDetail,
		projectDetailMapData,
		currentYear
	}

}

const mapDispatchToProps = (dispatch) => {
	return {
		setPageHeader: data => dispatch(setPageHeader(data)),
		fetchProjectDetailsOnSelection: (id) => dispatch(fetchProjectDetailsOnSelection(id)),
		clearProjectDetails: () => dispatch(clearProjectDetails()),
		updateProjectDocumentList: (id, category) => dispatch(updateProjectDocumentList(id, category)),
		swapDocumentList: () => dispatch(swapDocumentList()),
		onChangeRoute: (title) => dispatch(onChangeRoute(title)),
		loadOutputsMapData: (year, unit, sector, source, project_id, budget_type) => dispatch(loadOutputsMapData(year, unit, sector, source, project_id, budget_type)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedProjectDetailsView)
