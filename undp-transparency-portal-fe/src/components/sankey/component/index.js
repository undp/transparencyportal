/*********************** Preact *******************************/
import { h, Component } from 'preact';
import { string } from 'prop-types';
import { connect } from "preact-redux";
/********************** Custom components *********************/
import SankeyChart from '../../sankeyChart';
import PreLoader from '../../preLoader';
import NoDataTemplate from '../../no-data-template';
/************************* Style Files ************************/
import style from './style';
/**************************************************************/
class Sankey extends Component {
	constructor(props) {
		super(props);
		this.state = {
			firstChecked: true,     // Financial Flow type selector
			year: this.props.year,  // Financial Flow year selector
			modalState: false       // Financial Flow year selector drop down state
		};
	}

    static propTypes = {            // Prop Types
    	firstChecked: string,       // Financial Flow type selector - Default type - string
    	year: string,               // Financial Flow year selector - Default type - string
    	modalState: string          // Financial Flow year selector drop down state - Default type - string
    }

      static defaultProps = {       // Default Props
      	firstChecked: true,         // Financial Flow type selector - Default selection - Budget
      	year: '',                   // Financial Flow year selector - Default selection - Current Year
      	modalState: false           // Financial Flow year selector drop down state - Default selection - Dropdown close
      }
      componentWillMount() {

      	if(this.props.embed){
      		const {financialFlowType,financialFlowYear} = this.props;
      		financialFlowType === 'budget'?this.props.fetchBudgetFinancialFlow(financialFlowYear): this.props.fetchExpenseFinancialFlow(financialFlowYear);
      	}
      	else{
      		if (this.state.year) {      // Fetch Budget Financial Flow if year available
      			this.props.fetchBudgetFinancialFlow(this.state.year);
      		}
      	}


      }
      componentWillReceiveProps(nextProps) {                             // Fetch Budget Financial Flow only if year is changed
      	if (this.props.year != nextProps.year) {
      		this.setState({
      			year: nextProps.year
      		}, () => {
      			this.state.firstChecked ?
      				this.props.fetchBudgetFinancialFlow(nextProps.year) : // Financial Flow type selector = budget
      				this.props.fetchExpenseFinancialFlow(nextProps.year);  // Financial Flow type selector = expense
      		});
      	}
      }
      componentDidMount() {
      	window.addEventListener("mousedown", this.handleClickOutside);
      	window.addEventListener("touchstart", this.handleClickOutside);
      }
      componentWillUnmount() {
      	window.removeEventListener("mousedown", this.handleClickOutside);
      	window.removeEventListener("touchstart", this.handleClickOutside);
      }

    onBudgetChanged = () => {                                          // Financial Flow type selector = budget
    	this.setState({ firstChecked: true },()=>{
    		this.props.getBugetType && this.props.getBugetType(this.state.firstChecked);
    	});

    	if (this.state.year) {
    		this.props.fetchBudgetFinancialFlow(this.state.year);
    	}
    }
    onExpenseChanged = () => {                                         // Financial Flow type selector = expense
    	this.setState({ firstChecked: false },()=>{
    		this.props.getBugetType && this.props.getBugetType(this.state.firstChecked);
    	});
    	if (this.state.year) {
    		this.props.fetchExpenseFinancialFlow(this.state.year);
    	}
    }
    handleClickOutside = (e) => {                                      // Close drop down on outside click
    	if (this.node.contains(e.target)) {
    		return;
    	}
    	if (this.state.modalState && !this.dropDown.contains(e.target)) {
    		this.switchModalState();
    	}
    };

    generateYearList = () => {                                         // Financial Flow Year Generator
    	return this.props.timeLine.map((data, index) => {
    		return (
    			<li tabIndex="0"
    				onClick={() => {
    					this.props.getSankeyYear && this.props.getSankeyYear(data);
    					this.handleYearSelection(data);

    				}}>
    				<span>{data}</span>
    			</li>
    		);
    	});
    };
    switchModalState = () => {                                         // Drop Down List state Management
    	this.setState(prevState => ({
    		modalState: !prevState.modalState                          // Drop down hide/ show
    	}));
    };
    handleYearSelection = (year) => {                                  // Financial Year Selection
    	this.setState({ year: year, modalState: false }, () => {
    		this.state.firstChecked ?
    			this.props.fetchBudgetFinancialFlow(this.state.year) : // Financial Flow type selector = budget
    			this.props.fetchExpenseFinancialFlow(this.state.year);  // Financial Flow type selector = expense
    	});
    };
    render(props, { firstChecked, year, modalState }) {
    	return (
    		<div>
    			{/* Financial Flow Toolbar start */}
    			<div class={style.financialTab}>
    				{/* Financial Year Selection  start */}
    				{
    					!this.props.embed || this.props.embed === undefined ?
    						<div class={style.switch}>
    							<input type="radio"
    								class={style.switchInput}
    								onclick={() => this.onBudgetChanged()}
    								name="financial_flow_type"
    								value="budget"
    								id="budget"
    								checked={firstChecked} />
    							<label for="budget"
    								class={`${style.switchLabel} ${style.switchLabeloff}`}>
                                    Budget</label>
    							<input type="radio"
    								class={style.switchInput}
    								onclick={() => this.onExpenseChanged()}
    								name="financial_flow_type"
    								value="expense"
    								id="expense"
    								checked={!firstChecked} />
    							<label for="expense"
    								class={`${style.switchLabel} ${style.switchLabelon}`}>
                                    Expense</label>
    							<span class={style.switchSelection}></span>
    						</div> : null
    				}


    				{/* Financial Year Selection  end */}
    				{/* Year Chooser Start */}

    				{
    					!this.props.embed || this.props.embed === undefined ? <div class={style.buttonsWrapper}>
    						<div class={style.yearWrapper}
    							ref={node => {
    								this.node = node;
    							}}>
    							<div className={style.dropDownWrapper} onClick={this.switchModalState}>
    								<span id={style.pageSize}>{year}</span>
    							</div>
    							{modalState ? (
    								<div className={style.pageSizeModal} ref={node => (this.dropDown = node)}>
    									<ul>{this.generateYearList()}</ul>
    								</div>
    							) : null}
    						</div>
    					</div> : null
    				}


    				{/* Year Chooser End */}
    			</div>
    			{/* Financial Flow Toolbar end */}
    			{/* Financial Flow Diagram start */}
    			{ props.loading ?
    				<div class={style.loaderWrapper}><PreLoader /></div>:
    				(this.props.items.nodes && this.props.items.links) ?
						<SankeyChart 
						sankeyYear = {year}
						data={this.props.items} 
						currentYearSelected={this.props.currentYearSelected}/> :
    					<NoDataTemplate />
    			}
    			{/* Financial Flow Diagram end */}
    		</div>
    	);
    }
}
const mapStateToProps = state => {
	const yearList = state.yearList,
		timeLine = state.projectTimeline.year;
	return {
		yearList,
		timeLine
	};
};


export default connect(mapStateToProps)(Sankey);