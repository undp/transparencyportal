import { h, Component } from 'preact';
import style from './style';
import { route } from 'preact-router';
import { numberToCurrencyFormatter } from '../../../src/utils/numberFormatter';
import { openInNewTab } from '../../../src/utils/commonMethods';
import NoDataTemplate from '../no-data-template';
export default class BudgetSource extends Component {
    dataSorting = () => {
    	/**Sorting - Start*/
    	if (this.state.budget_source.length !== 0) {
    		let data = this.state.budget_source.slice();
    		data.sort((a, b) => a.budget - b.budget);

    		/**Sorting - End*/

    		let id = 0;
    		let result = data.map((el) => {
    			let o = Object.assign({}, el);
    			o.id = id++;
    			return o;
    		});

    		this.setState({
    			budget_source: result
    		}, () => {
    			this.setFontSize();
    		});
    	}

    }
    setFontSize = () => {
    	let { budget_source } = this.state;
    	let widthOfDevice = window.outerWidth;
    	let division = budget_source[budget_source.length - 1].budget / 15;
    	if (widthOfDevice <= 480) {
    		budget_source[0].fontSize = 16;
    		budget_source[budget_source.length - 1].fontSize = budget_source[budget_source.length - 1].budget > 0 ? 30 : 16;
    	} else {
    		budget_source[0].fontSize = 16;
    		budget_source[budget_source.length - 1].fontSize = budget_source[budget_source.length - 1].budget > 0 ? 30 : 16;
    	}


    	budget_source.map((el, index) => {
    		if (index != 0 && index != budget_source.length - 1) {
    			let priceDiff = division > 0 ? (el.budget) / division : 0;

    			if (widthOfDevice <= 480) {
    				budget_source[index].fontSize = 16 + parseInt(priceDiff,10);
    			} else {
    				budget_source[index].fontSize = 16 + parseInt(priceDiff,10);
    			}
    		}
    	});
    	this.setState({
    		...this.state,
    		budget_source
    	});
    }

    /*To dynamically calculate the font-size of each names in Tag Cloud = Start**/
    getStyles = (id) => {
    	let currentEl = {};
    	this.state.budget_source.length > 0 && this.state.budget_source.map((el) => {
    		if (el.id === id) {
    			currentEl = el;
    		}
    	});
    	let styles = {

    		fontSize: currentEl.fontSize + 'px'
    	};
    	return styles;
    }
    getBudgetStyles = (id) => {
    	let currentEl = {};
    	this.state.budget_source.length > 0 && this.state.budget_source.map((el) => {
    		if (el.id === id) {
    			currentEl = el;
    		}
    	});
    	let styles = {
    		fontSize: currentEl.fontSize < 18 ? (currentEl.fontSize * 0.90) + 'px' : (currentEl.fontSize * 0.75) + 'px'
    	};
    	return styles;
    }
    onSelectBudgetSource = (budget_source) => {
    	if(this.props.embed){
    		openInNewTab(`/profile/${budget_source.organisation}/donorprofile`,()=>{});
    	}else{
    		route(`/profile/${budget_source.organisation}/donorprofile`);
    	}
    }
    constructor(props) {
    	super(props);
    	this.state = {
    		budget_source: this.props.data ? this.props.data : []
    	};
    }

    componentWillMount() {
    	this.dataSorting();
    }

    componentWillReceiveProps(nextProps) {
    	if (nextProps.data !== this.props.data)
    		this.setState({
    			budget_source: nextProps.data
    		}, () => {
    			this.dataSorting();
    		});
    }


    render() {
    	let isBudgetSourceNonEmpty = this.props.data.length > 0;
    	return (
    		<div class={style.budgetComponentWrapper}>
    			<div class={style.budgetWrapper}>
    				<p class={style.budgetHeading}>Donors</p>
    				<div class={style.projectWrapper}>
    					{this.state.budget_source.length > 0 ?
    						<div>
    							{
    								this.state.budget_source.map((el, index) => (
    										<span key={index} class={style.project} onClick={() => {
    											this.onSelectBudgetSource(el);

    										}}>
    											<span style={this.getStyles(el.id)}>{el.organisation_name}</span>
    											<span style={this.getBudgetStyles(el.id)} class={style.projectPrice} >{numberToCurrencyFormatter(el.budget, 2)}</span>
    										</span>
    									))
    							}
    						</div>
    						:
    						< NoDataTemplate />
    					}

    				</div>
    			</div>
    		</div>
    	);
    }
}

