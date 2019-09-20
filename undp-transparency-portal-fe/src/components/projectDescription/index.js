/************************* Preact Files ************************/
import { h, Component } from 'preact';
import { connect } from 'preact-redux';

/************************* Custom Component Files ************************/
import Map from '../../components/map';
import AreaChartView from '../../components/areaChart';
import ProjectTimeLine from '../../components/project-timeline';
import DownloadModal from '../downloadModal';
import NoDataTemplate from '../../components/no-data-template';
/************************* Third Party  Files ************************/
import Helmet from 'preact-helmet';

/************************* Style Files ************************/
import style from './style';
class ProjectDescription extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isInfo: false,
			expand: false,
			mapType: 'map',
			prevLocation: { location: '', source: '' },
            currentLocation: { location: '', source: '' },
            nextLocation: { location: '', source: '' }
		};
		this.currentLocationIndex = 0;
        this.showNext = false;
        this.showPrev = false;
	}

	openModal= (type) => {
		this.setState({ expand: true, maptype: type });
	}

	closeModal = () => {
        this.setState({ expand: false });
	}
	changeSatelliteSrc(currentLocationIndex){
		this.currentLocationIndex = currentLocationIndex;
		if (this.props.satelliteData && this.props.satelliteData.length){
			if(this.currentLocationIndex === 0){
                this.setState({ prevLocation: { location: '', source: ''} } );
                this.showPrev = false;
            } else{
                this.setState({ prevLocation: this.props.satelliteData[this.currentLocationIndex-1] });
                this.showPrev = true;
            }
			this.setState({ currentLocation: this.props.satelliteData[this.currentLocationIndex] });
			if ( this.props.satelliteData.length > 1 && this.currentLocationIndex !== this.props.satelliteData.length-1) {
                this.setState({ nextLocation: this.props.satelliteData[this.currentLocationIndex+1] });
                this.showNext = true;
            }else{
                this.showNext = false;
            }
		}
    }
	setMapType(type){
		if (type === 'satellite'){
			this.setState( { mapType: 'satellite' } );
			if (this.props.satelliteData && this.props.satelliteData.length){  
				this.setState({ prevLocation: { location: '', source: '' } } );
				this.setState({ currentLocation: this.props.satelliteData[this.currentLocationIndex] });
				if ( this.props.satelliteData.length > 1 ) {
					this.setState({ nextLocation: this.props.satelliteData[this.currentLocationIndex+1] });
					this.showNext = true;
				} else {
					this.showNext = false;
				}
			}
		} else {
			this.setState( { mapType: 'map' } );
		}
	}
	changeIframeSrc = (type) => {
        let source = '';
        switch (type) {
            case 'prev':
                if( this.currentLocationIndex > 0){
                    this.currentLocationIndex--;
                    if(this.props.satelliteData[this.currentLocationIndex-1]){
                        this.setState({ prevLocation: this.props.satelliteData[this.currentLocationIndex-1] });
                        this.showPrev = true;
                    }
                    else{
                        this.setState({ prevLocation: { location: '', source: '' } });
                        this.showPrev = false;
                    }  
                    this.setState({ currentLocation: this.props.satelliteData[this.currentLocationIndex] });
                    this.setState({ nextLocation: this.props.satelliteData[this.currentLocationIndex+1] });
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
                if(this.currentLocationIndex < this.props.satelliteData.length-1){
                    this.setState({prevLocation: this.props.satelliteData[this.currentLocationIndex]});
                    this.currentLocationIndex++;
                    this.setState({currentLocation: this.props.satelliteData[this.currentLocationIndex]});
                    this.setState({nextLocation: this.props.satelliteData[this.currentLocationIndex+1]})
                    source = this.state.currentLocation.source;
                    this.showNext = true;
                    if(this.currentLocationIndex === this.props.satelliteData.length-1){
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
	render(props) {
		let isProjectDetailNonEmpty = Object.keys(this.props.projectDetail.project).length > 0;
		const data = (this.props.mapCountryData.outputData.data) ? (this.props.mapCountryData.outputData.data[0]): [] ;
		
		return (
			<div class={style.container}>

				{
					isProjectDetailNonEmpty &&
					<div>
						<Helmet
							meta={[
								{ name: 'description', content: this.props.projectDetail.project.description },
								{ property: 'og:description', content: this.props.projectDetail.project.description },
								{ property: 'twitter:description', content: this.props.projectDetail.project.description }
							]}
						/>
						<div class={`${style.descriptionSection} col-md-6 col-sm-12 col-xs-12`}>
							<div class={style.description}>
								<p>{this.props.projectDetail.project.description}</p>
								
							</div>
							<div class={style.heading}>
								<p class={style.source}>Implementing Organisation</p>
								<section class={style.mapOptions}>
									<span>{this.props.projectDetail.project.organisation.org_name}</span>
									<section class={style.mapMenu} >
										<button class={this.state.mapType ==='map' ? `${style.mapbuttons} ${style.selected}` :style.mapbuttons} onClick= {()=> this.setMapType('map') }> Map </button>
										{ this.props.satelliteData && this.props.satelliteData.length > 0 ? <button class={this.state.mapType ==='map' ? style.mapbuttons : `${style.mapbuttons} ${style.selected}`} onClick= {()=> this.setMapType('satellite') }> Story Map </button>:null}
										<img class={style.expandButton} src='./../../assets/icons/expand.png'  onClick={() => this.openModal(this.state.mapType)}/>
									</section>
								</section>
							</div>

							<div style={this.state.mapType ==='satellite' && !this.props.satelliteData.length ? {'padding-top': '0px'}: {'padding-top': '20px'}} class={style.projectMap}>
								{
									this.state.mapType ==='map' ? 
										<Map
											clusterMode
											projectId={this.props.projectId}
											mapData={props.projectDetailMapData}
											mapId={'individualProjectMap'}
										/>
									:
									this.props.satelliteData.length ?
										<div class={style.satelliteWrapper}>
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
										<div class={style.satelliteWrapper}>
											<NoDataTemplate/>
										</div>
								}
								
							</div>
							<div class={style.disclaimer}>
							<ul><li> The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the Secretariat of the United Nations or UNDP concerning the legal status of any country, territory, city or area or its authorities, or concerning the delimitation of its frontiers or boundaries.</li><li> References to Kosovo* shall be understood to be in the context of UN Security Council resolution 1244 (1999)</li>
    </ul>
							</div>
						</div>
					</div>
				}

				<div class={'col-md-6 col-sm-12 col-xs-12'} style={{ position: 'static' }}>
				
					<div class={style.projectStatus}>
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
				</div>
				<section >
				{(this.state.expand)? 
					(this.state.mapType !=='map')?
					<DownloadModal onCloseModal={() => this.closeModal()} mapType = {this.state.mapType} satelliteData={this.props.satelliteData} currentLocationIndex={this.currentLocationIndex} changeSource={(index) => this.changeSatelliteSrc(index)}/>
					 	// <DownloadModal onCloseModal={() => this.closeModal()} mapType = {this.state.mapType} projectId={this.props.projectId} projectDetailMapData = {data} />
					:   <DownloadModal onCloseModal={() => this.closeModal()} mapType = {this.state.mapType} projectId={this.props.projectId} projectDetailMapData = {props.projectDetailMapData} />
				:   null
				}
					
				</section>
			</div >
		);
	}
}
const mapStateToProps = (state) => {
	const { projectDetailMapData } = state.mapData;
	const mapCountryData = state.mapData;
	return {
		projectDetail: state.projectDetail,
		projectDetailMapData,
		mapCountryData
	};
};

export default connect(mapStateToProps)(ProjectDescription);
