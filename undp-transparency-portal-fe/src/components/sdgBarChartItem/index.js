import { h, Component } from "preact";
import { numberToCurrencyFormatter } from "../../utils/numberFormatter";
import style from "./style";

export default class SdgBarChartItem extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      styles: {
        expenseWrapper: {
          width: this.props.data.expensePercentage+"%",
          height: 40,
          backgroundColor: "#" + this.props.data.color,
          borderLeftWidth: 1,
          borderColor: "#" + this.props.data.color,
          verticalAlign: "middle"
        },
        budgetWrapper: {
          width: this.props.data.budgetPercentage+"%",
          height: 40,
          backgroundColor: "#42689b",
          verticalAlign: "middle"
        }
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      styles: {
        expenseWrapper: {
          height: 40,
          verticalAlign: "middle",
          width: nextProps.data.expensePercentage+"%",
          backgroundColor: "#" + nextProps.data.color,
          borderLeftWidth: 1,
          borderColor: "#" + nextProps.data.color
        },
        budgetWrapper: {
          width: nextProps.data.budgetPercentage+"%", 
          height: 40,
          backgroundColor: "#42689b",
          verticalAlign: "middle"
        }
      }
    });
  }

  render() {
    return (
      <section class={style.wrapper}>
        <div class={style.row}>
          <div class={style.rowWrapper}>
            <div
              class={`${style.budgetWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.budgetWrapper}
            ></div>
            <div class={style.rowText}>
              <span> Budget - 
                {numberToCurrencyFormatter(
                  this.props.data.budget,
                  2
                )}
              </span>
            </div>
          </div>
          <div class={style.rowWrapper}>
            <div
              class={`${style.expenseWrapper} ${style.rowWrapperItem}`}
              style={this.state.styles.expenseWrapper}
            />
            <div class={style.rowText}>
            Expense -{numberToCurrencyFormatter(this.props.data.expense, 2)}
            </div>
          </div>
        </div>
      </section>
    );
  }
}
