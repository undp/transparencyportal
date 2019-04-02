import {
    h,
    Component
} from 'preact';
import style from './style';
import d3 from 'd3';
import {
    numberToCurrencyFormatter
} from '../../utils/numberFormatter';
import List from '../../components/listView';
import TargetBudgetExpenseItem from '../../components/target-budget-expense-item';
export default class HorizontalStackedBarChart extends Component {
    componentDidMount() {
        this._onHorizontalStackedBarChart();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this._onHorizontalStackedBarChart();
        }
    }
    formatChartData(data) {
        var chartData = [];
        var expense = _.map(data, function (o) {
            return {
                target: {
                    id: o.target_id,
                    name: o.target_id,
                    percentage: o.target_percentage
                },
                count: o.target_expense,
                budget: o.target_budget
            };
        });
        chartData.push({
            data: expense,
            source: 'Expense'
        });
        var budget = _.map(data, function (o) {
            return {
                target: {
                    id: o.target_id,
                    name: o.target_id,
                    percentage: o.target_percentage
                },
                count: o.target_budget,
                expense: o.target_budget
            };
        });
        chartData.push({
            data: budget,
            source: 'Budget'
        });
        
        return chartData;
    }
    _onHorizontalStackedBarChart() {
        let thisPropsData = this.props.data;
    }
    renderRow = (item, index) => {
        return (
          <TargetBudgetExpenseItem
            data={item.item}
            index={index}
            section ={this.props.section}
          />
        )
      }
    render() {
        let max = this.props.data.length ? _.max(this.props.data, function(o) { return o.target_budget; }):{};
        if(max && max.target_budget){
            _.map(this.props.data, function (item) {
                let tempPer  = (( item.target_expense * 100 ) / item.target_budget).toFixed(2);
                item.expense_percentage = ((tempPer * item.target_percentage)/100).toFixed(2);;
            });
        }
        return (
            <div class={style.hStackedBar_chart}
                id={this.props.chart_id} >
                <List
                    data={this.props.data}
                    renderItem={this.renderRow}
                />
            </div>);
    }

}