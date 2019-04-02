import { h, Component } from 'preact';
import style from './style';
import { BootstrapTable, TableHeaderColumn, DeleteButton } from 'react-bootstrap-table';
import Modal from '../../components/modal'
import closeIcon from '../../assets/icons/closeIcon.png';
import { projectDetailDocData } from '../../assets/json/projectDetailDocuments';
import DropList from '../../components/dropList';
import PreLoader from '../preLoader'
import Cards from '../tableCards';
import {getFormmattedDate} from '../../utils/dateFormatter'
import NoDataTemplate from '../no-data-template'
import { numberToDollarFormatter } from '../../utils/numberFormatter'
const DocumentCategoryList = ["sdvksdgs", "svkjdhsg",]

export default class PurchaseOrderTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showMore : props.data.length <=20 ? false : true,
        }
        this.data = [
            {
                order_id: 'dssvdsvd',
                vendor_name: 'dsdvdsvdsvdd',
                description: 'ddsvdsvdsvd',
                order_date: 'ddsdvdsvdv',
                amount: 'ssssdvdsvdsv'
            }
        ]
    }
    componentDidMount() {
        if (this.props.data.length <= 20) 
            this.setState({showMore: false})
        else
            this.setState({showMore: true})
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data.length <= 20) 
            this.setState({showMore: false})
        else
        this.setState({showMore: true})
    }
    currencyFormat = (cell, row) => {
        return (
            <div class={style.priceColumn}>{numberToDollarFormatter(cell)}</div>
        )
    }
    dateFormat = (cell, row) => {
        return (
            <div>{getFormmattedDate(cell)}</div>
        )
    }
    parseTableData = () => {
        let obj = {
            order_id: "PO ID",
            vendor_name: "Vendor",
            description: "Description",
            order_date: "Date",
            amount: "Amount"
        }
        var formattedarray = this.props.data.map((item) => {
            return {
                ...item,
                order_date: getFormmattedDate(item.order_date),
                amount: numberToDollarFormatter(item.amount)
            }

        })
        return [obj, ...formattedarray]
    }
    onMaximize = () => {
        this.setState({showMore : false})
    }
    generateCardList = (dataArray) => {
        if (dataArray.length) {
            return dataArray.map((item) => {
                return (
                    <Cards
                        data={item}
                        fields={
                            [
                                {
                                    title: 'TITILE',
                                    key: 'vendor_name',
                                    displayTitle: false,
                                    renderElement:
                                    <div class={style.vendorWrapper}>

                                          <div class={style.docCategorylabel}>Vendor :</div>
                                          <div class={style.docCategorytext}>{item.vendor_name}</div>
                                      </div>

                                },
                                {
                                    title: 'ID',
                                    key: 'order_id',
                                    displayTitle: false,
                                    renderElement:
                                    <div class={style.projectId}>
                                        {'# ' + item.project_id}
                                    </div>
                                },
                                {
                                    title: 'COUNTRY',
                                    key: 'description',
                                    displayTitle: false,
                                    renderElement: <div class={style.purchaseOrderDescription}>{item.description}</div>

                                },


                                {
                                    title: 'BUDGET',
                                    key: 'order_date',
                                    displayTitle: false,
                                      renderElement: <div class={style.amountDateWrapper}>
                                            <div class={style.amount}>{getFormmattedDate(item.order_date)}</div>
                                            <div class={style.date}>{numberToDollarFormatter(item.amount)}</div>
                                        </div>


                                },
                            ]
                        } />
                )
            });
        } else {
            return [];
        }
    }



    render({ data }, state) {
        const options = {
            noDataText: this.props.loading?<div class={style.preloaderWrapper}><PreLoader /></div>:<NoDataTemplate />
        };
        return (
            <div>
                <div class={`${style.projectList} ${style.tableOuterWrapper }`}>
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" />
                    <BootstrapTable
                        data={
                            !this.props.loading?
                                this.state.showMore === false ?
                                data
                                :data.slice(0, 20)
                            :[]
                        }
                        options={options}
                        bordered={true}
                        version='4'
                        headerContainerClass={style.headerContainerClass}
                        headerStyle={{ borderBottom: 0, background: '#fffff' }}
                        bodyStyle={{ height: 'auto', background: '#f4f5fa', marginBottom: 0, paddingRight: 0 }}
                        tableBodyClass={style.tableBodyClass}
                        containerClass={style.containerClass}
                    >
                        <TableHeaderColumn
                            width={'10%'}
                            isKey={true}
                            dataField='order_id'>PO ID</TableHeaderColumn>
                        <TableHeaderColumn width={'20%'}
                            dataField='vendor_name'>Vendor</TableHeaderColumn>
                        <TableHeaderColumn width={'30%'}
                            dataField='description'>Description</TableHeaderColumn>
                        <TableHeaderColumn width={'20%'}
                            dataField='order_date'
                            dataFormat={this.dateFormat}
                            >Date</TableHeaderColumn>
                        <TableHeaderColumn width={'20%'}
                            dataFormat={this.currencyFormat}
                            dataField='amount'
                        >Amount</TableHeaderColumn>
                    </BootstrapTable>
                </div>
                <div class={style.cardListOuterWrapper}>
                        {
                            this.props.loading?<div class={style.preloaderWrapper}><PreLoader /></div>:(
                                data.length? this.generateCardList(data):<NoDataTemplate />
                            )

                        }
                </div>
                <div class={style.loadWrapper}>
					<button class={this.state.showMore === true ? style.buttons : style.hideButtons}
						onClick={() => this.onMaximize()}
					>
						Load more..
					</button>
				</div>
            </div>
        );
    }
}

