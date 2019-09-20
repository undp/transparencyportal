import { h, Component } from "preact";
import style from "./style";
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'preact-redux'
import PreLoader from '../preLoader'
import { exportPDFCall, resetExportUrl } from '../../shared/actions/exportPDF'
import { downLoadProjectListCsv } from '../../shared/actions/downLoadCSV'
import { aboutUsInfo } from '../../assets/json/undpAboutUsData';

class ExportPopup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedOption: "pdf"
        }
    }

    componentWillMount() {
       
        if (!this.props.loading) {
            if(this.props.type === 'projectDetails') {
                this.props.data.output_list.map((outputData,index) => {
                    this.props.data.output_list[index].markerNames = outputData.markers.map((element) => {
                        return  _.find(aboutUsInfo.data, (marker) => { return  marker.id === element; }).title ;
                     });
                });
            }
           
           if(this.props.data&&this.props.data.unitSelected === 'Azerbaijan'){
              
            this.props.data.mapData = [];
            this.props.exportPDFCall(this.props.templateType, this.props.data, this.props.usePuppeteer === 'true' ? 1 : 0);
           }
           else{
            this.props.exportPDFCall(this.props.templateType, this.props.data, this.props.usePuppeteer === 'true' ? 1 : 0);
           }
            
        }
    }
    componentDidMount() {
        document.body.style.overflowY = "hidden"
        window.addEventListener("mousedown", this.handleOutsideClick)
        window.addEventListener("touchstart", this.handleOutsideClick) 
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.loading != this.props.loading) {
            if(this.props.type === 'projectDetails') {
                const markerNames = nextProps.data.output_list[0].markers.map((element) => {
                   return  _.find(aboutUsInfo.data, (marker) => { return  marker.id === element; }).title;
                });
                nextProps.data.markerNames = markerNames ;
            }

           
           
            if(!nextProps.loading &&nextProps.data.selected==='Azerbaijan'){
                nextProps.data.mapData = [];
                this.props.exportPDFCall(nextProps.templateType, nextProps.data, nextProps.usePuppeteer === 'true' ? 1 : 0)
            }
            else{
                !nextProps.loading && this.props.exportPDFCall(nextProps.templateType, nextProps.data, nextProps.usePuppeteer === 'true' ? 1 : 0);
            }
        }
    }
    componentWillUnmount() {
        document.body.style.overflowY = "scroll"
        window.removeEventListener("mousedown", this.handleOutsideClick)
        window.removeEventListener("touchstart", this.handleOutsideClick)
    }
    handleOutsideClick = (e) => {
        if (!this.modal.contains(e.target)) {
            this.closeModal()
        }
    }
    handleRadioButton(e) {
        this.setState({ selectedOption: e.target.value })

    }
    export() {
        if(this.state.selectedOption === 'pdf'){
            if (!this.props.loading && !this.props.exportPDF.loading && this.props.exportPDF.downloadUrl) {
                let pdfUrl = this.props.exportPDF.downloadUrl;
                let element = document.createElement('a');
                element.setAttribute('href',`${pdfUrl}`);
                element.setAttribute('download', 'file.pdf');

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            }
        }
        else{
            this.props.downloadCsv && this.props.downloadCsv();
        }   
    }

    closeModal() {
        this.props.resetExportUrl()
        this.props.onCloseModal()
    }
    
    render(props,{selectedOption}) {

        return (
            <div class={style.outerContainer}>
                <div class={style.innerContainer} ref={(node) => this.modal = node}>
                    <div class={style.headerWrapper}>
                        <h3 class={style.resultsHeader}>Export</h3>
                        <span class={style.closeBtn} onClick={() => this.closeModal()} ></span>
                    </div>
                    <section class={style.modalContent}>
                        <section class={`${style.containerColumn} ${style.optionSection}`}>
                            <div class={style.optionList}>
                                <label class={style.optionContainer}>
                                    Printable Format
                                    <input type="radio" checked={this.state.selectedOption == "pdf" ? true : false} value="pdf" name="radio" onChange={(e) => this.handleRadioButton(e)} />
                                    <span class={style.customRadioButton}></span>
                                </label>
                                <label class={style.optionContainer}>
                                    CSV
                                    <input type="radio" value="csv" checked={this.state.selectedOption == "csv" ? true : false} name="radio" onChange={(e) => this.handleRadioButton(e)} />
                                    <span class={style.customRadioButton}></span>
                                </label>
                                <button class={style.exportButton} onClick={() => this.export()}>Export</button>
                            </div>
                        </section>
                        <section class={`${style.containerColumn} ${style.previewSection}`}>
                            {
                                this.state.selectedOption == "pdf" ?
                                    this.props.exportPDF.previewUrl && !this.props.loading && !this.props.exportPDF.loading ?
                                    <div class={style.iframeWrapper}>
                                        <object  data={this.props.exportPDF.previewUrl} width="100%" height="100%" >
                                            Your Browser does not support Embedding PDFs, you can view the document 
    											<a href={this.props.exportPDF.previewUrl} target="_blank" > here </a>
                                        </object>
                                    </div> : <div style={{ height: '100%', position: 'relative' }}><PreLoader /></div>
                                    : <div class={style.noPreviewWrapper}>
                                        <span>No Preview</span>
                                    </div>
                            }
                        </section>
                    </section>
                </div>
            </div >
        )
    }
}

const mapStateToProps = (state) => {
    return {
        exportPDF: state.exportPDF
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        resetExportUrl: () => dispatch(resetExportUrl()),
        exportPDFCall: (template_name, context_data, formatType) => dispatch(exportPDFCall(template_name, context_data,formatType))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportPopup)