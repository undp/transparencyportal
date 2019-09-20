import { h, Component } from 'preact';
import style from './style';
import { connect } from 'preact-redux'
import { BootstrapTable, TableHeaderColumn, DeleteButton } from 'react-bootstrap-table';
import Modal from '../../components/modal'
import closeIcon from '../../assets/icons/closeIcon.png';
import { fetchDocumentCategories } from '../../shared/actions/commonDataActions'
import DropList from '../../components/dropList';
import DropDown from '../filter';
import PreLoader from '../preLoader'
import NoDataTemplate from '../no-data-template'
import DOC from '../../assets/icons/DOC.png'
import HTML from '../../assets/icons/HTML.png'
import PDF from '../../assets/icons/PDF.png'
import OTHER from '../../assets/icons/Download.png'
import ReactGA from 'react-ga';
import Cards from '../tableCards';
import { getAPIBaseUrRl } from '../../utils/commonMethods';
const DocumentCategoryList = ["Budget", "Reports",]

class ProjectDocumentTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalState: false,
            flag: 0,
            masterData: this.props.data,
            filteredData: this.props.data
        }
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({
                masterData: nextProps.data,
                filteredData: nextProps.data
            })
        }
    }



    componentDidMount() {
        let toolBarBode = document.getElementsByClassName('react-bs-table-tool-bar'),
            rowNode = toolBarBode[0].childNodes[0].style.margin = 0,
            inputNode = document.getElementsByClassName('form-control'),
            inputParentNode = inputNode.length && inputNode[0].parentElement.style.margin ? 0 : 0;
    }

    createCustomToolBar = props => {
        return (
            <div class={style.toolBar}>
                <div class={style.insertBtnWrapper}>
                    {props.components.insertBtn}
                </div>
                <div class={style.searchWrapper}>

                    {props.components.searchPanel}
                </div>
            </div>
        )
    }

    handleSearchClick = (search,event) => {

        this.props.getSearchParam && this.props.getSearchParam(event.target.value) 
        search(this.searchField.value)
    }
    handleListClick = (data) => {
        this.setState({ flag: 1 })
    }
    renderCustomSearchPanel = (props) => {
        return (
            this.props.embed ? null :
                <span class={style.searchWrapper}>
                    <div class={style.searchContainer}>
                        <label for="document" class={style.searchLabel}>{'Search for Documents'}</label>
                        <div class={style.searchItems}>
                            <input
                                class={style.searchField}
                                id="document"
                                placeholder='Enter document name'
                                ref={(node) => this.searchField = node}
                                onKeyUp={(e) =>{

                                    this.handleSearchClick(props.search,e)

                                }

                                }
                            />
                            <span class={style.searchIcon}></span>
                        </div>
                    </div>
                </span>
        )
    }



    //Search for mobile/tablet

    handleSearchPhone = (text) => {
        const searchedText = text.toLowerCase();
        if (searchedText === '') {
            this.setState({ filteredData: this.state.masterData })
        }
        else {
            const filteredData = this.state.masterData.filter((item) => {
                return (item.title.toLowerCase().indexOf(searchedText) !== -1
                    || item.category_name.toLowerCase().indexOf(searchedText) !== -1
                    || item.format.toLowerCase().indexOf(searchedText) !== -1)
            })
            this.setState({ filteredData })
        }
    }

    //Custom Search panel for mobile/tablet

    renderCustomSearchPanelPhone = () => {
       
        return (
            this.props.embed ? null :
            <div>
                <DropDown
                    label="Document Category"
                    filterClass={style.filter}
                    handleClick={(value) => this.props.categorySelect(value.value)}
                    options={this.props.all && this.props.all === 'false' ? this.props.docCategoriesRecProfile : this.props.docCategoriesProDetail}
                    labelStyle={style.labelStyle}
                    placeHolder="Select"
                />
                <span class={style.searchWrapper}>
                    <div class={style.searchContainer}>
                        <span class={style.searchLabel}>{'Search for Documents'}</span>
                        <div class={style.searchItems}>
                            <input
                                class={style.searchField}
                                placeholder='Enter document name'
                                ref={(node) => this.searchField = node}
                                onInput={(e) => this.handleSearchPhone(e.target.value)}
                            />
                            <span class={style.searchIcon}></span>
                        </div>
                    </div>
                </span>
                </div>
        )
    }


    createCustomInsertButton = (onClick) => {
        return (
            this.props.embed ? <span></span> :
                <DropDown
                    label="Document Category"
                    filterClass={style.filter}
                    handleClick={(value) => this.props.categorySelect(value.value)}
                    options={this.props.all && this.props.all === 'false' ? this.props.docCategoriesRecProfile : this.props.docCategoriesProDetail}
                    labelStyle={style.labelStyle}
                    placeHolder="Select"
                />
        )
    }



    renderDocFormat = (cell, row) => {

        var imgSrc = '', isDownloadable, isHTML, isPDF;
        isDownloadable = (cell.indexOf('html') !== -1 || cell.indexOf('pdf') !== -1);
        isHTML = (cell.indexOf('html') !== -1)
        isPDF = (cell.indexOf('pdf') !== -1)
        imgSrc = isHTML ? HTML :
            isPDF ? PDF : OTHER
        return (
            <div class={style.projDocDetail}>
                <a target="_blank"
                    class={style.download_format_row}
                    download={!isDownloadable}
                    href={row.document_url}
                    onclick={() => ReactGA.ga('send', 'event', 'Project Document Download', cell + ' Document', row.document_url)}>
                    <img class={style.download_format} src={imgSrc} alt="download"/>
                </a>
            </div>
        )
    }

    generateCardList = (dataArray) => {
        if (dataArray.length) {
            return dataArray.map((item) => {
                return <Cards
                    data={item}
                    fields={
                        [
                            {
                                title: 'Title',
                                key: 'title',
                                displayTitle: false,
                                renderElement: <div class={style.cardDocTitle}>{item.title}</div>

                            }, {
                                title: 'Document Category',
                                key: 'category_name',
                                displayTitle: true,
                                renderElement:
                                    <div class={style.cardDocCategoryWrapper}>
                                        <div class={style.categoryLabelWrapper}>
                                            <span class={style.label}>Category: </span><span class={style.value}>{item.category_name}</span>
                                        </div>
                                        <div class={style.imageWrapper}>
                                            {
                                                this.renderDocFormat(item.format, item)
                                            }
                                        </div>
                                    </div>
                            }
                        ]
                    }

                />
            })
        }
        else {
            return []
        }
    }


    render({ data }, { filteredData }) {
        const options = {
            insertBtn: this.createCustomInsertButton,
            toolBar: this.createCustomToolBar,
            searchPanel: this.renderCustomSearchPanel,
            noDataText: this.props.loading ? <div class={style.preloaderWrapper}><PreLoader /></div> : <NoDataTemplate />
        };
        return (

            <div class={style.projectList}>
                <link rel="stylesheet" href={getAPIBaseUrRl()+"/assets/css/bootstrap.min.css"}/>
                <div class={style.tableOuterWrapper}>
                    <BootstrapTable
                        ref={refs => this.bootStrapTable = refs}
                        data={this.props.loading ? [] : this.props.data}
                        bordered={true}
                        version='4'
                        headerContainerClass={style.headerContainerClass}
                        headerStyle={{ borderBottom: 0, background: '#fffff' }}
                        bodyStyle={{ height: 'auto', background: '#f4f5fa', marginBottom: 0, paddingRight: 0 }}
                        tableBodyClass={style.tableBodyClass}
                        containerClass={style.containerClass}
                        search
                        options={options}
                        insertRow
                        toolBarClass={style.toolBarStyle}
                    >
                        <TableHeaderColumn hidden={true} isKey={true} dataField='id'>ID</TableHeaderColumn>
                        <TableHeaderColumn width={'40%'} dataField='title'>Document</TableHeaderColumn>
                        <TableHeaderColumn width={'40%'} dataField='category_name'>Document Category</TableHeaderColumn>
                        <TableHeaderColumn width={'20%'}
                            dataFormat={this.renderDocFormat}
                            dataField='format'>Download</TableHeaderColumn>

                    </BootstrapTable>
                </div>

                <div class={style.cardListOuterWrapper}>
                    {
                        <div class={style.customInsertBtnWrapper}>
                            {
                                //  this.createCustomInsertButton()
                            }
                        </div>
                    }
                    {
                        <div>
                            {this.renderCustomSearchPanelPhone()}
                        </div>
                    }
                    {
                        this.props.loading ? <div class={style.preloaderWrapper}><PreLoader /></div> : (
                            filteredData.length ? this.generateCardList(filteredData) : <NoDataTemplate />
                        )

                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { data: documentCategories } = state.documentCategories,
        { data: documentCategoriesAll } = state.documentCategoriesAll,
        docCategoriesProDetail = state.projectDetail.document_list.categoryList,
        docCategoriesRecProfile = state.recipientProfile.documentList.categoryList

    return {
        documentCategories,
        documentCategoriesAll,
        docCategoriesProDetail,
        docCategoriesRecProfile
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchDocumentCategories: () => dispatch(fetchDocumentCategories())
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ProjectDocumentTable)