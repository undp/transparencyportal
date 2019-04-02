import { h, Component } from "preact";
import { route } from "preact-router";
import { connect } from "preact-redux";
import style from "./style";
import {
  BootstrapTable,
  TableHeaderColumn,
  SizePerPageDropDown
} from "react-bootstrap-table";
import PaginationPanel from "../../paginationPanel";
import PreLoader from "../../preLoader"
import NoDataTemplate from "../../no-data-template";
import { numberToDollarFormatter } from "../../../utils/numberFormatter";
import Modal from "../../../components/modal";
import Table from '../../tableCards';
import DropList from '../../dropList';
import PaginationpanelMobile from '../../paginationPanelSearch'
import { openInNewTab } from '../../../utils/commonMethods';
import DropDown from '../../../components/filter';


const PagesizeDataArray = [10, 25, 50, 100];


export default class BootTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalDataSize: this.props.totalDataSize,
      sizePerPage: 10,
      currentPage: 1,
      searchValue: "", 
      enableSearchIcon: true
    };
  }

  renderPaginationPanel = paginationProps => {
    return <PaginationPanel paginationProps={paginationProps} />;
  };

  parseTableData = () => {
    if (this.props.data.length === 0) {
      return []
    }
    else {
      var formattedarray = this.props.data.map(item => {
        return {
          ...item,
          total_budget: this.formatTodollar( item.total_budget ? item.total_budget:item.budget),
          total_expense: this.formatTodollar( item.total_expense ? item.total_expense:item.expense)
        };
      });
      return formattedarray;
    }
  };

  formatTodollar(item) {
    var prefix = "$";
    if( item< 0){
        prefix = "-$";
    }
    item = Math.abs(item)
    return prefix + item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  colFormatter = (cell, row) => {
    return (
      <a
        className={style.projectTitleLink}
        href={`/projects/${row.project_id}`}
        target={this.props.embed ? "_blank" : "_self"}
      >
        {cell}
      </a>
    );


  };
  countryFormatter = (cell, row) => {

    return (
      <a
        className={style.projectTitleLink}
        href={`/projects/${row.project_id}`}
        target={this.props.embed ? "_blank" : "_self"}
      >
        {cell.length ? cell.toString().replace(/,/g, ', '):''}
      </a>
    );


  };
  categorySelect = (value) => {
    let yearSelected = (this.props.yearSelected )? this.props.yearSelected : (this.props.year || this.props.currentYear);
    this.props.fetchMarkerProjectList(
      yearSelected,
      this.props.marker,
      this.props.keyword,
      '',
      '',this.props.country,
      this.props.isSSCMarker ? this.props.selectedMarkerSubtype : value,
      this.props.l2country);
    this.props.setMarkerSubtype(value); 
      
  }
  currencyFormat = (cell, row) => {
    return <a
      className={`${style.projectTitleLink}`}
      href={`/projects/${row.project_id}`}
      target={this.props.embed ? "_blank" : "_self"}
    >{cell}</a>;
  };
  
  onPageChange = (page, sizePerPage) => {

    const currentIndex = (page - 1) * sizePerPage;
    let yearSelected = (this.props.yearSelected )? this.props.yearSelected : (this.props.year || this.props.currentYear);
    (!this.props.marker)?
      this.props.updateProjectList(
        yearSelected,
        this.props.unit,
        this.props.source,
        this.props.theme,
        this.props.keyword,
        sizePerPage,
        currentIndex,
        this.props.budgetType,
        this.props.sdg,
        this.props.sdg_targets,
        this.props.signatureSolution
      )
    : this.props.fetchMarkerProjectList(
        yearSelected,
        this.props.marker,
        this.props.keyword,
        sizePerPage,
        currentIndex,
        this.props.country,
        this.props.isSSCMarker ? this.props.selectedMarkerSubtype : this.props.markerSubTypeSelected.markerSubType,
        this.props.l2country);
    this.setState({
      currentPage: page
    });
  };


  onSizePerPageList(sizePerPage) {
    const currentIndex = (this.state.currentPage - 1) * sizePerPage;
    this.setState({
      sizePerPage: sizePerPage
    });
  }

  onSizePerPageListPhone(sizePerPage) {
    const currentIndex = (this.state.currentPage - 1) * sizePerPage;
    this.setState({
      sizePerPage: sizePerPage
    }, () => {
      let yearSelected = (this.props.yearSelected )? this.props.yearSelected : (this.props.year || this.props.currentYear);
      (!this.props.marker)?
        this.props.updateProjectList(
          yearSelected,
          this.props.unit,
          this.props.source,
          this.props.theme,
          this.props.keyword,
          sizePerPage,
          currentIndex,
          this.props.budgetType,
          this.props.sdg,
          this.props.sdg_targets,
          this.props.signatureSolution
        )
      : this.props.fetchMarkerProjectList(
          yearSelected,
          this.props.marker,
          this.props.keyword,
          sizePerPage,
          currentIndex,
          this.props.country,
          this.props.isSSCMarker ? this.props.selectedMarkerSubtype : this.props.markerSubTypeSelected.markerSubType,
          this.props.l2country);
    });
  }

  onPageChangePhone = (page) => {
    const currentIndex = (page - 1) * this.state.sizePerPage;
    this.setState({
      currentPage: page
    }, () => {
      let yearSelected = (this.props.yearSelected )? this.props.yearSelected : (this.props.year || this.props.currentYear);
      (!this.props.marker)?
        this.props.updateProjectList(
          yearSelected,
          this.props.unit,
          this.props.source,
          this.props.theme,
          this.props.keyword,
          this.state.sizePerPage,
          currentIndex,
          this.props.budgetType,
          this.props.sdg,
          this.props.sdg_targets,
          this.props.signatureSolution
        )
      : this.props.fetchMarkerProjectList(
          yearSelected,
          this.props.marker,
          this.props.keyword,
          this.state.sizePerPage,
          currentIndex,
          this.props.country,
          this.props.isSSCMarker ? this.props.selectedMarkerSubtype : this.props.markerSubTypeSelected.markerSubType,
          this.props.l2country
        );
    }); 
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentYear != this.props.currentYear ||
      nextProps.theme != this.props.theme ||
      nextProps.unit != this.props.unit ||
      nextProps.keyword != this.props.keyword ||
      nextProps.source != this.props.source ||
      nextProps.budgetType != this.props.budgetType ||
      nextProps.sdg !== this.props.sdg||
      nextProps.sdg_targets != this.props.sdg_targets ||
      nextProps.country != this.props.country ||
      nextProps.l2country != this.props.l2country ||
      nextProps.markerSubTypeSelected.markerSubType !== this.props.markerSubTypeSelected.markerSubType ||
      nextProps.selectedMarkerSubtype !== this.props.selectedMarkerSubtype||
      nextProps.yearSelected !== this.props.yearSelected
    ) {
      let yearSelected = (nextProps.yearSelected )? nextProps.yearSelected : (nextProps.year || nextProps.currentYear);
      (!this.props.marker)?
        this.props.updateProjectList(
          yearSelected,
          nextProps.unit,
          nextProps.source,
          nextProps.theme,
          nextProps.keyword,
          this.state.sizePerPage,
          0,
          nextProps.budgetType,
          nextProps.sdg,
          nextProps.sdg_targets,
          this.props.signatureSolution
        )
      : this.props.fetchMarkerProjectList(
          yearSelected,
          nextProps.marker,
          nextProps.keyword,
          this.state.sizePerPage,
          0,
          nextProps.country,
          this.props.isSSCMarker ? nextProps.selectedMarkerSubtype : nextProps.markerSubTypeSelected.markerSubType,
          nextProps.l2country
        );
        this.setState({ currentPage: 1 });
    }
    
   
    
  }
  componentDidMount = () => {
      let yearSelected =(this.props.yearSelected )? this.props.yearSelected :(this.props.year || this.props.currentYear);
      (!this.props.marker)?
        this.props.updateProjectList(
          yearSelected,
          this.props.unit,
          this.props.source,
          this.props.theme,
          this.props.keyword,
          this.state.sizePerPage,
          this.state.currentPage - 1,
          this.props.budgetType,
          this.props.sdg,
          this.props.sdg_targets,
          this.props.signatureSolution
        )
      : this.props.fetchMarkerProjectList(
          yearSelected,
          this.props.marker,
          this.props.keyword,
          this.state.sizePerPage,
          this.state.currentPage - 1,
          this.props.country,
          this.props.isSSCMarker ? this.props.selectedMarkerSubtype : this.props.markerSubTypeSelected.markerSubType,
          this.props.l2country
        );
  };

  handleEnterClick = event => {
    if (event.keyCode === 13) {
      this.props.handleFilterChange("search", event.target.value);
    }
  };

  handleSearchChange = event => {
    this.setState({ searchValue: event.target.value }, () => {
      this.props.getSearchParam(event.target.value)
    });
    if (this.state.searchValue === "") this.setState({ enableSearchIcon: true });
    else this.setState({ enableSearchIcon: false });
  };

  createCustomToolBar = (props) => {
    let rowCount, totalCount;
    totalCount = this.props.projectCount;
    if (this.state.sizePerPage <= totalCount)
      rowCount =
        this.state.sizePerPage * this.state.currentPage > totalCount
          ? this.state.sizePerPage -
          (this.state.sizePerPage * this.state.currentPage) % totalCount
          : this.state.sizePerPage;
    else rowCount = totalCount;
    rowCount = isNaN(rowCount) ? 0 : rowCount;
    return (
      <div class={this.props.marker? style.toolBar : null}>

        <div style={this.props.marker && this.props.optionData ? {'display':'none'}:''} class={style.searchWrapper}>{props.components.searchPanel}</div>
        <div class={this.props.marker? style.projectMarkerCountWrapper :style.projectCountWrapper}>
          <span class={style.projectCountDetails}>
            Showing {rowCount} of <span>{totalCount}</span> projects
          </span>
        </div>
        
      </div>
    );
  };

  createCustomToolBarPhone = () => {
    let rowCount, totalCount;
    totalCount =  this.props.projectCount ;
    if (this.state.sizePerPage <= totalCount)
      rowCount =
        this.state.sizePerPage * this.state.currentPage > totalCount
          ? this.state.sizePerPage -
          (this.state.sizePerPage * this.state.currentPage) % totalCount
          : this.state.sizePerPage;
    else rowCount = totalCount;
    rowCount = isNaN(rowCount) ? 0 : rowCount;
    return (
      <div class={style.toolBar}>
        <div class={style.projectCountWrapper}>
          <span class={style.projectCountDetails}>
            Showing {rowCount} of <span>{totalCount}</span> projects
              </span>
        </div>
      </div>
    );
  };

  search = () => {
    this.props.handleFilterChange("search", this.state.searchValue);
  };

  clearSearch() {
    this.setState({ searchValue: "", enableSearchIcon: true });
    this.props.handleFilterChange("search", "");
  }

  generateProjectCards = (dataArray) => {
    if (dataArray.length) {
      return dataArray.map((item) => {
        return (
          <Table
            data={item}
            fields={
              [
                {
                  title: 'TITILE',
                  key: 'title',
                  displayTitle: false,
                  renderElement: <a class={style.cardTitle} target={this.props.embed ? "_blank" : ""} href={`/projects/${item.project_id}`}>{item.title}</a>
                },
                {
                  title: 'ID',
                  key: 'project_id',
                  displayTitle: false,
                  renderElement: <div class={style.projectId}>
                    {'# ' + item.project_id}
                  </div>
                },
                {
                  title: 'COUNTRY',
                  key: 'country_name',
                  displayTitle: false,
                },
                {
                  renderElement:
                    <div class={style.amountWrapper}>
                      <div class={style.budgetWrapper}>
                        <span class={style.label}>Budget :</span>
                        <span class={style.text}>{item.total_budget}</span>
                      </div>
                      <div class={style.budgetWrapper} >
                        <span class={style.label}>Expense :</span>
                        <span class={style.text}>{item.total_expense}</span>
                      </div>
                    </div>

                }]
            } />
        )
      })
    }
  }


  renderCustomSearchPanel = props => {
    return (
      <div class={style.searchWrapper}>
        <div class={style.searchContainer}>
          <span class={style.searchLabel}>{"Search for projects"}</span>
          <div class={style.searchItems}>
            <input
              type="text"
              name="search"
              value={this.state.searchValue}
              onKeyUp={event => this.handleEnterClick(event)}
              onInput={event => this.handleSearchChange(event)}
              class={style.searchField}
              placeholder="Enter keyword(s)"
            />
            {this.state.enableSearchIcon ? (
              <span class={style.searchIcon} />
            ) : (
                <span
                  class={`${style.searchIcon} ${style.clearIcon}`}
                  onClick={() => this.clearSearch()}
                />
              )}
          </div>
          <button class={style.buttons} onClick={() => this.search()}>
            <strong>Search</strong>
          </button>
        </div>
      </div>
    );
  };

  render({ data, count, links }, state) {
    const options = {
      sizePerPageList: [
        ,
        {
          text: "10",
          value: 10
        },
        {
          text: "25",
          value: 25
        },
        {
          text: "50",
          value: 50
        },
        {
          text: "100",
          value: 100
        },
        {
          text: "All",
          value: data.length
        }
      ], // you can change the dropdown list for size per page
      sizePerPage: 10, // which size per page you want to locate as default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 5, // the pagination bar size.
      page: this.state.currentPage,
      prePage: "< Prev", // Previous page button text
      nextPage: "Next >", // Next page button text
      firstPage: "<<", // First page button text
      lastPage: ">>", // Last page button text
      // paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
      paginationPosition: "bottom", // default is bottom, top and both is all available
      // hideSizePerPage: true > You can hide the dropdown for sizePerPage
      // alwaysShowAllBtns: false, // Always show next and previous button
      // withFirstAndLast: false,  //Hide the going to First and Last page button
      paginationPanel: this.renderPaginationPanel,
      onPageChange: (page, sizePerPage) => this.onPageChange(page, sizePerPage),
      onSizePerPageList: sizePerPage => this.onSizePerPageList(sizePerPage),
      sizePerPageDropDown: this.renderSizePerPageDropDown,
      // onRowClick: this.onRowClick,
      toolBar: this.createCustomToolBar,
      searchPanel: this.renderCustomSearchPanel,
      noDataText: this.props.loading ? <div class={style.preloaderWrapper}><PreLoader /></div> : <NoDataTemplate />
    };
    if (window.innerWidth < 620) {
      options.paginationSize = 1;
    } else {
      options.paginationSize = 5;
    }

    return (
      <div class={this.props.marker ? `${style.markerprojectList} ${style.projectListActive}` : `${style.projectList} ${style.projectListActive}`}>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css"
        /> 
        <style>.row{}</style>
        {this.props.isSSCMarker === 'true' ?
          <div class={style.tableOuterWrapper}>
            <BootstrapTable
              options={options}
              remote={true}
              data={this.props.loading ? [] : this.parseTableData()}
              striped
              search={this.props.enableSearch ? true : false}
              bordered={true}
              fetchInfo={{ dataTotalSize: this.props.count }}
              pagination={true}
              options={options}
              version="4"
              headerContainerClass={style.headerContainerClass}
              tableHeaderClass={"table-responsive"}
              headerStyle={{
                borderTop: "#337ab7 3px solid",
                borderBottom: 0,
                background: "#fffff"
              }}
              bodyStyle={{
                height: "auto",
                background: "#f4f5fa",
                marginBottom: 0,
                paddingRight: 0
              }}
              tableBodyClass={`table-responsive ${style.tableBodyClass}`}
              bodyContainerClass={style.bodyContainerClass}
              containerClass={style.mainTableContainer}
            >
              <TableHeaderColumn width="11%" dataField="project_id" dataFormat={this.colFormatter} isKey={true}>
                ID
            </TableHeaderColumn>
              <TableHeaderColumn width="36%" dataField="title" dataFormat={this.colFormatter}>
                Project Title
            </TableHeaderColumn>
              <TableHeaderColumn width="10%" dataField="country_name" dataFormat={this.colFormatter}>
              Country Office
            </TableHeaderColumn>
            <TableHeaderColumn width="15%" dataField="country_involved" dataFormat={this.countryFormatter}>
              Countries Involved
            </TableHeaderColumn>
              <TableHeaderColumn
                width="10%"
                dataField="total_budget"
                dataFormat={this.currencyFormat}
                className={style.priceColumn}
              >
                Budget
            </TableHeaderColumn>
              <TableHeaderColumn
                width="10%"
                dataField="total_expense"
                dataFormat={this.currencyFormat}
                className={style.priceColumn}
              >
                Expense
            </TableHeaderColumn>
            </BootstrapTable>
          </div>:
          <div class={style.tableOuterWrapper}>
            <BootstrapTable
              options={options}
              remote={true}
              data={this.props.loading ? [] : this.parseTableData()}
              striped
              search={this.props.enableSearch ? true : false}
              bordered={true}
              fetchInfo={{ dataTotalSize: typeof(this.props.count)!== 'number' ? 0: this.props.count}}
              pagination={true}
              options={options}
              version="4"
              headerContainerClass={style.headerContainerClass}
              tableHeaderClass={"table-responsive"}
              headerStyle={{
                borderTop: "#337ab7 3px solid",
                borderBottom: 0,
                background: "#fffff"
              }}
              bodyStyle={{
                height: "auto",
                background: "#f4f5fa",
                marginBottom: 0,
                paddingRight: 0
              }}
              tableBodyClass={`table-responsive ${style.tableBodyClass}`}
              bodyContainerClass={style.bodyContainerClass}
              containerClass={style.mainTableContainer}
            >
              <TableHeaderColumn width="10%" dataField="project_id" dataFormat={this.colFormatter} isKey={true}>
                ID
            </TableHeaderColumn>
              <TableHeaderColumn width="40%" dataField="title" dataFormat={this.colFormatter}>
                Project Title
            </TableHeaderColumn>
              <TableHeaderColumn width="20%" dataField="country_name" dataFormat={this.colFormatter}>
              Country Office / Operating Unit
            </TableHeaderColumn>
              <TableHeaderColumn
                width="15%"
                dataField="total_budget"
                dataFormat={this.currencyFormat}
                className={style.priceColumn}
              >
                Budget
            </TableHeaderColumn>
              <TableHeaderColumn
                width="15%"
                dataField="total_expense"
                dataFormat={this.currencyFormat}
                className={style.priceColumn}
              >
                Expense
            </TableHeaderColumn>
            </BootstrapTable>
          </div>
      }
        <div class={style.cardListOuterWrapper} >
          {
            <div>

              {
                this.createCustomToolBarPhone()
              }

              {
                this.props.enableSearch ? this.renderCustomSearchPanel() : null

              }
            </div>

          }
          {
            this.props.loading ? <div class={style.preloaderWrapper}><PreLoader /></div> :
              (
                this.props.data.length ? <div>{this.generateProjectCards(this.parseTableData())}</div> : <NoDataTemplate />
              )

          }
          <PaginationpanelMobile
            onChangePageSize={(size) => { this.onSizePerPageListPhone(size) }}
            onChangePageIndex={(pageIndex) => { this.onPageChangePhone(pageIndex) }}
            searchFilterChange={this.searchFilterChange}
            pageIndex={this.state.currentPage}
            pageSize={this.state.sizePerPage}
            pageCount={count}
          />
        </div>
      </div>
    );
  }
}





