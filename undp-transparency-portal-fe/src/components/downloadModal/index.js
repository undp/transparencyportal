import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';
import { Scrollbars } from 'react-custom-scrollbars';
import Api from '../../lib/api'
import ReactGA from 'react-ga';
import Map from '../map/index';
import NoDataTemplate from '../no-data-template';

export default class DownloadModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prevLocation: { location: '', source: '' },
            currentLocation: { location: '', source: '' },
            nextLocation: { location: '', source: '' }
        };
        this.currentLocationIndex = props.currentLocationIndex;
        this.showNext = false;
        this.showPrev = false;
    }
    componentDidMount() {
        
        document.body.style.overflowY = "hidden"
        window.addEventListener("mousedown", this.handleOutsideClick);
        window.addEventListener("touchstart", this.handleOutsideClick);
        if(this.props.mapType === 'satellite' && this.props.satelliteData && this.props.satelliteData.length){  
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
            document.getElementById('satelliteIframe').src = this.props.satelliteData[this.currentLocationIndex].source;  
        }  
    }
    componentWillUnmount() {
        document.body.style.overflowY = "scroll";
        window.removeEventListener("mousedown", this.handleOutsideClick);
        window.removeEventListener("touchstart", this.handleOutsideClick);
    }
    handleOutsideClick = (e) => {
        if (!this.modal.contains(e.target)) {
            //this.props.onCloseModal()
        }
    }
    changeIframeSrc = (type) => {
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
                }
                else{
                    this.setState( { prevLocation: { location: '', source: '' } });
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
                    this.setState({nextLocation: this.props.satelliteData[this.currentLocationIndex+1]});
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
    changeSatelliteSrc(){
        this.props.changeSource(this.currentLocationIndex);
        this.props.onCloseModal();
    }
    render() {  
        return (
            <div class={style.outerContainer}>
              {
                  this.props.mapType ? 
                    this.props.mapType ==='map' ?
                    <section class={style.mapSection} ref={(node) => this.modal = node}>
                        <span class={style.closeBtn2} onClick={this.props.onCloseModal} ></span>
                        <Map
							clusterMode
						    projectId={this.props.projectId}
                            mapData={this.props.projectDetailMapData}
                            mapModal
                            mapId='map-zoom'
						/>
                    </section>  
                    :
                    this.props.satelliteData.length ? 
                    <section class={style.satelliteSection}>
                        <span class={style.closeBtn2} onClick={() => this.changeSatelliteSrc()}  ></span>
                        <iframe id="satelliteIframe" src={this.state.currentLocation.source} class={style.satellite} 
                        ref={(node) => this.modal = node} />
                        <div class={style.satellite_btn_container}>
                            <span style={!this.showPrev ? 'opacity:0':''} class={`${style.locationText} ${style.leftBtn}`}>
                                <div onClick= {()=> this.changeIframeSrc('prev') } className={style.accordion__arrow__left}></div>
                                <span style={!this.showPrev ? 'display:none':'display:inline-block'} class={style.buttonMode} onClick= {()=> this.changeIframeSrc('prev') }>Previous: {this.state.prevLocation.location}</span>
                            </span>
                            <span class={`${style.locationText} ${style.centerBtn}`}>{this.state.currentLocation.location}</span>
                            <span style={!this.showNext ? 'opacity:0':''} class={`${style.locationText} ${style.rightBtn}` }><span style={!this.showNext ? 'display:none':'display:inline-block'} class={style.buttonMode} onClick= {()=> this.changeIframeSrc('next') } >Next: {this.state.nextLocation.location}</span></span><div onClick= {()=> this.changeIframeSrc('next') } style={!this.showNext ? 'opacity:0':''} className={style.accordion__arrow__right}></div>
                        </div>
                    </section>     
                    : 
                    <section class={style.satelliteSection}>
                        <span class={style.closeBtn2} onClick={() => this.changeSatelliteSrc()}  ></span>
                        <NoDataTemplate/>  
                    </section>    
                  :
                  <div class={style.innerContainer} ref={(node) => this.modal = node}>
                  <div class={style.headerWrapper}>
                      <h3 class={style.resultsHeader}>Download project data</h3>
                      <span class={style.closeBtn} onClick={this.props.onCloseModal} ></span>
                  </div>
                  <section class={style.modalContent}>
                      <Scrollbars>
                          <span class={style.description}>
                              The data used on this site is free to use under the Creative Commons Attribution 3.0 IGO License (CC-BY 3.0 IGO) and available in the following formats.
                      </span>
                          <article class={style.detailsWrapper}>
                              <h4 class={style.subHeading}>JSON</h4>
                              <ul class={style.urlList}>
                                  <li>
                                      <span class={style.urlTitle}>Individual Project Data:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/projects/{project - id}.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Project Summaries:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/project_summary_{year}.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Operating Unit Data:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/units/{operating - unit}.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Operating Unit Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/units/operating-unit-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Sublocation Location Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/sub-location-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Region Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/region-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Donor Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/donor-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Donor by Country Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/donor-country-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Focus Area Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/focus-area-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Aid Classification Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/crs-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>SDG Index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/sdg-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Individual Output Data:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/outputs/{output - id}.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>SDG Target index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/target-index/{sdg - id}.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Signature solution index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/signature-solutions-index.json`}</span>
                                  </li>
                                  <li>
                                      <span class={style.urlTitle}>Our Approaches index:&nbsp;</span>
                                      <span class={style.urlContent}>{`${Api.API_BASE}/api/our-approaches-index.json`}</span>
                                  </li>

                              </ul>
                          </article>
                          <article class={style.detailsWrapper}>
                              <h4 class={style.subHeading}>Comma Separated Values</h4>
                              <a target="_blank"
                                  download
                                  href={`${Api.API_BASE}/api/download/undp-project-data.zip`}
                                  onclick={() => ReactGA.ga('send', 'event', 'Zip folder Downloads', 'Date - Time', Date())}>
                                  undp-project-data.zip</a>
                          </article>
                          <article class={style.detailsWrapper}>
                              <h4 class={style.subHeading}>IATI XML</h4>
                              <span>
                                  Latest data in IATI Data format is available at </span>
                              <a target="_blank"
                                      onclick={() => ReactGA.ga('send',
                                          'event',
                                          'External Links',
                                          'http://www.iatiregistry.org/publisher/undp',
                                          'http://www.iatiregistry.org/publisher/undp')}
                                      href="http://www.iatiregistry.org/publisher/undp">{'http://www.iatiregistry.org/publisher/undp'}</a>
                          </article>
                      </Scrollbars>
                  </section>
              </div>
              }
                
            </div>
        )
    }
}