import { h, Component } from "preact";
import { numberToCurrencyFormatter } from "../../utils/numberFormatter";
import { roundTo } from "../../utils/numberFormatter";
import style from "./style";

export default class DonorContributionItem extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      styles: {
        targetExpenseWrapper: {
          width: this.getWidthPercentage(this.props.data, 'expense') + "%",
          height: 25,
          backgroundColor: "#cae1f7",
          borderLeftWidth: 1,
          borderColor: "#cae1f7",
          verticalAlign: "middle"
        },
        targetBudgetWrapper: {
          width: this.getWidthPercentage(this.props.data, 'budget') + "%",
          height: 25,
          backgroundColor: "#42689b",
          borderColor: "#42689b",
          verticalAlign: "middle"
        }
      },
      showtooltip: '',
      tooltipData: '',
      tooltipPosition: [0, 0]
    };
  }
  getWidthPercentage(data, type) {
    switch (type) {
        case 'expense':
          return data.expense_percentage === 'NaN' && this.props.section ==='sdgPage' ? 0 :data.expense_percentage;
            break;
        case 'budget':
        return data.target_percentage === 'NaN' && this.props.section ==='sdgPage' ? 0:data.target_percentage
            break;
        default:
            
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      styles: {
        targetExpenseWrapper: {
          height: 25,
          verticalAlign: "middle",
          width: this.getWidthPercentage(nextProps.data, 'expense') + "%",
          backgroundColor: "#cae1f7",
          borderLeftWidth: 1,
          borderColor: "#cae1f7",
        },
        targetBudgetWrapper: {
          width: this.getWidthPercentage(nextProps.data, 'budget') + "%",
          height: 25,
          backgroundColor: "#42689b",
          borderColor: "#42689b",
          verticalAlign: "middle"
        }
      }
    });
  }
  showTooltip(e, data){
    this.setState({ showtooltip: true, tooltipData: data, tooltipPosition: [e.clientX, e.clientY] });
  }
  tooltipOut = (data) =>  {
		this.setState({ showtooltip: false });
	}
  render() {
    return (
      <section class={style.wrapper}>
        <a onMouseOver={(e)=> this.showTooltip(e, this.props.data)}
        onMouseOut={()=> this.tooltipOut(this.props.data)} 
        href={'/sdg/targets/'+this.props.data.target_id.replace('.','/')} 
        class={style.row}>{'Target '+this.props.data.target_id}</a>
        <div class={style.row}>
          <div class={style.rowWrapper}>
            <div
              class={`${style.targetBudgetWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.targetBudgetWrapper}
            />
            <div class={style.rowText}>
              <span>
                {numberToCurrencyFormatter(
                  this.props.data.target_budget,
                  2
                )}
              </span>
            </div>
          </div>
          <div class={style.rowWrapper}>
            <div
              class={`${style.targetExpenseWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.targetExpenseWrapper}
            />
            <div class={style.rowText}>
              {numberToCurrencyFormatter(this.props.data.target_expense, 2)}
            </div>
          </div>
        </div>
        <span 
					class={this.state.showtooltip ? 
					`${style.tooltipDonors} ${style.otherTooltip}`
					: style.tooltipDisplay}
					style={{top: `${this.state.tooltipPosition[1]}px`, left: `${this.state.tooltipPosition[0]}px`}}
				>
          <span class={style.targetTitle}>{'Target '+this.state.tooltipData.target_id+':'}</span>
          <span>{this.state.tooltipData.target_description}</span>
					
				</span>
      </section>
    );
  }
}
