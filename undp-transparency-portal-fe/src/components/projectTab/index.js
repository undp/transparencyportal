import { h, Component } from 'preact';
import style from './style';
import ProjectDetailDocTable from '../../components/projectDetailDocuTable';
import PurchaseOrderTable from '../../components/purchaseOrderTable';
import { projectDetailOutputResult } from '../../assets/json/projectDetailOutPutResults'
import { purchaseOrderData } from '../../assets/json/projectDetailPurchaseOrderData';
import { projectDetailDocData } from '../../assets/json/projectDetailDocuments';
import ProjectDetailTable from '../../components/projectDetailTable'
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'preact-redux';
class ProjectTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabSelected: 'Output/Results',
            accordionSelected: '',
            document_list: []
        }
    }
    componentWillReceiveProps = (nextProps) => {
        if (nextProps.projectDetail.document_list != this.props.projectDetail.document_list) {
            this.setState({
                document_list: nextProps.projectDetail.document_list.data
            }, () => {

            });
        }
    }
    tabClick = (tab) => {
        this.setState({ tabSelected: tab }, () => {
            this.props.onCurrentTabSelected(tab);
        })
    }
    componentWillUnmount() {
        document.body.className = '';
    }
    accordionClick = (accordion) => {
        if (this.state.accordionSelected == accordion) {
            document.body.className = '';
            this.setState({ accordionSelected: '' })
        }
        else {
            document.body.className = style.accordionScroll;
            this.setState({ accordionSelected: accordion })
            this.tabClick(accordion)
        }
    }
    render() {
        return (
            <div>
                <div class={style.desktop}>
                    <div class={style.tabSwitch}>
                        <ul class={style.list}>
                            <li>
                                <button class={this.state.tabSelected == "Output/Results" && style.active} onClick={(e) => this.tabClick('Output/Results')}>OUTPUTS / RESULTS</button>
                            </li>
                            <li>
                                <button class={this.state.tabSelected == "Documents" && style.active} onClick={(e) => this.tabClick('Documents')}>DOCUMENTS</button>
                            </li>
                            <li class={style.POWrapper}>
                                <button class={this.state.tabSelected == "Purchase Order" && style.active} onClick={(e) => this.tabClick('Purchase Order')}>PURCHASE ORDERS</button>
                                <span class={style.tooltipPO}>
                                    A single Purchase Order (PO) can be issued to purchase goods or services for one or more projects. For those POs, the amount displayed is for one project only. 
                                    Thus, there may be entries for less than USD 15,000, even though the total amount of that particular PO is actually more than USD 15,000. 
                                    The balance amount will be displayed on other relevant project pages.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class={style.mobile}>
                    <div class={style.accordion}>
                        <div class={this.state.accordionSelected == "Output/Results" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "Output/Results" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => { this.accordionClick('Output/Results') }}>
                                <h3 class={style.accordionHead}>Outputs / Results</h3>
                            </div>
                            {
                                this.state.accordionSelected == "Output/Results"
                                    ?
                                    <div class={style.accordionContent} >
                                        <div class={style.scrollWrapper}>
                                            <Scrollbars>
                                                <ProjectDetailTable data={projectDetailOutputResult} />
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={this.state.accordionSelected == "Documents" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "Documents" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => { this.accordionClick('Documents') }}>
                                <h3 class={style.accordionHead}>Documents</h3>
                            </div>
                            {
                                this.state.accordionSelected == "Documents"
                                    ?
                                    <div class={style.accordionContent} >
                                        <div class={style.scrollWrapper}>
                                            <Scrollbars>
                                                <ProjectDetailDocTable
                                                    clearFilter={() => this.clearCategoryFilter()}
                                                    loading={this.props.projectDetail.document_list_filtered.loading}
                                                    categorySelect={(value) => this.props.selectCategory(value)}
                                                    data={this.props.document_list_filtered}
                                                />
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                        <div class={this.state.accordionSelected == "Purchase Order" ? `${style.accordionItem} ${style.accordionPosition}` : style.accordionItem}>
                            <div class={this.state.accordionSelected == "Purchase Order" ? `${style.accordionTitle} ${style.accordionSelected}` : style.accordionTitle} onClick={() => { this.accordionClick('Purchase Order') }}>
                                <h3 class={style.accordionHead}>Purchase Orders</h3>
                                <span class={style.tooltipPO}>
                                    A single Purchase Order (PO) can be issued to purchase goods or services for one or more projects. For those POs, the amount displayed is for one project only. 
                                    Thus, there may be entries for less than USD 15,000, even though the total amount of that particular PO is actually more than USD 15,000. 
                                    The balance amount will be displayed on other relevant project pages.
                                </span>
                            </div>
                            
                            {
                                this.state.accordionSelected == "Purchase Order"
                                    ?
                                    <div class={style.accordionContent} >
                                        <div class={style.scrollWrapper}>
                                            <Scrollbars>
                                                <PurchaseOrderTable
                                                    loading={this.props.projectDetail.purchase_orders.loading}
                                                    data={this.props.purchaseOrderData}
                                                />
                                            </Scrollbars>
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                    </div>
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

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTab)